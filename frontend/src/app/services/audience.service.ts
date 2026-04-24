import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tribunal } from './referentiel.service';

export interface Audience {
  id?: number;
  procedureId?: number;
  tribunal?: Tribunal;
  dateHeure: string;
  salle: string;
  statut: 'PREVUE' | 'REPORTEE' | 'TENUE' | 'ANNULEE';
  observation: string;
}

@Injectable({
  providedIn: 'root'
})
export class AudienceService {
  private apiUrl = '/api/audiences';

  constructor(private http: HttpClient) { }

  getAllAudiences(): Observable<Audience[]> {
    return this.http.get<Audience[]>(this.apiUrl);
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  getAudienceById(id: number): Observable<Audience> {
    return this.http.get<Audience>(`${this.apiUrl}/${id}`);
  }

  createAudience(audience: Audience): Observable<Audience> {
    return this.http.post<Audience>(this.apiUrl, audience);
  }

  updateAudience(id: number, audience: Audience): Observable<Audience> {
    return this.http.put<Audience>(`${this.apiUrl}/${id}`, audience);
  }

  deleteAudience(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
