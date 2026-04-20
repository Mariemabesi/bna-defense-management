import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Procedure {
  id?: number;
  titre: string;
  type: 'ASSIGNATION' | 'REQUETE' | 'APPEL' | 'CASSATION' | 'REFERE' | 'AUTRE';
  statut: 'BROUILLON' | 'EN_COURS' | 'VALIDEE' | 'TERMINEE' | 'ANNULEE';
  description: string;
  affaireId: number;
}

export interface Audience {
  id?: number;
  dateAudience: string;
  lieu: string;
  statut: 'PLANIFIEE' | 'REPORTEE' | 'MENEE' | 'ANNULEE';
  compteRendu: string;
  procedureId: number;
}

export interface Jugement {
  id?: number;
  dateJugement: string;
  decision: string;
  impactFinancier: number;
  referenceJugement: string;
  procedureId: number;
}

@Injectable({
  providedIn: 'root'
})
export class LegalActionService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) { }

  // Procedures
  getAllProcedures(): Observable<Procedure[]> {
    return this.http.get<Procedure[]>(`${this.apiUrl}/procedures`);
  }

  createProcedure(procedure: any): Observable<Procedure> {
    return this.http.post<Procedure>(`${this.apiUrl}/procedures`, procedure);
  }

  validateProcedure(id: number): Observable<Procedure> {
    return this.http.post<Procedure>(`${this.apiUrl}/procedures/${id}/validate`, {});
  }

  updateProcedure(id: number, procedure: Partial<Procedure>): Observable<Procedure> {
    return this.http.put<Procedure>(`${this.apiUrl}/procedures/${id}`, procedure);
  }

  deleteProcedure(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/procedures/${id}`);
  }

  // Audiences
  createAudience(audience: any): Observable<Audience> {
    return this.http.post<Audience>(`${this.apiUrl}/audiences`, audience);
  }

  // Jugements
  createJugement(jugement: any): Observable<Jugement> {
    return this.http.post<Jugement>(`${this.apiUrl}/jugements`, jugement);
  }
}
