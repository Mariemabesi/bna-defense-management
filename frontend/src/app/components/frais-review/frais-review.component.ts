import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogService } from '../shared/confirm-dialog/confirm-dialog.service';
import { ReferentielService } from '../../services/referentiel.service';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-frais-review',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      <main class="main-content">
        <app-header title="Revue des Honoraires & Frais"></app-header>
        <div class="dashboard-content animate-fade">
          <div class="header-section">
            <div>
              <h2>Revue & Pré-Validation</h2>
              <p class="subtitle">Espace de contrôle et reporting financier (Point 9)</p>
            </div>
            <div class="export-actions">
               <button (click)="exportPdf()" class="btn-export pdf" [disabled]="loading">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                 Rapport PDF
               </button>
               <button (click)="exportExcel()" class="btn-export excel" [disabled]="loading">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                 Batch Excel
               </button>
            </div>
          </div>

      <!-- ADVANCED FILTERS -->
      <div class="filter-panel">
        <div class="filter-group">
          <label>Date Début</label>
          <input type="date" [(ngModel)]="filters.start" (change)="fetchFrais()" class="filter-input">
        </div>
        <div class="filter-group">
          <label>Date Fin</label>
          <input type="date" [(ngModel)]="filters.end" (change)="fetchFrais()" class="filter-input">
        </div>
        <div class="filter-group">
          <label>Département / Groupe</label>
          <select [(ngModel)]="filters.groupeId" (change)="fetchFrais()" class="filter-input">
             <option [value]="null">Tous les groupes</option>
             <option *ngFor="let g of groups" [value]="g.id">{{ g.nom }}</option>
          </select>
        </div>
        <div class="filter-group search">
          <label>Recherche Rapide</label>
          <input type="text" [(ngModel)]="searchQuery" placeholder="Référence ou Libellé..." class="filter-input">
        </div>
      </div>

      <div class="table-container">
        <table class="premium-table">
          <thead>
            <tr>
              <th>Dossier</th>
              <th>Désignation / Libellé</th>
              <th>Type</th>
              <th>Montant TTC</th>
              <th>Date Demande</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let f of filteredFrais()">
              <td><span class="ref-badge">{{ f.affaire?.dossier?.reference }}</span></td>
              <td><strong>{{ f.libelle }}</strong></td>
              <td class="type-tag">{{ f.type }}</td>
              <td class="amount">{{ f.montant | number:'1.2-2' }} TND</td>
              <td>{{ f.createdAt | date:'shortDate' }}</td>
              <td>
                <button *ngIf="f.statut === 'ATTENTE'" (click)="preValidate(f)" class="btn-prevalidate">
                  Pré-valider
                </button>
                <span *ngIf="f.statut === 'PRE_VALIDE'" class="status-badge valid">Pré-validé ✅</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="frais.length === 0" class="empty-state">
           <p>Aucun frais correspondant aux filtres.</p>
        </div>
      </div>
      </div>
      </main>
    </div>
  `,
  styles: [`
    .app-layout { display: flex; min-height: 100vh; background-color: #f8fafc; font-family: 'Outfit', sans-serif; }
    .main-content { flex: 1; padding-left: 250px; display: flex; flex-direction: column; }
    .dashboard-content { padding: 40px; max-width: 1400px; width: 100%; margin: 0 auto; }
    
    .header-section { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    h2 { font-size: 32px; font-weight: 800; color: #1e293b; margin: 0; }
    .subtitle { color: #64748b; font-size: 16px; margin-top: 4px; }
    
    .export-actions { display: flex; gap: 12px; }
    .btn-export { display: flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: 12px; border: 1px solid #e2e8f0; font-weight: 700; cursor: pointer; transition: 0.2s; background: white; }
    .btn-export:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .btn-export.pdf:hover { color: #ef4444; border-color: #ef4444; }
    .btn-export.excel:hover { color: #16a34a; border-color: #16a34a; }

    .filter-panel { display: flex; gap: 24px; background: white; padding: 24px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); margin-bottom: 24px; border: 1px solid rgba(0,0,0,0.03); }
    .filter-group { display: flex; flex-direction: column; gap: 8px; flex: 1; }
    .filter-group.search { flex: 1.5; }
    .filter-group label { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
    .filter-input { padding: 12px; border-radius: 10px; border: 1px solid #e2e8f0; font-family: inherit; font-size: 14px; background: #f8fafc; }
    .filter-input:focus { outline: none; border-color: #008766; box-shadow: 0 0 0 4px rgba(0,135,102,0.05); }

    .table-container { background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
    .premium-table { width: 100%; border-collapse: collapse; }
    .premium-table th { text-align: left; padding: 18px 24px; background: #f8fafc; color: #64748b; font-size: 12px; font-weight: 800; border-bottom: 1px solid #f1f5f9; }
    .premium-table td { padding: 18px 24px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    
    .ref-badge { background: #008766; color: white; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; }
    .type-tag { font-weight: 800; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 6px; font-size: 11px; width: fit-content; }
    .amount { font-weight: 800; color: #008766; }
    
    .btn-prevalidate { background: #008766; color: white; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 800; cursor: pointer; }
    .status-badge.valid { color: #16a34a; font-weight: 800; }
    .empty-state { padding: 80px; text-align: center; color: #64748b; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class FraisReviewComponent implements OnInit {
  frais: any[] = [];
  groups: any[] = [];
  searchQuery = '';
  loading = false;
  
  filters = {
    start: '',
    end: '',
    groupeId: null
  };

  private apiUrl = 'http://localhost:8082/api/frais';
  private reportUrl = 'http://localhost:8082/api/reporting/frais/export';

  constructor(
    private http: HttpClient, 
    private confirmService: ConfirmDialogService,
    private referentielService: ReferentielService
  ) {}

  ngOnInit() {
    this.fetchFrais();
    this.loadGroups();
  }

  loadGroups() {
    this.referentielService.getGroups().subscribe(data => this.groups = data);
  }

  fetchFrais() {
    this.http.get<any[]>(this.apiUrl).subscribe(data => {
      this.frais = data;
    });
  }

  filteredFrais() {
    let list = this.frais;
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(f => f.libelle.toLowerCase().includes(q) || f.affaire?.dossier?.reference?.toLowerCase().includes(q));
    }
    if (this.filters.start) {
       list = list.filter(f => f.createdAt && f.createdAt >= this.filters.start);
    }
    if (this.filters.end) {
       list = list.filter(f => f.createdAt && f.createdAt <= this.filters.end);
    }
    return list;
  }

  preValidate(f: any) {
    this.confirmService.open({
      title: 'Confirmer la Pré-validation',
      message: `Êtes-vous sûr de vouloir effectuer cette action ?`
    }).subscribe(ok => {
      if (ok) {
        this.http.put(`${this.apiUrl}/${f.id}/pre-valider`, {}).subscribe(() => this.fetchFrais());
      }
    });
  }

  exportPdf() {
    const params = this.getExportParams();
    window.open(`${this.reportUrl}/pdf?${params}`, '_blank');
  }

  exportExcel() {
    const params = this.getExportParams();
    window.open(`${this.reportUrl}/excel?${params}`, '_blank');
  }

  private getExportParams(): string {
    const parts = [];
    if (this.filters.start) parts.push(`start=${this.filters.start}`);
    if (this.filters.end) parts.push(`end=${this.filters.end}`);
    if (this.filters.groupeId && this.filters.groupeId !== 'null') parts.push(`groupeId=${this.filters.groupeId}`);
    return parts.join('&');
  }
}
