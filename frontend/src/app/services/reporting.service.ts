import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
    totalDossiers: number;
    openDossiers: number;
    closedDossiers: number;
    totalFraisPending: number;
    totalFraisAmountPending: number;
    totalAvocats: number;
    totalHuissiers: number;
    totalProcedures: number;
    totalAdversaires: number;
    successRate: number;
    totalBudgetProvisionne: number;
}

@Injectable({
    providedIn: 'root'
})
export class ReportingService {
    private apiUrl = 'http://localhost:8082/api/reports';

    constructor(private http: HttpClient) { }

    getDashboardStats(): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard-stats`);
    }
}
