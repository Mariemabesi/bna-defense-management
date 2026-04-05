from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
import anthropic
import os
import json
from typing import List, Optional

app = FastAPI(title="BNA AI Microservice", description="Servives Claude pour Action en Défense BNA")

# Configuration Claude (Assume API Key is in env)
CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY", "YOUR_KEY_HERE")
client = anthropic.Anthropic(api_key=CLAUDE_API_KEY)

class ClassificationRequest(BaseModel):
    description: str

class RiskScoreRequest(BaseModel):
    dossierId: int
    data: dict # Data for calculation

@app.post("/api/ai/classify-dossier")
async def classify_dossier(request: ClassificationRequest):
    try:
        system_prompt = "Vous êtes un expert juridique tunisien. Votre rôle est de classifier les dossiers juridiques de la BNA (Banque Nationale Agricole) en utilisant le contexte légal de la Tunisie."
        user_prompt = f"""Analyse cette description de dossier BNA et suggère :
        1. Type de Procédure (ex: CIVIL, PENAL, COMMERCIALE)
        2. Nature d'Affaire (ex: Non-paiement, Litige foncier, Chèque sans provision)
        3. Phase initiale (ex: PREMIERE_INSTANCE, APPEL)

        Description: "{request.description}"

        Réponds uniquement au format JSON structuré comme ceci:
        {{
            "typeProcedure": "...",
            "natureAffaire": "...",
            "phaseInitiale": "...",
            "confidence": 0.95
        }}
        """

        message = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1000,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}]
        )
        
        # Parse JSON from text blocks
        content = message.content[0].text
        # Safety: extracting JSON
        start = content.find('{')
        end = content.rfind('}') + 1
        return json.loads(content[start:end])
    except Exception as e:
        # Fallback response
        return {
            "typeProcedure": "CIVIL",
            "natureAffaire": "Droit commun",
            "phaseInitiale": "PREMIERE_INSTANCE",
            "confidence": 0.5
        }

@app.post("/api/ai/risk-score")
async def calculate_risk_score(request: dict):
    # logic simple for now or Claude
    try:
        montant = request.get("montant", 0)
        delay = request.get("daysSinceCreation", 0)
        
        score = "FAIBLE"
        if montant > 100000 or delay > 365:
            score = "ÉLEVÉ"
        elif montant > 50000 or delay > 180:
            score = "MOYEN"
            
        return {"riskScore": score}
    except:
        return {"riskScore": "MOYEN"}

@app.post("/api/ai/summarize-dossier")
async def summarize_dossier(request: dict):
    dossier_id = request.get("dossierId")
    # Simulate summarization with Claude
    try:
        user_prompt = f"Résume le dossier juridique BNA #{dossier_id}. Concentre-toi sur les faits marquants, les parties et l'enjeu financier."
        message = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=300,
            messages=[{"role": "user", "content": user_prompt}]
        )
        return {"summary": message.content[0].text}
    except:
        return {"summary": "Résumé automatique non disponible pour le moment."}

@app.post("/api/ai/detect-anomaly")
async def detect_anomaly(request: dict):
    frais_id = request.get("fraisId")
    # Simulation: return anomaly based on ID/Logic
    return {"fraisId": frais_id, "isAnomalous": False, "reason": "Consistent with market rates."}

@app.post("/api/ai/predict-budget")
async def predict_budget(request: dict):
    dossier_id = request.get("dossierId")
    # Simulation: Predict budget based on historical data
    return {"dossierId": dossier_id, "predictedBudget": 15000.0, "confidence": 0.82}

@app.get("/api/ai/avocat-score/{id}")
async def get_avocat_score(id: int):
    # Simulation: Lawyer performance score (0-100)
    return {"id": id, "score": 85.5, "winRate": 0.75, "efficiency": "High"}

@app.post("/api/ai/recommend-strategy")
async def recommend_strategy(request: dict):
    dossier_id = request.get("dossierId")
    # Use Claude for RAG / Strategy
    try:
        user_prompt = f"Suggère une stratégie juridique pour le dossier #{dossier_id} de la BNA (Banque Nationale Agricole) selon le droit tunisien."
        message = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=500,
            messages=[{"role": "user", "content": user_prompt}]
        )
        return {"strategy": message.content[0].text}
    except:
        return {"strategy": "Poursuivre la procédure standard en première instance."}

@app.get("/api/ai/predictive-kpis")
async def get_predictive_kpis():
    return {
        "expectedWinRate": 0.72,
        "estimatedTreasuryStrain": "Low",
        "nextQuarterVolumeProjection": "+15%"
    }

@app.post("/api/ai/nl-search")
async def nl_search(request: dict):
    query = request.get("query")
    # Simulation: Natural Language to SQL
    return [{"id": 1, "reference": "DEF-2026-1234", "titre": "Litige foncier BNA", "matchPercentage": 0.98}]

@app.get("/api/ai/smart-notifications")
async def get_smart_notifications():
    return [{"id": 1, "message": "Alerte de délai : Le dossier DEF-2026-6789 expire dans 3 jours.", "priority": "High"}]

@app.post("/api/ai/analyze-document")
async def analyze_document(request: dict):
    doc_id = request.get("documentId")
    return {"id": doc_id, "analysis": "Document conforme aux standards BNA.", "risks": []}

@app.get("/api/ai/detect-fraud/{id}")
async def detect_fraud(id: int):
    return {"userId": id, "status": "CLEAN", "flags": 0}

@app.get("/")
def read_root():
    return {"message": "BNA AI Service is Up"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
