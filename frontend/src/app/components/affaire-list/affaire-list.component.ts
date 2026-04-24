import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AffaireService, Affaire } from '../../services/affaire.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { SidebarService } from '../../services/sidebar.service';
import { DossierService } from '../../services/dossier.service';

@Component({
  selector: 'app-affaire-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>

      <main class="main-content">
        <app-header title="Gestion des Affaires"></app-header>

        <div class="dashboard-content">

          <!-- PAGE HEADER -->
          <div class="page-header-actions slideIn">
            <div class="page-title-block">
              <h2>Gestion des Affaires</h2>
              <p class="page-subtitle">Consultez et gérez l'ensemble des procédures judiciaires en cours.</p>
            </div>
            <div class="header-btns">
              <button class="btn-secondary" (click)="exportListPdf()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Exporter PDF
              </button>
              <button class="btn-primary" routerLink="/nouvelle-affaire" *ngIf="canManage()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Nouvelle Affaire
              </button>
            </div>
          </div>

          <!-- STATS -->
          <div class="stats-row slideIn">
            <div class="stat-card">
              <div class="stat-val">{{ affaires.length }}</div>
              <div class="stat-label">Total des Affaires</div>
            </div>
            <div class="stat-card success">
              <div class="stat-val">{{ countByStatut('EN_COURS') }}</div>
              <div class="stat-label">En Cours</div>
            </div>
            <div class="stat-card green">
              <div class="stat-val">{{ countByStatut('GAGNE') }}</div>
              <div class="stat-label">Gagnées</div>
            </div>
            <div class="stat-card danger">
              <div class="stat-val">{{ countByStatut('PERDU') }}</div>
              <div class="stat-label">Perdues</div>
            </div>
          </div>

          <!-- FILTER BAR -->
          <div class="tabs-filter-container slideIn">
            <div class="search-filter-bar">
              <div class="search-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" [(ngModel)]="searchTerm" (input)="onFilter()" placeholder="Rechercher par référence ou titre...">
              </div>
              <div class="filter-select-group">
                <select [(ngModel)]="filterType" (change)="onFilter()">
                  <option value="">Tous les Types</option>
                  <option value="CIVIL">🏦 Civil</option>
                  <option value="PENAL">🚨 Pénal</option>
                  <option value="CREDIT">💰 Crédit</option>
                  <option value="LITIGE">⚖️ Litige</option>
                  <option value="GARANTIE">🛡️ Garantie</option>
                  <option value="PRUDHOMME">⚖️ Prud'hommes</option>
                  <option value="PATRIMOINE_IMMOBILIER">🏠 Immobilier</option>
                  <option value="IMM">🏠 IMM</option>
                </select>
                <select [(ngModel)]="filterStatut" (change)="onFilter()">
                  <option value="">Tous les Statuts</option>
                  <option value="EN_COURS">🔵 En Cours</option>
                  <option value="GAGNE">🟢 Gagné</option>
                  <option value="PERDU">🔴 Perdu</option>
                  <option value="CLASSE">⚪ Classé</option>
                </select>
              </div>
            </div>
          </div>

          <!-- TABLE -->
          <div class="table-container slideIn">
            <table>
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Titre / Objet</th>
                  <th>Type</th>
                  <th>Statut</th>
                  <th>Date Ouverture</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let a of filteredAffaires">
                  <td><strong class="ref-code">{{ a.referenceJudiciaire }}</strong></td>
                  <td>{{ a.titre }}</td>
                  <td><span class="badge-type">{{ a.type }}</span></td>
                  <td>
                    <span class="status-pill" [ngClass]="a.statut">{{ a.statut }}</span>
                  </td>
                  <td>{{ a.dateOuverture | date:'dd/MM/yyyy' }}</td>
                  <td>
                    <div class="actions-cell">
                      <button class="btn-icon" (click)="viewDetails(a)" title="Détails">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </button>
                      <button class="btn-icon" (click)="exportSinglePdf(a)" title="Générer PDF">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="filteredAffaires.length === 0">
                  <td colspan="6" class="empty-row">
                    <div class="empty-state-inline">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                      <p>Aucune affaire ne correspond à vos filtres.</p>
                      <button class="btn-primary" routerLink="/nouvelle-affaire" *ngIf="canManage()">Créer une affaire</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- AFFAIRE DETAILS MODAL -->
        <div class="modal-overlay" *ngIf="selectedAffaire" (click)="closeModal()">
          <div class="modal-content glass-modal slideUp" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="header-title">
                <span class="badge-type-static">{{ selectedAffaire.type }}</span>
                <h3>Détails de l'Affaire: {{ selectedAffaire.referenceJudiciaire }}</h3>
              </div>
              <button class="btn-close" (click)="closeModal()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div class="modal-body">
              <div class="details-grid">
                <div class="detail-item full">
                  <label>Titre / Objet</label>
                  <div class="value large">{{ selectedAffaire.titre }}</div>
                </div>
                
                <div class="detail-item">
                  <label>Référence Judiciaire</label>
                  <div class="value mono">{{ selectedAffaire.referenceJudiciaire }}</div>
                </div>

                <div class="detail-item">
                  <label>Statut Actuel</label>
                  <div class="value">
                    <span class="status-pill" [ngClass]="selectedAffaire.statut">{{ selectedAffaire.statut }}</span>
                  </div>
                </div>

                <div class="detail-item">
                  <label>Type de Procédure</label>
                  <div class="value">{{ selectedAffaire.type }}</div>
                </div>

                <div class="detail-item">
                  <label>Date d'Ouverture</label>
                  <div class="value">{{ selectedAffaire.dateOuverture | date:'dd MMMM yyyy' }}</div>
                </div>

                <div class="detail-item full" *ngIf="selectedAffaire.description">
                  <label>Description Complète</label>
                  <div class="description-box">{{ selectedAffaire.description }}</div>
                </div>
              </div>

              <!-- PROCEDURES SECTION -->
              <div class="procedures-section">
                <div class="proc-section-header">
                  <div class="proc-title-area">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                    <span>PROCÉDURES JUDICIAIRES</span>
                  </div>
                  <span class="proc-count">{{ selectedProcedures.length }} procédure(s)</span>
                </div>

                <div *ngIf="loadingProcedures" class="proc-loading">
                  <div class="proc-spinner"></div>
                  <span>Chargement des procédures...</span>
                </div>

                <div *ngIf="!loadingProcedures && selectedProcedures.length === 0" class="proc-empty">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                  <p>Aucune procédure associée à cette affaire.</p>
                  <small>Une action en justice engagée doit être représentée par une procédure.</small>
                </div>

                <div class="proc-list" *ngIf="!loadingProcedures && selectedProcedures.length > 0">
                  <div class="proc-card" *ngFor="let p of selectedProcedures">
                    <div class="proc-info">
                      <span class="proc-titre">{{ p.titre }}</span>
                      <span class="proc-type-badge">{{ p.type }}</span>
                    </div>
                    <div class="proc-statut">
                      <span class="proc-pill" [ngClass]="p.statut.toLowerCase()">{{ p.statut }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-secondary" (click)="closeModal()">Fermer</button>
              <button class="btn-secondary" (click)="goToDossier(selectedAffaire)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                Voir Dossier Parent
              </button>
              <button class="btn-primary" (click)="exportSinglePdf(selectedAffaire)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                Télécharger Fiche PDF
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    /* ============================================
       PLATFORM CSS — matches MesDossiers exactly
       ============================================ */
    .dashboard-content { padding: 40px; }

    /* Page header */
    .page-header-actions {
      display: flex; justify-content: space-between;
      align-items: flex-start; margin-bottom: 32px;
    }
    .page-title-block h2 { font-size: 24px; font-weight: 800; color: #1e293b; margin: 0; }
    .page-subtitle { font-size: 14px; color: #64748b; margin: 4px 0 0; }
    .header-btns { display: flex; align-items: center; gap: 16px; }

    /* Stats */
    .stats-row {
      display: flex; gap: 16px; margin-bottom: 28px; flex-wrap: wrap;
    }
    .stat-card {
      flex: 1; min-width: 120px; background: white;
      border: 1px solid #e2e8f0; border-radius: 16px;
      padding: 20px 24px; text-align: center;
    }
    .stat-val { font-size: 28px; font-weight: 800; color: #1e293b; }
    .stat-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
    .stat-card.success { border-left: 3px solid #3b82f6; }
    .stat-card.success .stat-val { color: #2563eb; }
    .stat-card.green { border-left: 3px solid #10b981; }
    .stat-card.green .stat-val { color: #059669; }
    .stat-card.danger { border-left: 3px solid #ef4444; }
    .stat-card.danger .stat-val { color: #dc2626; }

    /* Buttons */
    .btn-primary {
      background: #008766; color: white; border: none;
      padding: 12px 24px; border-radius: 12px; font-weight: 700;
      font-size: 14px; cursor: pointer; display: flex; align-items: center;
      gap: 8px; transition: all 0.3s;
    }
    .btn-primary:hover { background: #00684d; transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,135,102,0.3); }
    .btn-secondary {
      background: #f1f5f9; color: #475569; border: none;
      padding: 12px 20px; border-radius: 12px; font-weight: 700;
      font-size: 14px; cursor: pointer; display: flex; align-items: center;
      gap: 8px; transition: all 0.2s;
    }
    .btn-secondary:hover { background: #e2e8f0; }

    /* Search & Filter bar */
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
      font-size: 14px; outline: none; color: #1e293b; font-family: inherit;
    }
    .filter-select-group { display: flex; gap: 12px; }
    .filter-select-group select {
      padding: 10px 16px; border-radius: 10px; border: 1.5px solid #e2e8f0;
      font-size: 13px; font-weight: 600; color: #475569; background: #f8fafc;
      cursor: pointer; outline: none;
    }
    .filter-select-group select:focus { border-color: #008766; background: white; }

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

    .ref-code { font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; color: #1e293b; }
    .badge-type {
      background: #f1f5f9; padding: 4px 10px; border-radius: 6px;
      font-size: 11px; font-weight: 800; color: #475569;
    }

    /* Status pills */
    .status-pill {
      padding: 5px 12px; border-radius: 50px;
      font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .status-pill.EN_COURS { background: #e0f2fe; color: #0369a1; }
    .status-pill.GAGNE    { background: #dcfce7; color: #15803d; }
    .status-pill.PERDU    { background: #fee2e2; color: #b91c1c; }
    .status-pill.CLASSE   { background: #f1f5f9; color: #64748b; }

    /* Action buttons */
    .actions-cell { display: flex; gap: 8px; align-items: center; }
    .btn-icon {
      width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
      border-radius: 10px; border: 1.5px solid #e2e8f0;
      background: #f8fafc; color: #64748b; cursor: pointer; transition: all 0.2s;
    }
    .btn-icon:hover { background: white; border-color: #008766; color: #008766; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,135,102,0.15); }

    /* Empty state */
    .empty-row { padding: 80px; text-align: center; }
    .empty-state-inline { display: flex; flex-direction: column; align-items: center; gap: 16px; color: #94a3b8; }
    .empty-state-inline svg { opacity: 0.3; }
    .empty-state-inline p { font-size: 16px; font-weight: 600; color: #94a3b8; margin: 0; }

    /* Animation */
    .slideIn { animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 1024px) {
      .dashboard-content { padding: 24px; }
      .page-header-actions { flex-direction: column; gap: 16px; }
      .search-filter-bar { flex-direction: column; align-items: stretch; }
      .stats-row { flex-wrap: wrap; }
    }

    /* MODAL STYLES */
    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center; z-index: 2000;
    }
    .modal-content.glass-modal {
      background: rgba(255, 255, 255, 0.95); border-radius: 32px;
      width: 100%; max-width: 700px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
      overflow: hidden; border: 1px solid rgba(255,255,255,0.3);
    }
    .modal-header {
      padding: 32px 40px; border-bottom: 1px solid #f1f5f9;
      display: flex; justify-content: space-between; align-items: flex-start;
    }
    .header-title h3 { margin: 8px 0 0; font-size: 22px; font-weight: 850; color: #1e293b; letter-spacing: -0.5px; }
    .badge-type-static {
      background: #008766; color: white; padding: 4px 10px; border-radius: 6px;
      font-size: 11px; font-weight: 800; text-transform: uppercase;
    }
    .btn-close {
      background: #f1f5f9; border: none; width: 40px; height: 40px;
      border-radius: 12px; color: #64748b; cursor: pointer; transition: 0.2s;
    }
    .btn-close:hover { background: #fee2e2; color: #ef4444; transform: rotate(90deg); }

    .modal-body { padding: 40px; }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
    .detail-item.full { grid-column: span 2; }
    .detail-item label {
      display: block; font-size: 11px; font-weight: 800; color: #94a3b8;
      text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;
    }
    .detail-item .value { font-size: 16px; font-weight: 600; color: #1e293b; }
    .detail-item .value.large { font-size: 20px; font-weight: 800; color: #008766; }
    .detail-item .value.mono { font-family: 'JetBrains Mono', monospace; font-size: 15px; }
    
    .description-box {
      background: #f8fafc; padding: 20px; border-radius: 16px;
      border: 1px solid #f1f5f9; color: #475569; line-height: 1.6; font-size: 15px;
    }

    .modal-footer {
      padding: 32px 40px; background: #f8fafc; border-top: 1px solid #f1f5f9;
      display: flex; justify-content: flex-end; gap: 16px;
    }

    .slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

    /* PROCEDURES SECTION IN MODAL */
    .procedures-section {
      margin-top: 32px; padding-top: 24px; border-top: 2px solid #f1f5f9;
    }
    .proc-section-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
    }
    .proc-title-area {
      display: flex; align-items: center; gap: 8px;
      font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px;
    }
    .proc-count {
      font-size: 12px; font-weight: 700; color: #008766;
      background: rgba(0,135,102,0.08); padding: 3px 10px; border-radius: 50px;
    }
    .proc-loading {
      display: flex; align-items: center; gap: 12px; color: #64748b; font-size: 14px; padding: 16px 0;
    }
    .proc-spinner {
      width: 16px; height: 16px; border: 2px solid #e2e8f0; border-top-color: #008766;
      border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    .proc-empty {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      padding: 24px; background: #f8fafc; border-radius: 16px; border: 1.5px dashed #e2e8f0;
      color: #94a3b8; text-align: center;
    }
    .proc-empty p { margin: 0; font-size: 14px; font-weight: 600; }
    .proc-empty small { font-size: 12px; color: #cbd5e1; }

    .proc-list { display: flex; flex-direction: column; gap: 10px; }
    .proc-card {
      display: flex; justify-content: space-between; align-items: center;
      background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 14px; padding: 14px 18px;
      transition: all 0.2s;
    }
    .proc-card:hover { background: white; border-color: #008766; transform: translateX(4px); }
    .proc-info { display: flex; flex-direction: column; gap: 4px; }
    .proc-titre { font-size: 14px; font-weight: 700; color: #1e293b; }
    .proc-type-badge {
      font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;
      background: #f1f5f9; padding: 2px 8px; border-radius: 4px; width: fit-content;
    }
    .proc-pill {
      padding: 4px 12px; border-radius: 50px; font-size: 10px; font-weight: 800; text-transform: uppercase;
    }
    .proc-pill.brouillon { background: #f1f5f9; color: #64748b; }
    .proc-pill.en_cours  { background: #dbeafe; color: #1d4ed8; }
    .proc-pill.validee   { background: #dcfce7; color: #166534; }
    .proc-pill.terminee  { background: #f0fdf4; color: #15803d; }
    .proc-pill.annulee   { background: #fee2e2; color: #b91c1c; }

    /* Modal scrollable body */
    .modal-body { padding: 40px; max-height: 70vh; overflow-y: auto; }
  `]
})
export class AffaireListComponent implements OnInit {
  affaires: Affaire[] = [];
  filteredAffaires: Affaire[] = [];

  searchTerm = '';
  filterType = '';
  filterStatut = '';
  selectedAffaire: Affaire | null = null;
  selectedProcedures: any[] = [];
  loadingProcedures = false;

  constructor(
    private affaireService: AffaireService,
    private dossierService: DossierService,
    private authService: AuthService,
    private router: Router,
    public sidebarService: SidebarService
  ) {}

  canManage(): boolean {
    return this.authService.hasRole('ROLE_ADMIN') || this.authService.hasRole('ROLE_CHARGE_DOSSIER');
  }

  ngOnInit(): void {
    this.loadAffaires();
  }

  loadAffaires() {
    this.affaireService.getAllAffaires().subscribe(data => {
      this.affaires = data;
      this.onFilter();
    });
  }

  onFilter() {
    this.filteredAffaires = this.affaires.filter(a => {
      const matchSearch = !this.searchTerm ||
        (a.referenceJudiciaire && a.referenceJudiciaire.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (a.titre && a.titre.toLowerCase().includes(this.searchTerm.toLowerCase()));
      const matchType   = !this.filterType   || a.type   === this.filterType;
      const matchStatut = !this.filterStatut || a.statut === this.filterStatut;
      return matchSearch && matchType && matchStatut;
    });
  }

  countByStatut(statut: string): number {
    return this.affaires.filter(a => a.statut === statut).length;
  }

  viewDetails(a: Affaire) {
    this.selectedAffaire = a;
    // Load linked procedures (Dossier → Affaire → Procédure hierarchy)
    if (a.id) {
      this.loadingProcedures = true;
      this.affaireService.getProceduresByAffaire(a.id).subscribe({
        next: (procs) => {
          this.selectedProcedures = procs;
          this.loadingProcedures = false;
        },
        error: () => {
          this.selectedProcedures = [];
          this.loadingProcedures = false;
        }
      });
    }
  }

  closeModal() {
    this.selectedAffaire = null;
    this.selectedProcedures = [];
    this.loadingProcedures = false;
  }

  goToDossier(a: Affaire) {
    this.closeModal();
    if (a.dossierId) {
      this.dossierService.getDossierById(a.dossierId).subscribe({
        next: (dossier) => {
          this.router.navigate(['/mes-dossiers'], { queryParams: { highlight: dossier.reference } });
        },
        error: () => {
          this.router.navigate(['/mes-dossiers']);
        }
      });
    } else {
      this.router.navigate(['/mes-dossiers']);
    }
  }

  exportListPdf() {
    this.affaireService.exportListPdf().subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Liste_Affaires_${new Date().getTime()}.pdf`;
      link.click();
    });
  }

  exportSinglePdf(a: Affaire) {
    this.affaireService.exportSinglePdf(a.id!).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Affaire_${a.referenceJudiciaire}.pdf`;
      link.click();
    });
  }
}
