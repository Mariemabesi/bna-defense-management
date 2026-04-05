from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
import openai
import os
import json
import httpx
from typing import List, Optional

app = FastAPI(title="BNA AI Microservice (OpenRouter FREE)", description="Intelligence BNA - Model: GPT-OSS-120B:FREE")

# Configuration OpenRouter (Point 14: No more Claude Pay)
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "YOUR_OPENROUTER_KEY_HERE")
client = openai.AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
    default_headers={
        "HTTP-Referer": "http://localhost:4200", # Optional for OpenRouter
        "X-Title": "BNA Defense Management",
    }
)

MODEL_NAME = "openai/gpt-oss-120b:free"

class ClassificationRequest(BaseModel):
    description: str

@app.post("/api/ai/classify-dossier")
async def classify_dossier(request: ClassificationRequest):
    try:
        system_content = "Vous êtes un expert juridique tunisien pour la BNA. Réponds avec rigueur bancaire."
        user_prompt = f"""Analyse cette description de dossier BNA et suggère :
        1. Type de Procédure (CIVIL, PENAL, COMMERCIALE)
        2. Nature d'Affaire
        3. Phase initiale
        
        Description: "{request.description}"
        Réponds uniquement au format JSON:
        {{
            "typeProcedure": "...",
            "natureAffaire": "...",
            "phaseInitiale": "...",
            "confidence": 0.95
        }}
        """

        response = await client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_content},
                {"role": "user", "content": user_prompt}
            ],
            response_format={ "type": "json_object" }
        )
        
        # OpenRouter Reasoning Usage Logs (Point 14)
        usage = getattr(response, 'usage', None)
        if usage:
            print(f"[AI REPORT] Total Tokens: {usage.total_tokens} | Cost: $0.00")

        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"[RECOVER] AI Error: {e}")
        return {
            "typeProcedure": "CIVIL", "natureAffaire": "Droit commun",
            "phaseInitiale": "PREMIERE_INSTANCE", "confidence": 0.5
        }

@app.post("/api/ai/summarize-dossier")
async def summarize_dossier(request: dict):
    dossier_id = request.get("dossierId")
    try:
        user_prompt = f"Résume le dossier juridique BNA #{dossier_id}. Points clés, enjeu financier."
        response = await client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": user_prompt}]
        )
        return {"summary": response.choices[0].message.content}
    except:
        return {"summary": "Résumé automatique (OpenRouter) non disponible."}

@app.post("/api/ai/recommend-strategy")
async def recommend_strategy(request: dict):
    dossier_id = request.get("dossierId")
    try:
        user_prompt = f"Suggère une stratégie juridique pour le dossier #{dossier_id} de la BNA (Banque Nationale Agricole) selon le droit tunisien."
        response = await client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": user_prompt}]
        )
        return {"strategy": response.choices[0].message.content}
    except:
        return {"strategy": "Poursuivre la procédure standard en première instance."}

# Remaining simulation endpoints (keeping them simple/fast)
@app.post("/api/ai/risk-score")
async def calculate_risk_score(request: dict):
    return {"riskScore": "MOYEN"}

@app.get("/api/ai/avocat-score/{id}")
async def get_avocat_score(id: int):
    return {"id": id, "score": 85.5, "winRate": 0.75, "efficiency": "High"}

@app.get("/api/ai/predictive-kpis")
async def get_predictive_kpis():
    return {"expectedWinRate": 0.72}

@app.post("/api/ai/nl-search")
async def nl_search(request: dict):
    return [{"id": 1, "reference": "DEF-2026", "matchPercentage": 0.98}]

@app.get("/")
def read_root(): return {"message": "BNA AI Service (OpenRouter) is Up"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
