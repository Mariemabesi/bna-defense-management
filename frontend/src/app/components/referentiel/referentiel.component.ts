import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReferentielService } from '../../services/referentiel.service';
import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { NotificationService } from '../../services/notification.service';
import { SidebarService } from '../../services/sidebar.service';
import Chart from 'chart.js/auto';

interface RefSection {
  id: string;
  title: string;
  count: number;
  icon: string;
  description: string;
  color: string;
  path: string;
}

@Component({
  selector: 'app-referentiel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>

      <main class="main-content">
        <app-header title="Administration du Référentiel"></app-header>

        <div class="dashboard-content">
          
          <!-- FUTURISTIC OVERVIEW BANNER -->
          <div class="executive-overview shadow-premium">
            <div class="overview-header">
              <h2>VUE D'ENSEMBLE DU RÉFÉRENTIEL</h2>
            </div>
            
            <div class="overview-grid">
              <!-- New entries chart -->
              <div class="overview-card chart-card">
                <div class="card-header-row">
                  <div class="header-left">
                    <h3>Nouveaux Inscrits</h3>
                    <p>Des derniers 30 jours</p>
                  </div>
                  <div class="time-selector">30 jours <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg></div>
                </div>
                <div class="chart-box">
                  <canvas id="newEntriesChart"></canvas>
                </div>
              </div>

              <!-- Distribution chart -->
              <div class="overview-card chart-card">
                <div class="card-header-row">
                  <div class="header-left">
                    <h3>Répartition des Intervenants</h3>
                  </div>
                </div>
                <div class="distribution-layout">
                  <div class="donut-box">
                    <canvas id="distributionDonutChart"></canvas>
                  </div>
                  <div class="custom-legend">
                    <div class="legend-item"><span class="dot green"></span> Avocats <strong>36 %</strong></div>
                    <div class="legend-item"><span class="dot orange"></span> Huissiers <strong>28 %</strong></div>
                    <div class="legend-item"><span class="dot blue"></span> Experts <strong>10 %</strong></div>
                    <div class="legend-item"><span class="dot grey"></span> Tribunaux <strong>5 %</strong></div>
                  </div>
                </div>
              </div>

              <!-- Experts Stat -->
              <div class="overview-card stat-highlight">
                <div class="stat-value">15</div>
                <div class="stat-label">Experts Judiciaires</div>
                <div class="stat-desc">Recrutement Expert <span class="trend">+5%</span></div>
                <div class="stat-wave">
                   <svg width="100%" height="40" viewBox="0 0 100 40" preserveAspectRatio="none">
                     <path d="M0,35 Q25,10 50,25 T100,5" fill="none" stroke="rgba(16, 185, 129, 0.5)" stroke-width="3"/>
                   </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- HUB SECTIONS -->
          <div class="hub-sections-container">
            
            <!-- SECTION 1 -->
            <div class="hub-section-group">
              <div class="section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <h3>Partenaires & Auxiliaires</h3>
              </div>

              <!-- Highlighted card with filter -->
              <div class="hub-horizontal-card highlighted">
                <div class="card-main">
                   <div class="type-icon green"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg></div>
                   <div class="type-name">Avocats</div>
                </div>
                <div class="card-filters">
                   <button class="filter-chip active">Tout (97)</button>
                   <button class="filter-chip">Récents (12)</button>
                   <button class="filter-chip">Validés (8)</button>
                   <button class="filter-chip">En Attente (6)</button>
                </div>
              </div>

              <div class="cards-list">
                 <div class="hub-horizontal-card" *ngFor="let s of sectionsGroup1" [routerLink]="['/referentiel', s.id]">
                    <div class="card-left">
                       <div class="type-icon-small" [style.background]="s.color + '15'" [style.color]="s.color">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                       </div>
                       <div class="type-info">
                          <h4>{{ s.title }}</h4>
                          <p>{{ s.description }}</p>
                       </div>
                    </div>
                    <div class="card-right">
                       <span class="count-badge">{{ s.count }}</span>
                       <div class="quick-actions">
                          <button class="action-btn" title="Gérer"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> Gérer</button>
                          <button class="action-btn" title="Ajouter" (click)="$event.stopPropagation()" [routerLink]="['/referentiel', s.id]" [queryParams]="{action: 'add'}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Ajouter</button>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            <!-- SECTION 2 -->
            <div class="hub-section-group">
              <div class="section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"></path><path d="M3 7v1h18V7H3z"></path><path d="M5 21V8"></path><path d="M19 21V8"></path><path d="M9 21V8"></path><path d="M15 21V8"></path><path d="M1 7h22"></path><path d="M10 11l2 2 2-2"></path></svg>
                <h3>Juridictions & Cours</h3>
              </div>

              <div class="hub-horizontal-card highlighted secondary">
                <div class="card-main">
                   <div class="type-icon blue"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"></path><path d="M3 7v1h18V7H3z"></path><path d="M5 21V8"></path><path d="M19 21V8"></path><path d="M9 21V8"></path><path d="M15 21V8"></path></svg></div>
                   <div class="type-name">Tribunaux</div>
                   <div class="type-desc">Première instance, Cantonal, Immobilier, Commercial.</div>
                </div>
              </div>

              <div class="cards-list">
                 <div class="hub-horizontal-card" *ngFor="let s of sectionsGroup2" [routerLink]="['/referentiel', s.id]">
                    <div class="card-left">
                       <div class="type-icon-small grey">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"></path><path d="M3 7v1h18V7H3z"></path><path d="M5 21V8"></path><path d="M19 21V8"></path></svg>
                       </div>
                       <div class="type-info">
                          <h4>{{ s.title }}</h4>
                          <p>{{ s.description }}</p>
                       </div>
                    </div>
                    <div class="card-right">
                       <span class="count-badge">{{ s.count }}</span>
                       <button class="action-btn-minimal" (click)="$event.stopPropagation()" [routerLink]="['/referentiel', s.id]"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> Voir</button>
                    </div>
                 </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host { --bna-green: #008766; --bna-green-accent: #059669; --border-color: #e2e8f0; --soft-shadow: 0 4px 20px rgba(0,0,0,0.03); --premium-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); }
    .app-layout { font-family: 'Outfit', sans-serif; display: flex; min-height: 100vh; background: #f4f7f6; }
    .main-content { flex: 1; margin-left: 280px; width: 100%; }
    .dashboard-content { padding: 40px; max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px; }

    /* EXECUTIVE OVERVIEW (OBSIDIAN GLASS) */
    .executive-overview {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border-radius: 32px; padding: 40px; position: relative; overflow: hidden;
      border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 30px 60px rgba(0,0,0,0.15);
    }
    .executive-overview::before {
      content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 6px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    }
    .overview-header h2 {
      font-size: 14px; font-weight: 800; color: rgba(255,255,255,0.4);
      letter-spacing: 0.15em; margin: 0 0 32px 0; text-align: center;
    }
    .overview-grid { display: grid; grid-template-columns: 1fr 1fr 280px; gap: 24px; }
    
    .overview-card {
      background: rgba(255,255,255,0.04); border-radius: 24px; padding: 24px;
      border: 1px solid rgba(255,255,255,0.06); backdrop-filter: blur(10px);
    }
    .card-header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .header-left h3 { font-size: 16px; font-weight: 700; color: white; margin: 0; }
    .header-left p { font-size: 12px; color: rgba(255,255,255,0.4); margin: 4px 0 0 0; }
    .time-selector {
      background: rgba(255,255,255,0.1); padding: 6px 12px; border-radius: 12px;
      font-size: 11px; font-weight: 700; color: white; display: flex; align-items: center; gap: 6px; cursor: pointer;
    }

    .chart-box { height: 120px; width: 100%; }
    .distribution-layout { display: flex; align-items: center; gap: 24px; }
    .donut-box { width: 100px; height: 100px; }
    .custom-legend { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .legend-item { font-size: 12px; color: rgba(255,255,255,0.6); display: flex; align-items: center; gap: 8px; }
    .legend-item strong { color: white; margin-left: auto; }
    .dot { width: 8px; height: 8px; border-radius: 50%; }
    .dot.green { background: #10b981; }
    .dot.orange { background: #f59e0b; }
    .dot.blue { background: #3b82f6; }
    .dot.grey { background: #94a3b8; }

    .stat-highlight {
      display: flex; flex-direction: column; justify-content: center; align-items: center;
      background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%);
    }
    .stat-value { font-size: 48px; font-weight: 800; color: white; line-height: 1; margin-bottom: 8px; }
    .stat-label { font-size: 13px; font-weight: 700; color: white; margin-bottom: 4px; }
    .stat-desc { font-size: 11px; color: rgba(255,255,255,0.4); }
    .trend { color: #10b981; font-weight: 800; }
    .stat-wave { width: 100%; margin-top: 20px; opacity: 0.5; }

    /* HUB HORIZONTAL CARDS */
    .hub-sections-container { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
    .hub-section-group { display: flex; flex-direction: column; gap: 24px; }
    .section-title { display: flex; align-items: center; gap: 12px; color: #64748b; }
    .section-title h3 { font-size: 16px; font-weight: 800; color: #1e293b; margin: 0; }

    .hub-horizontal-card {
      background: #ffffff; border-radius: 24px; padding: 24px;
      border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
    }
    .hub-horizontal-card:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); border-color: #cbd5e1; }

    .hub-horizontal-card.highlighted { background: #f8fafc; border: 2px solid var(--bna-green); padding: 32px; border-radius: 32px; flex-direction: column; align-items: flex-start; gap: 24px; }
    .hub-horizontal-card.highlighted.secondary { border-color: #3b82f6; flex-direction: row; }
    .card-main { display: flex; align-items: center; gap: 20px; width: 100%; }
    .type-icon { width: 48px; height: 48px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
    .type-icon.green { background: #ecfdf5; color: #059669; }
    .type-icon.blue { background: #eff6ff; color: #3b82f6; }
    .type-name { font-size: 20px; font-weight: 800; color: #1e293b; }
    .type-desc { font-size: 13px; color: #64748b; margin-left: auto; }

    .card-filters { display: flex; gap: 12px; flex-wrap: wrap; }
    .filter-chip {
      background: #ffffff; border: 1.5px solid #e2e8f0; padding: 8px 16px; border-radius: 14px;
      font-size: 12px; font-weight: 700; color: #64748b; cursor: pointer; transition: all 0.2s;
    }
    .filter-chip:hover { border-color: #94a3b8; color: #1e293b; }
    .filter-chip.active { background: #334155; border-color: #334155; color: white; }

    .cards-list { display: flex; flex-direction: column; gap: 16px; margin-top: 8px; }
    .card-left { display: flex; align-items: center; gap: 20px; }
    .type-icon-small { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
    .type-icon-small.grey { background: #f1f5f9; color: #64748b; }
    .type-info h4 { margin: 0; font-size: 15px; font-weight: 700; color: #1e293b; }
    .type-info p { margin: 4px 0 0 0; font-size: 12px; color: #64748b; }

    .card-right { display: flex; align-items: center; gap: 16px; }
    .count-badge { font-size: 12px; font-weight: 800; color: #1e293b; background: #f1f5f9; padding: 6px 12px; border-radius: 10px; }
    .quick-actions { display: flex; gap: 8px; }
    .action-btn {
      background: #ffffff; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 10px;
      font-size: 11px; font-weight: 800; color: #64748b; display: flex; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;
    }
    .action-btn:hover { border-color: var(--bna-green); color: var(--bna-green); }
    .action-btn-minimal {
      background: none; border: none; color: #64748b; font-size: 12px; font-weight: 700;
      display: flex; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;
    }
    .action-btn-minimal:hover { color: #3b82f6; }

    @media (max-width: 1200px) { .hub-sections-container { grid-template-columns: 1fr; } }
  `]
})
export class ReferentielComponent implements OnInit, AfterViewInit {
  totalItems: number = 0;
  private entriesChart: any;
  private donutChart: any;

  // Partners & Auxiliaires
  sectionsGroup1: RefSection[] = [
    { id: 'avocats', title: 'Avocats', count: 42, icon: '', description: 'Annuaire des avocats partenaires (Civil, Pénal, Foncier).', color: '#008766', path: '/referentiel/avocats' },
    { id: 'huissiers', title: 'Huissiers', count: 28, icon: '', description: 'Gestion des notifications et exécutions judiciaires.', color: '#d97706', path: '/referentiel/huissiers' },
    { id: 'experts', title: 'Experts Judiciaires', count: 15, icon: '', description: 'Référentiel des experts certifiés par domaine.', color: '#2563eb', path: '/referentiel/experts' }
  ];

  // Juridictions
  sectionsGroup2: RefSection[] = [
    { id: 'tribunaux', title: 'Tribunaux', count: 12, icon: '', description: 'Première instance, Cantonal, Immobilier, Commercial.', color: '#475569', path: '/referentiel/tribunaux' }
  ];

  constructor(
    private referentielService: ReferentielService,
    private authService: AuthService,
    private notificationService: NotificationService,
    public sidebarService: SidebarService
  ) { }

  ngOnInit(): void {
    this.totalItems = 152;
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initCharts(), 300);
  }

  private initCharts(): void {
    // 1. BAR CHART
    const ctx1 = document.getElementById('newEntriesChart') as HTMLCanvasElement;
    if (ctx1) {
      this.entriesChart = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: ['Avocats', 'Huissiers', 'Experts'],
          datasets: [{
            data: [25, 12, 8],
            backgroundColor: ['#10b981', '#f59e0b', '#3b82f6'],
            borderRadius: 8,
            barThickness: 20
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { display: false },
            x: { 
              grid: { display: false },
              ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } }
            }
          }
        }
      });
    }

    // 2. DONUT CHART
    const ctx2 = document.getElementById('distributionDonutChart') as HTMLCanvasElement;
    if (ctx2) {
      this.donutChart = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: ['Avocats', 'Huissiers', 'Experts', 'Tribunaux'],
          datasets: [{
            data: [36, 28, 10, 5],
            backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#94a3b8'],
            borderWidth: 0,
            spacing: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: { legend: { display: false } }
        }
      });
    }
  }

  isAdmin(): boolean { return this.authService.hasRole('ROLE_ADMIN'); }
}
