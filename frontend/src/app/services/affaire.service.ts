import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Affaire {
    id?: number;
    referenceJudiciaire: string;
    titre: string;
    description?: string;
    type: 'CIVIL' | 'PENAL' | 'PRUDHOMME' | 'PATRIMOINE_IMMOBILIER' | 'CREDIT' | 'LITIGE' | 'GARANTIE' | 'IMM' | 'COMM' | 'TRAV' | 'ADM';
    statut: 'EN_COURS' | 'GAGNE' | 'PERDU' | 'CLASSE';
    dateOuverture?: string;
    dossierId: number;
    avocat?: any;
    huissier?: any;
    expert?: any;
    tribunal?: any;
    procedures?: ProcedureJudiciaire[];
}

export interface ProcedureJudiciaire {
    id?: number;
    titre: string;
    type: 'ASSIGNATION' | 'REQUETE' | 'APPEL' | 'CASSATION' | 'REFERE' | 'AUTRE';
    statut: 'BROUILLON' | 'EN_COURS' | 'VALIDEE' | 'TERMINEE' | 'ANNULEE';
    description?: string;
    affaireId: number;
    audiences?: any[];
    jugement?: any;
}

@Injectable({
    providedIn: 'root'
})
export class AffaireService {
    private apiUrl = '/api/affaires';

    constructor(private http: HttpClient) { }

    getAllAffaires(): Observable<Affaire[]> {
        return this.http.get<Affaire[]>(this.apiUrl);
    }

    getAffaireById(id: number): Observable<Affaire> {
        return this.http.get<Affaire>(`${this.apiUrl}/${id}`);
    }

    getProceduresByAffaire(affaireId: number): Observable<ProcedureJudiciaire[]> {
        return this.http.get<ProcedureJudiciaire[]>(`/api/procedures/affaire/${affaireId}`);
    }

    exportListPdf(): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/export/pdf`, { responseType: 'blob' });
    }

    exportSinglePdf(id: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/${id}/export/pdf`, { responseType: 'blob' });
    }


    getAffairesByDossier(dossierId: number): Observable<Affaire[]> {
        return this.http.get<Affaire[]>(`${this.apiUrl}/dossier/${dossierId}`);
    }

    createAffaire(affaire: Partial<Affaire>): Observable<Affaire> {
        return this.http.post<Affaire>(this.apiUrl, affaire);
    }

    updateStatut(id: number, statut: string): Observable<Affaire> {
        return this.http.put<Affaire>(`${this.apiUrl}/${id}/statut?statut=${statut}`, {});
    }
 
    getByTribunal(id: number): Observable<Affaire[]> {
        return this.http.get<Affaire[]>(`${this.apiUrl}/by-tribunal/${id}`);
    }
 
    getByAvocat(id: number): Observable<Affaire[]> {
        return this.http.get<Affaire[]>(`${this.apiUrl}/by-avocat/${id}`);
    }
 
    getByHuissier(id: number): Observable<Affaire[]> {
        return this.http.get<Affaire[]>(`${this.apiUrl}/by-huissier/${id}`);
    }
 
    getByExpert(id: number): Observable<Affaire[]> {
        return this.http.get<Affaire[]>(`${this.apiUrl}/by-expert/${id}`);
    }
}
