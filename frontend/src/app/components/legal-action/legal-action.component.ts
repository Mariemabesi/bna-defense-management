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
import { AudienceService, Audience } from '../../services/audience.service';
import { ReferentielService, Tribunal } from '../../services/referentiel.service';

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
              <p class="page-subtitle">Gestion centralisée des procédures judiciaires et audiences.</p>
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
                <ng-container *ngFor="let p of filteredProcedures">
                  <tr [class.expanded]="expandedProcedureId === p.id">
                    <td><strong class="ref-code">#{{ p.id }}</strong></td>
                    <td>
                      <div class="procedure-cell" (click)="toggleExpand(p.id!)">
                        <span class="proc-title">{{ p.titre }}</span>
                        <span class="proc-desc" *ngIf="p.description">{{ p.description | slice:0:65 }}{{ (p.description?.length || 0) > 65 ? '...' : '' }}</span>
                      </div>
                    </td>
                    <td><span class="badge-type" [ngClass]="p.type">{{ p.type }}</span></td>
                    <td><span class="affaire-ref">📁 {{ getAffaireRef(p.affaireId) }}</span></td>
                    <td><span class="status-pill" [ngClass]="p.statut">{{ p.statut | titlecase }}</span></td>
                    <td>
                      <div class="actions-cell">
                        <button class="btn-icon view" (click)="toggleExpand(p.id!)" title="Voir Détails">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                        <button class="btn-icon" (click)="openAudienceModal(p)" title="Ajouter Audience" *ngIf="canManage()">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                        <button class="btn-icon" (click)="onEditProcedure(p)" title="Modifier" *ngIf="canManage()">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="btn-icon danger" (click)="onDelete(p.id!)" title="Supprimer" *ngIf="canManage()">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- AUDIENCES LIST (Inline Expanded) -->
                  <tr class="detail-row" *ngIf="expandedProcedureId === p.id">
                    <td colspan="6">
                      <div class="audience-section slideIn">
                        <div class="section-header">
                          <h4>📌 Audiences Planifiées ({{ p.audiences?.length || 0 }})</h4>
                          <button class="btn-text-icon" (click)="openAudienceModal(p)" *ngIf="canManage()">
                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                             Ajouter une audience
                          </button>
                        </div>
                        
                        <div class="audience-list" *ngIf="p.audiences && p.audiences.length > 0">
                           <div class="audience-card" *ngFor="let aud of p.audiences">
                              <div class="aud-date">
                                 <span class="day">{{ aud.dateHeure | date:'dd' }}</span>
                                 <span class="month">{{ aud.dateHeure | date:'MMM' }}</span>
                              </div>
                              <div class="aud-info">
                                 <div class="aud-tribunal">🏛️ {{ aud.tribunal?.nom || 'Tribunal non spécifié' }}</div>
                                 <div class="aud-meta">
                                    <span>🕒 {{ aud.dateHeure | date:'HH:mm' }}</span>
                                    <span>📍 {{ aud.salle || 'Salle non spécifiée' }}</span>
                                 </div>
                              </div>
                              <div class="aud-status">
                                 <select [(ngModel)]="aud.statut" (change)="onUpdateAudienceStatus(aud)" [disabled]="!canManage()">
                                    <option value="PREVUE">Prévue</option>
                                    <option value="REPORTEE">Reportée</option>
                                    <option value="TENUE">Tenue</option>
                                    <option value="ANNULEE">Annulée</option>
                                 </select>
                              </div>
                              <div class="aud-actions" *ngIf="canManage()">
                                 <button class="btn-icon-small" (click)="onEditAudience(aud, p)" title="Modifier"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                                 <button class="btn-icon-small danger" (click)="onDeleteAudience(aud.id!, p)" title="Supprimer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                              </div>
                           </div>
                        </div>
                        <div class="empty-mini" *ngIf="!p.audiences || p.audiences.length === 0">
                           <p>Aucune audience enregistrée pour cette procédure.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                </ng-container>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <!-- AUDIENCE MODAL -->
      <div class="modal-overlay" *ngIf="showAudienceModal" (click)="closeAudienceModal()">
         <div class="modal-card slideIn" (click)="$event.stopPropagation()">
            <div class="modal-header">
               <div class="modal-title-block">
                  <div class="modal-icon warning">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </div>
                  <div>
                     <h3>{{ isEditingAudience ? 'Modifier l\\'Audience' : 'Formulaire Ajouter Audience' }}</h3>
                     <p>Renseignez les détails de la séance pour la procédure <strong>#{{ targetProcedure?.titre }}</strong></p>
                  </div>
               </div>
               <button class="modal-close" (click)="closeAudienceModal()"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
            </div>
            <div class="modal-body">
               <form (ngSubmit)="onSaveAudience()">
                  <div class="form-section">
                     <div class="form-group full">
                        <label>Tribunal <span class="required">*</span></label>
                        <select [(ngModel)]="activeAudience.tribunalId" name="tribunalId" required>
                           <option [ngValue]="null" disabled selected>Sélectionner un tribunal...</option>
                           <option *ngFor="let t of tribunaux" [value]="t.id">{{ t.nom }} ({{ t.region }})</option>
                        </select>
                     </div>
                     <div class="form-row two-col">
                        <div class="form-group">
                           <label>Date <span class="required">*</span></label>
                           <input type="date" [(ngModel)]="activeAudience.date" name="date" required>
                        </div>
                        <div class="form-group">
                           <label>Heure <span class="required">*</span></label>
                           <input type="time" [(ngModel)]="activeAudience.time" name="time" required>
                        </div>
                     </div>
                     <div class="form-group full">
                        <label>Salle / Lieu</label>
                        <input type="text" [(ngModel)]="activeAudience.salle" name="salle" placeholder="Ex: Salle 4, 2ème étage...">
                     </div>
                     <div class="form-group full">
                        <label>Observations</label>
                        <textarea [(ngModel)]="activeAudience.observation" name="observation" rows="3" placeholder="Notes ou points à aborder durant l'audience..."></textarea>
                     </div>
                  </div>
                  <div class="modal-footer">
                     <button type="button" class="btn-secondary" (click)="closeAudienceModal()">Annuler</button>
                     <button type="submit" class="btn-primary" [disabled]="!activeAudience.tribunalId || !activeAudience.date || !activeAudience.time">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Enregistrer l'audience
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </div>

      <!-- PROCEDURE MODAL -->
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
       PLATFORM CSS SYSTEM
       ============================================ */
    .dashboard-content { padding: 40px; }
    .page-header-actions { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .page-title-block h2 { font-size: 24px; font-weight: 800; color: #1e293b; margin: 0; }
    .page-subtitle { font-size: 14px; color: #64748b; margin: 4px 0 0; }
    .header-btns { display: flex; align-items: center; gap: 16px; }
    .mini-stats-bar { display: flex; gap: 8px; }
    .mini-stat {
      display: flex; flex-direction: column; align-items: center;
      background: white; border: 1px solid #e2e8f0; border-radius: 12px;
      padding: 10px 20px; min-width: 80px;
    }
    .mini-val { font-size: 20px; font-weight: 800; color: #1e293b; }
    .mini-lbl { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
    .mini-stat.success { border-left: 3px solid #10b981; }
    .mini-stat.pending { border-left: 3px solid #3b82f6; }
    .btn-primary {
      background: #008766; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700;
      font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.3s;
    }
    .btn-primary:hover { background: #00684d; transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 135, 102, 0.3); }
    .btn-secondary { background: #f1f5f9; color: #475569; border: none; padding: 12px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; }
    .search-filter-bar { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 14px 24px; display: flex; align-items: center; gap: 20px; }
    .search-box { flex: 1; display: flex; align-items: center; gap: 10px; background: #f8fafc; border: 1.5px solid #f1f5f9; border-radius: 10px; padding: 10px 16px; }
    .search-box input { border: none; background: transparent; width: 100%; font-size: 14px; outline: none; }
    .pill { padding: 8px 16px; border-radius: 50px; font-size: 13px; font-weight: 700; cursor: pointer; border: 1.5px solid #e2e8f0; background: white; color: #64748b; }
    .pill.active { background: #008766; color: white; border-color: #008766; }
    .table-container { background: white; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 16px 24px; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
    td { padding: 18px 24px; border-bottom: 1px solid #f8fafc; font-size: 14px; color: #334155; }
    .procedure-cell { cursor: pointer; display: flex; flex-direction: column; gap: 3px; }
    .proc-title { font-weight: 700; color: #1e293b; }
    .status-pill { padding: 5px 12px; border-radius: 50px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
    .status-pill.VALIDEE { background: #dcfce7; color: #15803d; }
    .status-pill.VALIDEE { background: #dcfce7; color: #15803d; }
    .btn-icon { width: 34px; height: 34px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: #f8fafc; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .btn-icon:hover { border-color: #008766; color: #008766; transform: translateY(-2px); }
    .btn-icon.view:hover { border-color: #3b82f6; color: #3b82f6; }

    /* Detail Row & Audiences */
    .detail-row td { background: #f8fafc; padding: 0; }
    .audience-section { padding: 24px 40px; border-bottom: 2px solid #e2e8f0; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .section-header h4 { margin: 0; font-size: 15px; font-weight: 800; color: #1e293b; }
    .btn-text-icon { background: none; border: none; color: #008766; font-weight: 700; display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px; }
    .audience-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
    .audience-card {
      background: white; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 16px;
      display: flex; align-items: center; gap: 16px; transition: 0.2s;
    }
    .audience-card:hover { border-color: #008766; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .aud-date {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      background: #f1f5f9; min-width: 50px; height: 50px; border-radius: 12px;
    }
    .aud-date .day { font-size: 18px; font-weight: 800; color: #1e293b; }
    .aud-date .month { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; }
    .aud-info { flex: 1; }
    .aud-tribunal { font-weight: 700; font-size: 14px; color: #1e293b; margin-bottom: 4px; }
    .aud-meta { display: flex; gap: 12px; font-size: 12px; color: #64748b; font-weight: 600; }
    .aud-status select { padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 700; border: 1px solid #e2e8f0; background: #f8fafc; }
    .aud-actions { display: flex; gap: 4px; }
    .btn-icon-small { width: 28px; height: 28px; border-radius: 8px; border: 1px solid #e2e8f0; background: white; cursor: pointer; color: #64748b; }
    .empty-mini { padding: 20px; text-align: center; color: #94a3b8; font-style: italic; font-size: 13px; }

    /* Modal styles */
    .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.45); backdrop-filter: blur(6px); z-index: 1000; display: flex; align-items: center; justify-content: center; }
    .modal-card { background: white; border-radius: 24px; width: 100%; max-width: 600px; box-shadow: 0 25px 60px -15px rgba(0,0,0,0.2); overflow: hidden; }
    .modal-header { padding: 24px 32px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; }
    .modal-icon { width: 44px; height: 44px; border-radius: 12px; background: #ecfdf5; color: #008766; display: flex; align-items: center; justify-content: center; }
    .modal-icon.warning { background: #fff7ed; color: #f59e0b; }
    .modal-title-block h3 { margin: 0; font-size: 18px; font-weight: 800; }
    .modal-body { padding: 32px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
    .form-group label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; }
    .form-row.two-col { display: flex; gap: 16px; }
    .form-row.two-col .form-group { flex: 1; }
    input, select, textarea { padding: 12px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: #f8fafc; font-size: 14px; }
    .btn-icon-small.danger:hover { background: #fee2e2; color: #ef4444; border-color: #ef4444; }
    .slideIn { animation: slideIn 0.3s ease-out; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class LegalActionComponent implements OnInit {
  procedures: any[] = [];
  filteredProcedures: any[] = [];
  affaires: Affaire[] = [];
  tribunaux: Tribunal[] = [];

  loading = false;
  error: string | null = null;
  searchTerm = '';
  filterType = 'ALL';
  filterStatut = 'ALL';

  showModal = false;
  isEditing = false;
  activeProcedure: any = { titre: '', type: 'ASSIGNATION', statut: 'EN_COURS', description: '', affaireId: null };

  expandedProcedureId: number | null = null;
  showAudienceModal = false;
  isEditingAudience = false;
  targetProcedure: any = null;
  activeAudience: any = { tribunalId: null, date: '', time: '', salle: '', observation: '', statut: 'PREVUE' };

  constructor(
    private legalService: LegalActionService,
    private affaireService: AffaireService,
    private authService: AuthService,
    private confirmService: ConfirmDialogService,
    private referentielService: ReferentielService,
    private audienceService: AudienceService,
    public sidebarService: SidebarService
  ) {}

  canManage(): boolean {
    return this.authService.hasRole('ROLE_ADMIN') || this.authService.hasRole('ROLE_CHARGE_DOSSIER');
  }

  ngOnInit(): void {
    this.loadData();
    this.referentielService.getTribunaux().subscribe(data => this.tribunaux = data);
  }

  loadData(): void {
    this.loading = true;
    this.legalService.getAllProcedures().subscribe({
      next: data => {
        this.procedures = data;
        this.filterProcedures();
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les procédures.';
        this.loading = false;
      }
    });
    this.affaireService.getAllAffaires().subscribe(data => this.affaires = data);
  }

  filterProcedures(): void {
    this.filteredProcedures = this.procedures.filter(p => {
      const matchSearch = !this.searchTerm || p.titre.toLowerCase().includes(this.searchTerm.toLowerCase()) || p.id?.toString().includes(this.searchTerm);
      const matchType = this.filterType === 'ALL' || p.type === this.filterType;
      const matchStatut = this.filterStatut === 'ALL' || p.statut === this.filterStatut;
      return matchSearch && matchType && matchStatut;
    });
  }

  setType(t: string): void { this.filterType = t; this.filterProcedures(); }
  getValidatedCount(): number { return this.procedures.filter(p => p.statut === 'VALIDEE').length; }
  getPendingCount(): number  { return this.procedures.filter(p => p.statut === 'EN_COURS').length; }
  getAffaireRef(id: number): string { const a = this.affaires.find(af => af.id === id); return a ? a.referenceJudiciaire : `Aff. #${id}`; }

  toggleExpand(id: number): void {
     this.expandedProcedureId = this.expandedProcedureId === id ? null : id;
  }

  // --- PROCEDURE ACTIONS ---
  openCreateModal(): void {
    this.isEditing = false;
    this.activeProcedure = { titre: '', type: 'ASSIGNATION', statut: 'EN_COURS', description: '', affaireId: null };
    this.showModal = true;
  }
  onEditProcedure(p: any): void {
    this.isEditing = true;
    this.activeProcedure = { ...p };
    this.showModal = true;
  }
  closeModal(): void { this.showModal = false; }
  onSubmit(): void {
    const obs = this.isEditing ? this.legalService.updateProcedure(this.activeProcedure.id, this.activeProcedure) : this.legalService.createProcedure(this.activeProcedure);
    obs.subscribe(() => { this.loadData(); this.closeModal(); });
  }
  onDelete(id: number): void {
    this.confirmService.open({ title: 'Supprimer', message: 'Supprimer cette procédure ?' }).subscribe(c => {
      if (c) this.legalService.deleteProcedure(id).subscribe(() => this.loadData());
    });
  }

  // --- AUDIENCE ACTIONS ---
  openAudienceModal(p: any): void {
     this.targetProcedure = p;
     this.isEditingAudience = false;
     this.activeAudience = { tribunalId: null, date: '', time: '', salle: '', observation: '', statut: 'PREVUE' };
     this.showAudienceModal = true;
  }
  onEditAudience(aud: any, p: any): void {
     this.targetProcedure = p;
     this.isEditingAudience = true;
     const dt = new Date(aud.dateHeure);
     this.activeAudience = {
        ...aud,
        tribunalId: aud.tribunal?.id,
        date: dt.toISOString().split('T')[0],
        time: dt.toTimeString().split(' ')[0].substring(0, 5)
     };
     this.showAudienceModal = true;
  }
  closeAudienceModal(): void { this.showAudienceModal = false; }
  onSaveAudience(): void {
     const dateHeure = `${this.activeAudience.date}T${this.activeAudience.time}:00`;
     const payload: any = {
        ...this.activeAudience,
        dateHeure,
        procedure: { id: this.targetProcedure.id },
        tribunal: { id: this.activeAudience.tribunalId }
     };
     const obs = this.isEditingAudience 
        ? this.audienceService.updateAudience(this.activeAudience.id, payload)
        : this.audienceService.createAudience(payload);
     
     obs.subscribe(() => { this.loadData(); this.closeAudienceModal(); });
  }
  onUpdateAudienceStatus(aud: any): void {
     this.audienceService.updateAudience(aud.id, aud).subscribe();
  }
  onDeleteAudience(id: number, p: any): void {
     this.confirmService.open({ title: 'Supprimer', message: 'Supprimer cette audience ?' }).subscribe(c => {
        if (c) this.audienceService.deleteAudience(id).subscribe(() => this.loadData());
     });
  }
}
