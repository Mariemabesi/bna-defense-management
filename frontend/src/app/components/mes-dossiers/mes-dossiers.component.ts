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
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-mes-dossiers',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, SidebarComponent, HeaderComponent, ConfirmDialogComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>

      <main class="main-content">
        <app-header title="Mes Dossiers"></app-header>

        <div class="dashboard-content">
          <div class="page-header-actions">
            <h2>Liste de vos dossiers</h2>
            <button class="btn-primary" routerLink="/nouveau-dossier" *ngIf="isChargeDossier() || isAdmin()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Créer un Nouveau Dossier
            </button>
          </div>

          <!-- LOADING STATE -->
          <div class="loading-state" *ngIf="loading">
            <div class="spinner"></div>
            <p>Chargement des dossiers...</p>
          </div>

          <!-- ERROR STATE -->
          <div class="error-state" *ngIf="error && !loading">
            <div class="error-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <h3>Erreur de chargement</h3>
            <p>{{ error }}</p>
            <button class="btn-primary" (click)="loadDossiers()">Réessayer</button>
          </div>

          <!-- DOSSIERS TABLE -->
          <div class="table-container" *ngIf="!loading && !error && dossiers.length > 0">
            <table>
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Titre</th>
                  <th>Priorité</th>
                  <th>Statut</th>
                  <th>Budget</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let d of dossiers">
                  <td><strong>{{ d.reference }}</strong></td>
                  <td>{{ d.titre }}</td>
                  <td>
                    <span class="badge" [ngClass]="getPrioriteBadge(d.priorite)">
                      {{ d.priorite || '—' }}
                    </span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="getBadgeClass(d.statut)">
                      {{ d.statut }}
                    </span>
                  </td>
                   <td><strong>{{ d.budgetProvisionne != null ? (d.budgetProvisionne | number:'1.2-2') + ' TND' : '—' }}</strong></td>
                  <td>
                    <div class="actions-cell">
                      <button class="btn-action" title="Consulter Détails" (click)="$event.stopPropagation(); onViewDossier(d)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </button>
                      <button class="btn-action" title="Modifier" *ngIf="isChargeDossier() || isAdmin()" [routerLink]="['/modifier-dossier', d.reference]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button class="btn-action warning-bg" title="Approuver" *ngIf="isPreValidateur()" (click)="$event.stopPropagation(); onAction('Approuver', d.reference)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                      </button>
                      <button class="btn-action danger-bg" title="Valider" *ngIf="isValidateur()" (click)="$event.stopPropagation(); onAction('Valider', d.reference)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- PAGINATION CONTROLS -->
          <div class="pagination-controls" *ngIf="!loading && totalElements > 0">
            <div class="pagination-info">
              Affichage de {{ currentPage * pageSize + 1 }} à {{ Math.min((currentPage + 1) * pageSize, totalElements) }} sur {{ totalElements }} dossiers
            </div>
            <div class="pagination-buttons">
              <button class="btn-page" [disabled]="currentPage === 0" (click)="onPageChange(currentPage - 1)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <button class="btn-page" *ngFor="let p of [].constructor(totalPages); let i = index" 
                      [class.active]="i === currentPage" (click)="onPageChange(i)">
                {{ i + 1 }}
              </button>
              <button class="btn-page" [disabled]="currentPage === totalPages - 1" (click)="onPageChange(currentPage + 1)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>

          <!-- EMPTY STATE WHEN NO DOSSIERS EXIST -->
          <div class="empty-state" *ngIf="!loading && !error && dossiers.length === 0">
            <div class="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <h3>Aucun dossier disponible</h3>
            <p>Vous n'avez pas encore créé ou été assigné à des dossiers.</p>
            <button class="btn-primary large" routerLink="/nouveau-dossier" *ngIf="isChargeDossier() || isAdmin()">
              Créer le premier dossier
            </button>
          </div>
          </div>

          <!-- DOSSIER DETAILS MODAL -->
          <div class="modal-overlay" *ngIf="selectedDossier" (click)="closeDossierModal()">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h3>Détails du Dossier: {{ selectedDossier.reference }}</h3>
                <button class="btn-close" (click)="closeDossierModal()">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <div class="modal-body">
                <div class="detail-group">
                  <span class="detail-label">Titre / Objet</span>
                  <span class="detail-value">{{ selectedDossier.titre }}</span>
                </div>
                <div class="grid-2-col">
                  <div class="detail-group">
                    <span class="detail-label">Statut</span>
                    <span class="badge" [ngClass]="getBadgeClass(selectedDossier.statut)">{{ selectedDossier.statut }}</span>
                  </div>
                  <div class="detail-group">
                    <span class="detail-label">Priorité</span>
                    <span class="badge" [ngClass]="getPrioriteBadge(selectedDossier.priorite)">{{ selectedDossier.priorite || '—' }}</span>
                  </div>
                </div>
                <div class="detail-group">
                  <span class="detail-label">Budget Provisionné</span>
                  <span class="detail-value font-mono">{{ selectedDossier.budgetProvisionne != null ? (selectedDossier.budgetProvisionne | number:'1.2-2') + ' TND' : 'Non défini' }}</span>
                </div>
                <div class="detail-group" *ngIf="selectedDossier.description">
                  <span class="detail-label">Description / Notes</span>
                  <div class="detail-desc">{{ selectedDossier.description }}</div>
                </div>

                <!-- AFFAIRES SECTION -->
                <div class="affaires-section">
                  <div class="section-subtitle">AFFAIRES JUDICIAIRES LIÉES</div>
                  <div *ngIf="affaires.length === 0" class="no-data">Aucune affaire pour ce dossier.</div>
                  <div class="affaires-list">
                    <div class="affaire-card" *ngFor="let aff of affaires">
                      <div class="aff-info">
                        <span class="aff-ref">{{ aff.referenceJudiciaire }}</span>
                        <span class="aff-type">{{ aff.type }}</span>
                      </div>
                      <div class="aff-status">
                        <select [value]="aff.statut" (change)="updateAffaireStatut(aff, $any($event.target).value)" 
                                class="aff-select" [ngClass]="aff.statut.toLowerCase()">
                          <option value="EN_COURS">EN COURS</option>
                          <option value="GAGNE">GAGNE</option>
                          <option value="PERDU">PERDU</option>
                          <option value="CLASSE">CLASSE</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- AI ANALYSIS SECTION -->
                <div class="ai-section" *ngIf="aiAnalysis || aiLoading">
                  <div class="ai-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    <span>ANALYSE IA DEFENSE</span>
                  </div>
                  
                  <div *ngIf="aiLoading" class="ai-loader">
                    <div class="pulse-ring"></div>
                    <span>Intelligence Artificielle en cours de réflexion...</span>
                  </div>

                  <div *ngIf="aiAnalysis" class="ai-result slideIn">
                    <div class="ai-summary">{{ aiAnalysis.summary }}</div>
                    <div class="ai-meta">
                      <span class="ai-risk" [ngClass]="aiAnalysis.riskLevel.toLowerCase()">
                        Risque: {{ aiAnalysis.riskLevel }}
                      </span>
                      <span class="ai-conf">Confiance: {{ aiAnalysis.confidence * 100 }}%</span>
                    </div>
                    <div class="ai-suggestions">
                      <strong>Recommandations:</strong>
                      <ul>
                        <li *ngFor="let s of aiAnalysis.suggestions">{{ s }}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn-ai" (click)="analyzeWithAI()" [disabled]="aiLoading">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 2a10 10 0 0 1 10 10h-10V2z"></path><path d="M12 12L2.2 7.3"></path><path d="M12 12l9.8 4.7"></path><path d="M12 12v10"></path></svg>
                  {{ aiLoading ? 'Analyse...' : 'Analyse IA Profonde' }}
                </button>
                <button class="btn-secondary" (click)="closeDossierModal()">Fermer</button>
                <button class="btn-primary" *ngIf="isChargeDossier() || isAdmin()" [routerLink]="['/modifier-dossier', selectedDossier.reference]">
                  Modifier ce dossier
                </button>
              </div>
            </div>
          </div>
          <app-confirm-dialog 
            [show]="showConfirm" 
            [message]="confirmMessage" 
            (confirmed)="executeAction()" 
            (cancelled)="showConfirm = false">
          </app-confirm-dialog>
      </main>
    </div>
  `,
  styles: [`
    :host {
      --bg-color: #f0f4f8;
      --sidebar-width: 280px;
      --header-height: 90px;
      --bna-green: #008766;
      --bna-green-light: rgba(0, 135, 102, 0.08);
      --bna-green-hover: #007256;
      --bna-green-dark: #005641;
      --bna-grey: #40514e;
      --text-main: #1e293b;
      --text-muted: #64748b;
      --card-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
    }

    .app-layout {
      display: flex;
      min-height: 100vh;
      background-color: var(--bg-color);
      font-family: 'Outfit', 'Inter', sans-serif;
    }

    /* PREMIUM MAIN CONTENT */
    .main-content {
      flex: 1;
      margin-left: var(--sidebar-width);
      display: flex;
      flex-direction: column;
    }


    .dashboard-content {
      padding: 32px 48px 48px 48px;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
    }

    .page-header-actions { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 24px; 
    }
    
    .page-header-actions h2 { 
      font-size: 20px; 
      color: var(--text-main); 
      margin: 0; 
      font-weight: 800; 
    }
    
    .btn-primary { 
      background: linear-gradient(135deg, var(--bna-green) 0%, #10b981 100%); 
      color: white; 
      border: none; 
      padding: 12px 24px; 
      border-radius: 12px; 
      font-weight: 700; 
      cursor: pointer; 
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s; 
      font-size: 15px;
      box-shadow: 0 4px 12px rgba(0,135,102,0.3);
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,135,102,0.4); }
    .btn-primary.large { padding: 16px 32px; font-size: 16px; margin-top: 16px; }

    .table-container { 
      background: white; 
      border-radius: 24px; 
      border: 1px solid rgba(0,0,0,0.03); 
      overflow: hidden; 
      box-shadow: var(--card-shadow); 
    }
    table { width: 100%; border-collapse: separate; border-spacing: 0; }
    th { 
      text-align: left; 
      padding: 20px 24px; 
      color: #475569; 
      font-size: 13px; 
      font-weight: 800; 
      text-transform: uppercase; 
      background: #f8fafc; 
      border-bottom: 1px solid rgba(0,0,0,0.04); 
      letter-spacing: 0.1em;
    }
    td { 
      padding: 20px 24px; 
      color: var(--text-main); 
      font-size: 15px; 
      font-weight: 500;
      border-bottom: 1px solid rgba(0,0,0,0.03); 
    }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background-color: #f8fafc; }
    
    .badge { padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 700; display: inline-flex; align-items: center;}
    .badge.warning { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
    .badge.success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
    .badge.info { background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; }
    .badge.danger { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
    
    .step-text { font-size: 14px; color: var(--text-muted); font-weight: 600; background: #f1f5f9; padding: 6px 12px; border-radius: 8px; }

    .actions-cell { display: flex; gap: 12px; }
    .btn-action { 
      background: white; 
      color: #64748b; 
      border: 1px solid rgba(0,0,0,0.06); 
      width: 46px; 
      height: 46px; 
      border-radius: 15px; 
      cursor: pointer; 
      display: inline-flex; 
      align-items: center; 
      justify-content: center; 
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .btn-action:hover { 
      color: var(--bna-green); 
      border-color: rgba(0, 135, 102, 0.2); 
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
      background: white;
    }
    .btn-action svg { width: 20px; height: 20px; stroke-width: 2.2px; }

    /* LOADING STATE */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 40px;
      gap: 16px;
      color: var(--text-muted);
    }
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--bna-green-light);
      border-top: 4px solid var(--bna-green);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ERROR STATE */
    .error-state {
      background: #fef2f2;
      border: 1px dashed #fecaca;
      border-radius: 24px;
      padding: 48px 40px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .error-icon { color: #dc2626; }
    .error-state h3 { font-size: 20px; font-weight: 800; color: #991b1b; margin: 0; }
    .error-state p { color: #dc2626; margin: 0; }

    /* EMPTY STATE STYLES */
    .empty-state {
      background: white;
      border-radius: 24px;
      border: 1px dashed rgba(0, 135, 102, 0.3);
      padding: 80px 40px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: var(--card-shadow);
      margin-top: 24px;
    }
    
    .empty-icon {
      color: var(--bna-green);
      margin-bottom: 24px;
      opacity: 0.8;
      background: var(--bna-green-light);
      padding: 24px;
      border-radius: 50%;
    }
    
    .empty-state h3 {
      font-size: 24px;
      font-weight: 800;
      color: var(--text-main);
      margin: 0 0 8px 0;
    }
    
    .empty-state p {
      color: var(--text-muted);
      font-size: 16px;
      margin: 0 0 24px 0;
      max-width: 400px;
    }

    .nav-section-title {
      font-size: 11px;
      font-weight: 800;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin: 16px 0 8px 18px;
    }

    /* MODAL STYLES */
    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 1000; display: flex; align-items: center; justify-content: center;
      animation: fadeIn 0.2s ease-out;
    }
    .modal-content {
      background: white; border-radius: 24px; width: 100%; max-width: 600px;
      box-shadow: 0 20px 40px -10px rgba(0,0,0,0.2); overflow: hidden;
      animation: slideUp 0.3s ease-out; margin: 20px;
    }
    .modal-header {
      padding: 24px 32px; border-bottom: 1px solid #f1f5f9;
      display: flex; justify-content: space-between; align-items: center;
    }
    .modal-header h3 { margin: 0; font-size: 20px; font-weight: 800; color: #1e293b; }
    .btn-close {
      background: none; border: none; cursor: pointer; color: #64748b;
      display: flex; align-items: center; justify-content: center; padding: 8px; border-radius: 50%;
      transition: all 0.2s;
    }
    .btn-close:hover { background: #f1f5f9; color: #ef4444; }
    .modal-body { padding: 32px; display: flex; flex-direction: column; gap: 24px; }
    .grid-2-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .detail-group { display: flex; flex-direction: column; gap: 8px; }
    .detail-label { font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .detail-value { font-size: 16px; font-weight: 500; color: #1e293b; }
    .detail-value.font-mono { font-family: 'Courier New', Courier, monospace; font-weight: 700; color: var(--bna-green); }
    .detail-desc { font-size: 15px; color: #475569; line-height: 1.6; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #f1f5f9; }
    .modal-footer {
      padding: 24px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0;
      display: flex; justify-content: flex-end; gap: 16px;
    }
    .btn-secondary { background: white; border: 1px solid #cbd5e1; color: #475569; padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-secondary:hover { background: #f1f5f9; }

    /* AI STYLES */
    .ai-section { 
      margin-top: 8px; padding: 24px; border-radius: 20px; 
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 1.5px solid #bae6fd;
    }
    .ai-header { display: flex; align-items: center; gap: 10px; color: #0369a1; font-weight: 800; font-size: 12px; letter-spacing: 1px; margin-bottom: 16px; }
    .ai-loader { display: flex; align-items: center; gap: 12px; color: #0369a1; font-weight: 600; font-size: 14px; }
    .pulse-ring { width: 12px; height: 12px; background: #0ea5e9; border-radius: 50%; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(14, 165, 233, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(14, 165, 233, 0); } }
    
    .ai-result { display: flex; flex-direction: column; gap: 16px; }
    .ai-summary { font-size: 15px; line-height: 1.6; color: #1e293b; font-weight: 500; }
    .ai-meta { display: flex; gap: 16px; align-items: center; }
    .ai-risk { padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
    .ai-risk.low { background: #dcfce7; color: #166534; }
    .ai-risk.medium { background: #fef9c3; color: #854d0e; }
    .ai-risk.high { background: #fee2e2; color: #991b1b; }
    .ai-conf { font-size: 12px; color: #64748b; font-weight: 600; }
    .ai-suggestions { background: white; padding: 16px; border-radius: 12px; border: 1px solid #e0f2fe; }
    .ai-suggestions strong { display: block; margin-bottom: 8px; font-size: 13px; color: #0369a1; }
    .ai-suggestions ul { margin: 0; padding-left: 20px; font-size: 14px; color: #475569; }
    .ai-suggestions li { margin-bottom: 4px; }
    
    .btn-ai {
      background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
      color: white; border: none; padding: 12px 24px; border-radius: 14px;
      font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px;
      transition: all 0.3s; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      font-size: 14px;
    }
    .btn-ai:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4); }
    .btn-ai:disabled { opacity: 0.6; cursor: wait; }

    @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

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

    @media (max-width: 1024px) {
      .sidebar { transform: translateX(-100%); transition: transform 0.3s; }
      .main-content { margin-left: 0; }
      .top-header { padding: 0 24px; }
      .dashboard-content { padding: 24px; }
    }
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
    private route: ActivatedRoute
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.loadDossiers();

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

  onAction(type: string, ref: string): void {
    this.confirmMessage = `Êtes-vous sûr de vouloir ${type.toLowerCase()} le dossier ${ref} ?`;
    this.pendingAction = () => this.handleActionExecution(type, ref);
    this.showConfirm = true;
  }

  executeAction(): void {
    if (this.pendingAction) {
      this.pendingAction();
      this.pendingAction = null;
      this.showConfirm = false;
    }
  }

  private handleActionExecution(type: string, ref: string): void {
    const dossier = this.dossiers.find(d => d.reference === ref);

    if ((type === 'Approuver' || type === 'Valider') && dossier && dossier.id) {
      const nextStatus = type === 'Approuver' ? 'A_VALIDER' : 'CLOTURE';

      this.dossierService.updateStatus(dossier.id, nextStatus).subscribe({
        next: (updated) => {
          dossier.statut = updated.statut;

          if (type === 'Approuver') {
            this.notificationService.addNotification(
              `Dossier ${ref} pré-validé avec succès. Transmis au validateur.`,
              'ROLE_PRE_VALIDATEUR', 'SUCCESS'
            );
          } else {
            this.notificationService.addNotification(
              `Dossier ${ref} validé et clôturé avec succès.`,
              'ROLE_VALIDATEUR', 'SUCCESS'
            );
          }
        },
        error: () => {
          this.notificationService.addNotification(
            `Erreur lors de la mise à jour du dossier ${ref}.`,
            'ROLE_ADMIN', 'WARNING'
          );
        }
      });
    } else if (type === 'Soumettre' && dossier && dossier.id) {
      this.dossierService.updateStatus(dossier.id, 'A_PRE_VALIDER').subscribe({
        next: (updated) => {
          dossier.statut = updated.statut;
          this.notificationService.addNotification(`Dossier ${ref} soumis pour pré-validation.`, 'ROLE_CHARGE_DOSSIER', 'INFO');
        }
      });
    } else {
      this.notificationService.addNotification(
        `${type} pour ${ref} : Module en maintenance.`,
        'ROLE_ADMIN', 'WARNING'
      );
    }
  }

  getBadgeClass(statut: string): string {
    switch (statut) {
      case 'OUVERT': return 'info';
      case 'EN_COURS': return 'warning';
      case 'A_PRE_VALIDER': return 'info';
      case 'A_VALIDER': return 'warning';
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
