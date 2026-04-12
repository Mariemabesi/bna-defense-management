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
        <div class="dashboard-content">
          <div class="page-header-actions">
            <div>
              <h2>Journaux d'Audit</h2>
              <p class="subtitle">Historique complet des actions effectuées sur la plateforme.</p>
            </div>
          </div>

          <div class="table-container">
            <table>
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
                  <td><strong>{{ log.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}</strong></td>
                  <td>{{ log.userEmail }}</td>
                  <td><span class="action-badge">{{ log.action }}</span></td>
                  <td>{{ log.entityName }}</td>
                  <td><small>{{ log.details }}</small></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-layout { display: flex; min-height: 100vh; background-color: #f8fafc; }
    .main-content { flex: 1; margin-left: 280px; }
    .dashboard-content { padding: 40px; }
    .table-container { background: white; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); overflow: hidden; margin-top: 32px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 20px; background: #f1f5f9; font-size: 13px; color: #64748b; }
    td { padding: 20px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .action-badge { padding: 4px 10px; background: #eff6ff; color: #1e40af; border-radius: 8px; font-weight: 700; font-size: 11px; }
    .subtitle { color: #64748b; margin-top: 4px; }
  `]
})
export class AuditLogsComponent implements OnInit {
  logs: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('/api/admin/logs').subscribe(data => this.logs = data);
  }
}
