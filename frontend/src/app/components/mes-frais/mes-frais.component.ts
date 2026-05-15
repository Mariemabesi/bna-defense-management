import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FraisService, Frais } from '../../services/frais.service';
import { DossierService } from '../../services/dossier.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ConfirmDialogService } from '../shared/confirm-dialog/confirm-dialog.service';
import { Dossier } from '../../models/dossier.model';
import { FraisFinalisationFormComponent } from './frais-finalisation-form.component';
import { FraisDeclarationFormComponent } from './frais-declaration-form.component';

@Component({
  selector: 'app-mes-frais',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, FraisFinalisationFormComponent, FraisDeclarationFormComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>

      <main class="main-content">
        <app-header title="Gestion des Frais"></app-header>

        <div class="dashboard-content">
          <div class="page-header-actions">
            <h2>Gestion et Finalisation des Frais</h2>
            
            <div class="tabs-nav">
              <button [class.active]="activeTab === 'FINAL'" (click)="activeTab = 'FINAL'">
                Dossiers à Clôturer Financièrement
                <span class="badge-count" *ngIf="dossiersToFinalize.length > 0">{{ dossiersToFinalize.length }}</span>
              </button>
              <button [class.active]="activeTab === 'BUDGET'" (click)="activeTab = 'BUDGET'">Suivi Budgétaire</button>
              <button [class.active]="activeTab === 'LIST'" (click)="activeTab = 'LIST'">Historique des Dépenses</button>
              <div class="flex-grow"></div>
            </div>
          </div>

          <!-- TAB 1: DOSSIERS TO FINALIZE -->
          <div class="table-container slideIn" *ngIf="activeTab === 'FINAL'">
            <table>
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Titre</th>
                  <th>Budget Initial</th>
                  <th>Benchmark (TTC)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let d of dossiersToFinalize">
                  <td><strong class="ref-code">{{ d.reference }}</strong></td>
                  <td>{{ d.titre }}</td>
                  <td>{{ d.fraisInitial | number:'1.2-2' }} TND</td>
                  <td><span class="benchmark">{{ (d.fraisInitial || 0) * 1.19 | number:'1.2-2' }} TND</span></td>
                  <td>
                    <div class="actions-cell">
                      <button class="btn-action approve-btn" (click)="openFinalize(d)" title="Finaliser">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </button>
                      
                      <button class="btn-action view-btn" title="Historique" (click)="loadHistory(d)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      </button>

                      <div class="more-actions-wrapper">
                         <button class="btn-action more-btn" (click)="toggleActionMenu($event, d.id!)" title="Plus d'actions">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="1.5"></circle><circle cx="12" cy="5" r="1.5"></circle><circle cx="12" cy="19" r="1.5"></circle></svg>
                         </button>
                         <div class="actions-dropdown" *ngIf="activeActionMenuId === d.id" (click)="$event.stopPropagation()">
                            <button class="btn-action view-btn" title="Exporter PDF" (click)="onDownloadPdf(d)">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                            </button>
                         </div>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="dossiersToFinalize.length === 0">
                   <td colspan="5" class="empty-state">Aucun dossier en attente de clôture financière.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- TAB 2: BUDGET TRACKING -->
          <div class="table-container slideIn" *ngIf="activeTab === 'BUDGET'">
            <table>
              <thead>
                <tr>
                  <th>Dossier</th>
                  <th>Budget Prévu</th>
                  <th>Dépenses Réelles</th>
                  <th>Écart</th>
                  <th>Statut Financier</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let d of myDossiers">
                  <td><strong class="ref-code">{{ d.reference }}</strong></td>
                  <td>{{ d.fraisInitial | number:'1.2-2' }} TND</td>
                  <td>{{ d.fraisReel | number:'1.2-2' }} TND</td>
                  <td>
                    <span [class.text-danger]="(d.fraisReel || 0) > (d.fraisInitial || 0)" 
                          [class.text-success]="(d.fraisReel || 0) <= (d.fraisInitial || 0)">
                      {{ (d.fraisInitial || 0) - (d.fraisReel || 0) | number:'1.2-2' }} TND
                    </span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="d.financialStatut || 'NONE'">{{ d.financialStatut || 'NON DÉMARRÉ' }}</span>
                  </td>
                  <td>
                    <div class="actions-cell">
                      <button class="btn-action view-btn" title="Détails" (click)="openFinalize(d)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- TAB 3: FRAIS LIST (Paginated) -->
          <div class="table-container slideIn" *ngIf="activeTab === 'LIST'">
            <table>
              <thead>
                <tr>
                  <th>Libellé</th>
                  <th>Dossier / Affaire</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let f of listFrais">
                  <td>{{ f.libelle }}</td>
                  <td>
                    <div class="dossier-info-cell">
                      <span class="d-ref">{{ f.affaire?.dossier?.reference || '-' }}</span>
                      <span class="a-ref">{{ f.affaire?.referenceJudiciaire || '-' }}</span>
                    </div>
                  </td>
                  <td><strong class="amt">{{ f.montant | number:'1.2-2' }} TND</strong></td>
                  <td><span class="badge" [ngClass]="f.statut">{{ f.statut }}</span></td>
                  <td>{{ f.dateDemande | date:'dd/MM/yyyy' }}</td>
                  <td>
                    <div class="actions-cell">
                       <button class="btn-action view-btn" title="Télécharger" (click)="onDownloadAttachment(f)" *ngIf="f.attachments?.length">
                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                       </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- PAGINATION FOR FRAIS LIST -->
            <div class="pagination-footer" *ngIf="totalPages > 1">
              <div class="pagination-info">Affichage de <b>{{ listFrais.length }}</b> sur <b>{{ totalElements }}</b> frais</div>
              <div class="pagination-controls">
                <button class="btn-page" [disabled]="currentPage === 0" (click)="onPageChange(currentPage - 1)">‹ Précédent</button>
                <div class="page-numbers">
                  <button *ngFor="let p of [].constructor(totalPages); let i = index" 
                          class="btn-number" [class.active]="i === currentPage" (click)="onPageChange(i)">{{ i + 1 }}</button>
                </div>
                <button class="btn-page" [disabled]="currentPage === totalPages - 1" (click)="onPageChange(currentPage + 1)">Suivant ›</button>
              </div>
            </div>
          </div>

          <!-- HISTORY MODAL -->
          <div class="invoice-overlay" *ngIf="showHistory" (click)="showHistory = false">
            <div class="invoice-container history-modal" (click)="$event.stopPropagation()">
              <div class="invoice-header">
                <h2>Historique du Workflow - {{ selectedDossier?.reference }}</h2>
                <button class="btn-close-circle" (click)="showHistory = false">×</button>
              </div>
              <div class="invoice-scroll-area">
                <div class="timeline">
                  <div class="timeline-item" *ngFor="let h of historyList">
                    <div class="t-date">{{ h.timestamp | date:'dd/MM/yyyy HH:mm' }}</div>
                    <div class="t-user">{{ h.userEmail }}</div>
                    <div class="t-action">{{ h.action }}</div>
                    <div class="t-details">{{ h.details }}</div>
                  </div>
                  <div class="empty-state" *ngIf="historyList.length === 0">Aucun historique disponible.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <app-frais-finalisation-form 
          *ngIf="selectedDossier" 
          [dossier]="selectedDossier" 
          (close)="selectedDossier = null"
          (workflowAction)="onWorkflowAction($event)">
        </app-frais-finalisation-form>

        <app-frais-declaration-form
          *ngIf="showDeclaration"
          [availableDossiers]="myDossiers"
          (close)="showDeclaration = false"
          (success)="onDeclarationSuccess()">
        </app-frais-declaration-form>
      </main>
    </div>
  `,
  styles: [`
    .app-layout { display: flex; min-height: 100vh; background-color: #f8fafc; }
    .main-content { flex: 1; margin-left: 280px; }
    .dashboard-content { padding: 32px 48px; }
    
    .page-header-actions { margin-bottom: 32px; }
    .page-header-actions h2 { font-size: 24px; color: #1e293b; margin-bottom: 20px; }

    .tabs-nav { display: flex; align-items: center; gap: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 0; }
    .flex-grow { flex-grow: 1; }
    .tabs-nav button { 
      padding: 12px 24px; border: none; background: none; 
      font-size: 15px; font-weight: 600; color: #64748b; 
      cursor: pointer; position: relative; transition: 0.3s;
    }
    .tabs-nav button.active { color: #3b82f6; }
    .tabs-nav button.active::after {
      content: ''; position: absolute; bottom: -2px; left: 0; width: 100%; height: 2px; background: #3b82f6;
    }

    .btn-declare {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 20px; background: #3b82f6; color: white;
      border: none; border-radius: 10px; font-weight: 700; font-size: 14px;
      cursor: pointer; transition: 0.2s; margin-bottom: 8px;
    }
    .btn-declare:hover { background: #2563eb; transform: translateY(-2px); }

    .badge-count { 
      background: #ef4444; color: white; padding: 2px 6px; 
      border-radius: 10px; font-size: 11px; margin-left: 8px; vertical-align: middle;
    }

    .table-container { background: white; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 16px 24px; background: #f8fafc; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
    td { padding: 20px 24px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
    
    .empty-state { text-align: center; padding: 60px !important; color: #94a3b8; font-style: italic; }

    .badge { padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .badge.EN_ATTENTE_PREVALIDATION { background: #fff7ed; color: #c2410c; }
    .badge.PRE_VALIDE { background: #eff6ff; color: #1d4ed8; }
    .badge.VALIDE { background: #f0fdf4; color: #15803d; }
    .badge.REFUSE { background: #fef2f2; color: #991b1b; }
    .badge.ENVOYE_TRESORERIE { background: #f5f3ff; color: #5b21b6; }
    
    .benchmark { font-weight: 600; color: #0891b2; background: #ecfeff; padding: 4px 8px; border-radius: 6px; }

    .btn-action { 
      background: white; 
      color: #64748b; 
      border: 1px solid #e2e8f0; 
      width: 40px; 
      height: 40px; 
      border-radius: 12px; 
      cursor: pointer; 
      display: inline-flex; 
      align-items: center; 
      justify-content: center; 
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
      position: relative;
    }
    .btn-action:hover { 
      transform: translateY(-3px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      border-color: #3b82f6;
      z-index: 10;
    }
    .btn-action svg { width: 16px; height: 16px; transition: transform 0.2s; }
    .btn-action:hover svg { transform: scale(1.1); }

    .view-btn { background: #f8fafc; color: #334155; }
    .view-btn:hover { background: white; color: #0f172a; border-color: #cbd5e1; }
    
    .approve-btn { background: #f0fdf4; color: #16a34a; border-color: #bbf7d0; }
    .approve-btn:hover { background: #16a34a; color: white; border-color: #16a34a; }

    .more-actions-wrapper { position: relative; display: flex; align-items: center; }
    .actions-dropdown {
      position: absolute;
      top: 50%;
      right: 45px;
      transform: translateY(-50%);
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 8px;
      display: flex;
      gap: 8px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      z-index: 100;
      animation: slideInRight 0.2s ease-out;
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateY(-50%) translateX(10px); }
      to { opacity: 1; transform: translateY(-50%) translateX(0); }
    }

    .pagination-container { display: flex; justify-content: center; align-items: center; gap: 20px; padding: 24px; }
    .btn-page { padding: 8px 16px; border-radius: 8px; border: 1.5px solid #e2e8f0; background: white; font-weight: 700; cursor: pointer; }
    .btn-page:disabled { opacity: 0.5; }
    .page-info { font-size: 13px; font-weight: 600; color: #64748b; }
    .text-danger { color: #ef4444; font-weight: 700; }
    .text-success { color: #10b981; font-weight: 700; }

    /* PAGINATION STYLES */
    .pagination-footer {
      margin-top: 24px; display: flex; justify-content: space-between; align-items: center;
      padding: 0 8px; border-top: 1px solid #f1f5f9; padding-top: 24px;
    }
    .pagination-info { font-size: 13px; color: #64748b; }
    .pagination-info b { color: #1e293b; }
    .pagination-controls { display: flex; align-items: center; gap: 12px; }
    .page-numbers { display: flex; gap: 6px; }
    .btn-page {
      background: white; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 10px;
      font-size: 13px; font-weight: 700; color: #475569; cursor: pointer; transition: 0.2s;
    }
    .btn-page:hover:not(:disabled) { background: #f8fafc; border-color: #cbd5e1; }
    .btn-page:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-number {
      width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
      background: white; border: 1px solid #e2e8f0; border-radius: 10px;
      font-size: 13px; font-weight: 700; color: #64748b; cursor: pointer;
    }
    .btn-number.active { background: #3b82f6; border-color: #3b82f6; color: white; }

    .ref-code { color: #008766; font-family: monospace; font-weight: 800; }
    .amt { color: #1e293b; font-size: 15px; }
    
    .dossier-info-cell { display: flex; flex-direction: column; gap: 2px; }
    .d-ref { font-size: 12px; font-weight: 700; color: #008766; }
    .a-ref { font-size: 11px; color: #64748b; }

    .slideIn { animation: slideIn 0.3s ease-out; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class MesFraisComponent implements OnInit {
  listFrais: any[] = [];
  activeActionMenuId: number | null = null;
  dossiersToFinalize: Dossier[] = [];
  myDossiers: Dossier[] = [];
  activeTab: 'FINAL' | 'BUDGET' | 'LIST' = 'FINAL';
  selectedDossier: Dossier | null = null;
  showDeclaration = false;
  showHistory = false;
  historyList: any[] = [];

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  constructor(
    private fraisService: FraisService,
    private dossierService: DossierService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private confirmService: ConfirmDialogService
  ) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.loadFrais();
      this.loadDossiersToFinalize();
      this.loadMyDossiers();
    }
  }

  toggleActionMenu(event: Event, id: number) {
    event.stopPropagation();
    this.activeActionMenuId = this.activeActionMenuId === id ? null : id;
  }

  @HostListener('document:click')
  closeActionMenu() {
    this.activeActionMenuId = null;
  }

  loadFrais(): void {
    this.fraisService.getFrais(this.currentPage, this.pageSize).subscribe(data => {
      this.listFrais = data.content;
      this.totalElements = data.totalElements;
      this.totalPages = data.totalPages;
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadFrais();
  }

  onDeclarationSuccess() {
    this.showDeclaration = false;
    this.notificationService.addNotification("Dépense déclarée avec succès.", "ROLE_CHARGE_DOSSIER", "SUCCESS");
    this.loadFrais();
  }

  loadDossiersToFinalize(): void {
    this.dossierService.getDossiersToFinalize().subscribe(data => this.dossiersToFinalize = data);
  }

  loadMyDossiers(): void {
    this.dossierService.getMyDossiers(0, 100).subscribe(page => {
      this.myDossiers = page.content;
    });
  }

  onDownloadAttachment(f: any) {
    if (f.attachments && f.attachments.length > 0) {
      const attachmentId = f.attachments[0].id;
      const url = this.fraisService.getAttachmentDownloadUrl(attachmentId);
      window.open(url, '_blank');
    }
  }

  openFinalize(d: Dossier) {
    this.selectedDossier = d;
  }

  loadHistory(d: Dossier) {
    this.selectedDossier = d;
    this.dossierService.getHistory(d.id!).subscribe(data => {
      this.historyList = data;
      this.showHistory = true;
    });
  }

  onDownloadPdf(d: Dossier) {
    this.dossierService.exportSingleDossierPdf(d.id!).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport_financier_${d.reference}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  onWorkflowAction(event: any) {
    if (!this.selectedDossier?.id) return;
    const id = this.selectedDossier.id;
    const action = event.type;
    let obs;

    switch (action) {
      case 'SUBMIT':
        obs = this.dossierService.soumettreFinance(id, event.form);
        break;
      case 'APPROVE_PRE':
        obs = this.dossierService.prevaliderFinance(id, event.commentaire);
        break;
      case 'REJECT_PRE':
        obs = this.dossierService.refuserPrevalidationFinance(id, event.commentaire);
        break;
      case 'APPROVE_FINAL':
        obs = this.dossierService.validerFinanceFinal(id, event.commentaire);
        break;
      case 'REJECT_FINAL':
        obs = this.dossierService.refuserFinanceFinal(id, event.commentaire);
        break;
    }

    if (obs) {
      obs.subscribe({
        next: () => {
          this.notificationService.addNotification(`Action ${action} effectuée.`, "ROLE_ADMIN", "SUCCESS");
          this.selectedDossier = null;
          this.loadDossiersToFinalize();
        },
        error: (err) => {
          this.notificationService.addNotification("Erreur: " + (err.error?.message || "Échec de l'action"), "ROLE_ADMIN", "WARNING");
        }
      });
    }
  }

  onPreValidate(f: any): void {
    this.fraisService.preValidate(f.id!).subscribe(() => {
      this.loadFrais();
      this.notificationService.addNotification(`Frais pré-validés.`, "ROLE_PRE_VALIDATEUR", "SUCCESS");
    });
  }

  onValidate(f: any): void {
    this.fraisService.validate(f.id!).subscribe(() => {
      this.loadFrais();
      this.notificationService.addNotification(`Frais validés.`, "ROLE_VALIDATEUR", "SUCCESS");
    });
  }

  isCharge(): boolean { return this.authService.hasRole('ROLE_CHARGE_DOSSIER'); }
  isPreValidateur(): boolean { return this.authService.hasRole('ROLE_PRE_VALIDATEUR'); }
  isValidateur(): boolean { return this.authService.hasRole('ROLE_VALIDATEUR'); }
  getBadgeClass(s: string): string { return s; }
}
