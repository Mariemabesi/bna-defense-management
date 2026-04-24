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
import { AffaireService, Affaire } from '../../services/affaire.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { AudienceService } from '../../services/audience.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <!-- SIDEBAR COMPONENT -->
      <app-sidebar></app-sidebar>

      <main class="main-content">
        <!-- HEADER COMPONENT -->
        <app-header [title]="getSpaceName()"></app-header>

        <div class="dashboard-content">
          <!-- WELCOME BANNER (Dynamic based on role) -->
          <div class="role-welcome-banner bna" *ngIf="!isAdmin()">
            <div class="banner-content">
              <h2>Bienvenue, {{ currentUser?.fullName || currentUser?.username }}</h2>
              <p>Vous avez {{ dossiers.length }} dossiers actifs dans votre espace de travail.</p>
            </div>
            <div class="banner-actions">
               <button class="btn-primary white" (click)="exportGlobalStats()">
                 Exporter Rapport Global
               </button>
            </div>
          </div>

          <!-- STATS GRID - SHARED BUT DYNAMIC -->
          <div class="stats-grid" *ngIf="!isAdmin()">
            <div class="stat-card">
              <div class="stat-icon green">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <div class="stat-content">
                <span class="label">Total Dossiers</span>
                <div class="value">{{ dynamicStats.total }}</div>
              </div>
              <div class="stat-footer">
                <span class="trend positive">↑ Active cases</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon info">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <div class="stat-content">
                <span class="label">En Cours</span>
                <div class="value">{{ dynamicStats.enCours }}</div>
              </div>
              <div class="stat-footer">
                <span>En traitement</span>
              </div>
            </div>

            <!-- AUDIENCE WIDGET (NEW) -->
            <div class="stat-card audience-highlight">
              <div class="stat-icon warning">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <div class="stat-content">
                <span class="label">Audiences (S7)</span>
                <div class="value">{{ audienceStats?.countThisWeek || 0 }}</div>
              </div>
              <div class="stat-footer">
                <span class="trend danger" *ngIf="audienceStats?.countUrgent > 0">⚡ {{ audienceStats?.countUrgent }} Urgentes (48h)</span>
                <span class="trend" *ngIf="audienceStats?.countUrgent === 0">Calendrier stable</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon success">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <div class="stat-content">
                <span class="label">Validés / Clos</span>
                <div class="value">{{ dynamicStats.valide }}</div>
              </div>
              <div class="stat-footer">
                <span class="trend positive">Approuvés</span>
              </div>
            </div>
          </div>

          <!-- AUDIENCE NEXT BOX (If available) -->
          <div class="audience-next-banner slideIn" *ngIf="audienceStats?.nextAudience && !isAdmin()">
             <div class="banner-icon">🔔</div>
             <div class="banner-text">
                <strong>Prochaine Audience :</strong> 
                {{ audienceStats.nextAudience.tribunal?.nom }} — 
                {{ audienceStats.nextAudience.dateHeure | date:'dd MMMM à HH:mm' }} 
                (Salle: {{ audienceStats.nextAudience.salle || 'N/A' }})
             </div>
             <button class="btn-view-all" routerLink="/action-justice">VOIR TOUTES LES AUDIENCES</button>
          </div>

          <!-- ROLE SPECIFIC LISTINGS -->
          
          <!-- CHARGÉ DE DOSSIER VIEW -->
          <ng-container *ngIf="isChargeDossier() && !isAdmin()">
            <section class="recent-section">
              <div class="section-header">
                <h2>Mes Dossiers en Cours</h2>
                <div class="actions-group">
                   <button class="btn-primary" routerLink="/nouveau-dossier">Nouveau Dossier</button>
                </div>
              </div>
              <ng-container *ngTemplateOutlet="dossiersTable; context:{ filter: 'CHARGE' }"></ng-container>
            </section>
          </ng-container>

          <!-- PRE-VALIDATEUR VIEW -->
          <ng-container *ngIf="isPreValidateur() && !isAdmin()">
            <section class="recent-section">
              <div class="section-header">
                <h2>File d'Attente Pré-validation</h2>
              </div>
              <ng-container *ngTemplateOutlet="dossiersTable; context:{ filter: 'PRE_VALIDATOR' }"></ng-container>
            </section>
          </ng-container>

          <!-- VALIDATEUR VIEW -->
          <ng-container *ngIf="isValidateur() && !isAdmin()">
            <section class="recent-section">
              <div class="section-header">
                <h2>Dossiers à Valider</h2>
              </div>
              <ng-container *ngTemplateOutlet="dossiersTable; context:{ filter: 'VALIDATOR' }"></ng-container>
            </section>
          </ng-container>

          <!-- ANALYTICS SECTION (Visible to Charge & Super) -->
          <ng-container *ngIf="(isSuperValidateur() || isChargeDossier()) && !isAdmin()">
            <section class="recent-section">
              <div class="section-header">
                <h2>Analyse de Performance</h2>
              </div>
              <div class="performance-grid">
                <!-- RADIAL KPI CHART -->
                <div class="chart-container-card kpi-card">
                  <div class="chart-header center">
                    <h3>Performance KPI</h3>
                    <p>Progression globale</p>
                  </div>
                  <div class="chart-canvas-wrapper radial">
                    <canvas id="dossiersStatutChart"></canvas>
                  </div>
                  <div class="chart-footer-action">
                    <button class="btn-review-executive" (click)="onAction('Export', 'Referentiel')">REVIEW</button>
                  </div>
                </div>

                <!-- BUDGET BAR CHART -->
                <div class="chart-container-card budget-card">
                  <div class="chart-header">
                    <h3>Engagement Financier</h3>
                    <p>Top 5 dossiers par budget</p>
                  </div>
                  <div class="chart-canvas-wrapper bar">
                    <canvas id="budgetTopChart"></canvas>
                  </div>
                </div>

                <!-- HISTORICAL LINE CHART (NEW) -->
                <div class="chart-container-card history-card">
                  <div class="chart-header">
                    <h3>Progression Historique</h3>
                    <p>Évolution des dossiers traités</p>
                  </div>
                  <div class="chart-canvas-wrapper line">
                    <canvas id="historicalProgressChart"></canvas>
                  </div>
                </div>
              </div>
            </section>
          </ng-container>

          <!-- ADMIN MONITORING -->
          <ng-container *ngIf="isAdmin()">
            <div class="section-header">
              <h2>Supervision Plateforme</h2>
            </div>
            <div class="monitor-grid">
              <!-- UTILISATEURS & GROUPES -->
              <div class="monitor-card">
                <div class="monitor-header">
                  <div class="header-text">
                    <h3>Utilisateurs & Groupes</h3>
                    <p>Gestion des accès et affectations</p>
                  </div>
                  <button class="btn-gérer" routerLink="/admin/users">GÉRER</button>
                </div>
                <div class="monitor-body">
                  <div class="user-item-pro" *ngFor="let user of users.slice(0, 3)">
                     <div class="user-avatar-initial">{{ user.username[0].toUpperCase() }}</div>
                     <div class="user-info-pro">
                        <span class="user-name-bold">{{ user.username }}</span>
                        <span class="user-role-status">{{ user.roles[0]?.replace('ROLE_', '') }} • Actif</span>
                     </div>
                     <div class="status-dot-active"></div>
                  </div>
                </div>
              </div>

              <!-- JOURNAL D'AUDIT -->
              <div class="monitor-card">
                <div class="monitor-header">
                  <div class="header-text">
                    <h3>Journal d'Audit</h3>
                    <p>Suivi des actions en temps réel</p>
                  </div>
                  <button class="btn-voir-tout" routerLink="/admin/logs">VOIR TOUT</button>
                </div>
                <div class="monitor-body logs-feed">
                  <div class="log-entry-pro" *ngFor="let log of auditLogs.slice(0, 6)">
                     <span class="log-timestamp">{{ log.timestamp | date:'HH:mm' }}</span>
                     <span class="log-actor">{{ log.userEmail.split('@')[0] }}</span>
                     <span class="log-event">{{ log.action }}</span>
                     <span class="log-target">Dossier #{{ log.id.toString().slice(-2) }}</span>
                  </div>
                </div>
              </div>

              <!-- SANTE DU SYSTEME -->
              <div class="monitor-card">
                <div class="monitor-header">
                  <div class="header-text">
                    <h3>Santé du Système</h3>
                  </div>
                </div>
                <div class="monitor-body health-stats">
                  <div class="health-item">
                     <div class="health-info">
                        <span>Base de Données</span>
                        <strong>14%</strong>
                     </div>
                     <div class="health-progress"><div class="bar green" style="width: 14%"></div></div>
                  </div>
                  <div class="health-item">
                     <div class="health-info">
                        <span>Stockage Documents</span>
                        <strong>42%</strong>
                     </div>
                     <div class="health-progress"><div class="bar blue" style="width: 42%"></div></div>
                  </div>
                  <div class="health-item">
                     <div class="health-info">
                        <span>Charge Serveur (Port 8082)</span>
                        <strong>Stable</strong>
                     </div>
                     <div class="health-progress"><div class="bar-flat green"></div></div>
                  </div>
                </div>
              </div>
            </div>
          </ng-container>

          <!-- REUSABLE TABLE TEMPLATE -->
          <ng-template #dossiersTable let-filter="filter">
            <div class="table-container">
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
                  <tr *ngFor="let d of filterDossiers(filter)">
                    <td><strong>{{ d.reference }}</strong></td>
                    <td>{{ d.titre }}</td>
                    <td><span class="badge" [ngClass]="getPrioriteBadge(d.priorite)">{{ d.priorite }}</span></td>
                    <td><span class="badge" [ngClass]="getBadgeClass(d.statut)">{{ getStatusLabel(d.statut) }}</span></td>
                    <td><strong>{{ d.budgetProvisionne | number:'1.2-2' }} TND</strong></td>
                    <td class="actions-cell">
                       <button class="btn-action" (click)="onViewDossier(d)">
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                       </button>
                       <button class="btn-action" *ngIf="isChargeDossier()" [routerLink]="['/modifier-dossier', d.reference]">
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                       </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </ng-template>
        </div>
      </main>
    </div>
  `,
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  dossierChart: any;
  budgetChart: any;
  historyChart: any;

  currentUser: any;
  Math = Math;

  stats: DashboardStats | null = null;
  statsLoading = false;
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
  affaires: Affaire[] = [];
  workflowHistory: any[] = [];
  dynamicStats: any = { total: 0, urgent: 0, enCours: 0, valide: 0, refuse: 0 };
  audienceStats: any = null;

  constructor(
    private dossierService: DossierService,
    private fraisService: FraisService,
    private reportingService: ReportingService,
    private adminService: AdminService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private referentielService: ReferentielService,
    private aiService: AIService,
    private affaireService: AffaireService,
    private confirmService: ConfirmDialogService,
    private audienceService: AudienceService,
    private router: Router,
    public sidebarService: SidebarService
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.loadStats();
      this.loadDossiers();
      this.loadAudienceStats();
      if (this.isAdmin()) {
        this.loadUsers();
        this.loadLogs();
      }
      if (this.isAdmin() || this.isChargeDossier()) {
        this.loadAuxiliaires();
      }
    }
  }

  loadAudienceStats(): void {
    this.audienceService.getStats().subscribe(data => this.audienceStats = data);
  }

  loadAuxiliaires(): void {
    this.auxiliairesLoading = true;
    this.referentielService.getAuxiliaires().subscribe({
      next: (data) => {
        this.auxiliaires = data;
        this.auxiliairesLoading = false;
      },
      error: () => this.auxiliairesLoading = false
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
      error: () => this.statsLoading = false
    });
  }

  initCharts(): void {
    const ctx1 = document.getElementById('dossiersStatutChart') as HTMLCanvasElement;
    if (ctx1) {
      if (this.dossierChart) this.dossierChart.destroy();
      const total = this.dynamicStats.total || 1;
      const data = [
        Math.min(100, Math.round(((this.stats?.openDossiers || 0) / total) * 100)),
        Math.min(100, Math.round(((this.dynamicStats.enCours || 0) / total) * 100)),
        Math.min(100, Math.round(((this.dynamicStats.total - this.dynamicStats.enCours) / total) * 100)),
        Math.min(100, Math.round(((this.stats?.closedDossiers || 0) / total) * 100))
      ];
      this.dossierChart = new Chart(ctx1, {
        type: 'doughnut',
        data: {
          labels: ['Ouverts', 'En Cours', 'A Valider', 'Clôturés'],
          datasets: [
            { label: 'Ouverts', data: [data[0], 100 - data[0]], backgroundColor: ['#008766', '#f1f5f9'], borderWidth: 0, weight: 0.5 },
            { label: 'En Cours', data: [data[1], 100 - data[1]], backgroundColor: ['#3b82f6', '#f1f5f9'], borderWidth: 0, weight: 0.5 },
            { label: 'A Valider', data: [data[2], 100 - data[2]], backgroundColor: ['#f59e0b', '#f1f5f9'], borderWidth: 0, weight: 0.5 },
            { label: 'Clôturés', data: [data[3], 100 - data[3]], backgroundColor: ['#94a3b8', '#f1f5f9'], borderWidth: 0, weight: 0.5 }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '20%', spacing: 2,
          plugins: { legend: { display: false }, tooltip: { enabled: true, callbacks: { label: (c) => c.dataIndex === 1 ? '' : `${c.dataset.label}: ${c.raw}%` } } }
        }
      });
    }

    const budgetCtx = document.getElementById('budgetTopChart') as HTMLCanvasElement;
    if (budgetCtx) {
      if (this.budgetChart) this.budgetChart.destroy();
      const grad = budgetCtx.getContext('2d')?.createLinearGradient(0, 0, 0, 400);
      grad?.addColorStop(0, 'rgba(0, 135, 102, 0.8)');
      grad?.addColorStop(1, 'rgba(0, 135, 102, 0.2)');
      this.budgetChart = new Chart(budgetCtx, {
        type: 'bar',
        data: {
          labels: this.dossiers.slice(0, 5).map(d => d.reference),
          datasets: [{ label: 'Budget (TND)', data: this.dossiers.slice(0, 5).map(d => d.budgetProvisionne || 0), backgroundColor: grad || '#008766', borderRadius: 8 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } }
      });
    }

    const historyCtx = document.getElementById('historicalProgressChart') as HTMLCanvasElement;
    if (historyCtx) {
      if (this.historyChart) this.historyChart.destroy();
      const grad = historyCtx.getContext('2d')?.createLinearGradient(0, 0, 0, 300);
      grad?.addColorStop(0, 'rgba(0, 135, 102, 0.2)');
      grad?.addColorStop(1, 'rgba(0, 135, 102, 0)');
      this.historyChart = new Chart(historyCtx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
          datasets: [{ label: 'Dossiers Traités', data: [10, 25, 18, 45, 60, 85], borderColor: '#008766', backgroundColor: grad, fill: true, tension: 0.4 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } }
      });
    }
  }

  loadDossiers(): void {
    this.dossiersLoading = true;
    this.dossierService.getDossiers(0, 100).subscribe({
      next: (data) => {
        this.dossiers = Array.isArray(data) ? data : (data.content || []);
        this.dossiersLoading = false;
      },
      error: () => { this.dossiersLoading = false; this.dossiers = []; }
    });
  }

  filterDossiers(type: string): Dossier[] {
    if (this.isAdmin()) return [];
    switch (type) {
      case 'CHARGE': return this.dossiers.filter(d => ['OUVERT', 'EN_COURS', 'EN_ATTENTE_PREVALIDATION', 'EN_ATTENTE_VALIDATION', 'REFUSE'].includes(d.statut || ''));
      case 'PRE_VALIDATOR': return this.dossiers.filter(d => d.statut === 'EN_ATTENTE_PREVALIDATION');
      case 'VALIDATOR': return this.dossiers.filter(d => d.statut === 'EN_ATTENTE_VALIDATION');
      default: return this.dossiers;
    }
  }

  getSpaceName(): string { return 'Tableau de Bord Stratégique'; }
  getStatusLabel(s: string | undefined): string { 
    const map: any = { 'OUVERT': 'Ouvert', 'EN_COURS': 'En cours', 'EN_ATTENTE_PREVALIDATION': 'Attente Pré-val', 'EN_ATTENTE_VALIDATION': 'Attente Validation', 'VALIDE': 'Validé', 'CLOTURE': 'Clôturé', 'REFUSE': 'Refusé' };
    return map[s || ''] || s || '—';
  }
  getBadgeClass(s: string | undefined): string { return ['VALIDE', 'CLOTURE'].includes(s || '') ? 'success' : ['REFUSE'].includes(s || '') ? 'danger' : s?.includes('ATTENTE') ? 'warning' : 'info'; }
  getPrioriteBadge(p: string | undefined): string { return p === 'HAUTE' ? 'danger' : p === 'MOYENNE' ? 'warning' : 'success'; }

  isChargeDossier(): boolean { return this.authService.hasRole('ROLE_CHARGE_DOSSIER'); }
  isPreValidateur(): boolean { return this.authService.hasRole('ROLE_PRE_VALIDATEUR'); }
  isValidateur(): boolean { return this.authService.hasRole('ROLE_VALIDATEUR'); }
  isAdmin(): boolean { return this.authService.hasRole('ROLE_ADMIN'); }
  isSuperValidateur(): boolean { return this.authService.hasRole('ROLE_SUPER_VALIDATEUR'); }

  onViewDossier(d: Dossier): void {
    this.selectedDossier = d;
    if (d.id) { this.loadAffaires(d.id); this.loadHistory(d.id); }
  }
  loadHistory(id: number): void { this.dossierService.getHistory(id).subscribe(data => this.workflowHistory = data); }
  loadAffaires(id: number): void { this.affaireService.getAffairesByDossier(id).subscribe(data => this.affaires = data); }
  
  exportGlobalStats(): void {}
  onAction(t: string, r: string): void {}
}
