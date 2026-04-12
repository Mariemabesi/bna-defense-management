import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Frais {
    id?: number;
    affaire?: {
        id: number;
        referenceJudiciaire: string;
        dossier?: {
            reference: string;
            titre: string;
        }
    };
    referenceDossier?: string; // Still used for creation DTO mapping
    libelle: string;
    description?: string; // Fallback for old code
    montant: number;
    statut: 'ATTENTE' | 'PRE_VALIDE' | 'VALIDE' | 'REJETE' | 'ENVOYE_TRESORERIE';
    type?: string;
    observation?: string;
    dateDemande?: Date;
}

@Injectable({
    providedIn: 'root'
})
export class FraisService {
    private apiUrl = '/api/frais';

    constructor(private http: HttpClient) { }

    getFrais(): Observable<Frais[]> {
        return this.http.get<Frais[]>(this.apiUrl);
    }

    createFrais(frais: Frais): Observable<Frais> {
        return this.http.post<Frais>(this.apiUrl, frais);
    }

    preValidate(id: number): Observable<Frais> {
        return this.http.put<Frais>(`${this.apiUrl}/${id}/pre-valider`, {});
    }

    validate(id: number): Observable<Frais> {
        return this.http.put<Frais>(`${this.apiUrl}/${id}/valider`, {});
    }

    sendToTreasury(id: number): Observable<Frais> {
        return this.http.put<Frais>(`${this.apiUrl}/${id}/envoyer-tresorerie`, {});
    }

    batchSendToTreasury(): Observable<{ message: string; count: number }> {
        return this.http.put<{ message: string; count: number }>(`${this.apiUrl}/batch-tresorerie`, {});
    }
}
