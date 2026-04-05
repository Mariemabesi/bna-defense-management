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
  private apiUrl = '/api/ai';

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

  detectAnomaly(fraisId: number | string): Observable<any> {
    return this.http.post(`${this.apiUrl}/detect-anomaly`, { fraisId });
  }

  predictBudget(dossierId: number | string): Observable<any> {
    return this.http.post(`${this.apiUrl}/predict-budget`, { dossierId });
  }

  getAvocatScore(avocatId: number | string): Observable<any> {
    return this.http.get(`${this.apiUrl}/avocat-score/${avocatId}`);
  }

  getStrategy(dossierId: number | string): Observable<any> {
    return this.http.post(`${this.apiUrl}/recommend-strategy`, { dossierId });
  }

  getPredictiveKPIs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/predictive-kpis`);
  }

  nlSearch(query: string): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/nl-search`, { query });
  }

  getSmartNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/smart-notifications`);
  }

  generateDocument(dossierId: number | string, documentType: string): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/generate-document`, { dossierId, documentType }, { responseType: 'blob' });
  }

  analyzeDocument(documentId: number | string): Observable<any> {
    return this.http.post(`${this.apiUrl}/analyze-document`, { documentId });
  }

  detectFraud(userId: number | string): Observable<any> {
    return this.http.get(`${this.apiUrl}/detect-fraud/${userId}`);
  }
}
