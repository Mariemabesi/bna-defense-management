import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Auxiliaire {
    id: number;
    nom: string;
    type: 'AVOCAT' | 'HUISSIER' | 'EXPERT';
    adresse: string;
    telephone: string;
    email: string;
    specialite?: string;
    createdAt?: string;
}

export interface Tribunal {
    id?: number;
    nom: string;
    region: string;
    adresse?: string;
    telephone?: string;
    createdAt?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ReferentielService {
    private apiUrl = 'http://localhost:8082/api/referentiel';

    constructor(private http: HttpClient) { }

    // AUXILIAIRES
    getAuxiliaires(): Observable<Auxiliaire[]> {
        return this.http.get<Auxiliaire[]>(`${this.apiUrl}/auxiliaires`);
    }

    addAuxiliaire(auxiliaire: Omit<Auxiliaire, 'id' | 'createdAt'>): Observable<Auxiliaire> {
        return this.http.post<Auxiliaire>(`${this.apiUrl}/auxiliaires`, auxiliaire);
    }

    // TRIBUNAUX
    getTribunaux(): Observable<Tribunal[]> {
        return this.http.get<Tribunal[]>(`${this.apiUrl}/tribunaux`);
    }

    addTribunal(tribunal: Tribunal): Observable<Tribunal> {
        return this.http.post<Tribunal>(`${this.apiUrl}/tribunaux`, tribunal);
    }

    updateTribunal(id: number, tribunal: Tribunal): Observable<Tribunal> {
        return this.http.put<Tribunal>(`${this.apiUrl}/tribunaux/${id}`, tribunal);
    }

    deleteTribunal(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/tribunaux/${id}`);
    }
}
