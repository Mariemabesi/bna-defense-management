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
    .app-layout { display: flex; min-height: 100vh; background-color: #f8fafc; font-family: 'Outfit', sans-serif; }
    .main-content { flex: 1; padding-left: 250px; display: flex; flex-direction: column; overflow-y: auto; }
    
    .detail-page { padding: 40px; animation: fadeIn 0.4s ease-out; max-width: 1400px; width: 100%; margin: 0 auto; }
    .breadcrumb { margin-bottom: 24px; }
    .breadcrumb a { color: #64748b; font-weight: 700; text-decoration: none; font-size: 14px; }
    .breadcrumb a:hover { color: #008766; }

    .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px; }
    .section { background: white; border-radius: 24px; padding: 32px; box-shadow: 0 10px 40px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.02); }
    
    .profile-header { display: flex; align-items: center; gap: 20px; margin-bottom: 32px; }
    .avocat-avatar { width: 70px; height: 70px; background: linear-gradient(135deg, #008766 0%, #10b981 100%); border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 28px; }
    h1 { font-size: 24px; margin: 0 0 4px 0; color: #1e293b; }
    .badge-ordre { padding: 4px 10px; background: #f1f5f9; border-radius: 8px; font-size: 11px; font-weight: 700; color: #64748b; }

    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .info-item label { font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 800; display: block; margin-bottom: 4px; }
    .info-item p { font-size: 15px; color: #1e293b; font-weight: 700; margin: 0; }
    .info-item.full { grid-column: span 2; }

    .chart-wrapper { height: 200px; position: relative; margin-top: 20px; }
    
    .stats-ribbon { display: flex; justify-content: space-between; background: #1e293b; padding: 24px 48px; border-radius: 24px; margin-bottom: 32px; color: white; box-shadow: 0 20px 40px rgba(15,23,42,0.15); }
    .ribbon-item { display: flex; flex-direction: column; gap: 4px; }
    .ribbon-item .lab { font-size: 11px; text-transform: uppercase; opacity: 0.6; font-weight: 700; letter-spacing: 1px; }
    .ribbon-item .val { font-size: 24px; font-weight: 800; }
    .val.highlight { color: #10b981; }

    .data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
    .section-title h2 { font-size: 18px; margin: 0 0 20px 0; }
    
    .table-container { border-radius: 12px; border: 1px solid #f1f5f9; overflow: hidden; }
    .premium-table { width: 100%; border-collapse: collapse; }
    .premium-table th { background: #f8fafc; padding: 12px 20px; text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase; }
    .premium-table td { padding: 12px 20px; border-top: 1px solid #f1f5f9; font-size: 14px; }
    
    .badge-dossier { background: #008766; color: white; padding: 2px 8px; border-radius: 6px; font-size: 11px; }
    .status-badge { padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; }
    .status-badge.valide { background: #dcfce7; color: #15803d; }
    .amount { font-weight: 800; color: #008766; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AvocatDetailComponent implements OnInit, AfterViewInit {
  @ViewChild('feeChart') feeChartRef!: ElementRef;
  id: string | null = null;
  data: any = null;
  chart: any;
  private apiUrl = 'http://localhost:8082/api/referentiel/auxiliaires';

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

