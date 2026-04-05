import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dossier } from '../models/dossier.model';

@Injectable({
    providedIn: 'root'
})
export class DossierService {
    private apiUrl = 'http://localhost:8082/api/dossiers';

    constructor(private http: HttpClient) { }

    getDossiers(page: number = 0, size: number = 10): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`);
    }

    createDossier(dossier: Dossier): Observable<Dossier> {
        return this.http.post<Dossier>(this.apiUrl, dossier);
    }

    getDossierById(id: number): Observable<Dossier> {
        return this.http.get<Dossier>(`${this.apiUrl}/${id}`);
    }

    getRecentDossiers(): Observable<Dossier[]> {
        return this.http.get<Dossier[]>(`${this.apiUrl}/recent`);
    }

    updateStatus(id: number, status: string): Observable<Dossier> {
        return this.http.put<Dossier>(`${this.apiUrl}/${id}/statut?statut=${status}`, {});
    }

    cloturerDossier(id: number): Observable<Dossier> {
        return this.http.post<Dossier>(`${this.apiUrl}/${id}/cloturer`, {});
    }

    searchDossiers(query: string): Observable<Dossier[]> {
        return this.http.get<Dossier[]>(`${this.apiUrl}/search?q=${query}`);
    }

    searchDossiersSimple(query: string): Observable<Dossier[]> {
        return this.searchDossiers(query);
    }

    // Workflow Endpoints (Point 9)
    soumettre(id: number): Observable<Dossier> {
        return this.http.put<Dossier>(`${this.apiUrl}/${id}/soumettre`, {});
    }

    prevalider(id: number): Observable<Dossier> {
        return this.http.put<Dossier>(`${this.apiUrl}/${id}/prevalider`, {});
    }

    validerFinal(id: number): Observable<Dossier> {
        return this.http.put<Dossier>(`${this.apiUrl}/${id}/valider-final`, {});
    }

    refuser(id: number, motif: string): Observable<Dossier> {
        return this.http.put<Dossier>(`${this.apiUrl}/${id}/refuser`, { motif });
    }

    getPendingForPreValidateur(): Observable<Dossier[]> {
        return this.http.get<Dossier[]>(`${this.apiUrl}/pending/prevalider`);
    }

    getPendingForValidateur(): Observable<Dossier[]> {
        return this.http.get<Dossier[]>(`${this.apiUrl}/pending/valider`);
    }

    // Frais per Dossier (Point 6 + 9)
    addFrais(id: number, frais: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/${id}/frais`, frais);
    }

    getFraisByDossier(id: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/${id}/frais`);
    }

    getFraisSummary(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}/frais/summary`);
    }
}
