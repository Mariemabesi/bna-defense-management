import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LegalActionService, Procedure } from '../../services/legal-action.service';
import { AuthService } from '../../services/auth.service';
import { AffaireService, Affaire } from '../../services/affaire.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-legal-action',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>

      <main class="main-content">
        <app-header title="Actions en Justice"></app-header>

        <div class="dashboard-content">

          <!-- PAGE HEADER -->
          <div class="page-header-actions slideIn">
            <div class="page-title-block">
              <h2>Pilotage Juridique</h2>
              <p class="page-subtitle">Gestion centralisée des procédures judiciaires.</p>
            </div>
            <div class="header-btns">
              <div class="mini-stats-bar">
                <div class="mini-stat">
                  <span class="mini-val">{{ procedures.length }}</span>
                  <span class="mini-lbl">Procédures</span>
                </div>
                <div class="mini-stat success">
                  <span class="mini-val">{{ getValidatedCount() }}</span>
                  <span class="mini-lbl">Validées</span>
                </div>
                <div class="mini-stat pending">
                  <span class="mini-val">{{ getPendingCount() }}</span>
                  <span class="mini-lbl">En cours</span>
                </div>
              </div>
              <button class="btn-primary" (click)="openCreateModal()" *ngIf="canManage()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Nouvelle Procédure
              </button>
            </div>
          </div>

          <!-- FILTER / SEARCH BAR -->
          <div class="tabs-filter-container slideIn">
            <div class="search-filter-bar">
              <div class="search-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" [(ngModel)]="searchTerm" (input)="filterProcedures()" placeholder="Rechercher par titre ou ID...">
              </div>
              <div class="filter-pills">
                <button class="pill" [class.active]="filterType === 'ALL'" (click)="setType('ALL')">Tous</button>
                <button class="pill" [class.active]="filterType === 'ASSIGNATION'" (click)="setType('ASSIGNATION')">⚖️ Assignation</button>
                <button class="pill" [class.active]="filterType === 'REFERE'" (click)="setType('REFERE')">⚡ Référé</button>
                <button class="pill" [class.active]="filterType === 'APPEL'" (click)="setType('APPEL')">🔄 Appel</button>
                <button class="pill" [class.active]="filterType === 'CASSATION'" (click)="setType('CASSATION')">🏛️ Cassation</button>
              </div>
              <div class="filter-select-group">
                <select [(ngModel)]="filterStatut" (change)="filterProcedures()">
                  <option value="ALL">Tous les statuts</option>
                  <option value="BROUILLON">⚪ Brouillon</option>
                  <option value="EN_COURS">🔵 En Cours</option>
                  <option value="VALIDEE">✅ Validée</option>
                  <option value="TERMINEE">🏁 Terminée</option>
                  <option value="ANNULEE">🚫 Annulée</option>
                </select>
              </div>
            </div>
          </div>

          <!-- LOADING STATE -->
          <div class="loading-state" *ngIf="loading">
            <div class="spinner"></div>
            <p>Chargement des procédures...</p>
          </div>

          <!-- ERROR STATE -->
          <div class="error-state" *ngIf="error && !loading">
            <div class="error-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <h3>Erreur de chargement</h3>
            <p>{{ error }}</p>
            <button class="btn-primary" (click)="loadData()">Réessayer</button>
          </div>

          <!-- TABLE -->
          <div class="table-container slideIn" *ngIf="!loading && !error">
            <table>
              <thead>
                <tr>
                  <th>#ID</th>
                  <th>Titre / Procédure</th>
                  <th>Type</th>
                  <th>Affaire</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of filteredProcedures">
                  <td><strong class="ref-code">#{{ p.id }}</strong></td>
                  <td>
                    <div class="procedure-cell">
                      <span class="proc-title">{{ p.titre }}</span>
                      <span class="proc-desc" *ngIf="p.description">{{ p.description | slice:0:65 }}{{ (p.description?.length || 0) > 65 ? '...' : '' }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="badge-type" [ngClass]="p.type">{{ p.type }}</span>
                  </td>
                  <td>
                    <span class="affaire-ref">📁 {{ getAffaireRef(p.affaireId) }}</span>
                  </td>
                  <td>
                    <span class="status-pill" [ngClass]="p.statut">{{ p.statut | titlecase }}</span>
                  </td>
                  <td>
                    <div class="actions-cell">
                      <button class="btn-icon" (click)="onEditProcedure(p)" title="Modifier" *ngIf="canManage()">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button class="btn-icon success" *ngIf="p.statut !== 'VALIDEE' && canManage()" (click)="onValidate(p.id!)" title="Valider">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </button>
                      <button class="btn-icon danger" (click)="onDelete(p.id!)" title="Supprimer" *ngIf="canManage()">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="filteredProcedures.length === 0">
                  <td colspan="6" class="empty-row">
                    <div class="empty-state-inline">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                      <p>Aucune procédure trouvée.</p>
                      <button class="btn-primary" (click)="openCreateModal()" *ngIf="canManage()">Créer une procédure</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </main>

      <!-- CREATE / EDIT MODAL -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-card slideIn" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-block">
              <div class="modal-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
              </div>
              <div>
                <h3>{{ isEditing ? 'Modifier la Procédure' : 'Nouvelle Action en Justice' }}</h3>
                <p>{{ isEditing ? 'Mettez à jour les informations de cette procédure.' : 'Enregistrez une nouvelle action judiciaire.' }}</p>
              </div>
            </div>
            <button class="modal-close" (click)="closeModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div class="modal-body">
            <form (ngSubmit)="onSubmit()">
              <div class="form-section">
                <div class="form-row">
                  <div class="form-group full">
                    <label>Affaire Référente <span class="required">*</span></label>
                    <select [(ngModel)]="activeProcedure.affaireId" name="affaireId" required [disabled]="isEditing">
                      <option [ngValue]="null" disabled selected>Sélectionner une affaire...</option>
                      <option *ngFor="let a of affaires" [value]="a.id">{{ a.referenceJudiciaire }} — {{ a.titre }}</option>
                    </select>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group full">
                    <label>Titre de l'action <span class="required">*</span></label>
                    <input type="text" [(ngModel)]="activeProcedure.titre" name="titre" placeholder="Ex: Assignation en paiement..." required>
                  </div>
                </div>
                <div class="form-row two-col">
                  <div class="form-group">
                    <label>Type de Procédure</label>
                    <select [(ngModel)]="activeProcedure.type" name="type">
                      <option value="ASSIGNATION">⚖️ Assignation</option>
                      <option value="REQUETE">📝 Requête</option>
                      <option value="REFERE">⚡ Référé</option>
                      <option value="APPEL">🔄 Appel</option>
                      <option value="CASSATION">🏛️ Cassation</option>
                      <option value="AUTRE">➕ Autre</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Statut</label>
                    <select [(ngModel)]="activeProcedure.statut" name="statut">
                      <option value="BROUILLON">⚪ Brouillon</option>
                      <option value="EN_COURS">🔵 En Cours</option>
                      <option value="VALIDEE">✅ Validée</option>
                    </select>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group full">
                    <label>Description / Consignes</label>
                    <textarea [(ngModel)]="activeProcedure.description" name="description" rows="4" placeholder="Détails complémentaires sur la procédure..."></textarea>
                  </div>
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn-secondary" (click)="closeModal()">Annuler</button>
                <button type="submit" class="btn-primary" [disabled]="!activeProcedure.affaireId || !activeProcedure.titre">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  {{ isEditing ? 'Sauvegarder' : 'Confirmer le lancement' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ============================================
       PLATFORM CSS SYSTEM — matches MesDossiers
       ============================================ */

    /* Page shell */
    .dashboard-content { padding: 40px; }

    /* Page header */
    .page-header-actions {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
    }
    .page-title-block h2 { font-size: 24px; font-weight: 800; color: #1e293b; margin: 0; }
    .page-subtitle { font-size: 14px; color: #64748b; margin: 4px 0 0; }

    .header-btns { display: flex; align-items: center; gap: 16px; }

    /* Mini stats strip */
    .mini-stats-bar { display: flex; gap: 8px; }
    .mini-stat {
      display: flex; flex-direction: column; align-items: center;
      background: white; border: 1px solid #e2e8f0; border-radius: 12px;
      padding: 10px 20px; min-width: 80px;
    }
    .mini-val { font-size: 20px; font-weight: 800; color: #1e293b; }
    .mini-lbl { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
    .mini-stat.success .mini-val { color: #059669; }
    .mini-stat.success { border-left: 3px solid #10b981; }
    .mini-stat.pending .mini-val { color: #2563eb; }
    .mini-stat.pending { border-left: 3px solid #3b82f6; }

    /* Buttons — exact matches */
    .btn-primary {
      background: #008766; color: white; border: none;
      padding: 12px 24px; border-radius: 12px; font-weight: 700;
      font-size: 14px; cursor: pointer; display: flex; align-items: center;
      gap: 8px; transition: all 0.3s;
    }
    .btn-primary:hover { background: #00684d; transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 135, 102, 0.3); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
    .btn-secondary {
      background: #f1f5f9; color: #475569; border: none;
      padding: 12px 20px; border-radius: 12px; font-weight: 700;
      font-size: 14px; cursor: pointer; transition: all 0.2s;
    }
    .btn-secondary:hover { background: #e2e8f0; }

    /* Filter / search bar */
    .tabs-filter-container { margin-bottom: 24px; }
    .search-filter-bar {
      background: white; border: 1px solid #e2e8f0; border-radius: 16px;
      padding: 14px 24px; display: flex; align-items: center; gap: 20px;
      flex-wrap: wrap;
    }
    .search-box {
      flex: 1; display: flex; align-items: center; gap: 10px;
      background: #f8fafc; border: 1.5px solid #f1f5f9; border-radius: 10px;
      padding: 10px 16px; min-width: 200px;
    }
    .search-box svg { color: #94a3b8; flex-shrink: 0; }
    .search-box input {
      border: none; background: transparent; width: 100%;
      font-size: 14px; outline: none; color: #1e293b;
      font-family: inherit;
    }

    .filter-pills { display: flex; gap: 8px; flex-wrap: wrap; }
    .pill {
      padding: 8px 16px; border-radius: 50px; font-size: 13px;
      font-weight: 700; cursor: pointer; border: 1.5px solid #e2e8f0;
      background: white; color: #64748b; transition: all 0.2s;
    }
    .pill.active { background: #008766; color: white; border-color: #008766; }
    .pill:hover:not(.active) { background: #f8fafc; border-color: #cbd5e1; }

    .filter-select-group select {
      padding: 10px 16px; border-radius: 10px; border: 1.5px solid #e2e8f0;
      font-size: 13px; font-weight: 600; color: #475569; background: #f8fafc;
      cursor: pointer; outline: none;
    }
    .filter-select-group select:focus { border-color: #008766; background: white; }

    /* Loading & Error states */
    .loading-state {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 80px; gap: 16px;
    }
    .spinner {
      width: 40px; height: 40px; border: 3px solid #f1f5f9;
      border-top-color: #008766; border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-state p { color: #64748b; font-weight: 600; }

    .error-state {
      display: flex; flex-direction: column; align-items: center;
      padding: 80px; gap: 16px; text-align: center;
    }
    .error-icon { color: #ef4444; opacity: 0.6; }
    .error-state h3 { color: #1e293b; margin: 0; font-size: 18px; }
    .error-state p { color: #64748b; margin: 0; }

    /* Table */
    .table-container {
      background: white; border-radius: 20px;
      border: 1px solid #e2e8f0; overflow: hidden;
    }
    table { width: 100%; border-collapse: collapse; }
    thead { background: #f8fafc; }
    th {
      text-align: left; padding: 16px 24px;
      font-size: 11px; font-weight: 800; color: #64748b;
      text-transform: uppercase; letter-spacing: 0.8px;
      border-bottom: 1px solid #e2e8f0;
    }
    td {
      padding: 18px 24px; border-bottom: 1px solid #f8fafc;
      font-size: 14px; color: #334155; vertical-align: middle;
    }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #fcfcfd; }

    .ref-code { font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; color: #64748b; }

    .procedure-cell { display: flex; flex-direction: column; gap: 3px; }
    .proc-title { font-weight: 700; color: #1e293b; }
    .proc-desc { font-size: 12px; color: #94a3b8; font-weight: 500; }

    /* Type badges */
    .badge-type {
      padding: 4px 10px; border-radius: 6px;
      font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px;
      background: #f1f5f9; color: #475569;
    }
    .badge-type.ASSIGNATION { background: #eff6ff; color: #1d4ed8; }
    .badge-type.REFERE      { background: #fff7ed; color: #c2410c; }
    .badge-type.APPEL       { background: #faf5ff; color: #7e22ce; }
    .badge-type.CASSATION   { background: #ecfdf5; color: #065f46; }
    .badge-type.REQUETE     { background: #fefce8; color: #a16207; }

    .affaire-ref { font-size: 13px; color: #008766; font-weight: 600; }

    /* Status pills */
    .status-pill {
      padding: 5px 12px; border-radius: 50px;
      font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .status-pill.VALIDEE  { background: #dcfce7; color: #15803d; }
    .status-pill.EN_COURS { background: #e0f2fe; color: #0369a1; }
    .status-pill.BROUILLON{ background: #f1f5f9; color: #64748b; }
    .status-pill.TERMINEE { background: #f0fdf4; color: #166534; }
    .status-pill.ANNULEE  { background: #fee2e2; color: #b91c1c; }

    /* Action buttons */
    .actions-cell { display: flex; gap: 8px; align-items: center; }
    .btn-icon {
      width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
      border-radius: 10px; border: 1.5px solid #e2e8f0;
      background: #f8fafc; color: #64748b; cursor: pointer; transition: all 0.2s;
    }
    .btn-icon:hover { background: white; border-color: #008766; color: #008766; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,135,102,0.15); }
    .btn-icon.success:hover { background: #dcfce7; border-color: #10b981; color: #059669; }
    .btn-icon.danger:hover  { background: #fee2e2; border-color: #ef4444; color: #dc2626; }

    /* Empty state */
    .empty-row { padding: 80px; text-align: center; }
    .empty-state-inline {
      display: flex; flex-direction: column; align-items: center; gap: 16px;
      color: #94a3b8;
    }
    .empty-state-inline svg { opacity: 0.3; }
    .empty-state-inline p { font-size: 16px; font-weight: 600; color: #94a3b8; }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(6px);
      z-index: 1000;
      display: flex; align-items: center; justify-content: center;
    }
    .modal-card {
      background: white; border-radius: 24px;
      width: 100%; max-width: 640px;
      box-shadow: 0 25px 60px -15px rgba(0,0,0,0.2);
      overflow: hidden;
    }
    .modal-header {
      padding: 24px 32px; border-bottom: 1px solid #f1f5f9;
      display: flex; justify-content: space-between; align-items: flex-start;
    }
    .modal-title-block { display: flex; gap: 16px; align-items: flex-start; }
    .modal-icon {
      width: 44px; height: 44px; border-radius: 12px;
      background: #ecfdf5; color: #008766;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .modal-title-block h3 { font-size: 18px; font-weight: 800; color: #1e293b; margin: 0; }
    .modal-title-block p { font-size: 13px; color: #64748b; margin: 3px 0 0; }
    .modal-close {
      border: none; background: #f8fafc; border-radius: 10px;
      width: 36px; height: 36px; display: flex; align-items: center;
      justify-content: center; cursor: pointer; color: #64748b;
      transition: 0.2s; flex-shrink: 0;
    }
    .modal-close:hover { background: #fee2e2; color: #dc2626; }

    .modal-body { padding: 32px; }

    /* Form inside modal */
    .form-section { display: flex; flex-direction: column; gap: 20px; }
    .form-row { display: flex; flex-direction: column; }
    .form-row.two-col { flex-direction: row; gap: 20px; }
    .form-row.two-col .form-group { flex: 1; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-group.full { width: 100%; }
    .form-group label {
      font-size: 13px; font-weight: 700; color: #475569;
      text-transform: uppercase; letter-spacing: 0.4px;
    }
    input, select, textarea {
      padding: 12px 16px; border-radius: 12px;
      border: 1.5px solid #e2e8f0; background: #f8fafc;
      font-size: 14px; color: #1e293b; outline: none;
      font-family: inherit; transition: all 0.2s; resize: none;
    }
    input:focus, select:focus, textarea:focus {
      border-color: #008766; background: white;
      box-shadow: 0 0 0 4px rgba(0, 135, 102, 0.08);
    }
    .required { color: #ef4444; }

    .modal-footer {
      display: flex; justify-content: flex-end; gap: 12px;
      margin-top: 28px; padding-top: 24px; border-top: 1px solid #f1f5f9;
    }

    /* Animations */
    .slideIn { animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 1024px) {
      .dashboard-content { padding: 24px; }
      .search-filter-bar { flex-direction: column; align-items: stretch; }
      .form-row.two-col { flex-direction: column; }
      .page-header-actions { flex-direction: column; gap: 16px; }
      .header-btns { flex-wrap: wrap; }
    }
  `]
})
export class LegalActionComponent implements OnInit {
  procedures: Procedure[] = [];
  filteredProcedures: Procedure[] = [];
  affaires: Affaire[] = [];

  loading = false;
  error: string | null = null;

  searchTerm = '';
  filterType = 'ALL';
  filterStatut = 'ALL';

  showModal = false;
  isEditing = false;
  activeProcedure: any = {
    titre: '', type: 'ASSIGNATION', statut: 'EN_COURS', description: '', affaireId: null
  };

  constructor(
    private legalService: LegalActionService,
    private affaireService: AffaireService,
    private authService: AuthService,
    private confirmService: ConfirmDialogService,
    public sidebarService: SidebarService
  ) {}

  canManage(): boolean {
    return this.authService.hasRole('ROLE_ADMIN') || this.authService.hasRole('ROLE_CHARGE_DOSSIER');
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;
    this.legalService.getAllProcedures().subscribe({
      next: data => {
        this.procedures = data;
        this.filterProcedures();
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les procédures. Vérifiez que le serveur est démarré.';
        this.loading = false;
      }
    });
    this.affaireService.getAllAffaires().subscribe(data => this.affaires = data);
  }

  filterProcedures(): void {
    this.filteredProcedures = this.procedures.filter(p => {
      const matchSearch = !this.searchTerm ||
        p.titre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.id?.toString().includes(this.searchTerm);
      const matchType = this.filterType === 'ALL' || p.type === this.filterType;
      const matchStatut = this.filterStatut === 'ALL' || p.statut === this.filterStatut;
      return matchSearch && matchType && matchStatut;
    });
  }

  setType(t: string): void { this.filterType = t; this.filterProcedures(); }

  getValidatedCount(): number { return this.procedures.filter(p => p.statut === 'VALIDEE').length; }
  getPendingCount(): number  { return this.procedures.filter(p => p.statut === 'EN_COURS').length; }

  getAffaireRef(id: number): string {
    const a = this.affaires.find(af => af.id === id);
    return a ? a.referenceJudiciaire : `Aff. #${id}`;
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.activeProcedure = { titre: '', type: 'ASSIGNATION', statut: 'EN_COURS', description: '', affaireId: null };
    this.showModal = true;
  }

  onEditProcedure(p: Procedure): void {
    this.isEditing = true;
    this.activeProcedure = { ...p };
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  onSubmit(): void {
    const obs = this.isEditing
      ? this.legalService.updateProcedure(this.activeProcedure.id, this.activeProcedure)
      : this.legalService.createProcedure(this.activeProcedure);

    obs.subscribe(() => { this.loadData(); this.closeModal(); });
  }

  onValidate(id: number): void {
    this.legalService.validateProcedure(id).subscribe(() => this.loadData());
  }

  onDelete(id: number): void {
    this.confirmService.open({
      title: 'Supprimer la procédure',
      message: 'Êtes-vous sûr de vouloir supprimer cette action en justice ? Cette opération est irréversible.',
      confirmLabel: 'Supprimer',
      cancelLabel: 'Annuler'
    }).subscribe(confirmed => {
      if (confirmed) this.legalService.deleteProcedure(id).subscribe(() => this.loadData());
    });
  }
}
