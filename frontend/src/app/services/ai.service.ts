import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AIAnalysis {
  typeProcedure: string;
  natureAffaire: string;
  phaseInitiale: string;
  confidence: number;
  summary: string;
  riskLevel: string;
  suggestions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AIService {
  private apiUrl = 'http://localhost:8082/api/ai';

  constructor(private http: HttpClient) {}

  classifyDossier(description: string): Observable<AIAnalysis> {
    return this.http.post<AIAnalysis>(`${this.apiUrl}/classify-dossier`, { description });
  }

  analyzeDossier(dossierId: number | string): Observable<any> {
    return this.http.post(`${this.apiUrl}/analyze-dossier`, { dossierId });
  }

  getRiskScore(dossierId: number | string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/risk-score`, { dossierId, ...data });
  }

  getSummary(dossierId: number | string): Observable<any> {
    return this.http.post(`${this.apiUrl}/summarize-dossier`, { dossierId });
  }

  generateDocument(dossierId: number | string, documentType: string): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/generate-document`, { dossierId, documentType }, { responseType: 'blob' });
  }
}
