from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
from openai import OpenAI
import os
import time
import joblib
import pandas as pd
import numpy as np
from typing import Optional

app = FastAPI(
    title="BNA AI Microservice",
    description="""
    Architecture bi-couche :
    - Couche 1 (CORE): Service ML — prédiction indépendante via modèle pré-entraîné.
    - Couche 2 (OPTIONNEL): Service NVIDIA — analyse avancée et interprétation des résultats.
    """
)

# ==============================================================================
# COUCHE 1 — SERVICE ML CORE (Indépendant, pas de dépendances externes)
# Le modèle est chargé une seule fois au démarrage, en mémoire RAM.
# Rôle : Prédiction uniquement. Pas d'entraînement en production.
# ==============================================================================

MODEL_PATH = "models/logistic_regression_legal_model.pkl"

try:
    model = joblib.load(MODEL_PATH)
    print(f"[ML CORE] Modèle chargé avec succès : {MODEL_PATH}", flush=True)
except Exception as e:
    import traceback
    print(f"[ML CORE] Erreur chargement modèle : {str(e)}", flush=True)
    traceback.print_exc()
    model = None


def run_ml_prediction(data: dict) -> dict:
    """
    SERVICE ML CORE — Prédiction pure.
    Entrée  : dict avec les features du dossier.
    Sortie  : Verdict (GAGNÉ/PERDU/NUANCÉ), probabilités, niveau de risque.
    Ce service fonctionne de manière totalement autonome.
    """
    input_data = pd.DataFrame([data])
    probabilities = model.predict_proba(input_data)[0]

    prob_gagne = float(probabilities[1])
    prob_perdu = float(probabilities[0])

    # Verdict nuancé si probabilité entre 40% et 60%
    if prob_gagne > 0.6:
        prediction = "GAGNÉ"
    elif prob_gagne < 0.4:
        prediction = "PERDU"
    else:
        prediction = "NUANCÉ"

    # Calcul du niveau de risque
    if prob_gagne > 0.75:
        risk_level = "FAIBLE"
    elif prob_gagne > 0.40:
        risk_level = "MOYEN"
    else:
        risk_level = "ÉLEVÉ"

    return {
        "prediction": prediction,
        "probabilitySuccess": round(prob_gagne * 100, 2),
        "probabilityFailure": round(prob_perdu * 100, 2),
        "riskLevel": risk_level,
    }


# ==============================================================================
# COUCHE 2 — SERVICE D'ANALYSE AVANCÉE (Optionnel — NVIDIA GLM-5.1)
# Enrichit les résultats du Service ML CORE.
# Ne bloque JAMAIS la prédiction en cas d'indisponibilité.
# ==============================================================================

NVIDIA_API_KEY = os.getenv(
    "NVIDIA_API_KEY",
    "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"
)
nvidia_client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=NVIDIA_API_KEY
)


def run_nvidia_analysis(ml_result: dict, request_data: dict) -> Optional[str]:
    """
    SERVICE D'ANALYSE OPTIONNEL — Enrichissement NVIDIA.
    Reçoit les résultats du ML CORE et génère :
      - Interprétation du verdict
      - Explication des facteurs influents
      - Conseils stratégiques concrets
    Retourne None si le service est indisponible (fallback automatique).
    """
    try:
        start_time = time.time()
        print(
            f"[NVIDIA] Requête envoyée pour {request_data.get('affaire_type')} "
            f"— Prédiction: {ml_result['prediction']}",
            flush=True
        )

        prompt = f"""
        En tant qu'assistant juridique expert pour la BNA (Banque Nationale Agricole), analyse ce dossier :

        Données du dossier :
        - Type d'affaire       : {request_data.get('affaire_type')}
        - Spécialité Avocat    : {request_data.get('avocat_specialite')}
        - Expérience Avocat    : {request_data.get('avocat_experience_annees')} ans
        - Qualité des preuves  : {request_data.get('qualite_preuves')}
        - Solidité du dossier  : {request_data.get('solidite_dossier')}
        - Budget provisionné   : {request_data.get('dossier_budget_provisionne')} TND

        Résultats du modèle ML (Régression Logistique) :
        - Verdict prédit       : {ml_result['prediction']}
        - Probabilité de gain  : {ml_result['probabilitySuccess']}%
        - Probabilité de perte : {ml_result['probabilityFailure']}%
        - Niveau de risque     : {ml_result['riskLevel']}

        Génère une analyse courte (3-4 phrases max) en français :
        - Si GAGNÉ  : 2 points forts principaux.
        - Si PERDU  : 2 faiblesses + 1 action corrective.
        - Si NUANCÉ : 1 phrase sur l'équilibre et 1 recommandation.
        Sois direct et factuel. Pas d'introduction ni de conclusion.
        """

        completion = nvidia_client.chat.completions.create(
            model="z-ai/glm-5.1",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            top_p=0.9,
            max_tokens=512,  # Concise output — no need for long essays
            extra_body={"chat_template_kwargs": {"enable_thinking": False}},  # Disabled: was causing 60-90s delay
            stream=False
        )
        analysis_text = completion.choices[0].message.content
        duration = time.time() - start_time
        print(f"[NVIDIA] Réponse reçue en {duration:.2f}s", flush=True)
        return analysis_text

    except Exception as ai_err:
        print(f"[NVIDIA] Service indisponible — Fallback activé. Erreur: {ai_err}", flush=True)
        return None


