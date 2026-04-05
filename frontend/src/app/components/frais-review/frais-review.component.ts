import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogService } from '../shared/confirm-dialog/confirm-dialog.service';
import { ReferentielService } from '../../services/referentiel.service';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-frais-review',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      <main class="main-content">
        <app-header title="Sovereign Financial Oversight"></app-header>
        
        <div class="page-container">
          <!-- SOVEREIGN BANNER -->
          <div class="header-banner shadow-premium">
             <div class="banner-info">
                <h1>Hub d'Audit Financier</h1>
                <p>Espace souverain de contrôle et pré-validation des honoraires BNA.</p>
             </div>
             <div class="banner-actions">
                <button (click)="exportPdf()" class="btn-executive secondary">RAPPORT PDF</button>
                <button (click)="exportExcel()" class="btn-executive primary">BATCH EXCEL</button>
             </div>
          </div>

          <!-- ADVANCED FILTERS -->
          <div class="filter-glass shadow-premium fade-in">
             <div class="filter-row">
                <div class="filter-unit">
                   <label>Héritage Début</label>
                   <input type="date" [(ngModel)]="filters.start" (change)="fetchFrais()" class="glass-input">
                </div>
                <div class="filter-unit">
                   <label>Héritage Fin</label>
                   <input type="date" [(ngModel)]="filters.end" (change)="fetchFrais()" class="glass-input">
                </div>
                <div class="filter-unit">
                   <label>Département / Groupe</label>
                   <select [(ngModel)]="filters.groupeId" (change)="fetchFrais()" class="glass-select">
                      <option [value]="null">Toutes les Secteurs</option>
                      <option *ngFor="let g of groups" [value]="g.id">{{ g.nom }}</option>
                   </select>
                </div>
                <div class="filter-unit search-stack">
                   <label>Sentinel Search</label>
                   <input type="text" [(ngModel)]="searchQuery" placeholder="Reference ou Libellé..." class="glass-input">
                </div>
             </div>
          </div>

          <!-- AUDIT TABLE -->
          <div class="table-card shadow-premium fade-in">
             <table class="data-table">
                <thead>
                   <tr>
                      <th>Dossier</th>
                      <th>Désignation</th>
                      <th>Type Acte</th>
                      <th>Montant TTC</th>
                      <th>Chronologie</th>
                      <th class="actions-col">Audit Flow</th>
                   </tr>
                </thead>
                <tbody>
                   <tr *ngFor="let f of filteredFrais()" class="frais-row">
                      <td><span class="ref-pill">{{ f.affaire?.dossier?.reference }}</span></td>
                      <td class="desc-cell">{{ f.libelle }}</td>
                      <td><span class="type-aura">{{ f.type }}</span></td>
                      <td class="amount-cell"><strong>{{ f.montant | number:'1.2-2' }}</strong></td>
                      <td class="date-cell">{{ f.createdAt | date:'dd/MM/yyyy' }}</td>
                      <td class="actions-cell">
                         <!-- WORKFLOW N1/N2 -->
                         <div class="btn-group" *ngIf="f.statut === 'ATTENTE' && isPreValidateur()">
                            <button (click)="preValidate(f)" class="btn-tiny success" title="Pré-valider"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></button>
                            <button (click)="reject(f)" class="btn-tiny danger" title="Rejeter"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                         </div>
                         <div class="btn-group" *ngIf="f.statut === 'PRE_VALIDE' && isValidateur()">
                            <button (click)="validate(f)" class="btn-tiny primary" title="Validation Final"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></button>
                            <button (click)="reject(f)" class="btn-tiny danger" title="Rejeter"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                         </div>
                         <!-- FINAL STATUS -->
                         <span *ngIf="f.statut === 'VALIDE'" class="status-pill valid">Validé</span>
                         <span *ngIf="f.statut === 'REJETE'" class="status-pill error" [title]="f.observation">Refusé</span>
                         <span *ngIf="f.statut === 'ENVOYE_TRESORERIE'" class="status-pill treasury">Trésorerie</span>
                      </td>
                   </tr>
                </tbody>
             </table>
          </div>
        </div>

        <!-- REJECTION MODAL OVERHAUL -->
        <div class="modal-root" *ngIf="showRejectModal" (click)="cancelReject()">
           <div class="modal-glass shadow-premium" (click)="$event.stopPropagation()">
              <div class="modal-banner">
                 <div class="modal-aura-icon reject">!</div>
                 <div class="modal-banner-txt">
                    <h3>Motif du Refus Stratégique</h3>
                    <p>Justification exigée pour la conformité BNA.</p>
                 </div>
              </div>
              <div class="modal-pulp">
                 <textarea [(ngModel)]="rejectionReason" placeholder="Argumentaire du refus (technique/financier)..." class="pulp-input"></textarea>
              </div>
              <div class="modal-actions">
                 <button (click)="cancelReject()" class="btn-modal secondary">ANNULER</button>
                 <button (click)="confirmReject()" [disabled]="!rejectionReason.trim()" class="btn-modal danger">DÉCLINER</button>
              </div>
           </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-layout { display: flex; min-height: 100vh; background: transparent; }
    .main-content { flex: 1; margin-left: var(--sidebar-width); }
    .page-container { padding: 48px; max-width: 1600px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px; animation: fadeUp 0.6s ease-out; }
    
    .header-banner { 
      background: white; border-radius: 32px; padding: 48px; border-left: 5px solid var(--bna-emerald);
      display: flex; justify-content: space-between; align-items: center; 
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    }
    .banner-info h1 { font-size: 36px; font-weight: 850; color: #0f172a; margin: 0 0 10px 0; letter-spacing: -1.2px; }
    .banner-info p { font-size: 17px; color: #64748b; margin: 0; font-weight: 600; }
    .btn-executive { padding: 12px 28px; border-radius: 14px; border: 1.5px solid #e2e8f0; font-weight: 850; font-size: 11px; cursor: pointer; transition: 0.3s; letter-spacing: 1px; }
    .btn-executive.primary { background: var(--bna-emerald); color: white; border: none; }
    .btn-executive.secondary { background: #f8fafc; color: #475569; }
    .btn-executive:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }

    .filter-glass { background: white; border-radius: 24px; padding: 32px; }
    .filter-row { display: flex; gap: 24px; }
    .filter-unit { flex: 1; display: flex; flex-direction: column; gap: 10px; }
    .filter-unit label { font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
    .glass-input, .glass-select { padding: 14px; border-radius: 12px; border: 2px solid #f1f5f9; background: #f8fafc; font-family: inherit; font-size: 14px; font-weight: 700; color: #1e293b; }
    .glass-input:focus { outline: none; border-color: var(--bna-emerald); background: white; }

    .table-card { background: white; border-radius: 32px; overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { padding: 24px 32px; background: #f8fafc; color: #475569; font-size: 11px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; text-align: left; }
    .data-table td { padding: 24px 32px; border-bottom: 1px solid #f1f5f9; font-size: 15px; font-weight: 650; color: #1e293b; }
    
    .ref-pill { background: #f1f5f9; padding: 6px 12px; border-radius: 10px; font-family: monospace; font-weight: 800; color: var(--bna-emerald); }
    .type-aura { font-size: 11px; font-weight: 850; color: #64748b; background: #f8fafc; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; }
    .amount-cell { font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #0f172a; }
    .date-cell { font-family: monospace; color: #94a3b8; font-size: 13px; }

    .btn-group { display: flex; gap: 8px; }
    .btn-tiny { width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
    .btn-tiny.success { background: #ecfdf5; color: #10b981; }
    .btn-tiny.primary { background: #eff6ff; color: #3b82f6; }
    .btn-tiny.danger { background: #fef2f2; color: #ef4444; }
    .btn-tiny:hover { transform: scale(1.15) rotate(5deg); }

    .status-pill { padding: 6px 14px; border-radius: 12px; font-size: 9px; font-weight: 950; letter-spacing: 1px; text-transform: uppercase; }
    .status-pill.valid { background: #ecfdf5; color: #10b981; }
    .status-pill.error { background: #fef2f2; color: #ef4444; }
    .status-pill.treasury { background: #eff6ff; color: #3b82f6; }

    /* MODAL OVERHAUL */
    .modal-root { position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(12px); z-index: 3000; display: flex; align-items: center; justify-content: center; }
    .modal-glass { background: white; border-radius: 32px; width: 100%; max-width: 500px; padding: 40px; }
    .modal-banner { display: flex; align-items: center; gap: 20px; margin-bottom: 32px; }
    .modal-aura-icon { width: 56px; height: 56px; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 900; }
    .modal-aura-icon.reject { background: #fef2f2; color: #ef4444; }
    .modal-banner-txt h3 { margin: 0; font-size: 20px; font-weight: 850; color: #0f172a; }
    .modal-banner-txt p { margin: 0; font-size: 14px; color: #64748b; font-weight: 600; }
    .pulp-input { width: 100%; padding: 24px; border-radius: 20px; border: 2.5px solid #f1f5f9; background: #f8fafc; font-size: 15px; font-weight: 700; height: 160px; resize: none; }
    .pulp-input:focus { outline: none; border-color: #ef4444; background: white; }
    .modal-actions { margin-top: 32px; display: flex; gap: 16px; }
    .btn-modal { flex: 1; padding: 16px; border-radius: 16px; border: none; font-weight: 850; letter-spacing: 1px; cursor: pointer; transition: 0.3s; }
    .btn-modal.secondary { background: #f8fafc; color: #475569; }
    .btn-modal.danger { background: #ef4444; color: white; }

    @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

    .bounce-in { animation: bounceIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
    @keyframes bounceIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
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

  private apiUrl = '/api/frais';
  private reportUrl = '/api/reporting/frais/export';

  constructor(
    private http: HttpClient, 
    private confirmService: ConfirmDialogService,
    private referentielService: ReferentielService,
    private authService: AuthService
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

  isPreValidateur() { return this.authService.hasRole('ROLE_PRE_VALIDATEUR') || this.authService.hasRole('ROLE_ADMIN'); }
  isValidateur() { return this.authService.hasRole('ROLE_VALIDATEUR') || this.authService.hasRole('ROLE_ADMIN'); }

  validate(f: any) {
    this.confirmService.open({
      title: 'Validation Finale',
      message: `Voulez-vous valider définitivement ce frais de ${f.montant} TND ?`
    }).subscribe(ok => {
      if (ok) {
        this.http.put(`${this.apiUrl}/${f.id}/valider`, {}).subscribe(() => this.fetchFrais());
      }
    });
  }

  showRejectModal = false;
  rejectionReason = '';
  selectedFraisForReject: any = null;

  reject(f: any) {
    this.selectedFraisForReject = f;
    this.rejectionReason = '';
    this.showRejectModal = true;
  }

  cancelReject() {
    this.showRejectModal = false;
    this.selectedFraisForReject = null;
  }

  confirmReject() {
    if (!this.selectedFraisForReject || !this.rejectionReason.trim()) return;
    
    this.http.put(`${this.apiUrl}/${this.selectedFraisForReject.id}/rejeter?reason=${encodeURIComponent(this.rejectionReason)}`, {}).subscribe({
      next: () => {
        this.showRejectModal = false;
        this.fetchFrais();
      },
      error: (err) => {
        this.showRejectModal = false;
        alert('Erreur lors du rejet: ' + (err.error?.message || 'Problème serveur'));
      }
    });
  }
}
