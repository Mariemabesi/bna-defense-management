import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Auxiliaire {
    id: number;
    nom: string;
    type: 'AVOCAT' | 'HUISSIER' | 'EXPERT' | 'NOTAIRE' | 'MANDATAIRE' | 'GREFFIER';
    adresse: string;
    telephone: string;
    email: string;
    specialite?: string;
    createdAt?: string;
    numOrdreNational?: string;
    region?: string;
    perimetreMandat?: string;
    dateFinMandat?: string;
    tribunalRattache?: string;
}

export interface Tribunal {
    id?: number;
    nom: string;
    type?: string;
    region: string;
    gouvernorat?: string;
    adresse?: string;
    telephone?: string;
    email?: string;
    president?: string;
    competenceTerritoriale?: string;
    actif?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ReferentielService {
    private apiUrl = '/api/referentiel';

    constructor(private http: HttpClient) { }

    // GENERIC PAGINATED FETCH
    getData(path: string, params: any = {}): Observable<any> {
        let httpParams = new HttpParams();
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                httpParams = httpParams.append(key, params[key].toString());
            }
        });
        return this.http.get<any>(`${this.apiUrl}/${path}`, { params: httpParams });
    }

    saveData(path: string, id: number | null, data: any): Observable<any> {
        if (id) {
            return this.http.put<any>(`${this.apiUrl}/${path}/${id}`, data);
        } else {
            return this.http.post<any>(`${this.apiUrl}/${path}`, data);
        }
    }

    deleteData(path: string, id: number | string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${path}/${id}`);
    }

    // LEGACY METHODS (to keep compatibility with existing components)
    getAuxiliaires(): Observable<Auxiliaire[]> {
        return this.http.get<any>(`${this.apiUrl}/auxiliaires`).pipe(
            map(res => res.content || res)
        );
    }

    addAuxiliaire(auxiliaire: Omit<Auxiliaire, 'id' | 'createdAt'>): Observable<Auxiliaire> {
        return this.http.post<Auxiliaire>(`${this.apiUrl}/auxiliaires`, auxiliaire);
    }

    getTribunaux(): Observable<Tribunal[]> {
        return this.http.get<any>(`${this.apiUrl}/tribunaux`).pipe(
            map(res => res.content || res)
        );
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

    getItems(type: string): Observable<any[]> {
        return this.http.get<any>(`${this.apiUrl}/${type}`).pipe(
            map(res => res.content || res)
        );
    }

    getGroups(): Observable<any[]> {
        return this.http.get<any>(`${this.apiUrl}/groupes`).pipe(
            map(res => res.content || res)
        );
    }
}
