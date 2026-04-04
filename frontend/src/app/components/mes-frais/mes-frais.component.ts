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

        <div class="dashboard-content">
          <div class="page-header-actions">
            <h2>Suivi et Validation des Frais</h2>
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Dossier</th>
                  <th>Description</th>
                  <th>Montant (TND)</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let f of paginatedList">
                  <td><strong>{{ f.affaire?.dossier?.reference || f.referenceDossier || '—' }}</strong></td>
                  <td>{{ f.libelle }}</td>
                  <td><strong>{{ f.montant | number:'1.2-2' }}</strong></td>
                  <td>
                    <span class="badge" [ngClass]="getBadgeClass(f.statut)">{{ f.statut }}</span>
                  </td>
                  <td>
                    <div class="actions-cell">
                      <button class="btn-action success-bg" title="Pré-Valider" 
                              *ngIf="f.statut === 'ATTENTE' && isPreValidateur()"
                              (click)="onPreValidate(f)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </button>
                      <button class="btn-action primary-bg" title="Valider Finalement" 
                              *ngIf="f.statut === 'PRE_VALIDE' && isValidateur()"
                              (click)="onValidate(f)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      </button>
                      <button class="btn-action warning-bg" title="Trésorerie" 
                              *ngIf="f.statut === 'VALIDE' && isValidateur()"
                              (click)="onSendToTreasury(f)">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="pagination-container" *ngIf="listFrais.length > pageSize">
            <button (click)="prevPage()" [disabled]="currentPage === 1" class="btn-page">Précédent</button>
            <span class="page-info">Page {{ currentPage }} sur {{ totalPages }}</span>
            <button (click)="nextPage()" [disabled]="currentPage === totalPages" class="btn-page">Suivant</button>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-layout { display: flex; min-height: 100vh; background-color: #f0f4f8; }
    .main-content { flex: 1; margin-left: 280px; }
    .dashboard-content { padding: 32px 48px; }
    .table-container { background: white; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 20px; background: #f8fafc; font-size: 13px; color: #64748b; text-transform: uppercase; }
    td { padding: 20px; border-bottom: 1px solid #f1f5f9; font-size: 15px; }
    .badge { padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; }
    .badge.ATTENTE { background: #fff7ed; color: #c2410c; }
    .badge.PRE_VALIDE { background: #eff6ff; color: #1d4ed8; }
    .badge.VALIDE { background: #f0fdf4; color: #15803d; }
    .badge.ENVOYE_TRESORERIE { background: #fdf2f8; color: #be185d; }
    .actions-cell { display: flex; gap: 8px; }
    .btn-action { width: 36px; height: 36px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
    .btn-action:hover { transform: scale(1.1); }
    .success-bg { background: #dcfce7; color: #166534; }
    .primary-bg { background: #dbeafe; color: #1e40af; }
    .warning-bg { background: #fef3c7; color: #92400e; }
    .pagination-container { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 32px; }
    .btn-page { padding: 8px 16px; border-radius: 8px; border: 1.5px solid #e2e8f0; background: white; font-weight: 700; cursor: pointer; }
    .btn-page:disabled { opacity: 0.5; }
    .page-info { font-size: 14px; font-weight: 600; color: #64748b; }
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
