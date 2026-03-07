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

    getDossiers(): Observable<Dossier[]> {
        return this.http.get<Dossier[]>(this.apiUrl);
    }

    createDossier(dossier: Dossier): Observable<Dossier> {
        return this.http.post<Dossier>(this.apiUrl, dossier);
    }

    getDossierById(id: number): Observable<Dossier> {
        return this.http.get<Dossier>(`${this.apiUrl}/${id}`);
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
}
