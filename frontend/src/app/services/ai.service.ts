import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, of } from 'rxjs';

export interface AIAnalysis {
    summary: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    suggestions: string[];
    confidence: number;
}

@Injectable({
    providedIn: 'root'
})
export class AIService {
    constructor(private http: HttpClient) { }

    analyzeDossier(description: string): Observable<AIAnalysis> {
        // En mode réel, ceci appellerait un endpoint Python/FastAPI ou un service OpenAI/Google Vertex AI
        // Pour la démo, nous simulons une analyse intelligente

        const mockAnalysis: AIAnalysis = {
            summary: "L'analyse automatique détecte un litige commercial à fort enjeu. La documentation semble complète mais une vérification de la compétence territoriale du tribunal est conseillée.",
            riskLevel: description.length > 200 ? 'MEDIUM' : 'LOW',
            suggestions: [
                "Vérifier les délais de prescription (30 jours)",
                "Mandater un huissier pour constat immédiat",
                "Préparer une provision pour frais d'expertise"
            ],
            confidence: 0.94
        };

        return of(mockAnalysis).pipe(delay(2000)); // Simule le temps de réflexion de l'IA
    }
}
