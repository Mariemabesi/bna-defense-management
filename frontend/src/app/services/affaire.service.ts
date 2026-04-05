import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Affaire {
    id?: number;
    referenceJudiciaire: string;
    type: 'CIVIL' | 'PENAL' | 'PRUDHOMME' | 'PATRIMOINE_IMMOBILIER';
    statut: 'EN_COURS' | 'GAGNE' | 'PERDU' | 'CLASSE';
    dateOuverture?: string;
    dossierId: number;
}

@Injectable({
    providedIn: 'root'
})
export class AffaireService {
    private apiUrl = '/api/affaires';

    constructor(private http: HttpClient) { }

    getAffairesByDossier(dossierId: number): Observable<Affaire[]> {
        return this.http.get<Affaire[]>(`${this.apiUrl}/dossier/${dossierId}`);
    }

    createAffaire(affaire: Partial<Affaire>): Observable<Affaire> {
        return this.http.post<Affaire>(this.apiUrl, affaire);
    }

    updateStatut(id: number, statut: string): Observable<Affaire> {
        return this.http.put<Affaire>(`${this.apiUrl}/${id}/statut?statut=${statut}`, {});
    }
}
