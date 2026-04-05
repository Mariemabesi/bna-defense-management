import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      <main class="main-content">
        <app-header title="Audit Trail Platform"></app-header>
        
        <div class="page-container">
          <!-- SOVEREIGN BANNER -->
          <div class="header-banner shadow-premium">
             <div class="banner-info">
                <h1>Audit Trail Platform</h1>
                <p>Historique complet des actions effectuées sur la plateforme.</p>
             </div>
             <div class="banner-actions">
                <div class="user-pill">MODE ADMIN</div>
             </div>
          </div>

          <!-- DATA TABLE -->
          <div class="table-card shadow-premium fade-in">
             <table class="data-table">
                <thead>
                   <tr>
                      <th>Horodatage</th>
                      <th>Utilisateur</th>
                      <th>Action</th>
                      <th>Module</th>
                      <th>Détails</th>
                   </tr>
                </thead>
                <tbody>
                   <tr *ngFor="let log of logs">
                      <td class="time-cell"><strong>{{ log.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}</strong></td>
                      <td><span class="user-email">{{ log.userEmail }}</span></td>
                      <td><span class="action-badge pulse-hover">{{ log.action }}</span></td>
                      <td><span class="entity-name">{{ log.entityName }}</span></td>
                      <td><div class="details-box">{{ log.details }}</div></td>
                   </tr>
                </tbody>
             </table>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-layout { display: flex; min-height: 100vh; background: transparent; }
    .main-content { flex: 1; margin-left: var(--sidebar-width); }
    .page-container { padding: 48px; max-width: 1500px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px; animation: fadeUp 0.6s ease-out; }
    
    .header-banner { 
      background: white; border-radius: 32px; padding: 48px; border-left: 5px solid var(--bna-emerald);
      display: flex; justify-content: space-between; align-items: center; 
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    }
    .banner-info h1 { font-size: 36px; font-weight: 850; color: #0f172a; margin: 0 0 10px 0; letter-spacing: -1.2px; }
    .banner-info p { font-size: 17px; color: #64748b; margin: 0; font-weight: 600; }
    .user-pill { padding: 8px 16px; background: #fef2f2; color: #dc2626; border-radius: 12px; font-weight: 850; font-size: 11px; letter-spacing: 1px; }
    
    .table-card { background: white; border-radius: 32px; overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { padding: 24px 32px; background: #f8fafc; color: #475569; font-size: 11px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; text-align: left; }
    .data-table td { padding: 20px 32px; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 650; color: #1e293b; }
    .data-table tr:hover { background: #fcfdfe; }
    
    .time-cell { font-family: monospace; color: #64748b; font-size: 13px; }
    .user-email { color: var(--bna-emerald); font-weight: 800; }
    .action-badge { padding: 5px 12px; background: #ecfdf5; color: #059669; border-radius: 8px; font-size: 11px; font-weight: 850; text-transform: uppercase; letter-spacing: 0.5px; }
    .entity-name { font-weight: 700; color: #475569; }
    .details-box { color: #64748b; font-size: 12px; font-style: italic; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AuditLogsComponent implements OnInit {
  logs: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('/api/admin/logs').subscribe(data => this.logs = data);
  }
}
