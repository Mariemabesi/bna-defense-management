import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DossierService } from '../../services/dossier.service';
import { FraisService } from '../../services/frais.service';
import { ReportingService, DashboardStats } from '../../services/reporting.service';
import { AuthService } from '../../services/auth.service';
import { AdminService, UserDTO, AuditLogDTO } from '../../services/admin.service';
import { NotificationService } from '../../services/notification.service';
import { Dossier } from '../../models/dossier.model';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ReferentielService, Auxiliaire } from '../../services/referentiel.service';
import { AIService, AIAnalysis } from '../../services/ai.service';
import { SidebarService } from '../../services/sidebar.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>

      <main class="main-content">
        <app-header title="Espace {{ getSpaceName() }}"></app-header>

        <div class="dashboard-content">
          <div class="global-report-btn-container mb-6" *ngIf="!isAdmin()">
            <button class="btn-primary generate-pdf-btn" (click)="exportGlobalStats()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Générer Analyse Globale (PDF)
            </button>
          </div>

      <!-- ============================================== -->
      <!-- DASHBOARD CHARGE DE DOSSIER -->
      <!-- ============================================== -->        <ng-container *ngIf="isChargeDossier() && !isAdmin()">
          <div class="stats-grid">
            <div class="stat-card" [class.loading-shimmer]="statsLoading">
              <div class="stat-icon green">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <div class="stat-content">
                <div class="label">Total de mes dossiers</div>
                <div class="value">{{ dynamicStats.total }}</div>
                <div class="trend positive">Créés par moi</div>
              </div>
            </div>
            <div class="stat-card" [class.loading-shimmer]="statsLoading">
              <div class="stat-icon info">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <div class="stat-content">
                <div class="label">Dossiers en cours</div>
                <div class="value">{{ dynamicStats.enCours }}</div>
                <div class="status-indicator">En cours de traitement</div>
              </div>
            </div>
            <div class="stat-card" [class.loading-shimmer]="statsLoading">
              <div class="stat-icon success">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <div class="stat-content">
                <div class="label">Dossiers Validés</div>
                <div class="value">{{ dynamicStats.valide }}</div>
                <div class="trend positive">Approuvés</div>
              </div>
            </div>
            <div class="stat-card" [class.loading-shimmer]="statsLoading">
              <div class="stat-icon danger">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </div>
              <div class="stat-content">
                <div class="label">Dossiers Refusés</div>
                <div class="value">{{ dynamicStats.refuse }}</div>
                <div class="status-indicator" style="color: #ef4444;">Corrections requises</div>
              </div>
            </div>
            <div class="stat-card" [class.loading-shimmer]="statsLoading">
              <div class="stat-icon danger">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              </div>
              <div class="stat-content">
                <div class="label">Dossiers Urgents</div>
                <div class="value">{{ dynamicStats.urgent }}</div>
                <div class="status-indicator" style="color: #ef4444;">Priorité haute</div>
              </div>
            </div>
          </div>

        <section class="recent-section">
          <div class="section-header">
            <div class="title-with-badge">
              <h2>Suivi de mes dossiers</h2>
              <span class="badge info">{{ filterDossiers('CHARGE').length }} actifs</span>
            </div>
            <div class="actions-group">
              <button class="btn-secondary" routerLink="/nouvelle-demande-frais">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                Nouvelle Demande de Frais
              </button>
              <button class="btn-primary" routerLink="/nouveau-dossier">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                Nouveau Dossier
              </button>
            </div>
          </div>
          <ng-container *ngTemplateOutlet="dossiersTable; context:{ filter: 'CHARGE' }"></ng-container>
        </section>
      </ng-container>

      <!-- ============================================== -->
      <!-- DASHBOARD PRE-VALIDATEUR -->
      <!-- ============================================== -->
      <!-- ============================================== -->
      <!-- DASHBOARD PRE-VALIDATEUR -->
      <!-- ============================================== -->
      <ng-container *ngIf="isPreValidateur() && !isAdmin()">
        <div class="stats-grid">
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon warning">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <div class="stat-content">
              <div class="label">Dossiers à Pré-valider</div>
              <div class="value">{{ dynamicStats.total }}</div>
              <div class="action-needed">Action requise</div>
            </div>
          </div>
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon danger">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <div class="stat-content">
              <div class="label">Urgences High-Priority</div>
              <div class="value">{{ dynamicStats.urgent }}</div>
              <div class="action-needed">Délai critique</div>
            </div>
          </div>
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon success">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div class="stat-content">
              <div class="label">Mes Pré-validations</div>
              <div class="value">{{ dynamicStats.valide }}</div>
              <div class="status-indicator">Déjà traitées</div>
            </div>
          </div>
        </div>

        <section class="recent-section">
          <div class="section-header">
            <div class="title-with-badge">
              <h2>File d'Attente de Validation Technique</h2>
              <span class="badge warning">{{ dossiers.length }} à traiter</span>
            </div>
            <div class="actions-group">
              <button class="btn-primary" (click)="onAction('Rapport Technique', 'Export')">Générer Rapport de Conformité</button>
            </div>
          </div>
          <ng-container *ngTemplateOutlet="dossiersTable; context:{ filter: 'PRE_VALIDATOR' }"></ng-container>
        </section>
      </ng-container>

      <!-- ============================================== -->
      <!-- DASHBOARD VALIDATEUR -->
      <!-- ============================================== -->
      <!-- ============================================== -->
      <!-- DASHBOARD VALIDATEUR -->
      <!-- ============================================== -->
      <ng-container *ngIf="isValidateur() && !isAdmin()">
        <div class="stats-grid">
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon danger">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div class="stat-content">
              <div class="label">Dossiers à Valider</div>
              <div class="value">{{ dynamicStats.total }}</div>
              <div class="action-needed">Approbation finale</div>
            </div>
          </div>
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon danger">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <div class="stat-content">
              <div class="label">Urgences Dossiers</div>
              <div class="value">{{ dynamicStats.urgent }}</div>
              <div class="action-needed">Décision critique</div>
            </div>
          </div>
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon success">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <div class="stat-content">
              <div class="label">Dossiers déjà Validés</div>
              <div class="value">{{ dynamicStats.valide }}</div>
              <div class="status-indicator">Historique approuvé</div>
            </div>
          </div>
        </div>

        <section class="recent-section">
          <div class="section-header">
            <div class="title-with-badge">
              <h2>Approbations de Règlements</h2>
              <span class="badge danger">Urgent</span>
            </div>
            <div class="actions-group">
              <button class="btn-primary" (click)="onAction('Batch Paiement', 'Trésorerie')">Transmettre Batch Trésorerie</button>
            </div>
          </div>
          <ng-container *ngTemplateOutlet="dossiersTable; context:{ filter: 'VALIDATOR' }"></ng-container>
        </section>
      </ng-container>

      <!-- ============================================== -->
      <!-- DASHBOARD ADMINISTRATION & SUPER VALIDATEUR STATS -->
      <!-- ============================================== -->
      <ng-container *ngIf="isSuperValidateur() && !isAdmin()">
        <div class="stats-grid">
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <div class="stat-content">
              <div class="label">Total Dossiers</div>
              <div class="value">{{ stats ? stats.totalDossiers : '—' }}</div>
              <div class="trend positive">{{ stats ? stats.openDossiers : 0 }} Actifs</div>
            </div>
          </div>
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon info">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div class="stat-content">
              <div class="label">Avocats & Auxiliaires</div>
              <div class="value">{{ stats ? (stats.totalAvocats + stats.totalHuissiers) : '—' }}</div>
              <div class="status-indicator">Inscrits dans l'annuaire</div>
            </div>
          </div>
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon warning">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <div class="stat-content">
              <div class="label">Provision Globale</div>
              <div class="value">{{ stats ? (stats.totalBudgetProvisionne | number:'1.0-0') : '—' }} <small>TND</small></div>
              <div class="status-indicator">Engagement financier total</div>
            </div>
          </div>
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon danger">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <div class="stat-content">
              <div class="label">Taux de Succès</div>
              <div class="value">{{ stats ? (stats.successRate * 100 | number:'1.0-1') + '%' : '—' }}</div>
              <div class="trend positive">Affaires Gagnées</div>
            </div>
          </div>
        </div>
      </ng-container>

      <ng-container *ngIf="(isSuperValidateur() || isChargeDossier()) && !isAdmin()">
        <section class="recent-section">
          <div class="section-header">
            <div class="title-with-badge">
              <h2>Analyse Statistique Globale</h2>
              <span class="badge success">KPI Visualizer</span>
            </div>
          </div>
          <div class="charts-grid">
            <div class="chart-container-card">
              <div class="chart-header">
                <h3>Répartition des Dossiers</h3>
                <p>Par statut de traitement</p>
              </div>
              <canvas id="dossiersStatutChart"></canvas>
            </div>
            <div class="chart-container-card">
              <div class="chart-header">
                <h3>Engagement Financier</h3>
                <p>Top 5 Dossiers (TND)</p>
              </div>
              <canvas id="budgetTopChart"></canvas>
            </div>
            <div class="chart-container-card">
              <div class="chart-header">
                <h3>Allocation Budgétaire</h3>
                <p>Par statut (TND)</p>
              </div>
              <canvas id="budgetStatusChart"></canvas>
            </div>
          </div>
        </section>
      </ng-container>

      <ng-container *ngIf="isAdmin()">
        <section class="recent-section">
          <div class="monitor-grid">
            <!-- USER & GROUP MANAGEMENT -->
            <div class="monitor-card card-users">
              <div class="monitor-header">
                <div>
                  <h3>Utilisateurs & Groupes</h3>
                  <p>Gestion des accès et affectations</p>
                </div>
                <button class="btn-primary-sm" routerLink="/admin/users">Gérer</button>
              </div>
              <div class="monitor-body">
                <div class="user-item-pro" *ngFor="let user of users.slice(0, 4)">
                  <div class="user-avatar-text">{{ user.username.substring(0,1).toUpperCase() }}</div>
                  <div class="user-details">
                    <span class="user-name">{{ user.username }}</span>
                    <span class="user-group-link">{{ user.roles && user.roles.length > 0 ? user.roles[0].replace('ROLE_', '') : 'Utilisateur' }} • {{ user.enabled ? 'Actif' : 'Suspendu' }}</span>
                  </div>
                  <div class="user-status-dot" [class.active]="user.enabled"></div>
                </div>
                <div *ngIf="users.length === 0" class="empty-mini">Chargement utilisateurs...</div>
              </div>
            </div>

            <!-- AUDIT LOGS -->
            <div class="monitor-card card-logs">
              <div class="monitor-header">
                <div>
                  <h3>Journal d'Audit</h3>
                  <p>Suivi des actions en temps réel</p>
                </div>
                <button class="btn-secondary-sm" routerLink="/admin/logs">Voir tout</button>
              </div>
              <div class="monitor-body logs-scroll">
                <div class="log-entry" *ngFor="let log of auditLogs.slice(0, 6)">
                  <div class="log-time">{{ log.timestamp | date:'HH:mm' }}</div>
                  <div class="log-content">
                    <span class="log-user">{{ log.userEmail }}</span>
                    <span class="log-action">{{ log.action }}</span>
                    <span class="log-target">{{ log.entityName }} #{{ log.entityId }}</span>
                  </div>
                </div>
                <div *ngIf="auditLogs.length === 0" class="empty-mini">Aucun log récent.</div>
              </div>
            </div>

            <!-- SYSTEM HEALTH -->
            <div class="monitor-card card-system">
              <div class="monitor-header">
                 <h3>Santé du Système</h3>
              </div>
              <div class="system-stats-pro">
                 <div class="sys-item">
                   <div class="sys-label"><span>Base de Données</span> <span>14%</span></div>
                   <div class="sys-bar"><div class="fill green" style="width: 14%"></div></div>
                 </div>
                 <div class="sys-item">
                   <div class="sys-label"><span>Stockage Documents</span> <span>42%</span></div>
                   <div class="sys-bar"><div class="fill blue" style="width: 42%"></div></div>
                 </div>
                 <div class="sys-item">
                   <div class="sys-label"><span>Charge Serveur (Port 8082)</span> <span>Stable</span></div>
                   <div class="sys-bar"><div class="fill green" style="width: 10%"></div></div>
                 </div>
              </div>
            </div>
          </div>
        </section>
      </ng-container>

      <!-- ============================================== -->
      <!-- REUSABLE TABLE TEMPLATE FOR DOSSIERS & FRAIS -->
      <!-- ============================================== -->
      <ng-template #dossiersTable let-filter="filter">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Référence</th>
                <th>Titre / Objet</th>
                <th>Priorité</th>
                <th>Statut</th>
                <th>Budget</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let d of filterDossiers(filter)">
                <td><strong>{{ d.reference }}</strong></td>
                <td>{{ d.titre }}</td>
                <td><span class="badge" [ngClass]="getPrioriteBadge(d.priorite)">{{ d.priorite || '—' }}</span></td>
                <td><span class="badge" [ngClass]="getBadgeClass(d.statut)">{{ getStatusLabel(d.statut) }}</span></td>
                <td><strong>{{ d.budgetProvisionne != null ? (d.budgetProvisionne | number:'1.2-2') + ' TND' : '—' }}</strong></td>
                <td>
                  <div class="actions-cell">
                    <button class="btn-action" title="Voir" (click)="$event.stopPropagation(); onViewDossier(d)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    <button class="btn-action" title="Modifier" *ngIf="isChargeDossier()" [routerLink]="['/modifier-dossier', d.reference]">
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
              <tr *ngIf="filterDossiers(filter).length === 0">
                <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">
                  Aucun dossier correspondant à ce statut.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ng-template>

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

      <!-- REFUSAL MODAL -->
      <div class="modal-overlay" *ngIf="showRefuseModal">
        <div class="modal-content small" (click)="$event.stopPropagation()">
          <div class="modal-header danger-border">
            <h3>❌ Refuser le dossier</h3>
            <button class="btn-close" (click)="showRefuseModal = false">×</button>
          </div>
          <div class="modal-body">
            <p>Veuillez indiquer le motif du refus (Min. 5 caractères).</p>
            <div class="form-group">
              <textarea [(ngModel)]="refusalMotif" placeholder="Expliquez pourquoi..." rows="5" class="form-control"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" (click)="showRefuseModal = false">Annuler</button>
            <button class="btn-danger" [disabled]="refusalMotif.length < 5" (click)="confirmRefusal()">Confirmer le refus</button>
          </div>
        </div>
      </div>

    </div>
  </main>
