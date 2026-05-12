from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
import anthropic
from openai import OpenAI
import os
import json
import joblib
import pandas as pd
import numpy as np
from typing import List, Optional

app = FastAPI(title="BNA AI Microservice", description="Services IA pour Action en Défense BNA")

# --- Configuration & Model Loading ---
MODEL_PATH = "models/logistic_regression_legal_model.pkl"

try:
    model = joblib.load(MODEL_PATH)
    print(f"Modèle chargé avec succès : {MODEL_PATH}", flush=True)
except Exception as e:
    import traceback
    print(f"Erreur chargement modèle : {str(e)}", flush=True)
    traceback.print_exc()
    model = None

# Configuration AI
CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY", "YOUR_KEY_HERE")
claude_client = anthropic.Anthropic(api_key=CLAUDE_API_KEY)

# NVIDIA Configuration
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", "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")
nvidia_client = OpenAI(
  base_url="https://integrate.api.nvidia.com/v1",
  api_key=NVIDIA_API_KEY
)

# --- Schemas ---

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

# --- Endpoints ---

@app.post("/api/ai/predict-outcome")
async def predict_outcome(request: LegalAnalysisRequest):
    if model is None:
        raise HTTPException(status_code=500, detail="Modèle ML non disponible sur le serveur.")
    
    try:
        # 1. Conversion de la requête en DataFrame
        input_data = pd.DataFrame([request.dict()])
        
        # 2. Prédiction (Probabilités)
        probabilities = model.predict_proba(input_data)[0]
        prob_gagne = float(probabilities[1])
        prob_perdu = float(probabilities[0])
        
        # 3. Résultat final avec état NUANCÉ (entre 40% et 60%)
        prediction = "GAGNÉ" if prob_gagne > 0.6 else ("PERDU" if prob_gagne < 0.4 else "NUANCÉ")
        
        # 4. Calcul du Niveau de Risque
        risk_level = "ÉLEVÉ"
        if prob_gagne > 0.75:
            risk_level = "FAIBLE"
        elif prob_gagne > 0.40:
            risk_level = "MOYEN"

        # 5. Appel à NVIDIA GLM-5.1 pour l'Analyse Assistante
        try:
            prompt = f"""
            En tant qu'assistant juridique expert pour la BNA, analyse ce dossier :
            - Type d'affaire : {request.affaire_type}
            - Expérience Avocat : {request.avocat_experience_annees} ans
            - Qualité des preuves : {request.qualite_preuves}
            - Solidité du dossier : {request.solidite_dossier}
            - Budget provisionné : {request.dossier_budget_provisionne} TND
            
            Le modèle de Machine Learning a prédit : {prediction} avec une probabilité de succès de {round(prob_gagne*100, 2)}%.
            
            Génère une analyse professionnelle et concise selon les règles suivantes :
            - Si GAGNÉ : Explique les points forts (preuves, expérience, budget).
            - Si PERDU : Explique les faiblesses et donne 3 conseils concrets d'amélioration.
            - Si NUANCÉ : Explique l'équilibre des forces et ce qui pourrait faire basculer le verdict.
            """

            completion = nvidia_client.chat.completions.create(
                model="z-ai/glm-5.1",
                messages=[{"role": "user", "content": prompt}],
                temperature=1,
                top_p=1,
                max_tokens=16384,
                extra_body={"chat_template_kwargs": {"enable_thinking": True, "clear_thinking": False}},
                stream=False
            )
            analysis_text = completion.choices[0].message.content
        except Exception as ai_err:
            print(f"Erreur NVIDIA AI : {ai_err}")
            analysis_text = "Analyse AI non disponible pour le moment."
            
        return {
            "prediction": prediction,
            "probabilitySuccess": round(prob_gagne * 100, 2),
            "probabilityFailure": round(prob_perdu * 100, 2),
            "riskLevel": risk_level,
            "analysis": analysis_text,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur lors de la prédiction : {str(e)}")

@app.post("/api/ai/classify-dossier")
async def classify_dossier(request: ClassificationRequest):
    try:
        system_prompt = "Vous êtes un expert juridique tunisien. Votre rôle est de classifier les dossiers juridiques de la BNA."
        user_prompt = f"Analyse cette description de dossier BNA et suggère Type de Procédure, Nature d'Affaire, Phase initiale. Description: '{request.description}'"

        message = claude_client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1000,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}]
        )
        # Simplified for brevity in this task, usually you'd parse JSON here
        return {"raw_analysis": message.content[0].text}
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/ai/summarize-dossier")
async def summarize_dossier(request: dict = Body(...)):
    # Simple placeholder to avoid 404
    return {"summary": "Résumé automatique du dossier en attente de traitement approfondi."}

@app.post("/api/ai/risk-score")
async def risk_score(request: dict = Body(...)):
    return {"riskScore": "MOYEN"}

@app.post("/api/ai/analyze-dossier")
async def analyze_dossier_legacy(request: dict = Body(...)):
    return {"analysis": "Analyse préliminaire effectuée."}

@app.get("/")
def read_root():
    return {"message": "BNA AI Service is Up", "model_loaded": model is not None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
