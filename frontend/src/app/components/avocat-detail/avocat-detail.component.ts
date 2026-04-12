import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-avocat-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      <main class="main-content">
        <div class="detail-page shadow-premium" *ngIf="data">
          <div class="breadcrumb">
            <a routerLink="/referentiel/avocats">← Retour à la liste des Avocats</a>
          </div>

      <!-- SECTION 1: PROFILE & STATS -->
      <div class="profile-grid">
        <div class="section profile-card">
          <div class="profile-header">
             <div class="avocat-avatar">{{ getInitials(data.info.nom) }}</div>
             <div class="avocat-main">
               <h1>{{ data.info.nom }}</h1>
               <span class="badge-ordre">Ordre National: #{{ data.info.numOrdreNational || 'N/A' }}</span>
             </div>
          </div>
          <div class="info-grid">
             <div class="info-item">
               <label>Spécialité</label>
               <p>{{ data.info.specialite || 'Généraliste' }}</p>
             </div>
             <div class="info-item">
               <label>Région</label>
               <p>{{ data.info.region || 'Tunis' }}</p>
             </div>
             <div class="info-item full">
               <label>Email</label>
               <p>{{ data.info.email }}</p>
             </div>
             <div class="info-item full">
               <label>Cabinet</label>
               <p>{{ data.info.adresse }}</p>
             </div>
          </div>
        </div>

        <div class="section chart-card">
          <div class="section-title">
            <h3>Tendance des Honoraires (TND)</h3>
          </div>
          <div class="chart-wrapper">
             <canvas #feeChart></canvas>
          </div>
        </div>
      </div>

      <!-- STATS OVERVIEW RIBBON -->
      <div class="stats-ribbon">
         <div class="ribbon-item">
           <span class="lab">Affaires Traitées</span>
           <span class="val">{{ data.affaires.length }}</span>
         </div>
         <div class="ribbon-item">
           <span class="lab">Total Honoraires</span>
           <span class="val highlight">{{ data.totalFees | number:'1.2-2' }} TND</span>
         </div>
         <div class="ribbon-item">
           <span class="lab">Moyenne par Affaire</span>
           <span class="val">{{ (data.avgFee || 0) | number:'1.2-2' }} TND</span>
         </div>
      </div>

      <!-- CASES & FEES TABS/SECTIONS -->
      <div class="data-grid">
        <div class="section">
          <div class="section-title">
            <h2>Affaires Associées</h2>
          </div>
          <div class="table-container">
            <table class="premium-table">
              <thead>
                <tr>
                  <th>Réf. Judiciaire</th>
                  <th>Dossier</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let aff of data.affaires">
                  <td><strong>{{ aff.referenceJudiciaire }}</strong></td>
                  <td><span class="badge-dossier">{{ aff.dossier?.reference }}</span></td>
                  <td><span class="status-badge" [ngClass]="aff.statut.toLowerCase()">{{ aff.statut }}</span></td>
                </tr>
              </tbody>
            </table>
            <div *ngIf="data.affaires.length === 0" class="empty-state">Aucune affaire liée.</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">
            <h2>Historique des Honoraires</h2>
          </div>
          <div class="table-container">
            <table class="premium-table">
              <thead>
                <tr>
                  <th>Libellé</th>
                  <th>Type</th>
                  <th>Montant</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let f of data.frais">
                  <td>{{ f.libelle }}</td>
                  <td>{{ f.type }}</td>
                  <td class="amount">{{ f.montant | number:'1.2-2' }} TND</td>
                </tr>
              </tbody>
            </table>
            <div *ngIf="data.frais.length === 0" class="empty-state">Aucun frais enregistré.</div>
          </div>
        </div>
      </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-layout { display: flex; min-height: 100vh; }
    .main-content { flex: 1; margin-left: var(--sidebar-width); transition: margin-left 0.5s ease; background: #f8fafc; }

    .detail-page { 
      padding: 40px; max-width: 1400px; margin: 0 auto; 
      display: flex; flex-direction: column; gap: 32px; 
      animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); 
    }

    .breadcrumb { margin-bottom: 8px; }
    .breadcrumb a { color: #64748b; font-weight: 800; text-decoration: none; font-size: 13px; display: flex; align-items: center; gap: 8px; }
    .breadcrumb a:hover { color: var(--bna-emerald); }

    .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .section { background: white; border-radius: 28px; padding: 32px; border: 1.5px solid #f1f5f9; }
    
    .profile-header { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; }
    .avocat-avatar { 
      width: 64px; height: 64px; border-radius: 18px; 
      background: linear-gradient(135deg, var(--bna-emerald) 0%, #064e3b 100%); 
      display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 24px;
    }
    .avocat-main h1 { font-size: 24px; font-weight: 950; color: #0f172a; margin: 0 0 4px 0; }
    .badge-ordre { padding: 4px 10px; background: #f1f5f9; border-radius: 8px; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; }

    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .info-item label { font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 850; margin-bottom: 4px; display: block; }
    .info-item p { font-size: 15px; color: #1e293b; font-weight: 750; margin: 0; word-break: break-all; }
    .info-item.full { grid-column: span 2; }

    .chart-wrapper { height: 260px; position: relative; margin-top: 16px; }

    .stats-ribbon { 
      background: #0f172a; padding: 32px; border-radius: 28px; 
      display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 32px;
      color: white; box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }
    .ribbon-item { display: flex; flex-direction: column; gap: 6px; }
    .ribbon-item .lab { font-size: 11px; text-transform: uppercase; opacity: 0.6; font-weight: 800; letter-spacing: 1px; }
    .ribbon-item .val { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; }
    .ribbon-item .val.highlight { color: var(--bna-emerald); }

    .data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .section-title h2 { font-size: 18px; font-weight: 950; color: #0f172a; margin: 0 0 24px 0; }
    
    .table-container { border-radius: 16px; border: 1.5px solid #f1f5f9; overflow-x: auto; width: 100%; }
    .premium-table { width: 100%; border-collapse: collapse; min-width: 400px; }
    .premium-table th { background: #f8fafc; padding: 14px 20px; text-align: left; font-size: 11px; color: #64748b; font-weight: 800; text-transform: uppercase; }
    .premium-table td { padding: 14px 20px; border-top: 1.5px solid #f1f5f9; font-size: 14px; font-weight: 700; color: #334155; }
    
    .badge-dossier { background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; }
    .status-badge { padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
    .status-badge.valide { background: #ecfdf5; color: #059669; }
    .amount { font-weight: 850; color: var(--bna-emerald); font-family: 'JetBrains Mono', monospace; }

    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 1024px) {
      .main-content { margin-left: 0; }
      .detail-page { padding: 24px; }
      .profile-grid, .data-grid { grid-template-columns: 1fr; }
      .stats-ribbon { grid-template-columns: 1fr 1fr; padding: 24px; gap: 24px; }
    }

    @media (max-width: 640px) {
      .detail-page { padding: 16px; }
      .stats-ribbon { grid-template-columns: 1fr; }
      .info-grid { grid-template-columns: 1fr; }
      .info-item.full { grid-column: span 1; }
      .ribbon-item .val { font-size: 20px; }
    }
  `]
})
export class AvocatDetailComponent implements OnInit, AfterViewInit {
  @ViewChild('feeChart') feeChartRef!: ElementRef;
  id: string | null = null;
  data: any = null;
  chart: any;
  private apiUrl = '/api/referentiel/auxiliaires';

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) { this.fetchDetails(); }
  }

  ngAfterViewInit() {
    if (this.data) { this.createChart(); }
  }

  fetchDetails() {
    this.http.get(`${this.apiUrl}/${this.id}/details`).subscribe(res => {
      this.data = res;
      setTimeout(() => this.createChart(), 0);
    });
  }

  createChart() {
    if (!this.feeChartRef) return;
    const ctx = this.feeChartRef.nativeElement.getContext('2d');
    if (this.chart) { this.chart.destroy(); }

    // Logic: Group fees by month
    const feeMap = new Map<string, number>();
    (this.data.frais || []).forEach((f: any) => {
      const date = new Date(f.createdAt || Date.now());
      const month = date.toLocaleString('default', { month: 'short' });
      feeMap.set(month, (feeMap.get(month) || 0) + f.montant);
    });

    const labels = Array.from(feeMap.keys());
    const values = Array.from(feeMap.values());

    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(0, 135, 102, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 135, 102, 0.0)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Honoraires Totaux (TND)',
          data: values,
          borderColor: '#008766',
          borderWidth: 3,
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { display: false } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }
}

