import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DossierService } from '../../services/dossier.service';
import { NotificationService } from '../../services/notification.service';
import { Dossier } from '../../models/dossier.model';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { AIService, AIAnalysis } from '../../services/ai.service';
import { AffaireService, Affaire } from '../../services/affaire.service';
import { ConfirmDialogService } from '../shared/confirm-dialog/confirm-dialog.service';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-mes-dossiers',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      <main class="main-content">
        <app-header title="Mes Dossiers"></app-header>
        
        <div class="page-container">
          <!-- SOVEREIGN BANNER -->
          <div class="header-banner shadow-premium">
             <div class="banner-info">
                <h1>Mes Dossiers</h1>
                <p>Gestion et suivi des dossiers de défense BNA.</p>
             </div>
             <div class="banner-actions">
                <button class="btn-export secondary" (click)="exportDossiers('pdf')">PDF</button>
                <button class="btn-export secondary" (click)="exportDossiers('excel')">Excel</button>
                <button class="btn-add primary" routerLink="/nouveau-dossier" *ngIf="isChargeDossier() || isAdmin()">
                   Nouveau Dossier
                </button>
             </div>
          </div>

          <!-- DATA TABLE -->
          <div class="table-card shadow-premium fade-in">
             <table class="data-table">
                <thead>
                   <tr>
                      <th>Référence</th>
                      <th>Titre</th>
                      <th>Priorité</th>
                      <th>Statut</th>
                      <th>Finance (TND)</th>
                      <th class="actions-col">Actions</th>
                   </tr>
                </thead>
                <tbody>
                   <tr *ngFor="let d of dossiers" (click)="onViewDossier(d)">
                      <td><span class="ref-pill">{{ d.reference }}</span></td>
                      <td class="titre-cell">{{ d.titre }}</td>
                      <td>
                        <span class="status-badge" [ngClass]="getPrioriteBadge(d.priorite)">{{ d.priorite || '—' }}</span>
                      </td>
                      <td>
                        <span class="status-badge" [ngClass]="getBadgeClass(d.statut)">{{ d.statut }}</span>
                      </td>
                      <td>
                         <div class="finance-stack">
                            <span class="val-p">P: {{ d.budgetProvisionne | number:'1.2-2' }}</span>
                            <span class="val-r" *ngIf="d.fraisReel">R: {{ d.fraisReel | number:'1.2-2' }}</span>
                         </div>
                      </td>
                      <td class="actions-cell">
                         <button class="btn-micro" (click)="$event.stopPropagation(); onViewDossier(d)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                         </button>
                         <button class="btn-micro success" *ngIf="isChargeDossier() && d.statut === 'OUVERT'" (click)="$event.stopPropagation(); executeWorkflow('soumettre', d.id!)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                         </button>
                      </td>
                   </tr>
                </tbody>
             </table>
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
    
    .table-card { background: white; border-radius: 32px; overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { padding: 24px 32px; background: #f8fafc; color: #475569; font-size: 11px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; text-align: left; }
    .data-table td { padding: 24px 32px; border-bottom: 1px solid #f1f5f9; font-size: 15px; font-weight: 650; color: #1e293b; }
    .data-table tr:hover { background: #fcfdfe; cursor: pointer; }
    
    .ref-pill { background: #f1f5f9; padding: 6px 12px; border-radius: 10px; font-family: monospace; font-weight: 800; color: var(--bna-emerald); }
    .status-badge { padding: 6px 14px; border-radius: 12px; font-size: 11px; font-weight: 850; letter-spacing: 0.8px; text-transform: uppercase; }
    .finance-stack { display: flex; flex-direction: column; gap: 4px; font-family: monospace; }
    .val-p { color: #64748b; }
    .val-r { color: var(--bna-emerald); font-weight: 800; }

    .btn-micro { width: 32px; height: 32px; border-radius: 10px; border: none; background: #f8fafc; color: #64748b; cursor: pointer; transition: 0.2s; }
    .btn-micro:hover { transform: scale(1.1); color: var(--bna-emerald); }
    .btn-micro.success:hover { color: #10b981; background: #ecfdf5; }
    
    .btn-add { padding: 14px 28px; border-radius: 16px; border: none; background: var(--bna-emerald); color: white; font-weight: 800; cursor: pointer; transition: 0.3s; }
    .btn-add:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0, 135, 102, 0.25); }
    
    .btn-export { padding: 10px 20px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: white; font-weight: 700; cursor: pointer; margin-right: 10px; transition: 0.2s; }
    .btn-export:hover { border-color: var(--bna-emerald); color: var(--bna-emerald); }

    @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
transform: translateY(0); } }

    /* AFFAIRES STYLES */
    .affaires-section { margin-top: 24px; padding-top: 24px; border-top: 1px solid #f1f5f9; }
    .section-subtitle { font-size: 11px; font-weight: 800; color: #94a3b8; letter-spacing: 1px; margin-bottom: 16px; }
    .no-data { font-size: 14px; color: #94a3b8; font-style: italic; }
    .affaires-list { display: flex; flex-direction: column; gap: 12px; }
    .affaire-card { 
      background: #f8fafc; padding: 16px 20px; border-radius: 16px; 
      display: flex; justify-content: space-between; align-items: center;
      border: 1px solid #f1f5f9;
    }
    .aff-ref { display: block; font-weight: 700; color: #1e293b; font-size: 14px; }
    .aff-type { font-size: 12px; color: #64748b; font-weight: 600; }
    .aff-select {
      padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700;
      border: 1px solid transparent; cursor: pointer; outline: none;
    }
    .aff-select.en_cours { background: #fffbeb; color: #b45309; }
    .aff-select.gagne { background: #f0fdf4; color: #166534; }
    .aff-select.perdu { background: #fef2f2; color: #991b1b; }
    .aff-select.classe { background: #f1f5f9; color: #475569; }

    .pagination-controls {
      display: flex; justify-content: space-between; align-items: center; margin-top: 24px; padding: 0 8px;
    }
    .pagination-info { font-size: 14px; color: #64748b; font-weight: 600; }
    .pagination-buttons { display: flex; gap: 8px; }
    .btn-page {
      width: 38px; height: 38px; border-radius: 10px; border: 1px solid #e2e8f0;
      background: white; color: #475569; font-weight: 700; cursor: pointer;
      display: flex; align-items: center; justify-content: center; transition: all 0.2s;
    }
    .btn-page:hover:not(:disabled) { border-color: var(--bna-green); color: var(--bna-green); background: var(--bna-green-light); transform: translateY(-2px); }
    .btn-page.active { background: var(--bna-green); color: white; border-color: var(--bna-green); }
    .btn-page:disabled { opacity: 0.4; cursor: not-allowed; }

    .header-btns { display: flex; gap: 12px; }
    .btn-export {
      background: white; border: 1px solid #e2e8f0; border-radius: 10px;
      padding: 8px 16px; font-weight: 700; cursor: pointer; display: flex;
      align-items: center; gap: 8px; font-size: 13px; color: #475569;
      transition: all 0.2s;
    }
    .btn-export:hover { background: #f8fafc; border-color: #cbd5e1; transform: translateY(-1px); }
    .btn-export.pdf { border-left: 4px solid #ef4444; }
    .btn-export.excel { border-left: 4px solid #10b981; }

    .finance-cell { display: flex; flex-direction: column; gap: 4px; min-width: 140px; }
    .budget-row, .reel-row { font-size: 13px; font-weight: 600; font-family: 'JetBrains Mono', 'Courier New', monospace; }
    .label { color: #94a3b8; margin-right: 4px; font-weight: 800; font-family: 'Outfit'; }
    .danger-text { color: #dc2626; }
    
    .depassement-badge {
      background: #fee2e2; color: #dc2626; padding: 2px 6px; border-radius: 4px;
      font-size: 10px; font-weight: 800; margin-left: 4px; vertical-align: middle;
      border: 1px solid #fecaca;
    }

    .success-bg { background: #f0fdf4 !important; }
    .danger-bg { background: #fef2f2 !important; }
    
    .depassement-alert-banner {
      display: flex; align-items: center; gap: 16px; 
      padding: 16px 24px; border-radius: 12px; margin-bottom: 8px;
    }
    .depassement-alert-banner.alert-danger {
      background: #fee2e2; border: 1.5px solid #ef4444; color: #991b1b;
    }
    .depassement-alert-banner .highlight { font-weight: 800; text-decoration: underline; }
    
    @media (max-width: 1024px) {
      .sidebar { transform: translateX(-100%); transition: transform 0.3s; }
      .main-content { margin-left: 0; }
      .top-header { padding: 0 24px; }
      .dashboard-content { padding: 24px; }
    }

    /* PREMIUM REJECTION MODAL STYLES */
    .bna-glass-overlay { 
      background: rgba(15, 23, 42, 0.4); 
      backdrop-filter: blur(20px) saturate(160%); 
      -webkit-backdrop-filter: blur(20px) saturate(160%); 
    }
    .bna-danger-ring { 
      width: 56px; height: 56px; border-radius: 18px; 
      background: #fef2f2; color: #ef4444; 
      display: flex; align-items: center; justify-content: center; 
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
    }
    .modal-title h3 { margin: 0; font-size: 24px; font-weight: 800; color: #1e293b; }
    .executive-textarea { 
      width: 100%; border: 2.5px solid #f1f5f9; border-radius: 20px; 
      padding: 24px; font-size: 16px; font-weight: 600; color: #1e293b;
      font-family: inherit; resize: none; transition: 0.3s;
      background: #f8fafc;
    }
    .executive-textarea:focus { border-color: #ef4444; outline: none; background: white; box-shadow: 0 0 0 6px rgba(239, 68, 68, 0.08); }
    .char-counter { font-size: 11px; font-weight: 800; color: #94a3b8; margin-top: 10px; text-align: right; }
    .char-counter.valid { color: #008766; }
    
    .btn-ghost { background: none; border: none; font-weight: 800; color: #94a3b8; cursor: pointer; transition: 0.2s; }
    .btn-ghost:hover { color: #475569; }
    .btn-executive-reject { 
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); 
      color: white; border: none; padding: 16px 32px; border-radius: 16px;
      font-weight: 800; cursor: pointer; transition: 0.3s;
      box-shadow: 0 10px 25px rgba(239, 68, 68, 0.25);
    }
    .btn-executive-reject:disabled { filter: grayscale(1); opacity: 0.5; cursor: not-allowed; box-shadow: none; }
    .btn-executive-reject:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(239, 68, 68, 0.35); }
  `]
})
export class MesDossiersComponent implements OnInit {
  currentUser: any;
  dossiers: Dossier[] = [];
  selectedDossier: Dossier | null = null;
  loading = false;
  error: string | null = null;
  Math = Math;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  // AI Analysis
  aiAnalysis: AIAnalysis | null = null;
  aiLoading = false;

  // Affaires
  affaires: Affaire[] = [];

  // Confirmation
  showConfirm = false;
  confirmMessage = '';
  pendingAction: (() => void) | null = null;

  constructor(
    private authService: AuthService,
    private dossierService: DossierService,
    private notificationService: NotificationService,
    private aiService: AIService,
    private affaireService: AffaireService,
    private router: Router,
    private route: ActivatedRoute,
    private searchService: SearchService,
    private confirmService: ConfirmDialogService
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.loadDossiers();

    this.searchService.searchQuery$.subscribe((query: string) => {
      if (query && query.trim().length > 1) {
        this.loading = true;
        this.dossierService.searchDossiers(query).subscribe({
          next: (results) => {
            this.dossiers = results;
            this.totalElements = results.length;
            this.totalPages = 1;
            this.loading = false;
          },
          error: () => this.loading = false
        });
      } else {
        this.loadDossiers();
      }
    });

    this.route.queryParams.subscribe(params => {
      if (params['highlight']) {
        const ref = params['highlight'];
        const checkExist = setInterval(() => {
          if (this.dossiers.length > 0) {
            const d = this.dossiers.find(d => d.reference === ref);
            if (d) {
              this.onViewDossier(d);
              clearInterval(checkExist);
            }
          }
        }, 300);
        setTimeout(() => clearInterval(checkExist), 5000);
      }
    });
  }

  loadDossiers(): void {
    this.loading = true;
    this.error = null;
    this.dossierService.getDossiers(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        if (data && data.content !== undefined) {
          this.dossiers = data.content || [];
          this.totalElements = data.totalElements || 0;
          this.totalPages = data.totalPages || 0;
        } else {
          // Fallback if data is a plain array
          this.dossiers = Array.isArray(data) ? data : [];
          this.totalElements = this.dossiers.length;
          this.totalPages = 1;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.status === 403
          ? 'Accès refusé. Vous n\'avez pas les droits pour voir cette liste.'
          : 'Impossible de contacter le serveur. Vérifiez que le backend est démarré.';
        this.loading = false;
        this.dossiers = [];
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadDossiers();
  }

  onViewDossier(dossier: Dossier): void {
    this.selectedDossier = dossier;
    if (dossier.id) {
      this.loadAffaires(dossier.id);
    }
  }

  loadAffaires(dossierId: number): void {
    this.affaireService.getAffairesByDossier(dossierId).subscribe(data => {
      this.affaires = data;
    });
  }

  updateAffaireStatut(aff: Affaire, newStatut: string): void {
    if (!aff.id) return;
    this.affaireService.updateStatut(aff.id, newStatut).subscribe({
      next: (updated) => {
        aff.statut = updated.statut;
        this.notificationService.addNotification(`Statut de l'affaire ${aff.referenceJudiciaire} mis à jour.`, "ROLE_CHARGE_DOSSIER", "SUCCESS");
      },
      error: () => {
        this.notificationService.addNotification("Erreur lors de la mise à jour de l'affaire.", "ROLE_ADMIN", "WARNING");
      }
    });
  }

  closeDossierModal(): void {
    this.selectedDossier = null;
    this.aiAnalysis = null;
    this.aiLoading = false;
    this.affaires = [];
  }

  analyzeWithAI(): void {
    if (!this.selectedDossier || !this.selectedDossier.description) {
      this.notificationService.addNotification("Description insuffisante pour une analyse IA.", "ROLE_ADMIN", "WARNING");
      return;
    }

    this.aiLoading = true;
    this.aiAnalysis = null;
    this.aiService.analyzeDossier(this.selectedDossier.description).subscribe({
      next: (result) => {
        this.aiAnalysis = result;
        this.aiLoading = false;
        this.notificationService.addNotification("Analyse IA terminée avec succès.", "ROLE_ADMIN", "SUCCESS");
      },
      error: () => {
        this.aiLoading = false;
        this.notificationService.addNotification("Erreur lors de l'analyse IA.", "ROLE_ADMIN", "WARNING");
      }
    });
  }

  showRefusalModal = false;
  refusalMotif = '';
  refusalDossierId: number | null = null;

  executeWorkflow(action: 'soumettre' | 'prevalider' | 'validerFinal' | 'refuser', id: number): void {
    if (action === 'refuser') {
      this.refusalDossierId = id;
      this.refusalMotif = '';
      this.showRefusalModal = true;
    } else {
      this.dossierService[action](id).subscribe({
        next: (res) => {
          this.notificationService.addNotification(`Action ${action} effectuée.`, "ROLE_ADMIN", "SUCCESS");
          this.loadDossiers();
        },
        error: (err) => alert(err.error?.message || `Erreur lors de l'action ${action}`)
      });
    }
  }

  closeRefusal() {
    this.showRefusalModal = false;
    this.refusalDossierId = null;
  }

  confirmRefusal() {
    if (!this.refusalDossierId || this.refusalMotif.length < 20) return;

    this.dossierService.refuser(this.refusalDossierId, this.refusalMotif).subscribe({
      next: () => {
        this.showRefusalModal = false;
        this.notificationService.addNotification("Dossier refusé avec succès.", "ROLE_ADMIN", "SUCCESS");
        this.loadDossiers();
      },
      error: (err) => {
        this.showRefusalModal = false;
        alert(err.error?.message || "Erreur lors du refus");
      }
    });
  }

  exportDossiers(format: 'pdf' | 'excel'): void {
    window.open(`/api/reports/dossiers/export/${format}`, '_blank');
  }

  getBadgeClass(statut: string): string {
    switch (statut) {
      case 'OUVERT': return 'info';
      case 'EN_COURS': return 'warning';
      case 'EN_ATTENTE_PREVALIDATION': return 'warning';
      case 'EN_ATTENTE_VALIDATION': return 'danger';
      case 'REFUSE': return 'danger';
      case 'CLOTURE': return 'success';
      default: return 'info';
    }
  }

  getPrioriteBadge(priorite: string | undefined): string {
    switch (priorite) {
      case 'HAUTE': return 'danger';
      case 'MOYENNE': return 'warning';
      case 'BASSE': return 'success';
      default: return 'info';
    }
  }

  getInitials(): string {
    if (!this.currentUser || !this.currentUser.username) return 'U';
    return this.currentUser.username.substring(0, 2).toUpperCase();
  }

  formatRoles(): string {
    if (!this.currentUser || !this.currentUser.roles) return 'Rôle';
    return this.currentUser.roles.map((r: string) => r.replace('ROLE_', '').replace('_', ' ')).join(', ');
  }

  isChargeDossier(): boolean {
    return this.authService.hasRole('ROLE_CHARGE_DOSSIER');
  }

  isPreValidateur(): boolean {
    return this.authService.hasRole('ROLE_PRE_VALIDATEUR');
  }

  isValidateur(): boolean {
    return this.authService.hasRole('ROLE_VALIDATEUR');
  }



  isAdmin(): boolean {
    return this.authService.hasRole('ROLE_ADMIN');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
