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

        <div class="dashboard-content">
          <div class="page-header-actions">
            <h2>Liste de vos dossiers</h2>
            <div class="header-btns">
              <button class="btn-export pdf" (click)="exportDossiers('pdf')" title="Exporter en PDF">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                PDF
              </button>
              <button class="btn-export excel" (click)="exportDossiers('excel')" title="Exporter en Excel">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                Excel
              </button>
              <button class="btn-primary" routerLink="/nouveau-dossier" *ngIf="isChargeDossier() || isAdmin()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Nouveau Dossier
              </button>
            </div>
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
                  <th>Finance</th>
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
                   <td>
                    <div class="finance-cell">
                      <div class="budget-row"><span class="label">P:</span> {{ d.budgetProvisionne != null ? (d.budgetProvisionne | number:'1.2-2') : '—' }}</div>
                      <div class="reel-row" *ngIf="d.fraisReel" [class.danger-text]="d.depassement && d.depassement > 0">
                        <span class="label">R:</span> {{ d.fraisReel | number:'1.2-2' }}
                        <span class="depassement-badge" *ngIf="d.depassement && d.depassement > 0" title="Dépassement de budget!">
                           +{{ d.depassement | number:'1.2-2' }}
                        </span>
                      </div>
                    </div>
                  <td>
                    <div class="actions-cell">
                      <button class="btn-action" title="Détails" (click)="$event.stopPropagation(); onViewDossier(d)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </button>
                      
                      <!-- FLOW ACTIONS -->
                      <button class="btn-action success-bg" title="Soumettre" *ngIf="isChargeDossier() && d.statut === 'OUVERT'" (click)="$event.stopPropagation(); executeWorkflow('soumettre', d.id!)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </button>

                      <button class="btn-action success-bg" title="Pré-valider" *ngIf="isPreValidateur() && d.statut === 'EN_ATTENTE_PREVALIDATION'" (click)="$event.stopPropagation(); executeWorkflow('prevalider', d.id!)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      </button>

                      <button class="btn-action success-bg" title="Valider Final" *ngIf="isValidateur() && d.statut === 'EN_ATTENTE_VALIDATION'" (click)="$event.stopPropagation(); executeWorkflow('validerFinal', d.id!)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                      </button>

                      <button class="btn-action danger-bg" title="Refuser" *ngIf="(isPreValidateur() && d.statut === 'EN_ATTENTE_PREVALIDATION') || (isValidateur() && d.statut === 'EN_ATTENTE_VALIDATION')" (click)="$event.stopPropagation(); executeWorkflow('refuser', d.id!)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
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
                <!-- DEPASSEMENT ALERT BANNER -->
                <div class="depassement-alert-banner alert-danger" *ngIf="selectedDossier.depassement && selectedDossier.depassement > 0">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                   <div class="alert-text">
                      <strong>Alerte Dépassement Budget:</strong> Ce dossier a dépassé son budget initial de 
                      <span class="highlight">{{ selectedDossier.depassement | number:'1.2-2' }} TND</span>.
                   </div>
                </div>

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
                    <div class="ai-premium-card">
                      <div class="ai-header">
                        <div class="ai-sparkle-icon">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 2a10 10 0 0 1 10 10h-10V2z"></path><path d="M12 12L2.2 7.3"></path><path d="M12 12l9.8 4.7"></path><path d="M12 12v10"></path></svg>
                        </div>
                        <div class="ai-title-wrap">
                          <span class="ai-label">INTELLIGENCE BNA</span>
                          <h4 class="ai-title">Résumé IA Decision-Ready</h4>
                        </div>
                      </div>
                      
                      <div *ngIf="aiLoading" class="ai-loader-premium">
                        <div class="ai-pulse-bar"></div>
                        <span class="pulse-text">Génération de l'analyse en cours...</span>
                      </div>
    
                      <div *ngIf="aiAnalysis" class="ai-body-premium slideIn">
                        <div class="ai-meta-pills">
                          <span class="ai-pill risk" [ngClass]="aiAnalysis.riskLevel.toLowerCase()">
                            RISQUE: {{ aiAnalysis.riskLevel }}
                          </span>
                          <span class="ai-pill conf">
                            FIABILITÉ: {{ aiAnalysis.confidence * 100 }}%
                          </span>
                        </div>
    
                        <div class="ai-summary-text">
                          {{ aiAnalysis.summary }}
                        </div>
    
                        <div class="ai-reco-box">
                          <div class="reco-header">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                            RECO. STRATÉGIQUES
                          </div>
                          <ul>
                            <li *ngFor="let s of aiAnalysis.suggestions">{{ s }}</li>
                          </ul>
                        </div>
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
    /* AI PREMIUM STYLES */
    .ai-section { margin-top: 8px; }
    .ai-premium-card {
      background: #ffffff; border-radius: 20px; border: 1.5px solid #e2e8f0;
      padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
      position: relative; overflow: hidden;
    }
    .ai-premium-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
      background: linear-gradient(90deg, #0ea5e9, #2563eb);
    }
    .ai-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
    .ai-sparkle-icon {
      background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
      width: 44px; height: 44px; border-radius: 12px; display: flex;
      align-items: center; justify-content: center; color: white;
      box-shadow: 0 6px 12px rgba(37, 99, 235, 0.2);
    }
    .ai-label { font-size: 11px; font-weight: 800; color: #64748b; letter-spacing: 1.5px; }
    .ai-title { margin: 2px 0 0 0; font-size: 18px; font-weight: 800; color: #1e293b; }
    
    .ai-loader-premium { display: flex; flex-direction: column; gap: 12px; align-items: center; padding: 20px 0; }
    .ai-pulse-bar { 
      width: 100%; height: 6px; background: #f1f5f9; border-radius: 10px; 
      position: relative; overflow: hidden;
    }
    .ai-pulse-bar::after {
      content: ''; position: absolute; left: -50%; width: 50%; height: 100%;
      background: linear-gradient(90deg, transparent, #0ea5e9, transparent);
      animation: pulseMove 1.5s infinite;
    }
    @keyframes pulseMove { from { left: -50%; } to { left: 100%; } }
    .pulse-text { font-size: 14px; font-weight: 600; color: #64748b; }

    .ai-meta-pills { display: flex; gap: 10px; margin-bottom: 16px; }
    .ai-pill { padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
    .ai-pill.risk.low { background: #dcfce7; color: #166534; }
    .ai-pill.risk.medium { background: #fef9c3; color: #854d0e; }
    .ai-pill.risk.high { background: #fee2e2; color: #991b1b; }
    .ai-pill.conf { background: #f1f5f9; color: #475569; }

    .ai-summary-text { font-size: 15px; color: #334155; line-height: 1.7; font-weight: 500; margin-bottom: 20px; }
    .ai-reco-box { background: #f8fafc; border-radius: 16px; padding: 16px; border: 1px solid #f1f5f9; }
    .reco-header { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 800; color: #0ea5e9; margin-bottom: 12px; letter-spacing: 1px; }
    .ai-reco-box ul { margin: 0; padding-left: 20px; list-style-type: none; }
    .ai-reco-box li { position: relative; font-size: 14px; color: #475569; margin-bottom: 8px; padding-left: 4px; font-weight: 500; }
    .ai-reco-box li::before { content: '•'; position: absolute; left: -14px; color: #0ea5e9; font-weight: 900; }


    
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

   executeWorkflow(action: 'soumettre' | 'prevalider' | 'validerFinal' | 'refuser', id: number): void {
    if (action === 'refuser') {
      const motif = prompt("Veuillez saisir le motif du refus (Min. 20 car.) :");
      if (!motif || motif.length < 20) {
        alert("Le motif doit contenir au moins 20 caractères.");
        return;
      }
      this.dossierService.refuser(id, motif).subscribe({
        next: () => {
          this.notificationService.addNotification("Dossier refusé.", "ROLE_ADMIN", "SUCCESS");
          this.loadDossiers();
        },
        error: (err) => alert(err.error?.message || "Erreur lors du refus")
      });
    } else {
      this.dossierService[action](id).subscribe({
        next: () => {
          this.notificationService.addNotification(`Action ${action} effectuée.`, "ROLE_ADMIN", "SUCCESS");
          this.loadDossiers();
        },
        error: (err) => alert(err.error?.message || `Erreur lors de l'action ${action}`)
      });
    }
  }

  exportDossiers(format: 'pdf' | 'excel'): void {
    window.open(`http://localhost:8082/api/reports/dossiers/export/${format}`, '_blank');
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
