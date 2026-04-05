import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FraisService, Frais } from '../../services/frais.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ConfirmDialogService } from '../shared/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-mes-frais',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      <main class="main-content">
        <app-header title="Gestion des Frais"></app-header>
        
        <div class="page-container">
          <!-- SOVEREIGN BANNER -->
          <div class="header-banner shadow-premium">
             <div class="banner-info">
                <h1>Registre Financier</h1>
                <p>Suivi souverain des honoraires et frais de défense BNA.</p>
             </div>
             <div class="banner-actions">
                <div class="finance-pill">AUDIT ACTIF</div>
             </div>
          </div>

          <!-- DATA TABLE -->
          <div class="table-card shadow-premium fade-in">
             <table class="data-table">
                <thead>
                   <tr>
                      <th>Dossier Reference</th>
                      <th>Description</th>
                      <th>Montant (TND)</th>
                      <th>Statut</th>
                      <th class="actions-col">Actions Réglementaires</th>
                   </tr>
                </thead>
                <tbody>
                   <tr *ngFor="let f of paginatedList" class="frais-row">
                      <td><span class="ref-pill">{{ f.affaire?.dossier?.reference || f.referenceDossier || '—' }}</span></td>
                      <td class="desc-cell">{{ f.libelle }}</td>
                      <td class="amount-cell"><strong>{{ f.montant | number:'1.2-2' }}</strong></td>
                      <td>
                        <span class="status-badge" [ngClass]="getBadgeClass(f.statut)">{{ f.statut }}</span>
                      </td>
                      <td class="actions-cell">
                         <button class="btn-micro success" *ngIf="f.statut === 'ATTENTE' && isPreValidateur()" (click)="onPreValidate(f)" title="Pré-Valider">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                         </button>
                         <button class="btn-micro primary" *ngIf="f.statut === 'PRE_VALIDE' && isValidateur()" (click)="onValidate(f)" title="Valider Final">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                         </button>
                         <button class="btn-micro warning" *ngIf="f.statut === 'VALIDE' && isValidateur()" (click)="onSendToTreasury(f)" title="Trésorerie">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                         </button>
                      </td>
                   </tr>
                </tbody>
             </table>
             
             <!-- PAGINATION -->
             <div class="pagination-bar" *ngIf="listFrais.length > pageSize">
                <button (click)="prevPage()" [disabled]="currentPage === 1" class="btn-page">PRÉCÉDENT</button>
                <span class="page-counter">PAGE {{ currentPage }} / {{ totalPages }}</span>
                <button (click)="nextPage()" [disabled]="currentPage === totalPages" class="btn-page">SUIVANT</button>
             </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-layout { display: flex; min-height: 100vh; background: transparent; }
    .main-content { flex: 1; margin-left: var(--sidebar-width); }
    .page-container { padding: 48px; max-width: 1500px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px; animation: fadeUp 0.6s ease-out; }
    
    .header-banner { 
      background: white; border-radius: 32px; padding: 48px; border-left: 5px solid var(--bna-emerald);
      display: flex; justify-content: space-between; align-items: center; 
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    }
    .banner-info h1 { font-size: 36px; font-weight: 850; color: #0f172a; margin: 0 0 10px 0; letter-spacing: -1.2px; }
    .banner-info p { font-size: 17px; color: #64748b; margin: 0; font-weight: 600; }
    .finance-pill { padding: 8px 16px; background: #ecfdf5; color: #059669; border-radius: 12px; font-weight: 850; font-size: 11px; letter-spacing: 1px; }
    
    .table-card { background: white; border-radius: 32px; overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { padding: 24px 32px; background: #f8fafc; color: #475569; font-size: 11px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; text-align: left; }
    .data-table td { padding: 24px 32px; border-bottom: 1px solid #f1f5f9; font-size: 15px; font-weight: 650; color: #1e293b; }
    
    .ref-pill { background: #f1f5f9; padding: 6px 12px; border-radius: 10px; font-family: monospace; font-weight: 800; color: var(--bna-emerald); }
    .amount-cell { font-family: 'JetBrains Mono', monospace; font-size: 16px; color: #0f172a; }
    .status-badge { padding: 6px 14px; border-radius: 12px; font-size: 10px; font-weight: 900; letter-spacing: 0.8px; text-transform: uppercase; }
    .status-badge.ATTENTE { background: #fff7ed; color: #c2410c; }
    .status-badge.PRE_VALIDE { background: #eff6ff; color: #1d4ed8; }
    .status-badge.VALIDE { background: #f0fdf4; color: #15803d; }
    
    .btn-micro { width: 36px; height: 36px; border-radius: 12px; border: none; background: #f8fafc; color: #64748b; cursor: pointer; transition: 0.2s; margin-right: 8px; }
    .btn-micro:hover { transform: scale(1.15) rotate(5deg); }
    .btn-micro.success { color: #10b981; background: #ecfdf5; }
    .btn-micro.primary { color: #3b82f6; background: #eff6ff; }
    .btn-micro.warning { color: #f59e0b; background: #fffbeb; }

    .pagination-bar { padding: 24px 32px; background: #f8fafc; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; }
    .btn-page { padding: 10px 20px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: white; font-weight: 850; font-size: 11px; cursor: pointer; color: #475569; }
    .btn-page:hover:not(:disabled) { border-color: var(--bna-emerald); color: var(--bna-emerald); }
    .page-counter { font-size: 12px; font-weight: 800; color: #94a3b8; letter-spacing: 1px; }

    @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class MesFraisComponent implements OnInit {
  listFrais: Frais[] = [];
  currentPage = 1;
  pageSize = 5;

  constructor(
    private fraisService: FraisService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private confirmService: ConfirmDialogService
  ) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.loadFrais();
    }
  }

  get paginatedList(): Frais[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.listFrais.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.listFrais.length / this.pageSize);
  }

  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }

  loadFrais(): void {
    this.fraisService.getFrais().subscribe(data => this.listFrais = data);
  }

  onPreValidate(f: Frais): void {
    if (!f.id) return;
    this.confirmService.open({
        title: 'Confirmation',
        message: 'Êtes-vous sûr de vouloir effectuer cette action ?'
    }).subscribe(ok => {
        if (ok) {
            this.fraisService.preValidate(f.id!).subscribe(() => {
                const ref = f.affaire?.dossier?.reference || f.referenceDossier || 'N/A';
                this.notificationService.addNotification(`Frais pour ${ref} pré-validés.`, "ROLE_PRE_VALIDATEUR", "SUCCESS");
                this.loadFrais();
            });
        }
    });
  }

  onValidate(f: Frais): void {
    if (!f.id) return;
    this.confirmService.open({
        title: 'Confirmation',
        message: 'Êtes-vous sûr de vouloir effectuer cette action ?'
    }).subscribe(ok => {
        if (ok) {
            this.fraisService.validate(f.id!).subscribe(() => {
                const ref = f.affaire?.dossier?.reference || f.referenceDossier || 'N/A';
                this.notificationService.addNotification(`Frais pour ${ref} validés définitivement.`, "ROLE_VALIDATEUR", "SUCCESS");
                this.loadFrais();
            });
        }
    });
  }

  onSendToTreasury(f: Frais): void {
    if (!f.id) return;
    this.confirmService.open({
        title: 'Confirmation',
        message: 'Êtes-vous sûr de vouloir effectuer cette action ?'
    }).subscribe(ok => {
        if (ok) {
            this.fraisService.sendToTreasury(f.id!).subscribe(() => {
                const ref = f.affaire?.dossier?.reference || f.referenceDossier || 'N/A';
                this.notificationService.addNotification(`Frais pour ${ref} envoyés à la trésorerie.`, "ROLE_VALIDATEUR", "INFO");
                this.loadFrais();
            });
        }
    });
  }

  isPreValidateur(): boolean { return this.authService.hasRole('ROLE_PRE_VALIDATEUR'); }
  isValidateur(): boolean { return this.authService.hasRole('ROLE_VALIDATEUR'); }
  getBadgeClass(s: string): string { return s; }
}
