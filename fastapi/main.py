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

@app.get("/")
def read_root():
    return {"message": "BNA AI Service is Up"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