</div>
  `,
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  dossierChart: any;
  budgetChart: any;

  // ... rest of the properties ...
  currentUser: any;
  Math = Math;

  // Real API data
  stats: DashboardStats | null = null;
  statsLoading = false;

  // AI Analysis
  aiAnalysis: AIAnalysis | null = null;
  aiLoading = false;

  dossiers: Dossier[] = [];
  selectedDossier: Dossier | null = null;
  dossiersLoading = false;

  users: any[] = [];
  usersLoading = false;

  auxiliaires: Auxiliaire[] = [];
  auxiliairesLoading = false;

  auditLogs: AuditLogDTO[] = [];
  logsLoading = false;
  showRefuseModal = false;
  refusalMotif = '';
  refusalDossierId: number | null = null;

  constructor(
    private dossierService: DossierService,
    private fraisService: FraisService,
    private reportingService: ReportingService,
    private adminService: AdminService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private referentielService: ReferentielService,
    private aiService: AIService,
    private confirmService: ConfirmDialogService,
    private router: Router,
    public sidebarService: SidebarService
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  dynamicStats: any = { total: 0, urgent: 0, enCours: 0, valide: 0, refuse: 0 };

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.loadStats();
      this.loadDossiers();
      if (this.isAdmin()) {
        this.loadUsers();
        this.loadLogs();
      }
      if (this.isAdmin() || this.isChargeDossier()) {
        this.loadAuxiliaires();
      }
    }
  }

  loadAuxiliaires(): void {
    this.auxiliairesLoading = true;
    this.referentielService.getAuxiliaires().subscribe({
      next: (data) => {
        this.auxiliaires = data;
        this.auxiliairesLoading = false;
      },
      error: () => {
        this.auxiliairesLoading = false;
      }
    });
  }

  loadUsers(): void {
    this.usersLoading = true;
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.usersLoading = false;
      },
      error: (err) => {
        console.error('Error loading users', err);
        this.usersLoading = false;
      }
    });
  }

  loadLogs(): void {
    this.logsLoading = true;
    this.adminService.getLogs().subscribe({
      next: (data) => {
        this.auditLogs = data;
        this.logsLoading = false;
      },
      error: () => this.logsLoading = false
    });
  }

  loadDynamicStats(): void {
    this.reportingService.getUserDynamicStats().subscribe({
      next: (data) => this.dynamicStats = data,
      error: () => console.error('Failed to load dynamic user stats')
    });
  }

  loadStats(): void {
    this.statsLoading = true;
    this.loadDynamicStats();
    this.reportingService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.statsLoading = false;
        if (this.isAdmin() || this.isSuperValidateur() || this.isChargeDossier()) {
          setTimeout(() => this.initCharts(), 100);
        }
      },
      error: () => {
        this.statsLoading = false;
      }
    });
  }

  initCharts(): void {
    const ctx1 = document.getElementById('dossiersStatutChart') as HTMLCanvasElement;
    if (ctx1) {
      if (this.dossierChart) this.dossierChart.destroy();
      this.dossierChart = new Chart(ctx1, {
        type: 'doughnut',
        data: {
          labels: ['Ouverts', 'En Cours', 'A Valider', 'Clôturés'],
          datasets: [{
            data: [
              this.stats?.openDossiers || 0,
              this.dynamicStats.enCours || 0,
              this.dynamicStats.total - this.dynamicStats.enCours || 0,
              this.stats?.closedDossiers || 0
            ],
            backgroundColor: ['#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#10b981'],
            borderWidth: 0,
            hoverOffset: 15
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { usePointStyle: true, font: { weight: 'bold' } } }
          },
          cutout: '70%'
        }
      });
    }

    // Top Budgets Chart
    const budgetCtx = document.getElementById('budgetTopChart') as HTMLCanvasElement;
    if (budgetCtx) {
      new Chart(budgetCtx, {
        type: 'bar',
        data: {
          labels: this.dossiers.slice(0, 5).map(d => d.reference),
          datasets: [{
            label: 'Budget (TND)',
            data: this.dossiers.slice(0, 5).map(d => d.budgetProvisionne || 0),
            backgroundColor: 'rgba(0, 135, 102, 0.6)',
            borderColor: '#008766',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }

    // Budget Status Chart
    const budgetStatusCtx = document.getElementById('budgetStatusChart') as HTMLCanvasElement;
    if (budgetStatusCtx) {
      new Chart(budgetStatusCtx, {
        type: 'pie',
        data: {
          labels: ['Ouvert', 'En Cours', 'Clôturé'],
          datasets: [{
            data: [
              (this.stats?.totalBudgetProvisionne || 0) * 0.4,
              (this.stats?.totalBudgetProvisionne || 0) * 0.5,
              (this.stats?.totalBudgetProvisionne || 0) * 0.1
            ],
            backgroundColor: ['#3b82f6', '#f59e0b', '#10b981'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }
  }

  loadDossiers(): void {
    this.dossiersLoading = true;
    this.dossierService.getDossiers(0, 100).subscribe({
      next: (data) => {
        // Handle both Array and Page object (data.content)
        this.dossiers = Array.isArray(data) ? data : (data.content || []);
        this.dossiersLoading = false;
      },
      error: () => {
        this.dossiersLoading = false;
        this.dossiers = [];
      }
    });
  }

  filterDossiers(type: string): Dossier[] {
    if (this.isAdmin()) return []; // Admin strictly has no access to dossier listings

    switch (type) {
      case 'CHARGE':
        return this.dossiers.filter(d => ['OUVERT', 'EN_COURS', 'EN_ATTENTE_PREVALIDATION', 'EN_ATTENTE_VALIDATION', 'REFUSE'].includes(d.statut || ''));
      case 'PRE_VALIDATOR':
        return this.dossiers.filter(d => d.statut === 'EN_ATTENTE_PREVALIDATION');
      case 'VALIDATOR':
        return this.dossiers.filter(d => d.statut === 'EN_ATTENTE_VALIDATION');
      default:
        return this.dossiers;
    }
  }

  getStatusLabel(statut: string | undefined): string {
    switch (statut) {
      case 'OUVERT': return 'Brouillon';
      case 'EN_ATTENTE_PREVALIDATION': return 'Soumis';
      case 'EN_ATTENTE_VALIDATION': return 'Pré-validé';
      case 'VALIDE': return 'Validé';
      case 'CLOTURE': return 'Clôturé';
      case 'REFUSE': return 'Refusé';
      default: return statut || '—';
    }
  }

  getBadgeClass(statut: string | undefined): string {
    switch (statut) {
      case 'OUVERT': return 'info';
      case 'EN_ATTENTE_PREVALIDATION': return 'warning';
      case 'EN_ATTENTE_VALIDATION': return 'danger';
      case 'REFUSE': return 'danger';
      case 'VALIDE': return 'success';
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

  isSuperValidateur(): boolean {
    return this.authService.hasRole('ROLE_SUPER_VALIDATEUR') || (this.currentUser && this.currentUser.isSuperValidateur);
  }

  onViewDossier(d: Dossier): void {
    this.selectedDossier = d;
  }

  closeDossierModal(): void {
    this.selectedDossier = null;
    this.aiAnalysis = null;
    this.aiLoading = false;
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
    const dossier = this.dossiers.find(d => d.reference === ref);

    if ((type === 'Approuver' || type === 'Valider') && dossier && dossier.id) {
      const actionRef = type === 'Approuver' ? 'prevalider' : 'validerFinal';
      const promptMsg = type === 'Approuver' ? 
          'Voulez-vous PRÉ-VALIDER ce dossier ? (Oui pour valider, Non pour refuser)' :
          'Voulez-vous VALIDER ce dossier ? (Oui pour valider, Non pour refuser)';

      this.confirmService.open({
        title: 'Validation de Dossier',
        message: promptMsg,
        confirmLabel: 'Oui, Valider',
        cancelLabel: 'Non, Refuser'
      }).subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.dossierService[actionRef](dossier.id!).subscribe({
            next: (updated) => {
              dossier.statut = updated.statut;
              this.loadStats();
              this.loadDossiers();
              this.notificationService.addNotification(
                `Dossier ${ref} ${type === 'Approuver' ? 'pré-validé' : 'validé'} avec succès.`,
                'ROLE_ADMIN', 'SUCCESS'
              );
            },
            error: (err) => alert(err.error?.message || "Erreur lors de la validation")
          });
        } else {
          // Trigger refusal workflow
          this.refusalDossierId = dossier.id!;
          this.refusalMotif = '';
          this.showRefuseModal = true;
        }
      });
    } else if (type === 'Soumettre' && dossier && dossier.id) {
      this.dossierService.updateStatus(dossier.id, 'EN_ATTENTE_PREVALIDATION' as any).subscribe({
        next: (updated) => {
          dossier.statut = updated.statut;
          this.notificationService.addNotification(`Dossier ${ref} soumis pour pré-validation.`, 'ROLE_CHARGE_DOSSIER', 'INFO');
        }
      });
    } else if (type === 'Batch Paiement') {
      this.batchSendToTreasury();
    } else if (type === 'Export' && ref === 'Referentiel') {
      this.exportAnnuaire();
    } else if (type === 'Nouveau Tribunal' || type === 'Ajouter Auxiliaire' || type.startsWith('Voir')) {
      this.notificationService.addNotification(
        `Ouverture du module: ${type}...`,
        'ROLE_ADMIN', 'SUCCESS'
      );
      this.router.navigate(['/referentiel'], { queryParams: { action: type } });
    } else {
      this.notificationService.addNotification(
        `${type} pour ${ref} : Cette fonctionnalité sera disponible dans la prochaine mise à jour.`,
        'ROLE_ADMIN', 'WARNING'
      );
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  exportGlobalStats(): void {
    const btn = document.querySelector('.generate-pdf-btn') as HTMLButtonElement;
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="loading-spinner"></span> Génération...';
    }
    
    this.reportingService.exportDashboardPdf();
    
    setTimeout(() => {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> Générer Analyse Globale (PDF)';
      }
    }, 2000);
  }

  getSpaceName(): string {
    if (this.isChargeDossier()) return 'Chargé de Dossier';
    if (this.isPreValidateur()) return 'Pré-Validateur';
    if (this.isValidateur()) return 'Validateur';
    if (this.isAdmin()) return 'Administrateur';
    return 'Action en Défense';
  }

  exportAnnuaire(): void {
    if (this.auxiliaires.length === 0) {
      this.notificationService.addNotification("Aucun auxiliaire à exporter.", "ROLE_ADMIN", "WARNING");
      return;
    }
    const headers = ['Nom', 'Type', 'Spécialité', 'Téléphone', 'Email', 'Adresse', 'Date Ajout'];
    const rows = this.auxiliaires.map(aux => [
      aux.nom,
      aux.type,
      aux.specialite || 'Généraliste',
      aux.telephone,
      aux.email,
      aux.adresse,
      aux.createdAt ? new Date(aux.createdAt).toLocaleDateString() : ''
    ]);
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(';'))
    ].join('\n');

    // Add BOM for Excel UTF-8 display
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'annuaire_auxiliaires.csv';
    link.click();
    this.notificationService.addNotification("Annuaire exporté (CSV).", "ROLE_ADMIN", "SUCCESS");
  }

  batchSendToTreasury(): void {
    this.fraisService.batchSendToTreasury().subscribe({
      next: (result) => {
        if (result.count > 0) {
          this.notificationService.addNotification(
            `Batch Virement réussi : ${result.count} frais transmis à la Trésorerie.`,
            'ROLE_VALIDATEUR', 'SUCCESS'
          );
        } else {
          this.notificationService.addNotification(
            'Aucun frais validé à transmettre à la Trésorerie.',
            'ROLE_VALIDATEUR', 'WARNING'
          );
        }
        this.loadStats();
      },
      error: () => {
        this.notificationService.addNotification(
          'Erreur lors du batch virement vers la Trésorerie.',
          'ROLE_VALIDATEUR', 'WARNING'
        );
      }
    });
  }

  confirmRefusal(): void {
    if (!this.refusalDossierId || this.refusalMotif.length < 5) return;
    this.dossierService.refuser(this.refusalDossierId, this.refusalMotif).subscribe({
      next: () => {
        this.showRefuseModal = false;
        this.notificationService.addNotification("Dossier refusé.", "ROLE_ADMIN", "SUCCESS");
        this.loadDossiers();
        this.loadStats();
      },
      error: (err: any) => alert(err.error?.message || "Erreur serveur lors du refus.")
    });
  }
}