# ==============================================================================
# SCHEMAS
# ==============================================================================

class LegalAnalysisRequest(BaseModel):
    affaire_type: str
    avocat_specialite: str
    nb_reportees: float
    avocat_experience_annees: float
    qualite_preuves: str
    solidite_dossier: str
    dossier_budget_provisionne: float
    specialite_compatible: str


class ClassificationRequest(BaseModel):
    description: str


# ==============================================================================
# ENDPOINTS
# ==============================================================================

@app.post("/api/ai/predict-outcome")
async def predict_outcome(request: LegalAnalysisRequest):
    """
    COUCHE 1 — ML CORE uniquement.
    Prédiction rapide (< 1 seconde) sans aucune dépendance externe.
    Retourne : verdict, probabilités, niveau de risque.
    """
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Service ML indisponible. Le modèle pré-entraîné n'a pas pu être chargé."
        )

    try:
        ml_result = run_ml_prediction(request.dict())
        print(
            f"[ML CORE] Prédiction: {ml_result['prediction']} "
            f"| Succès: {ml_result['probabilitySuccess']}% "
            f"| Risque: {ml_result['riskLevel']}",
            flush=True
        )
        return {
            **ml_result,
            "analysis": None,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Erreur lors de la prédiction ML : {str(e)}"
        )


class NvidiaAnalysisRequest(BaseModel):
    """Requête pour l'analyse NVIDIA — contient les données du dossier + le résultat ML."""
    affaire_type: str
    avocat_specialite: str
    avocat_experience_annees: float
    qualite_preuves: str
    solidite_dossier: str
    dossier_budget_provisionne: float
    nb_reportees: float
    specialite_compatible: str
    # Résultat ML déjà calculé
    prediction: str
    probabilitySuccess: float
    probabilityFailure: float
    riskLevel: str


@app.post("/api/ai/nvidia-analysis")
async def nvidia_analysis(request: NvidiaAnalysisRequest):
    """
    COUCHE 2 — NVIDIA GLM-5.1 (Optionnel).
    Enrichit une prédiction ML existante avec une analyse juridique textuelle.
    Appelé uniquement si l'utilisateur clique sur le bouton bleu 'Analyse NVIDIA'.
    """
    ml_result = {
        "prediction": request.prediction,
        "probabilitySuccess": request.probabilitySuccess,
        "probabilityFailure": request.probabilityFailure,
        "riskLevel": request.riskLevel,
    }
    request_data = request.dict()

    analysis_text = run_nvidia_analysis(ml_result, request_data)
    if analysis_text is None:
        raise HTTPException(
            status_code=503,
            detail="Le service d'analyse NVIDIA est temporairement indisponible."
        )

    return {
        "analysis": analysis_text,
        "status": "success"
    }


@app.get("/api/ai/health")
def health_check():
    """Vérifie l'état des deux couches du service."""
    return {
        "status": "UP",
        "ml_core": {
            "available": model is not None,
            "model": MODEL_PATH if model is not None else None
        },
        "nvidia_analysis": {
            "available": True,
            "model": "z-ai/glm-5.1",
            "mode": "optional_enrichment"
        }
    }


@app.post("/api/ai/classify-dossier")
async def classify_dossier(request: ClassificationRequest):
    """Classification rapide d'un dossier via description textuelle."""
    return {
        "typeProcedure": "CIVIL",
        "natureAffaire": "Droit commun",
        "phaseInitiale": "PREMIERE_INSTANCE",
        "confidence": 0.0,
        "note": "Classification automatique — vérification manuelle recommandée."
    }


@app.post("/api/ai/summarize-dossier")
async def summarize_dossier(request: dict = Body(...)):
    return {"summary": "Résumé automatique du dossier en attente de traitement approfondi."}


@app.post("/api/ai/risk-score")
async def risk_score(request: dict = Body(...)):
    return {"riskScore": "MOYEN"}


@app.post("/api/ai/analyze-dossier")
async def analyze_dossier_legacy(request: dict = Body(...)):
    return {"analysis": "Analyse préliminaire effectuée."}


@app.get("/")
def read_root():
    return {
        "message": "BNA AI Service is Up",
        "architecture": "ML Core (independent) + NVIDIA Analysis (optional)",
        "ml_core_loaded": model is not None
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
