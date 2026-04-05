import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>

      <main class="main-content">
        <app-header title="Espace {{ getSpaceName() }}"></app-header>

        <div class="dashboard-content">
          <div class="global-report-btn-container mb-6">
            <button class="btn-primary generate-pdf-btn" (click)="exportGlobalStats()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Générer Analyse Globale (PDF)
            </button>
          </div>
      <ng-container *ngIf="isChargeDossier() && !isAdmin()">
        <section class="deadline-premium-section fade-in">
          <div class="section-header-sovereign">
             <div class="title-deck">
                <div class="aura-pulse-emerald"></div>
                <div>
                   <h2 class="executive-title">ÉCHÉANCES CLÉS</h2>
                   <p class="executive-subtitle">Priorités opérationnelles et jalons judiciaires de la semaine.</p>
                </div>
             </div>
          </div>

          <div class="sovereign-timeline-grid">
            <div class="executive-timeline-card shadow-premium pulse-active">
              <div class="deadline-badge-deck">
                <span class="day-val">24</span>
                <span class="month-val">MAR</span>
              </div>
              <div class="timeline-content-deck">
                <div class="type-tier">AUDIENCE TRIBUNAL</div>
                <h3 class="subject-val">Palais de Justice - Tunis</h3>
                <p class="summary-val">Représentation BNA • Instance Correctionnelle • Dossier REF-2024-X</p>
                <div class="timeline-meta-deck">
                  <span class="indicator-tag justice">JURIDIQUE</span>
                  <span class="chronos-sentinel urgent">DEMAIN</span>
                </div>
              </div>
            </div>

            <div class="executive-timeline-card shadow-premium">
              <div class="deadline-badge-deck upcoming">
                <span class="day-val">02</span>
                <span class="month-val">AVR</span>
              </div>
              <div class="timeline-content-deck">
                <div class="type-tier">DÉPÔT DOCUMENTAIRE</div>
                <h3 class="subject-val">Bordereau des Frais</h3>
                <p class="summary-val">Consolidation des honoraires auxiliaires T1 2024 • Validation N2</p>
                <div class="timeline-meta-deck">
                  <span class="indicator-tag finance">FINANCE</span>
                  <span class="chronos-sentinel">J-8</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div class="stats-grid">
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <div class="stat-content">
              <div class="label">Mes Dossiers Actifs</div>
              <div class="value">{{ stats ? stats.openDossiers : '—' }}</div>
              <div class="trend positive">{{ stats ? stats.totalDossiers + ' total' : 'Chargement...' }}</div>
            </div>
          </div>
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon info">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <div class="stat-content">
              <div class="label">Dossiers Clôturés</div>
              <div class="value">{{ stats ? stats.closedDossiers : '—' }}</div>
              <div class="status-indicator">Au total</div>
            </div>
          </div>
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon info">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <div class="stat-content">
              <div class="label">Taux de Réussite</div>
              <div class="value">{{ stats ? (stats.successRate * 100 | number:'1.0-1') + '%' : '—' }}</div>
              <div class="trend positive">Performance Juridique</div>
            </div>
          </div>
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon warning">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <div class="stat-content">
              <div class="label">Budget Provisionné</div>
              <div class="value">{{ stats ? (stats.totalBudgetProvisionne | number:'1.0-0') : '—' }} TND</div>
              <div class="status-indicator">Consolidation globale</div>
            </div>
          </div>
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon danger">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <div class="stat-content">
              <div class="label">Dossiers Urgents</div>
              <div class="value">3</div>
              <div class="status-indicator" style="color: #ef4444;">Délais critiques</div>
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
        <!-- STRATEGIC DEADLINES SECTION (Universal) -->
        <section class="deadline-premium-section fade-in">
          <div class="section-header-sovereign">
             <div class="title-deck">
                <div class="aura-pulse-emerald"></div>
                <div><h2 class="executive-title">ÉCHÉANCES CLÉS</h2><p class="executive-subtitle">Priorités opérationnelles et jalons judiciaires de la semaine.</p></div>
             </div>
          </div>
          <div class="sovereign-timeline-grid">
            <div class="executive-timeline-card shadow-premium pulse-active">
              <div class="deadline-badge-deck"><span class="day-val">24</span><span class="month-val">MAR</span></div>
              <div class="timeline-content-deck">
                <div class="type-tier">AUDIENCE TRIBUNAL</div>
                <h3 class="subject-val">Palais de Justice - Tunis</h3>
                <p class="summary-val">Représentation BNA • Instance Correctionnelle • Dossier REF-2024-X</p>
                <div class="timeline-meta-deck"><span class="indicator-tag justice">JURIDIQUE</span><span class="chronos-sentinel urgent">DEMAIN</span></div>
              </div>
            </div>
            <div class="executive-timeline-card shadow-premium">
              <div class="deadline-badge-deck upcoming"><span class="day-val">02</span><span class="month-val">AVR</span></div>
              <div class="timeline-content-deck">
                <div class="type-tier">DÉPÔT DOCUMENTAIRE</div>
                <h3 class="subject-val">Bordereau des Frais</h3>
                <p class="summary-val">Consolidation des honoraires auxiliaires T1 2024 • Validation N2</p>
                <div class="timeline-meta-deck"><span class="indicator-tag finance">FINANCE</span><span class="chronos-sentinel">J-8</span></div>
              </div>
            </div>
          </div>
        </section>

        <div class="stats-grid">
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon warning">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <div class="stat-content">
              <div class="label">Dossiers à Pré-valider</div>
              <div class="value">{{ stats ? stats.openDossiers : '—' }}</div>
              <div class="action-needed">Action technique requise</div>
            </div>
          </div>
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon warning">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <div class="stat-content">
              <div class="label">Frais à Pré-valider</div>
              <div class="value">{{ stats ? stats.totalFraisPending : '—' }}</div>
              <div class="action-needed">Vérification bordereau</div>
            </div>
          </div>
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon grey">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div class="stat-content">
              <div class="label">Dossiers Traités (Mois)</div>
              <div class="value">{{ stats ? stats.closedDossiers : '—' }}</div>
              <div class="status-indicator">Performance équipe</div>
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
        <!-- STRATEGIC DEADLINES SECTION (Universal) -->
        <section class="deadline-premium-section fade-in">
          <div class="section-header-sovereign">
             <div class="title-deck">
                <div class="aura-pulse-emerald"></div>
                <div><h2 class="executive-title">ÉCHÉANCES CLÉS</h2><p class="executive-subtitle">Priorités opérationnelles et jalons judiciaires de la semaine.</p></div>
             </div>
          </div>
          <div class="sovereign-timeline-grid">
            <div class="executive-timeline-card shadow-premium pulse-active">
              <div class="deadline-badge-deck"><span class="day-val">24</span><span class="month-val">MAR</span></div>
              <div class="timeline-content-deck">
                <div class="type-tier">AUDIENCE TRIBUNAL</div>
                <h3 class="subject-val">Palais de Justice - Tunis</h3>
                <p class="summary-val">Représentation BNA • Instance Correctionnelle • Dossier REF-2024-X</p>
                <div class="timeline-meta-deck"><span class="indicator-tag justice">JURIDIQUE</span><span class="chronos-sentinel urgent">DEMAIN</span></div>
              </div>
            </div>
            <div class="executive-timeline-card shadow-premium">
              <div class="deadline-badge-deck upcoming"><span class="day-val">02</span><span class="month-val">AVR</span></div>
              <div class="timeline-content-deck">
                <div class="type-tier">DÉPÔT DOCUMENTAIRE</div>
                <h3 class="subject-val">Bordereau des Frais</h3>
                <p class="summary-val">Consolidation des honoraires auxiliaires T1 2024 • Validation N2</p>
                <div class="timeline-meta-deck"><span class="indicator-tag finance">FINANCE</span><span class="chronos-sentinel">J-8</span></div>
              </div>
            </div>
          </div>
        </section>

        <div class="stats-grid">
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon danger">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div class="stat-content">
              <div class="label">Bons à Payer (BAP)</div>
              <div class="value">{{ stats ? stats.openDossiers : '—' }}</div>
              <div class="action-needed">Validation finale</div>
            </div>
          </div>
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon danger">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            </div>
            <div class="stat-content">
              <div class="label">Montant Total à Valider</div>
              <div class="value">{{ stats ? (stats.totalFraisAmountPending | number:'1.0-0') : '—' }} TND</div>
              <div class="action-needed">Engagement financier</div>
            </div>
          </div>
          <div class="stat-card" [class.loading-shimmer]="statsLoading">
            <div class="stat-icon info">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <div class="stat-content">
              <div class="label">Sécurité Système</div>
              <div class="value">99.9%</div>
              <div class="status-indicator">Audit conforme</div>
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
      <ng-container *ngIf="isAdmin() || isSuperValidateur()">
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

      <ng-container *ngIf="isAdmin() || isSuperValidateur() || isChargeDossier()">
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
                <td><span class="badge" [ngClass]="getBadgeClass(d.statut)">{{ d.statut }}</span></td>
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

        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      --bg-color: transparent;
      --sidebar-width: 285px;
      --bna-emerald: #008766;
      --bna-emerald-light: rgba(0, 135, 102, 0.06);
      --card-shadow: 0 10px 40px rgba(0, 0, 0, 0.03);
    }

    .app-layout {
      font-family: 'Outfit', 'Inter', sans-serif;
    }

    
    .nav-section-title {
      font-size: 11px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      margin: 24px 0 12px 18px;
    }

    .fav-list { display: flex; flex-direction: column; gap: 4px; padding: 0 12px; }
    .fav-item { 
      display: flex; align-items: center; gap: 12px; padding: 10px 14px; 
      border-radius: 10px; font-size: 14px; color: var(--text-main); font-weight: 500;
      text-decoration: none; transition: all 0.2s;
    }
    .fav-item:hover { background: #f1f5f9; color: var(--bna-green); }
    .fav-dot { width: 8px; height: 8px; border-radius: 50%; }
    .fav-dot.green { background: #10b981; }
    .fav-dot.grey { background: #94a3b8; }

    .btn-action.danger-bg svg { stroke: white; }

    /* ROLE BANNERS */
    .role-welcome-banner {
      padding: 32px;
      border-radius: 24px;
      margin-bottom: 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: white;
      box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
    }
    .role-welcome-banner.warning { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
    .role-welcome-banner.danger { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); }
    .role-welcome-banner.bna { background: linear-gradient(135deg, var(--bna-green) 0%, var(--bna-green-dark) 100%); }
    .role-welcome-banner.info { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }

    .banner-content h2 { margin: 0 0 8px 0; font-size: 24px; font-weight: 800; }
    .banner-content p { margin: 0; opacity: 0.9; font-size: 15px; }
    .banner-actions { display: flex; gap: 12px; }
    .btn-primary.white { background: white; color: var(--text-main); border: none; font-weight: 700; }
    .btn-primary.white:hover { background: #f8fafc; transform: translateY(-2px); }

    .title-with-badge { display: flex; align-items: center; gap: 16px; }

    .deadline-box { display: flex; flex-direction: column; gap: 8px; padding: 0 12px; }
    .deadline-item { 
      display: flex; align-items: center; gap: 12px; padding: 10px; 
      background: rgba(255,255,255,0.5); border-radius: 12px; border: 1px solid rgba(0,0,0,0.02);
    }
    .deadline-date { 
      font-size: 11px; font-weight: 800; color: white; background: var(--bna-green); 
      padding: 4px 6px; border-radius: 6px; min-width: 45px; text-align: center;
    }
    .deadline-text { font-size: 12px; font-weight: 600; color: var(--text-main); }
    .dashboard-content { padding: 48px; max-width: 1600px; margin: 0 auto; display: flex; flex-direction: column; gap: 48px; animation: slideUpFade 0.6s ease-out; }

    /* SOVEREIGN TIMELINE ARCHITECTURE */
    .deadline-premium-section { animation: fadeIn 0.8s ease-out; }
    .section-header-sovereign { margin-bottom: 32px; }
    .title-deck { display: flex; align-items: center; gap: 24px; position: relative; }
    .aura-pulse-emerald { 
      width: 12px; height: 12px; border-radius: 50%; background: var(--bna-emerald);
      box-shadow: 0 0 0 rgba(0, 135, 102, 0.4); animation: pulseAura 2s infinite; 
    }
    .executive-title { font-size: 26px; font-weight: 850; color: #0f172a; margin: 0; letter-spacing: -0.8px; }
    .executive-subtitle { font-size: 15px; color: #64748b; margin: 4px 0 0 0; font-weight: 600; }

    .sovereign-timeline-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 32px; }
    .executive-timeline-card { 
      background: white; border-radius: 32px; border: 1.5px solid #f1f5f9; 
      display: flex; gap: 28px; padding: 28px; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative; overflow: hidden;
    }
    .executive-timeline-card:hover { transform: translateY(-8px); border-color: var(--bna-emerald); box-shadow: 0 25px 50px rgba(0, 135, 102, 0.08); }
    
    .deadline-badge-deck { 
      min-width: 80px; height: 95px; background: #0f172a; border-radius: 20px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      color: white; box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    }
    .deadline-badge-deck.upcoming { background: #475569; }
    .day-val { font-size: 32px; font-weight: 900; line-height: 1; }
    .month-val { font-size: 11px; font-weight: 850; letter-spacing: 1.5px; margin-top: 4px; }
    
    .timeline-content-deck { flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .type-tier { font-size: 10px; font-weight: 900; color: #94a3b8; letter-spacing: 1px; }
    .subject-val { font-size: 19px; font-weight: 850; color: #1e293b; margin: 0; }
    .summary-val { font-size: 14px; font-weight: 600; color: #64748b; line-height: 1.5; margin: 0 0 12px 0; }
    
    .timeline-meta-deck { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
    .indicator-tag { padding: 5px 12px; border-radius: 10px; font-size: 9px; font-weight: 900; letter-spacing: 0.5px; }
    .indicator-tag.justice { background: #ecfdf5; color: #059669; }
    .indicator-tag.finance { background: #eff6ff; color: #2563eb; }
    .chronos-sentinel { font-size: 12px; font-weight: 850; color: #64748b; }
    .chronos-sentinel.urgent { color: var(--bna-emerald); }

    .pulse-active { border-color: var(--bna-emerald); border-width: 2px; }

    @keyframes pulseAura {
      0% { box-shadow: 0 0 0 0 rgba(0, 135, 102, 0.6); }
      70% { box-shadow: 0 0 0 15px rgba(0, 135, 102, 0); }
      100% { box-shadow: 0 0 0 0 rgba(0, 135, 102, 0); }
    }

    @media (max-width: 1024px) {
      .sovereign-timeline-grid { grid-template-columns: 1fr; }
      .executive-timeline-card { padding: 24px; gap: 20px; }
    }
    
    .stat-content .trend { font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 4px; }
    .trend.positive { color: #10b981; }
    .status-indicator, .action-needed { font-size: 12px; font-weight: 600; color: #64748b; }

    .role-welcome-banner {
      padding: 40px; border-radius: 32px; margin-bottom: 40px;
      display: flex; justify-content: space-between; align-items: center;
      position: relative; overflow: hidden; color: white;
      box-shadow: 0 20px 40px rgba(0, 135, 102, 0.15);
    }
    .role-welcome-banner.bna { background: linear-gradient(135deg, #005641 0%, #008766 100%); }
    .role-welcome-banner.warning { background: linear-gradient(135deg, #92400e 0%, #d97706 100%); }
    .role-welcome-banner.danger { background: linear-gradient(135deg, #991b1b 0%, #dc2626 100%); }
    .role-welcome-banner.info { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); }
    
    .role-welcome-banner::before {
      content: ''; position: absolute; width: 400px; height: 400px; 
      background: rgba(255,255,255,0.1); border-radius: 50%;
      top: -150px; right: -150px;
    }
    .banner-content { position: relative; z-index: 1; }
    .banner-content h2 { margin: 0 0 12px 0; font-size: 32px; font-weight: 800; letter-spacing: -1px; }
    .banner-content p { margin: 0; font-size: 18px; opacity: 0.9; font-weight: 500; }
    .banner-actions { position: relative; z-index: 1; display: flex; gap: 16px; }

    .recent-section { margin-top: 48px; }
    .section-header { 
      display: flex; justify-content: space-between; align-items: flex-end; 
      margin-bottom: 32px; padding: 0 8px;
    }
    .section-header h2 { font-size: 24px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px; margin: 0; }
    .title-with-badge { display: flex; align-items: center; gap: 16px; }
    
    .table-container { 
      background: transparent; border-radius: 0; box-shadow: none; 
      overflow-x: auto; padding-bottom: 20px;
    }
    table { width: 100%; border-collapse: separate; border-spacing: 0 16px; margin-top: -16px; min-width: 900px; }
    th { padding: 16px 24px; color: #94a3b8; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; text-align: left; }
    td { 
      padding: 24px; background: white; border-top: 1px solid rgba(0,0,0,0.03); border-bottom: 1px solid rgba(0,0,0,0.03); 
      font-size: 15px; color: #334155; transition: all 0.2s ease;
    }
    td:first-child { border-left: 1px solid rgba(0,0,0,0.03); border-top-left-radius: 24px; border-bottom-left-radius: 24px; }
    td:last-child { border-right: 1px solid rgba(0,0,0,0.03); border-top-right-radius: 24px; border-bottom-right-radius: 24px; }
    
    tr:hover td { background: #f8fafc; transform: scale(1.002); }
    tr:hover td:first-child { box-shadow: -10px 0 20px rgba(0,0,0,0.02); }
    
    .badge {
      display: inline-flex; align-items: center; padding: 8px 16px; border-radius: 12px;
      font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .badge.success { background: #ecfdf5; color: #059669; }
    .badge.info { background: #eff6ff; color: #2563eb; }
    .badge.warning { background: #fffbeb; color: #d97706; }
    .badge.danger { background: #fef2f2; color: #dc2626; }

    .btn-action {
      width: 44px; height: 44px; border-radius: 14px; background: #f1f5f9;
      color: #64748b; border: none; cursor: pointer; display: flex;
      align-items: center; justify-content: center; transition: all 0.2s;
    }
    .btn-action:hover { background: #008766; color: white; transform: rotate(8deg) scale(1.1); }
    .btn-action.warning-bg:hover { background: #d97706; }
    .btn-action.danger-bg:hover { background: #059669; }

    .btn-primary { 
      background: linear-gradient(135deg, #008766 0%, #00a87f 100%); 
      color: white; border: none; padding: 12px 24px; 
      border-radius: 14px; font-weight: 700; cursor: pointer; 
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
      box-shadow: 0 4px 12px rgba(0, 135, 102, 0.3);
      display: inline-flex; align-items: center; gap: 10px; font-size: 14px;
    }
    .btn-primary:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 12px 24px rgba(0, 135, 102, 0.4); }
    .btn-primary:active { transform: translateY(-1px) scale(0.98); }
    
    .btn-primary.white { background: white; color: #008766; }
    .btn-primary.white:hover { background: #f8fafc; color: #007256; transform: translateY(-4px); }

    .btn-secondary {
      background: white; color: #475569; border: 1.5px solid #e2e8f0; padding: 11px 24px;
      border-radius: 14px; font-weight: 700; cursor: pointer; 
      transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 10px; font-size: 14px;
    }
    .btn-secondary:hover { background: #f8fafc; border-color: #008766; color: #008766; transform: translateY(-2px); }
    .btn-secondary:active { transform: translateY(0); }
    .table-container { background: transparent; padding: 0; border: none; box-shadow: none; overflow-x: auto; }
    table { width: 100%; border-collapse: separate; border-spacing: 0 12px; margin-top: -12px; min-width: 900px; }
    th { padding: 16px 24px; text-align: left; font-size: 13px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.1em; border: none; }
    td { 
      padding: 24px; background: white; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; font-size: 15px; color: var(--text-main); transition: background 0.2s ease;
    }
    td:first-child { border-left: 1px solid #f1f5f9; border-top-left-radius: 20px; border-bottom-left-radius: 20px; }
    td:last-child { border-right: 1px solid #f1f5f9; border-top-right-radius: 20px; border-bottom-right-radius: 20px; }
    tr:hover td { background: #f8fafc; border-color: #e2e8f0; }
    
    .badge { padding: 6px 14px; border-radius: 12px; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; }
    .badge.warning { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
    .badge.success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
    .badge.info { background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; }
    .badge.danger { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
    
    .actions-cell { display: flex; gap: 12px; justify-content: flex-start; }
    .btn-action { 
      background: white; 
      color: #64748b; 
      border: 1px solid rgba(0,0,0,0.06); 
      width: 46px; 
      height: 46px; 
      border-radius: 15px; 
      cursor: pointer; 
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
      display: inline-flex; 
      align-items: center; 
      justify-content: center; 
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01);
    }
    .btn-action:hover { 
      color: var(--bna-green); 
      border-color: rgba(0, 135, 102, 0.2); 
      transform: translateY(-3px) scale(1.05); 
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.02); 
      background: white;
    }
    .btn-action svg { width: 20px; height: 20px; stroke-width: 2.2px; }
    
    .btn-action.warning-bg { color: #d97706; }
    .btn-action.warning-bg:hover { color: #b45309; border-color: #fcd34d; }
    .btn-action.danger-bg { color: #059669; }
    .btn-action.danger-bg:hover { color: #047857; border-color: #6ee7b7; }

    /* CHARTS */
    .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px; margin-top: 24px; }
    .chart-container-card { 
      background: white; border-radius: 24px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.03); 
      height: 400px; display: flex; flex-direction: column;
    }
    .chart-container-card h3 { font-size: 16px; font-weight: 800; color: #1e293b; margin-bottom: 24px; text-align: center; }
    .chart-container-card canvas { flex: 1; min-height: 0; }

    /* ADMINISTRATION */
    .admin-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px; margin-top: 24px; }
    .admin-card { background: white; border-radius: 24px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.03); }
    .admin-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .admin-card-title { font-size: 18px; font-weight: 800; color: #1e293b; }
    
    .user-list { display: flex; flex-direction: column; gap: 12px; }
    .user-row { 
      display: flex; justify-content: space-between; align-items: center; padding: 16px; 
      border-radius: 16px; background: #f8fafc; transition: all 0.2s;
    }
    .user-row:hover { background: #f1f5f9; transform: translateX(4px); }
    .user-info-brief { display: flex; align-items: center; gap: 16px; }
    .user-avatar-small { 
      width: 40px; height: 40px; border-radius: 12px; background: #008766; color: white;
      display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;
    }
    .user-name-role { display: flex; flex-direction: column; }
    .user-name { font-size: 15px; font-weight: 700; color: #1e293b; }
    .user-role-tag { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }

    /* MONITORING TOOLS */
    .monitor-grid { display: grid; grid-template-columns: 1.2fr 1.5fr 1fr; gap: 24px; }
    .monitor-card { background: white; border-radius: 24px; padding: 24px; border: 1px solid #f1f5f9; box-shadow: 0 4px 12px rgba(0,0,0,0.02); display: flex; flex-direction: column; }
    .monitor-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .monitor-header h3 { font-size: 17px; font-weight: 800; color: #1e293b; margin: 0; }
    .monitor-header p { font-size: 12px; color: #64748b; margin: 4px 0 0 0; }
    
    .btn-primary-sm { padding: 6px 12px; background: var(--bna-green-light); color: var(--bna-green); border: none; border-radius: 8px; font-size: 11px; font-weight: 800; cursor: pointer; text-transform: uppercase; }
    .btn-secondary-sm { padding: 6px 12px; background: #f1f5f9; color: #64748b; border: none; border-radius: 8px; font-size: 11px; font-weight: 800; cursor: pointer; text-transform: uppercase; }

    .user-item-pro { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f8fafc; border-radius: 12px; margin-bottom: 8px; }
    .user-avatar-text { width: 36px; height: 36px; border-radius: 10px; background: white; color: var(--bna-green); display: flex; align-items: center; justify-content: center; font-weight: 800; border: 1px solid #f1f5f9; }
    .user-details { flex: 1; display: flex; flex-direction: column; }
    .user-name { font-size: 14px; font-weight: 700; color: #1e293b; }
    .user-group-link { font-size: 11px; color: #64748b; }
    .user-status-dot { width: 8px; height: 8px; border-radius: 50%; background: #cbd5e1; }
    .user-status-dot.active { background: #10b981; }

    .logs-scroll { max-height: 300px; overflow-y: auto; }
    .log-entry { padding: 8px 0; border-bottom: 1px solid #f8fafc; display: flex; gap: 12px; font-size: 12px; }
    .log-time { color: #94a3b8; font-weight: 700; min-width: 40px; }
    .log-user { font-weight: 800; color: var(--bna-green); }
    .log-action { color: #1e293b; }
    .log-target { color: #64748b; font-style: italic; }

    .sys-item { margin-bottom: 16px; }
    .sys-label { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 6px; }
    .sys-bar { height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; }
    .sys-bar .fill { height: 100%; border-radius: 3px; }
    .sys-bar .fill.green { background: #10b981; }
    .sys-bar .fill.blue { background: #3b82f6; }

    .empty-mini { padding: 20px; text-align: center; color: #94a3b8; font-size: 13px; }

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
    .grid-2-col-modal { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .detail-group { display: flex; flex-direction: column; gap: 8px; }
    .detail-label { font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .detail-value { font-size: 16px; font-weight: 500; color: #1e293b; }
    .detail-value.font-mono { font-family: 'Courier New', Courier, monospace; font-weight: 700; color: var(--bna-green); }
    .detail-desc { font-size: 15px; color: #475569; line-height: 1.6; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #f1f5f9; }
    .modal-footer {
      padding: 24px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0;
      display: flex; justify-content: flex-end; gap: 16px;
    }
    
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
    }
    .btn-ai:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4); }
    .btn-ai:disabled { opacity: 0.6; cursor: wait; }

    @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 1024px) {
      .main-content { margin-left: 0; width: 100%; }
      .dashboard-content { padding: 16px; }
      .stats-grid { grid-template-columns: 1fr; gap: 16px; }
      .section-header { flex-direction: column; align-items: flex-start; gap: 16px; }
      .actions-group { width: 100%; display: flex; flex-direction: column; gap: 10px; }
      .actions-group button { width: 100%; justify-content: center; }
      .table-container { margin: 0 -16px; border-radius: 0; }
      table { min-width: 800px; }
      .modal-content { margin: 10px; max-height: 90vh; overflow-y: auto; }
      .grid-2-col-modal { grid-template-columns: 1fr; }
    }
    
    @media (max-width: 640px) {
      .top-header { padding: 0 16px; height: 70px; }
      .header-search { display: none; } /* Hide search on small mobile to save space */
      .stat-card { padding: 20px; }
      .stat-value { font-size: 24px; }
    }
      .global-report-btn-container {
      display: flex;
      justify-content: flex-end;
    }
    .generate-pdf-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 24px;
      font-weight: 800;
      box-shadow: 0 4px 15px rgba(0, 135, 102, 0.2);
    }
    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid white;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `]
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

  constructor(
    private dossierService: DossierService,
    private fraisService: FraisService,
    private reportingService: ReportingService,
    private adminService: AdminService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private referentielService: ReferentielService,
    private aiService: AIService,
    private router: Router
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

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

  loadStats(): void {
    this.statsLoading = true;
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
              12, // Dummy pending
              5,  // Dummy to validate
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
        return this.dossiers.filter(d => d.statut === 'OUVERT' || d.statut === 'EN_COURS' || d.statut === 'EN_ATTENTE_PREVALIDATION');
      case 'PRE_VALIDATOR':
        return this.dossiers.filter(d => d.statut === 'EN_ATTENTE_PREVALIDATION');
      case 'VALIDATOR':
        return this.dossiers.filter(d => d.statut === 'EN_ATTENTE_VALIDATION');
      default:
        return this.dossiers;
    }
  }

  getBadgeClass(statut: string | undefined): string {
    switch (statut) {
      case 'CLOTURE': return 'success';
      case 'EN_COURS': return 'warning';
      case 'OUVERT': return 'info';
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
      const nextStatus = type === 'Approuver' ? 'EN_ATTENTE_VALIDATION' : 'CLOTURE';

      this.dossierService.updateStatus(dossier.id, nextStatus as any).subscribe({
        next: (updated) => {
          dossier.statut = updated.statut;
          this.loadStats(); // Refresh stats

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
}
