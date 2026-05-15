import { Component, OnInit, HostListener } from '@angular/core';
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
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mes-dossiers',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, SidebarComponent, HeaderComponent, FormsModule],
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

          <!-- TABS FILTER -->
          <div class="tabs-filter-container slideIn">
            <div class="filter-pills">
              <button class="pill" [class.active]="activeTab === 'ALL'" (click)="setTab('ALL')">
                Tous les Dossiers
              </button>
              <button class="pill" [class.active]="activeTab === 'SOUMIS'" (click)="setTab('SOUMIS')">
                <span class="pill-icon">📤</span> Soumis
              </button>
              <button class="pill" [class.active]="activeTab === 'PRE_VALIDE'" (click)="setTab('PRE_VALIDE')">
                <span class="pill-icon">🛡️</span> Pré-validés
              </button>
              <button class="pill" [class.active]="activeTab === 'VALIDE'" (click)="setTab('VALIDE')">
                <span class="pill-icon">✅</span> Validés
              </button>
              <button class="pill" [class.active]="activeTab === 'CLOTURE'" (click)="setTab('CLOTURE')">
                <span class="pill-icon">🔒</span> Clôturés
              </button>
              <button class="pill" [class.active]="activeTab === 'ARCHIVED'" (click)="setTab('ARCHIVED')">
                <span class="pill-icon">📦</span> Archivés
              </button>
              <button class="pill" [class.active]="activeTab === 'REFUSE'" (click)="setTab('REFUSE')">
                <span class="pill-icon">🚫</span> Refusés
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
                <tr *ngFor="let d of filteredDossiers">
                  <td><strong>{{ d.reference }}</strong></td>
                  <td>{{ d.titre }}</td>
                  <td>
                    <span class="badge" [ngClass]="getPrioriteBadge(d.priorite)">
                      {{ d.priorite || '—' }}
                    </span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="getBadgeClass(d.statut)">
                      {{ getStatusLabel(d.statut) }}
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
                  </td>
                  <td>
                      <div class="actions-cell">
                        <!-- 1. Toujours Voir -->
                        <button class="btn-action view-btn" title="Détails" (click)="$event.stopPropagation(); onViewDossier(d)">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>

                        <!-- Actions Dynamiques -->
                        <ng-container *ngIf="actionsMap[d.id!] as dossierActions">
                          <!-- Afficher les 2 premières actions directement -->
                          <button *ngFor="let act of dossierActions.slice(0, 2)" 
                                  class="btn-action" [ngClass]="act.class" 
                                  [title]="act.title" 
                                  (click)="handleAction(act.id, d, $event)">
                            <ng-container [ngSwitch]="act.icon">
                              <svg *ngSwitchCase="'soumettre'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                              <svg *ngSwitchCase="'demarrer'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                              <svg *ngSwitchCase="'cloturer'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
                              <svg *ngSwitchCase="'reject'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                              <svg *ngSwitchCase="'archiver'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>
                              <svg *ngSwitchCase="'delete'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </ng-container>
                          </button>

                          <!-- Si plus de 2 actions, afficher les points de suspension -->
                          <div class="more-actions-wrapper" *ngIf="dossierActions.length > 2">
                            <button class="btn-action more-btn" (click)="toggleActionMenu($event, d.id!)" title="Plus d'actions">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="1.5"></circle><circle cx="12" cy="5" r="1.5"></circle><circle cx="12" cy="19" r="1.5"></circle></svg>
                            </button>
                            
                            <div class="actions-dropdown" *ngIf="activeActionMenuId === d.id" (click)="$event.stopPropagation()">
                              <button *ngFor="let act of dossierActions.slice(2)" 
                                      class="btn-action" [ngClass]="act.class" 
                                      [title]="act.title" 
                                      (click)="handleAction(act.id, d, $event)">
                                <ng-container [ngSwitch]="act.icon">
                                  <svg *ngSwitchCase="'soumettre'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                  <svg *ngSwitchCase="'demarrer'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                  <svg *ngSwitchCase="'cloturer'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
                                  <svg *ngSwitchCase="'reject'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                  <svg *ngSwitchCase="'archiver'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>
                                  <svg *ngSwitchCase="'delete'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </ng-container>
                              </button>
                            </div>
                          </div>
                        </ng-container>
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
                    <span class="badge" [ngClass]="getBadgeClass(selectedDossier.statut)">{{ getStatusLabel(selectedDossier.statut) }}</span>
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
 
                <!-- PARTICIPANTS SECTION -->
                <div class="participants-section">
                  <div class="section-subtitle">PARTICIPANTS & AUXILIAIRES</div>
                  <div class="participants-grid">
                    <div class="participant-card" *ngIf="selectedDossier.avocat">
                      <div class="p-icon avocat">⚖️</div>
                      <div class="p-info">
                        <span class="p-role">Avocat</span>
                        <span class="p-name">{{ selectedDossier.avocat.nom }}</span>
                        <span class="p-contact" *ngIf="selectedDossier.avocat.telephone">{{ selectedDossier.avocat.telephone }}</span>
                      </div>
                    </div>
                    <div class="participant-card" *ngIf="selectedDossier.huissier">
                      <div class="p-icon huissier">📜</div>
                      <div class="p-info">
                        <span class="p-role">Huissier</span>
                        <span class="p-name">{{ selectedDossier.huissier.nom }}</span>
                        <span class="p-contact" *ngIf="selectedDossier.huissier.telephone">{{ selectedDossier.huissier.telephone }}</span>
                      </div>
                    </div>
                    <div class="participant-card" *ngIf="selectedDossier.expert">
                      <div class="p-icon expert">🔍</div>
                      <div class="p-info">
                        <span class="p-role">Expert</span>
                        <span class="p-name">{{ selectedDossier.expert.nom }}</span>
                        <span class="p-contact" *ngIf="selectedDossier.expert.telephone">{{ selectedDossier.expert.telephone }}</span>
                      </div>
                    </div>
                    <div class="no-data" *ngIf="!selectedDossier.avocat && !selectedDossier.huissier && !selectedDossier.expert">
                      Aucun auxiliaire assigné à ce dossier.
                    </div>
                  </div>
                </div>

                <!-- REFUSAL REASON IF ANY -->
                <div class="detail-group refusal-box" *ngIf="selectedDossier.statut === 'REFUSE' && selectedDossier.motifRefus">
                  <span class="detail-label danger-text">Motif du Refus</span>
                  <div class="detail-desc refusal-reason">{{ selectedDossier.motifRefus }}</div>
                </div>

                <!-- WORKFLOW HISTORY ACTIONS (Timeline) -->
                <div class="history-section" *ngIf="workflowHistory.length > 0">
                   <div class="section-subtitle">HISTORIQUE DU WORKFLOW</div>
                   <div class="timeline">
                      <div class="timeline-item" *ngFor="let entry of workflowHistory">
                         <div class="timeline-marker">
                           <div class="marker-dot"></div>
                         </div>
                         <div class="timeline-content">
                            <span class="time">{{ entry.timestamp | date:'dd/MM/yyyy HH:mm' }}</span>
                            <span class="user">{{ entry.userEmail }}</span>
                            <p class="action">{{ entry.details }}</p>
                         </div>
                      </div>
                   </div>
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
                      <div class="aff-actions">
                        <select [value]="aff.statut" (change)="updateAffaireStatut(aff, $any($event.target).value)"
                                class="aff-select" [ngClass]="aff.statut?.toLowerCase() || ''">
                          <option value="EN_COURS">EN COURS</option>
                          <option value="GAGNE">GAGNE</option>
                          <option value="PERDU">PERDU</option>
                          <option value="CLASSE">CLASSE</option>
                        </select>
                        <button class="btn-aff-detail" (click)="viewAffaireDetail(aff)" title="Voir les détails">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                  <!-- AI PREDICTION SECTION (ML) -->
                  <div class="ai-ml-section" *ngIf="selectedDossier.verdict || mlLoading">
                    <div class="ai-premium-card ml-card" [ngClass]="{'loading': mlLoading}">
                      <div class="ai-header">
                        <div class="ai-sparkle-icon ml">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 2a10 10 0 0 1 10 10h-10V2z"></path><path d="M12 12L2.2 7.3"></path><path d="M12 12l9.8 4.7"></path><path d="M12 12v10"></path></svg>
                        </div>
                        <div class="ai-title-wrap">
                          <span class="ai-label">MACHINE LEARNING - RÉGRESSION LOGISTIQUE</span>
                          <h4 class="ai-title">Prédiction du Verdict</h4>
                        </div>
                      </div>
                      
                      <div *ngIf="mlLoading" class="ai-loader-premium">
                        <div class="ai-pulse-bar ml"></div>
                        <span class="pulse-text">Calcul de la probabilité en cours...</span>
                      </div>
    
                      <div *ngIf="!mlLoading && selectedDossier.verdict" class="ai-body-premium ml-body slideIn">
                        <div class="prediction-main">
                          <div class="verdict-display" [ngClass]="selectedDossier.verdict?.toLowerCase() || ''">
                            <span class="verdict-label">VERDICT PRÉDIT</span>
                            <span class="verdict-value">{{ selectedDossier.verdict }}</span>
                          </div>
                          
                          <div class="probability-stats">
                            <div class="stat-item">
                              <span class="stat-label">SUCCÈS</span>
                              <div class="progress-container">
                                <div class="progress-bar success" [style.width.%]="selectedDossier.probabilitySuccess"></div>
                              </div>
                              <span class="stat-val">{{ selectedDossier.probabilitySuccess }}%</span>
                            </div>
                            <div class="stat-item">
                              <span class="stat-label">ÉCHEC</span>
                              <div class="progress-container">
                                <div class="progress-bar failure" [style.width.%]="selectedDossier.probabilityFailure"></div>
                              </div>
                              <span class="stat-val">{{ selectedDossier.probabilityFailure }}%</span>
                            </div>
                          </div>
                        </div>

                        <div class="ai-meta-pills ml-pills">
                          <span class="ai-pill risk" [ngClass]="selectedDossier.riskScore ? selectedDossier.riskScore?.toLowerCase() : 'moyen'">
                            NIVEAU DE RISQUE: {{ selectedDossier.riskScore || 'MOYEN' }}
                          </span>
                        </div>

                        <!-- Assistant NVIDIA AI -->
                        <div class="ai-assistant-analysis slideIn" *ngIf="selectedDossier.aiAnalysis">
                          <div class="assistant-header">
                            <div class="assistant-bot-icon">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 2a10 10 0 0 1 10 10h-10V2z"></path><path d="M12 12L2.2 7.3"></path><path d="M12 12l9.8 4.7"></path><path d="M12 12v10"></path></svg>
                            </div>
                            <span>ASSISTANT JURIDIQUE NVIDIA GLM-5.1</span>
                          </div>
                          <div class="assistant-content">
                            <p>{{ selectedDossier.aiAnalysis }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>


                  <!-- NVIDIA ANALYSIS SECTION (Optionnel — s'affiche après clic sur bouton bleu) -->
                  <div class="ai-section" *ngIf="selectedDossier.aiAnalysis || nvidiaLoading">
                    <div class="ai-premium-card nvidia-card">
                      <div class="ai-header">
                        <div class="ai-sparkle-icon nvidia-icon">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 2a10 10 0 0 1 10 10h-10V2z"></path><path d="M12 12L2.2 7.3"></path><path d="M12 12l9.8 4.7"></path><path d="M12 12v10"></path></svg>
                        </div>
                        <div class="ai-title-wrap">
                          <span class="ai-label">ANALYSE AVANCÉE — NVIDIA GLM-5.1</span>
                          <h4 class="ai-title">Interprétation Juridique IA</h4>
                        </div>
                      </div>

                      <div *ngIf="nvidiaLoading" class="ai-loader-premium">
                        <div class="ai-pulse-bar nvidia-bar"></div>
                        <span class="pulse-text">Analyse NVIDIA en cours (~10s)...</span>
                      </div>

                      <div *ngIf="!nvidiaLoading && selectedDossier.aiAnalysis" class="ai-body-premium slideIn">
                        <div class="assistant-content">
                          <p>{{ selectedDossier.aiAnalysis }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
              </div>

              <div class="modal-footer">
                <button class="btn-ai ml" (click)="analyzeWithML()" [disabled]="mlLoading">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 2a10 10 0 0 1 10 10h-10V2z"></path><path d="M12 12L2.2 7.3"></path><path d="M12 12l9.8 4.7"></path><path d="M12 12v10"></path></svg>
                  {{ mlLoading ? 'Prédiction en cours...' : 'Prédiction Verdict (ML)' }}
                </button>
                <button class="btn-ai nvidia" (click)="analyzeWithNvidia()" [disabled]="nvidiaLoading || !selectedDossier?.verdict" title="Analyse NVIDIA GLM-5.1 (requiert la prédiction ML)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 2a10 10 0 0 1 10 10h-10V2z"></path><path d="M12 12L2.2 7.3"></path><path d="M12 12l9.8 4.7"></path><path d="M12 12v10"></path></svg>
                  {{ nvidiaLoading ? 'Analyse NVIDIA...' : 'Analyse NVIDIA (Optionnel)' }}
                </button>
                <button class="btn-secondary" (click)="closeDossierModal()">Fermer</button>
                <button class="btn-primary" *ngIf="isChargeDossier() && selectedDossier.statut === 'OUVERT'" (click)="executeWorkflow('en-cours', selectedDossier.id!)" style="background: #0369a1;">
                  Démarrer le dossier
                </button>
                <button class="btn-primary" *ngIf="isChargeDossier() && (selectedDossier.statut === 'OUVERT' || selectedDossier.statut === 'EN_COURS')" (click)="executeWorkflow('cloturer', selectedDossier.id!)" style="background: #475569;">
                  Clôturer le dossier
                </button>
                <button class="btn-primary" *ngIf="isChargeDossier() || isAdmin()" [routerLink]="['/modifier-dossier', selectedDossier.reference]">
                  Modifier ce dossier
                </button>
              </div>
            </div>
          </div>

          <!-- AFFAIRE DETAIL SUB-MODAL -->
          <div class="modal-overlay affaire-sub-overlay" *ngIf="selectedAffaireDetail" (click)="closeAffaireDetail()">
            <div class="modal-content affaire-detail-modal slideUp" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <div class="aff-modal-title">
                  <span class="aff-type-badge">{{ selectedAffaireDetail.type }}</span>
                  <h3>{{ selectedAffaireDetail.referenceJudiciaire }}</h3>
                </div>
                <button class="btn-close" (click)="closeAffaireDetail()">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <div class="modal-body aff-detail-body">
                <!-- Main info grid -->
                <div class="aff-detail-grid">
                  <div class="aff-detail-item full">
                    <label>Titre / Objet</label>
                    <div class="aff-detail-val title">{{ selectedAffaireDetail.titre || '—' }}</div>
                  </div>
                  <div class="aff-detail-item">
                    <label>Référence Judiciaire</label>
                    <div class="aff-detail-val mono">{{ selectedAffaireDetail.referenceJudiciaire }}</div>
                  </div>
                  <div class="aff-detail-item">
                    <label>Statut</label>
                    <span class="status-pill-aff" [ngClass]="selectedAffaireDetail.statut">{{ selectedAffaireDetail.statut }}</span>
                  </div>
                  <div class="aff-detail-item">
                    <label>Type de Procédure</label>
                    <div class="aff-detail-val">{{ selectedAffaireDetail.type }}</div>
                  </div>
                  <div class="aff-detail-item">
                    <label>Date d'Ouverture</label>
                    <div class="aff-detail-val">{{ selectedAffaireDetail.dateOuverture | date:'dd MMMM yyyy' }}</div>
                  </div>
                  <div class="aff-detail-item full" *ngIf="selectedAffaireDetail.description">
                    <label>Description</label>
                    <div class="aff-detail-desc">{{ selectedAffaireDetail.description }}</div>
                  </div>
                </div>
 
                <!-- Affaire Participants -->
                <div class="aff-participants-section">
                  <div class="aff-proc-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    ACTEURS ET AUXILIAIRES
                  </div>
                  <div class="aff-participants-list">
                    <div class="aff-part-item" *ngIf="selectedAffaireDetail.tribunal">
                      <div class="aff-part-icon tribunal">🏛️</div>
                      <div class="aff-part-info">
                        <span class="aff-part-role">Tribunal</span>
                        <span class="aff-part-name">{{ selectedAffaireDetail.tribunal.nom }}</span>
                      </div>
                    </div>
                    <div class="aff-part-item" *ngIf="selectedAffaireDetail.avocat">
                      <div class="aff-part-icon avocat">⚖️</div>
                      <div class="aff-part-info">
                        <span class="aff-part-role">Avocat</span>
                        <span class="aff-part-name">{{ selectedAffaireDetail.avocat.nom }}</span>
                      </div>
                    </div>
                    <div class="aff-part-item" *ngIf="selectedAffaireDetail.huissier">
                      <div class="aff-part-icon huissier">📜</div>
                      <div class="aff-part-info">
                        <span class="aff-part-role">Huissier</span>
                        <span class="aff-part-name">{{ selectedAffaireDetail.huissier.nom }}</span>
                      </div>
                    </div>
                    <div class="aff-part-item" *ngIf="selectedAffaireDetail.expert">
                      <div class="aff-part-icon expert">🔍</div>
                      <div class="aff-part-info">
                        <span class="aff-part-role">Expert</span>
                        <span class="aff-part-name">{{ selectedAffaireDetail.expert.nom }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Procedures section -->
                <div class="aff-proc-section">
                  <div class="aff-proc-header">
                    <div class="aff-proc-title">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                      PROCÉDURES JUDICIAIRES
                    </div>
                    <span class="aff-proc-count">{{ selectedAffaireProcedures.length }} procédure(s)</span>
                  </div>

                  <div *ngIf="loadingAffaireProcs" class="aff-proc-loading">
                    <div class="mini-spinner"></div> Chargement...
                  </div>

                  <div *ngIf="!loadingAffaireProcs && selectedAffaireProcedures.length === 0" class="aff-proc-empty">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    <p>Aucune procédure pour cette affaire.</p>
                  </div>

                  <div class="aff-proc-list" *ngIf="!loadingAffaireProcs && selectedAffaireProcedures.length > 0">
                    <div class="aff-proc-row" *ngFor="let p of selectedAffaireProcedures">
                      <div class="proc-row-left">
                        <span class="proc-row-titre">{{ p.titre }}</span>
                        <span class="proc-row-type">{{ p.type }}</span>
                      </div>
                      <span class="proc-row-pill" [ngClass]="p.statut?.toLowerCase() || ''">{{ p.statut }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="modal-footer">
                <button class="btn-secondary" (click)="closeAffaireDetail()">Fermer</button>
              </div>
            </div>
          </div>

          <!-- REFUSE MODAL -->
          <div class="modal-overlay" *ngIf="showRefuseModal">
            <div class="modal-content small" (click)="$event.stopPropagation()">
              <div class="modal-header danger-border">
                <h3>❌ Refuser le dossier</h3>
                <button class="btn-close" (click)="showRefuseModal = false">×</button>
              </div>
              <div class="modal-body">
                <p>Veuillez indiquer le motif du refus. Ce motif sera transmis au chargé de dossier.</p>
                <div class="form-group">
                  <label>Motif du refus (Min. 5 caractères) <span class="required">*</span></label>
                  <textarea [(ngModel)]="refusalMotif" name="refusalMotif" placeholder="Expliquez pourquoi ce dossier est refusé..." rows="5" class="refusal-area"></textarea>
                  <small class="char-count" [class.valid]="refusalMotif.length >= 5">{{ refusalMotif.length }} / 5 caractères minimum</small>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn-secondary" (click)="showRefuseModal = false">Annuler</button>
                <button class="btn-danger" [disabled]="refusalMotif.length < 5" (click)="confirmRefusal()">Confirmer le refus</button>
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
    .badge.secondary { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
    
    .step-text { font-size: 14px; color: var(--text-muted); font-weight: 600; background: #f1f5f9; padding: 6px 12px; border-radius: 8px; }

    .actions-cell { 
      display: flex; 
      gap: 10px; 
      align-items: center;
      justify-content: flex-start;
    }
    .btn-action { 
      background: white; 
      color: #64748b; 
      border: 1px solid #f1f5f9; 
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
      border-color: #e2e8f0;
      z-index: 10;
    }
    
    .btn-action.approve-btn { background: #f0fdf4; color: #166534; border-color: #dcfce7; }
    .btn-action.approve-btn:hover { background: #166534; color: white; border-color: #166534; }
    
    .btn-action.reject-btn { background: #fef2f2; color: #991b1b; border-color: #fee2e2; }
    .btn-action.reject-btn:hover { background: #991b1b; color: white; border-color: #991b1b; }
    
    .btn-action.delete-btn { background: #fffcfc; color: #ef4444; border-color: #fee2e2; }
    .btn-action.delete-btn:hover { background: #ef4444; color: white; border-color: #ef4444; }
    
    .view-btn { background: #f8fafc; color: #334155; border-color: #f1f5f9; }
    .view-btn:hover { background: white; color: #0f172a; border-color: #cbd5e1; }
    
    .edit-btn { background: #f0f7ff; color: #2563eb; border-color: #dbeafe; }
    .edit-btn:hover { background: #2563eb; color: white; border-color: #2563eb; }
    
    .btn-action svg { width: 16px; height: 16px; transition: transform 0.2s; }
    .btn-action:hover svg { transform: scale(1.1); }

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
    .cloture-btn { background: #fffbeb; color: #d97706; border-color: #fef3c7; }
    .cloture-btn:hover { background: #d97706; color: white; border-color: #d97706; }

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
      background: white; border-radius: 24px; width: 100%; max-width: 800px;
      box-shadow: 0 20px 50px -10px rgba(0,0,0,0.3); overflow: hidden;
      animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); margin: 20px;
      display: flex; flex-direction: column; max-height: 90vh;
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
    .modal-body { 
      padding: 32px; 
      display: flex; 
      flex-direction: column; 
      gap: 24px; 
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: #cbd5e1 #f8fafc;
    }
    .modal-body::-webkit-scrollbar { width: 6px; }
    .modal-body::-webkit-scrollbar-track { background: #f8fafc; }
    .modal-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
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
    
    /* ML PREDICTION SPECIFIC */
    .ml-card { border-color: #008766; }
    .ml-card::before { background: linear-gradient(90deg, #008766, #10b981); }
    .ai-sparkle-icon.ml { background: linear-gradient(135deg, #008766 0%, #10b981 100%); box-shadow: 0 6px 12px rgba(0, 135, 102, 0.2); }
    .ai-pulse-bar.ml::after { background: linear-gradient(90deg, transparent, #008766, transparent); }

    .prediction-main { display: flex; flex-direction: column; gap: 24px; margin-bottom: 24px; }
    .verdict-display { 
      background: #f8fafc; border-radius: 16px; padding: 20px; text-align: center;
      display: flex; flex-direction: column; gap: 4px; border: 2px solid #e2e8f0;
    }
    .verdict-display.gagné { border-color: #10b981; background: #f0fdf4; }
    .verdict-display.perdu { border-color: #ef4444; background: #fef2f2; }
    .verdict-label { font-size: 11px; font-weight: 800; color: #64748b; letter-spacing: 1px; }
    .verdict-value { font-size: 28px; font-weight: 900; }
    .verdict-display.gagné .verdict-value { color: #15803d; }
    .verdict-display.perdu .verdict-value { color: #b91c1c; }

    .probability-stats { display: flex; flex-direction: column; gap: 16px; }
    .stat-item { display: flex; align-items: center; gap: 16px; }
    .stat-label { font-size: 12px; font-weight: 800; color: #64748b; width: 60px; }
    .progress-container { flex: 1; height: 10px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
    .progress-bar { height: 100%; border-radius: 10px; }
    .progress-bar.success { background: #10b981; }
    .progress-bar.failure { background: #ef4444; }
    .stat-val { font-size: 14px; font-weight: 800; color: #1e293b; width: 50px; text-align: right; }

    .btn-ai.ml { background: linear-gradient(135deg, #008766 0%, #10b981 100%); box-shadow: 0 4px 12px rgba(0, 135, 102, 0.3); }
    .btn-ai.ml:hover:not(:disabled) { box-shadow: 0 8px 20px rgba(0, 135, 102, 0.4); }
    .btn-ai.nvidia { background: linear-gradient(135deg, #1a56db 0%, #6366f1 100%); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
    .btn-ai.nvidia:hover:not(:disabled) { box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4); }


    
    .btn-ai {
      background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
      color: white; border: none; padding: 12px 24px; border-radius: 14px;
      font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px;
      transition: all 0.3s; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      font-size: 14px;
    }
    .btn-ai:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4); }
    .btn-ai:disabled { opacity: 0.6; cursor: wait; }

    /* FILTERS TABS STYLES */
    .tabs-filter-container {
      margin: 0 0 32px 0;
      display: flex;
    }
    .filter-pills {
      background: #f1f5f9;
      padding: 6px;
      border-radius: 16px;
      display: flex;
      gap: 4px;
      border: 1px solid rgba(0,0,0,0.03);
    }
    .pill {
      background: transparent;
      border: none;
      padding: 10px 24px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .pill:hover {
      color: var(--bna-green);
      background: rgba(255,255,255,0.5);
    }
    .pill.active {
      background: white;
      color: var(--bna-green);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    .pill-icon {
      font-size: 16px;
      filter: grayscale(0.5);
      transition: all 0.3s;
    }
    .pill.active .pill-icon {
      filter: grayscale(0);
      transform: scale(1.1);
    }

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

    .aff-actions { display: flex; align-items: center; gap: 8px; }
    .btn-aff-detail {
      width: 32px; height: 32px; border-radius: 8px; border: 1.5px solid #e2e8f0;
      background: white; color: #64748b; display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.2s; flex-shrink: 0;
    }
    .btn-aff-detail:hover { border-color: #008766; color: #008766; background: rgba(0,135,102,0.06); transform: scale(1.1); }

    /* AFFAIRE DETAIL SUB-MODAL */
    .affaire-sub-overlay { z-index: 2100; }
    .affaire-detail-modal {
      max-width: 680px; border-radius: 28px;
      box-shadow: 0 32px 64px -12px rgba(0,0,0,0.3);
    }
    .aff-modal-title { display: flex; flex-direction: column; gap: 6px; }
    .aff-modal-title h3 { margin: 0; font-size: 20px; font-weight: 800; color: #1e293b; }
    .aff-type-badge {
      background: #008766; color: white; padding: 3px 10px; border-radius: 6px;
      font-size: 10px; font-weight: 800; text-transform: uppercase; width: fit-content;
    }

    .aff-detail-body { padding: 32px; max-height: 65vh; overflow-y: auto; display: flex; flex-direction: column; gap: 24px; }
    .aff-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .aff-detail-item.full { grid-column: span 2; }
    .aff-detail-item label {
      display: block; font-size: 10px; font-weight: 800; color: #94a3b8;
      text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;
    }
    .aff-detail-val { font-size: 15px; font-weight: 600; color: #1e293b; }
    .aff-detail-val.title { font-size: 18px; font-weight: 800; color: #008766; }
    .aff-detail-val.mono { font-family: 'JetBrains Mono', monospace; font-size: 14px; }
    .aff-detail-desc {
      background: #f8fafc; padding: 16px; border-radius: 12px;
      border: 1px solid #f1f5f9; font-size: 14px; color: #475569; line-height: 1.6;
    }
    .status-pill-aff {
      display: inline-flex; padding: 4px 12px; border-radius: 50px;
      font-size: 11px; font-weight: 800; text-transform: uppercase;
    }
    .status-pill-aff.EN_COURS { background: #e0f2fe; color: #0369a1; }
    .status-pill-aff.GAGNE    { background: #dcfce7; color: #15803d; }
    .status-pill-aff.PERDU    { background: #fee2e2; color: #b91c1c; }
    .status-pill-aff.CLASSE   { background: #f1f5f9; color: #64748b; }

    /* Procedures inside affaire detail modal */
    .aff-proc-section { border-top: 2px solid #f1f5f9; padding-top: 20px; }
    .aff-proc-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;
    }
    .aff-proc-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px;
    }
    .aff-proc-count {
      font-size: 11px; font-weight: 700; background: rgba(0,135,102,0.08);
      color: #008766; padding: 2px 10px; border-radius: 50px;
    }
    .aff-proc-loading { display: flex; align-items: center; gap: 10px; color: #64748b; font-size: 13px; }
    .mini-spinner {
      width: 14px; height: 14px; border: 2px solid #e2e8f0; border-top-color: #008766;
      border-radius: 50%; animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .aff-proc-empty {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      padding: 20px; background: #f8fafc; border-radius: 12px; border: 1.5px dashed #e2e8f0;
      color: #94a3b8; text-align: center;
    }
    .aff-proc-empty p { margin: 0; font-size: 13px; font-weight: 600; }
    .aff-proc-list { display: flex; flex-direction: column; gap: 8px; }
    .aff-proc-row {
      display: flex; justify-content: space-between; align-items: center;
      background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 12px 16px;
      transition: all 0.2s;
    }
    .aff-proc-row:hover { background: white; border-color: #008766; }
    .proc-row-left { display: flex; flex-direction: column; gap: 3px; }
    .proc-row-titre { font-size: 14px; font-weight: 700; color: #1e293b; }
    .proc-row-type {
      font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;
      background: #f1f5f9; padding: 2px 6px; border-radius: 4px; width: fit-content;
    }
    .proc-row-pill {
      padding: 4px 10px; border-radius: 50px; font-size: 10px; font-weight: 800; text-transform: uppercase;
    }
    .proc-row-pill.brouillon { background: #f1f5f9; color: #64748b; }
    .proc-row-pill.en_cours  { background: #dbeafe; color: #1d4ed8; }
    .proc-row-pill.validee   { background: #dcfce7; color: #166534; }
    .proc-row-pill.terminee  { background: #f0fdf4; color: #15803d; }
    .proc-row-pill.annulee   { background: #fee2e2; color: #b91c1c; }


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
    
    .refusal-box {
      background: #fef2f2;
      border: 2px solid #ef4444;
      border-radius: 16px;
      padding: 20px;
      margin-top: 16px;
      animation: slideIn 0.3s ease-out;
    }
    .refusal-reason {
      color: #991b1b;
      font-weight: 600;
      font-size: 15px;
      line-height: 1.6;
      margin-top: 8px;
    }
    .danger-text { color: #dc2626; font-weight: 800; }
    
    .refusal-area { 
      width: 100%; border-radius: 12px; border: 2px solid #fee2e2; background: #fef2f2; 
      padding: 16px; font-weight: 500; font-family: inherit; color: #991b1b;
    }
    .refusal-area:focus { border-color: #ef4444; outline: none; }
    .char-count { font-size: 11px; font-weight: 700; color: #94a3b8; display: block; margin-top: 4px; }
    .char-count.valid { color: #10b981; }
    .required { color: #ef4444; }
    .danger-border { border-bottom-color: #fecaca !important; }
    .btn-danger { background: #dc2626; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; }
    .btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

    .history-section { margin-top: 32px; padding-top: 24px; border-top: 1px solid #f1f5f9; }
    .section-subtitle { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
    .timeline { position: relative; padding-left: 32px; margin-top: 16px; }
    .timeline::before { content: ''; position: absolute; left: 11px; top: 0; bottom: 0; width: 2px; background: #e2e8f0; border-radius: 1px; }
    .timeline-item { position: relative; padding-bottom: 32px; }
    .timeline-item:last-child { padding-bottom: 0; }
    .timeline-marker { 
      position: absolute; left: -32px; top: 0; width: 24px; height: 24px; 
      border-radius: 50%; background: white; border: 2.5px solid #008766; 
      display: flex; align-items: center; justify-content: center; z-index: 2;
    }
    .marker-dot { width: 8px; height: 8px; border-radius: 50%; background: #008766; }
    .timeline-content .time { font-size: 11px; font-weight: 800; color: #64748b; display: block; margin-bottom: 4px; opacity: 0.8; }
    .timeline-content .user { font-size: 14px; font-weight: 800; color: #1e293b; display: block; }
    .timeline-content .action { margin: 6px 0 0 0; font-size: 14px; color: #64748b; font-weight: 500; line-height: 1.5; }
 
    /* PARTICIPANTS & AUXILIAIRES STYLES */
    .participants-section { margin-top: 24px; padding-top: 24px; border-top: 1.5px solid #f1f5f9; }
    .participants-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-top: 12px; }
    .participant-card { 
      background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; 
      padding: 16px; display: flex; align-items: center; gap: 16px; transition: all 0.2s;
    }
    .participant-card:hover { border-color: var(--bna-green); background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .p-icon { 
      width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px;
    }
    .p-icon.avocat { background: #ecfdf5; }
    .p-icon.huissier { background: #eff6ff; }
    .p-icon.expert { background: #fff7ed; }
    .p-info { display: flex; flex-direction: column; gap: 2px; }
    .p-role { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
    .p-name { font-size: 14px; font-weight: 700; color: #1e293b; }
    .p-contact { font-size: 12px; color: #64748b; font-weight: 500; }
 
    .aff-participants-section { margin-top: 8px; margin-bottom: 24px; }
    .aff-participants-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 12px; }
    .aff-part-item { 
      display: flex; align-items: center; gap: 12px; background: #f8fafc; 
      padding: 10px 16px; border-radius: 12px; border: 1px solid #f1f5f9; 
    }
    .aff-part-icon { font-size: 16px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
    .aff-part-icon.tribunal { background: #f1f5f9; }
    .aff-part-icon.avocat { background: #ecfdf5; }
    .aff-part-icon.huissier { background: #eff6ff; }
    .aff-part-icon.expert { background: #fff7ed; }
    .aff-part-info { display: flex; flex-direction: column; }
    .aff-part-role { font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; }
    .aff-part-name { font-size: 13px; font-weight: 700; color: #1e293b; }

    .ai-assistant-analysis {
      margin-top: 16px;
      background: #f8fafc;
      border-radius: 12px;
      border-left: 4px solid #10b981;
      padding: 16px;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
    }
    .assistant-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
      color: #047857;
      font-weight: 800;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .assistant-bot-icon {
      background: #10b981;
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .assistant-content p {
      font-size: 14px;
      line-height: 1.6;
      color: #334155;
      margin: 0;
      font-style: italic;
      white-space: pre-wrap;
    }

    @media (max-width: 1024px) {
      .top-header { padding: 0 24px; }
      .dashboard-content { padding: 24px; }
    }
  `]
})
export class MesDossiersComponent implements OnInit {
  currentUser: any;
  private _dossiers: Dossier[] = [];
  get dossiers(): Dossier[] { return this._dossiers; }
  set dossiers(val: Dossier[]) {
    this._dossiers = val;
    this._updateCache();
  }

  // Cached computed values — never recalculated by change detection
  filteredDossiers: Dossier[] = [];
  actionsMap: Record<number, any[]> = {};

  private _updateCache(): void {
    this.filteredDossiers = this._computeFilteredDossiers();
    const map: Record<number, any[]> = {};
    for (const d of this._dossiers) {
      if (d.id != null) {
        map[d.id] = this.getAvailableActions(d);
      }
    }
    this.actionsMap = map;
  }

  selectedDossier: Dossier | null = null;
  loading = false;
  mlLoading = false;
  nvidiaLoading = false;
  error: string | null = null;
  Math = Math;
  activeActionMenuId: number | null = null;

  toggleActionMenu(event: Event, id: number) {
    event.stopPropagation();
    this.activeActionMenuId = this.activeActionMenuId === id ? null : id;
  }

  @HostListener('document:click')
  closeActionMenu() {
    this.activeActionMenuId = null;
  }

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

  // Affaire Detail Sub-Modal
  selectedAffaireDetail: Affaire | null = null;
  selectedAffaireProcedures: any[] = [];
  loadingAffaireProcs = false;

  // Workflow
  workflowHistory: any[] = [];
  showRefuseModal = false;
  refusalMotif = '';
  refusalDossierId: number | null = null;

  // Confirmation
  showConfirm = false;
  confirmMessage = '';
  pendingAction: (() => void) | null = null;

  activeTab: 'ALL' | 'SOUMIS' | 'PRE_VALIDE' | 'VALIDE' | 'CLOTURE' | 'ARCHIVED' | 'REFUSE' = 'ALL';

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
      if (params['tab']) {
        this.activeTab = params['tab'] as any;
      }
      if (params['highlight']) {
        const ref = params['highlight'];
        this.highlightDossier(ref);
      }
    });
  }

  highlightDossier(ref: string): void {
    // 1. Try to find in current list
    const d = this.dossiers.find(d => d.reference === ref);
    if (d) {
      this.onViewDossier(d);
      return;
    }

    // 2. If not found (e.g. on another page), fetch it specifically
    this.dossierService.searchDossiers(ref).subscribe({
      next: (results: any[]) => {
        const found = results.find(r => r.reference === ref);
        if (found) {
          this.onViewDossier(found);
        }
      }
    });
  }

  loadDossiers(): void {
    this.loading = true;
    this.error = null;
    const fetchArchived = this.activeTab === 'ARCHIVED';
    this.dossierService.getDossiers(this.currentPage, this.pageSize, fetchArchived).subscribe({
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
      this.loadHistory(dossier.id);
    }
  }

  loadHistory(dossierId: number): void {
    this.dossierService.getHistory(dossierId).subscribe(data => {
      this.workflowHistory = data;
    });
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

  viewAffaireDetail(aff: Affaire): void {
    this.selectedAffaireDetail = aff;
    this.selectedAffaireProcedures = [];
    if (aff.id) {
      this.loadingAffaireProcs = true;
      this.affaireService.getProceduresByAffaire(aff.id).subscribe({
        next: (procs) => {
          this.selectedAffaireProcedures = procs;
          this.loadingAffaireProcs = false;
        },
        error: () => {
          this.selectedAffaireProcedures = [];
          this.loadingAffaireProcs = false;
        }
      });
    }
  }

  closeAffaireDetail(): void {
    this.selectedAffaireDetail = null;
    this.selectedAffaireProcedures = [];
    this.loadingAffaireProcs = false;
  }

  closeDossierModal(): void {
    this.selectedDossier = null;
    this.aiAnalysis = null;
    this.aiLoading = false;
    this.affaires = [];
    this.workflowHistory = [];
  }

  analyzeWithAI(): void {
    if (!this.selectedDossier || !this.selectedDossier.description) {
      this.notificationService.addNotification("Description insuffisante pour une analyse IA.", "ROLE_ADMIN", "WARNING");
      return;
    }

    this.aiLoading = true;
    this.aiAnalysis = null;
    this.aiService.analyzeDossier(this.selectedDossier.id!).subscribe({
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

  analyzeWithML(): void {
    if (!this.selectedDossier || !this.selectedDossier.id) return;

    this.mlLoading = true;
    this.dossierService.analyzeDossier(this.selectedDossier.id).subscribe({
      next: (updatedDossier) => {
        this.selectedDossier = updatedDossier;
        this.mlLoading = false;
        this.notificationService.addNotification("Prédiction ML effectuée avec succès.", "ROLE_ADMIN", "SUCCESS");
        const idx = this.dossiers.findIndex(d => d.id === updatedDossier.id);
        if (idx !== -1) this.dossiers[idx] = updatedDossier;
      },
      error: (err) => {
        this.mlLoading = false;
        console.error("ML Error", err);
        this.notificationService.addNotification("L'analyse ML a échoué. Vérifiez le service AI.", "ROLE_ADMIN", "WARNING");
      }
    });
  }

  analyzeWithNvidia(): void {
    if (!this.selectedDossier || !this.selectedDossier.id) return;
    if (!this.selectedDossier.verdict) {
      this.notificationService.addNotification("Effectuez d'abord la prédiction ML.", "ROLE_ADMIN", "WARNING");
      return;
    }

    this.nvidiaLoading = true;
    this.dossierService.nvidiaAnalyzeDossier(this.selectedDossier.id).subscribe({
      next: (updatedDossier) => {
        this.selectedDossier = updatedDossier;
        this.nvidiaLoading = false;
        this.notificationService.addNotification("Analyse NVIDIA effectuée avec succès.", "ROLE_ADMIN", "SUCCESS");
        const idx = this.dossiers.findIndex(d => d.id === updatedDossier.id);
        if (idx !== -1) this.dossiers[idx] = updatedDossier;
      },
      error: (err) => {
        this.nvidiaLoading = false;
        console.error("NVIDIA Error", err);
        this.notificationService.addNotification("L'analyse NVIDIA a échoué. Réessayez.", "ROLE_ADMIN", "WARNING");
      }
    });
  }

  executeWorkflow(action: 'soumettre' | 'prevalider' | 'validerFinal' | 'refuser' | 'en-cours' | 'cloturer' | 'prevalider-cloture' | 'valider-cloture' | 'archiver' | 'demarrer', id: number): void {
    if (action === 'refuser') {
      this.refusalDossierId = id;
      this.refusalMotif = '';
      this.showRefuseModal = true;
    } else {
      const messages: any = {
        'soumettre': 'Soumettre ce dossier pour pré-validation ?',
        'prevalider': 'Voulez-vous PRÉ-VALIDER ce dossier ? (Oui pour valider, Non pour refuser)',
        'validerFinal': 'Voulez-vous VALIDER ce dossier ? (Oui pour valider, Non pour refuser)',
        'demarrer': 'Démarrer ce dossier et le marquer "En cours" ?',
        'en-cours': 'Marquer ce dossier comme "En cours" ?',
        'cloturer': 'Soumettre une demande de CLOTURE pour ce dossier ?',
        'prevalider-cloture': 'Voulez-vous PRÉ-VALIDER la clôture de ce dossier ?',
        'valider-cloture': 'Voulez-vous VALIDER DEFINITIVEMENT la clôture ?',
        'refuser': '',
        'archiver': 'Voulez-vous ARCHIVER ce dossier ?'
      };

      this.confirmService.open({
        title: 'Validation de Dossier',
        message: messages[action],
        confirmLabel: action === 'soumettre' ? 'Oui, Soumettre' : 'Oui, Confirmer',
        cancelLabel: action === 'soumettre' ? 'Annuler' : 'Non, Refuser'
      }).subscribe(confirmed => {
        if (confirmed) {
          // Map action name to service method
          const methodMap: any = {
            'soumettre': 'soumettre',
            'prevalider': 'prevalider',
            'validerFinal': 'validerFinal',
            'demarrer': 'setEnCours',
            'en-cours': 'setEnCours',
            'cloturer': 'cloturer',
            'prevalider-cloture': 'prevaliderCloture',
            'valider-cloture': 'validerCloture',
            'archiver': 'archiver'
          };

          const serviceMethod = methodMap[action];
          (this.dossierService as any)[serviceMethod](id).subscribe({
            next: () => {
              this.notificationService.addNotification(`Action réussie.`, "ROLE_ADMIN", "SUCCESS");
              this.loadDossiers();
              if (this.selectedDossier) this.closeDossierModal();
            },
            error: (err: any) => alert(err.error?.message || `Erreur lors de l'action`)
          });
        } else if (action === 'prevalider' || action === 'validerFinal' || action === 'prevalider-cloture' || action === 'valider-cloture') {
          // If "No" was clicked for a validation step, trigger the refusal workflow
          this.executeWorkflow('refuser', id);
        }
      });
    }
  }

  confirmRefusal(): void {
    if (!this.refusalDossierId || this.refusalMotif.length < 5) return;

    this.dossierService.refuser(this.refusalDossierId, this.refusalMotif).subscribe({
      next: () => {
        this.notificationService.addNotification("Dossier refusé.", "ROLE_ADMIN", "SUCCESS");
        this.showRefuseModal = false;
        this.loadDossiers();
      },
      error: (err) => {
        const msg = err.error?.message || "Erreur serveur lors du refus. Veuillez vérifier le motif.";
        alert(msg);
      }
    });
  }

  exportDossiers(format: 'pdf' | 'excel'): void {
    this.loading = true;
    this.dossierService.downloadDossiers(format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `dossiers_bna_${new Date().getTime()}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.loading = false;
        this.notificationService.addNotification("Export réussi.", "ROLE_ADMIN", "SUCCESS");
      },
      error: (err) => {
        console.error("Export error", err);
        this.error = "Erreur lors de la génération de l'export (Vérifiez votre connexion).";
        this.loading = false;
        this.notificationService.addNotification("Erreur lors de l'export.", "ROLE_ADMIN", "WARNING");
      }
    });
  }


  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'OUVERT': return 'Ouvert';
      case 'EN_COURS': return 'En cours';
      case 'EN_ATTENTE_PREVALIDATION': return 'En attente Pré-val';
      case 'EN_ATTENTE_VALIDATION': return 'En attente Validation';
      case 'VALIDE': return 'Validé';
      case 'EN_ATTENTE_PREVALIDATION_CLOTURE': return 'Clôture (Attente Pré-val)';
      case 'EN_ATTENTE_VALIDATION_CLOTURE': return 'Clôture (Attente Validation)';
      case 'CLOTURE': return 'Clôturé';
      case 'ARCHIVEE': return 'Archivé';
      case 'REFUSE': return 'Refusé';
      default: return statut;
    }
  }

  getBadgeClass(statut: string): string {
    switch (statut) {
      case 'OUVERT': return 'info';
      case 'EN_COURS': return 'info';
      case 'EN_ATTENTE_PREVALIDATION': return 'warning';
      case 'EN_ATTENTE_VALIDATION': return 'warning';
      case 'EN_ATTENTE_PREVALIDATION_CLOTURE': return 'warning';
      case 'EN_ATTENTE_VALIDATION_CLOTURE': return 'warning';
      case 'REFUSE': return 'danger';
      case 'VALIDE': return 'success';
      case 'CLOTURE': return 'success';
      case 'ARCHIVEE': return 'secondary';
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

  deleteDossier(id: number): void {
    this.confirmService.open({
      title: 'Suppression du dossier',
      message: 'Êtes-vous sûr de vouloir supprimer ce dossier ? Il sera archivé et ne sera plus visible dans la liste principale.',
      confirmLabel: 'Supprimer',
      cancelLabel: 'Annuler'
    }).subscribe(ok => {
      if (ok) {
        this.dossierService.archiveDossier(id).subscribe({
          next: () => {
            this.notificationService.addNotification("Dossier archivé avec succès.", "ROLE_ADMIN", "SUCCESS");
            this.loadDossiers();
          },
          error: (err) => {
            alert(err.error?.message || "Erreur lors de la suppression.");
          }
        });
      }
    });
  }

  setTab(tab: any): void {
    this.activeTab = tab;
    this.currentPage = 0;
    this.loadDossiers();
    this._updateCache();
  }

  private _computeFilteredDossiers(): Dossier[] {
    if (this.activeTab === 'ALL') return this._dossiers;
    
    return this._dossiers.filter(d => {
      switch(this.activeTab) {
        case 'SOUMIS': return d.statut === 'EN_ATTENTE_PREVALIDATION';
        case 'PRE_VALIDE': return d.statut === 'EN_ATTENTE_VALIDATION';
        case 'VALIDE': return d.statut === 'VALIDE';
        case 'CLOTURE': return d.statut === 'CLOTURE';
        case 'ARCHIVED': return (d as any).archived === true;
        case 'REFUSE': return d.statut === 'REFUSE';
        default: return true;
      }
    });
  }

  // Keep public method for compatibility but it now just returns the cache
  getFilteredDossiers(): Dossier[] {
    return this.filteredDossiers;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getAvailableActions(d: any) {
    const actions: any[] = [];
    
    // Workflow Actions for Charge
    if (this.isChargeDossier()) {
      if (d.statut === 'OUVERT' || d.statut === 'REFUSE') {
        actions.push({ id: 'soumettre', title: 'Soumettre', icon: 'soumettre', class: 'approve-btn' });
        actions.push({ id: 'demarrer', title: 'Démarrer', icon: 'demarrer', class: 'edit-btn' });
      }
      if (d.statut === 'VALIDE' && !d.archived) {
        actions.push({ id: 'demarrer', title: 'Démarrer', icon: 'demarrer', class: 'edit-btn' });
      }
      if (d.statut === 'OUVERT' || d.statut === 'EN_COURS') {
        actions.push({ id: 'cloturer', title: 'Clôturer', icon: 'cloturer', class: 'cloture-btn' });
      }
    }

    // Pre-validation
    if (this.isPreValidateur() && d.statut === 'EN_ATTENTE_PREVALIDATION') {
      actions.push({ id: 'prevalider', title: 'Pré-valider', icon: 'soumettre', class: 'approve-btn' });
      actions.push({ id: 'refuser', title: 'Refuser', icon: 'reject', class: 'reject-btn' });
    }

    // Validation
    if (this.isValidateur() && d.statut === 'EN_ATTENTE_VALIDATION') {
      actions.push({ id: 'validerFinal', title: 'Valider', icon: 'soumettre', class: 'approve-btn' });
      actions.push({ id: 'refuser', title: 'Refuser', icon: 'reject', class: 'reject-btn' });
    }

    // Admin / Super
    if (this.isAdmin()) {
      if (d.statut === 'VALIDE' && !d.archived) {
        actions.push({ id: 'archiver', title: 'Archiver', icon: 'archiver', class: 'view-btn' });
      }
      actions.push({ id: 'delete', title: 'Supprimer', icon: 'delete', class: 'delete-btn' });
    } else if (this.isChargeDossier() && d.statut === 'OUVERT') {
      actions.push({ id: 'delete', title: 'Supprimer', icon: 'delete', class: 'delete-btn' });
    }

    return actions;
  }

  handleAction(actionId: string, d: any, event?: Event) {
    if (event) event.stopPropagation();
    
    if (actionId === 'view') {
      this.onViewDossier(d);
    } else if (actionId === 'delete') {
      this.deleteDossier(d.id!);
    } else {
      this.executeWorkflow(actionId as any, d.id!);
    }
  }
}
