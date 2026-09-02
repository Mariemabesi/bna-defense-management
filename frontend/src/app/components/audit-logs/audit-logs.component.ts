import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { WebSocketService } from '../../services/web-socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      <main class="main-content">
        <app-header title="Audit Trail Platform"></app-header>
        <div class="dashboard-content">
          <!-- Page Header -->
          <div class="page-header-actions">
            <div>
              <h2>Journaux d'Audit</h2>
              <p class="subtitle">Historique complet des actions effectuées sur la plateforme.</p>
            </div>
            
            <div class="actions-group">
              <!-- Real-time badge indicator -->
              <div class="rt-status" [class.active]="wsConnected">
                <span class="pulse-dot"></span>
                <span>{{ wsConnected ? 'Temps réel actif' : 'Hors ligne' }}</span>
              </div>

              <!-- Refresh Button -->
              <button class="btn-refresh" (click)="refreshLogs()" [class.spinning]="isRefreshing" title="Actualiser les journaux">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                </svg>
                <span>Actualiser</span>
              </button>
            </div>
          </div>

          <!-- Filters and Search Bar -->
          <div class="controls-panel">
            <div class="search-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange()" placeholder="Rechercher par utilisateur, action, détails..." />
            </div>

            <div class="filter-box">
              <select [(ngModel)]="selectedActionFilter" (change)="onSearchChange()">
                <option value="">Toutes les actions</option>
                <option *ngFor="let act of uniqueActions" [value]="act">{{ act }}</option>
              </select>
            </div>
          </div>

          <!-- Logs Table -->
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
                <tr *ngFor="let log of paginatedLogs" [class.new-log-flash]="log.isNew" (animationend)="log.isNew = false">
                  <td class="col-time">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline; margin-right: 6px; vertical-align: text-bottom; opacity: 0.7;">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <strong>{{ log.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}</strong>
                  </td>
                  <td class="col-user">
                    <div class="user-chip">
                      <span class="user-avatar">{{ log.userEmail ? log.userEmail.substring(0, 2).toUpperCase() : 'SYS' }}</span>
                      <span>{{ log.userEmail || 'Système' }}</span>
                    </div>
                  </td>
                  <td>
                    <span [class]="'action-badge ' + getActionBadgeClass(log.action)">
                      {{ log.action }}
                    </span>
                  </td>
                  <td>
                    <span class="module-tag">{{ log.entityName }}</span>
                  </td>
                  <td class="col-details">
                    <span class="details-text" [title]="log.details">{{ log.details }}</span>
                  </td>
                </tr>
                <tr *ngIf="filteredLogs.length === 0">
                  <td colspan="5" class="empty-state">
                    <div class="empty-content">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="9" y1="9" x2="15" y2="9"></line>
                        <line x1="9" y1="13" x2="15" y2="13"></line>
                        <line x1="9" y1="17" x2="15" y2="17"></line>
                      </svg>
                      <p>Aucun journal d'audit trouvé.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="pagination-container" *ngIf="filteredLogs.length > 0">
            <div class="pagination-info">
              Affichage de {{ getStartIndex() }} à {{ getEndIndex() }} sur {{ filteredLogs.length }} entrées
            </div>
            <div class="pagination-controls">
              <button class="btn-page" (click)="goToPage(1)" [disabled]="currentPage === 1">«</button>
              <button class="btn-page" (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">‹</button>
              
              <ng-container *ngFor="let page of getPageRange()">
                <button class="btn-page" [class.active]="page === currentPage" (click)="goToPage(page)">
                  {{ page }}
                </button>
              </ng-container>

              <button class="btn-page" (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages">›</button>
              <button class="btn-page" (click)="goToPage(totalPages)" [disabled]="currentPage === totalPages">»</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-layout { display: flex; min-height: 100vh; background-color: #f8fafc; font-family: 'Outfit', sans-serif; }
    .main-content { flex: 1; margin-left: 280px; display: flex; flex-direction: column; }
    .dashboard-content { padding: 40px; flex: 1; max-width: 1400px; width: 100%; margin: 0 auto; }
    
    .page-header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .page-header-actions h2 { margin: 0; font-size: 28px; font-weight: 800; color: #1e293b; }
    .subtitle { color: #64748b; margin-top: 4px; font-size: 15px; }

    .actions-group { display: flex; align-items: center; gap: 16px; }
    
    .rt-status { display: flex; align-items: center; background: white; padding: 8px 16px; border-radius: 12px; font-size: 12px; font-weight: 700; color: #64748b; box-shadow: 0 4px 6px rgba(0,0,0,0.02); border: 1px solid #f1f5f9; }
    .rt-status.active { color: #0f766e; background: #f0fdf4; border-color: #bbf7d0; }
    .rt-status.active .pulse-dot { background-color: #10b981; animation: pulse 2s infinite; }
    .rt-status:not(.active) .pulse-dot { background-color: #94a3b8; animation: none; }
    
    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }
    .pulse-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 6px; }

    .btn-refresh { display: flex; align-items: center; gap: 8px; background: white; color: #008766; border: 1px solid #e2e8f0; padding: 10px 18px; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
    .btn-refresh:hover { background: #f8fafc; border-color: #cbd5e1; transform: translateY(-1px); }
    .btn-refresh:active { transform: translateY(0); }
    .btn-refresh svg { transition: transform 0.2s ease; }
    .btn-refresh:hover svg { transform: rotate(30deg); }
    .btn-refresh.spinning svg { animation: spin 0.8s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    .controls-panel { display: flex; gap: 16px; margin-bottom: 24px; }
    .search-box { flex: 1; position: relative; display: flex; align-items: center; }
    .search-box svg { position: absolute; left: 16px; color: #94a3b8; pointer-events: none; }
    .search-box input { width: 100%; padding: 12px 16px 12px 48px; border-radius: 14px; border: 1px solid #e2e8f0; background: white; font-family: inherit; font-size: 14px; font-weight: 500; transition: all 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
    .search-box input:focus { outline: none; border-color: #008766; box-shadow: 0 0 0 4px rgba(0, 135, 102, 0.1); }
    
    .filter-box select { padding: 12px 24px 12px 16px; border-radius: 14px; border: 1px solid #e2e8f0; background: white; font-family: inherit; font-size: 14px; font-weight: 600; color: #334155; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
    .filter-box select:focus { outline: none; border-color: #008766; box-shadow: 0 0 0 4px rgba(0, 135, 102, 0.1); }

    .table-container { background: white; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.02); border: 1px solid #f1f5f9; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 18px 24px; background: #f8fafc; font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #f1f5f9; }
    td { padding: 18px 24px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; transition: background-color 0.2s ease; }
    tr:hover td { background-color: #f8fafc; }

    @keyframes flashRow {
      0% { background-color: rgba(16, 185, 129, 0.15); }
      100% { background-color: transparent; }
    }
    .new-log-flash td { animation: flashRow 2s cubic-bezier(0.25, 1, 0.5, 1); }

    .user-chip { display: flex; align-items: center; gap: 8px; }
    .user-avatar { width: 28px; height: 28px; border-radius: 8px; background: rgba(0,135,102,0.1); color: #008766; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }
    
    .action-badge { display: inline-flex; padding: 4px 10px; border-radius: 8px; font-weight: 700; font-size: 11px; text-transform: uppercase; }
    .badge-success { background: #ecfdf5; color: #047857; }
    .badge-danger { background: #fef2f2; color: #b91c1c; }
    .badge-warning { background: #fffbeb; color: #b45309; }
    .badge-primary { background: #faf5ff; color: #6b21a8; }
    .badge-info { background: #eff6ff; color: #1d4ed8; }
    .badge-neutral { background: #f8fafc; color: #475569; }

    .module-tag { font-size: 12px; font-weight: 600; color: #475569; background: #f1f5f9; padding: 4px 8px; border-radius: 6px; }
    .col-time { white-space: nowrap; color: #64748b; }
    .col-user { font-weight: 500; }
    .col-details { color: #475569; max-width: 400px; }
    .details-text { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .col-details:hover .details-text { white-space: normal; word-break: break-word; }

    .empty-state { text-align: center; padding: 60px 0; color: #94a3b8; }
    .empty-content { display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .empty-content svg { stroke-width: 1.2; }

    .pagination-container { display: flex; justify-content: space-between; align-items: center; margin-top: 24px; padding: 0 8px; }
    .pagination-info { font-size: 13px; color: #64748b; font-weight: 500; }
    .pagination-controls { display: flex; gap: 6px; }
    .btn-page { min-width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: white; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13px; font-weight: 700; color: #475569; cursor: pointer; transition: all 0.2s; }
    .btn-page:hover:not([disabled]) { border-color: #008766; color: #008766; background: #f0fdf4; }
    .btn-page.active { background: #008766; border-color: #008766; color: white; }
    .btn-page[disabled] { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class AuditLogsComponent implements OnInit, OnDestroy {
  logs: any[] = [];
  filteredLogs: any[] = [];
  paginatedLogs: any[] = [];
  uniqueActions: string[] = [];

  // Search & Filtering
  searchQuery: string = '';
  selectedActionFilter: string = '';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  // State
  wsConnected: boolean = false;
  isRefreshing: boolean = false;

  private wsSubscription?: Subscription;
  private wsStatusSubscription?: Subscription;

  constructor(
    private http: HttpClient,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.fetchLogs();

    // Subscribe to WebSocket status
    this.wsStatusSubscription = this.webSocketService.isConnected$.subscribe(status => {
      this.wsConnected = status;
    });

    // Subscribe to real-time Audit Log broadcasts
    this.wsSubscription = this.webSocketService.auditLog$.subscribe((newLog: any) => {
      if (newLog) {
        // Tag as new for flash animation
        newLog.isNew = true;
        
        // Add to main logs list at the beginning
        this.logs.unshift(newLog);
        
        // Refresh unique action list
        this.extractUniqueActions();
        
        // Re-apply search filters and update pagination
        this.applyFilters();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) this.wsSubscription.unsubscribe();
    if (this.wsStatusSubscription) this.wsStatusSubscription.unsubscribe();
  }

  fetchLogs(): void {
    this.isRefreshing = true;
    this.http.get<any[]>('/api/admin/logs').subscribe({
      next: (data) => {
        this.logs = data;
        this.extractUniqueActions();
        this.applyFilters();
        setTimeout(() => this.isRefreshing = false, 600); // smooth animation timing
      },
      error: (err) => {
        console.error('Failed to load audit logs:', err);
        this.isRefreshing = false;
      }
    });
  }

  refreshLogs(): void {
    this.fetchLogs();
  }

  extractUniqueActions(): void {
    const actions = this.logs.map(l => l.action).filter(a => !!a);
    this.uniqueActions = Array.from(new Set(actions)).sort();
  }

  onSearchChange(): void {
    this.currentPage = 1; // reset page to 1 on filter change
    this.applyFilters();
  }

  applyFilters(): void {
    let temp = [...this.logs];

    // Search query filter
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase().trim();
      temp = temp.filter(log => 
        (log.userEmail && log.userEmail.toLowerCase().includes(q)) ||
        (log.action && log.action.toLowerCase().includes(q)) ||
        (log.details && log.details.toLowerCase().includes(q)) ||
        (log.entityName && log.entityName.toLowerCase().includes(q))
      );
    }

    // Action select filter
    if (this.selectedActionFilter) {
      temp = temp.filter(log => log.action === this.selectedActionFilter);
    }

    this.filteredLogs = temp;
    this.totalPages = Math.ceil(this.filteredLogs.length / this.pageSize) || 1;
    this.updatePaginatedLogs();
  }

  updatePaginatedLogs(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedLogs = this.filteredLogs.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedLogs();
    }
  }

  getStartIndex(): number {
    return this.filteredLogs.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndIndex(): number {
    const end = this.currentPage * this.pageSize;
    return end > this.filteredLogs.length ? this.filteredLogs.length : end;
  }

  getPageRange(): number[] {
    const pages = [];
    const maxVisiblePages = 5;
    
    let start = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let end = Math.min(this.totalPages, start + maxVisiblePages - 1);
    
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  getActionBadgeClass(action: string): string {
    if (!action) return 'badge-neutral';
    const act = action.toUpperCase();
    if (act.startsWith('CREATION_') || act.includes('CREATE')) return 'badge-success';
    if (act.startsWith('SUPPRESSION_') || act.includes('DELETE') || act.includes('DROP')) return 'badge-danger';
    if (act.startsWith('MODIFICATION_') || act.includes('UPDATE') || act.includes('EDIT')) return 'badge-warning';
    if (act.startsWith('VALIDATION_') || act.includes('VALIDATE') || act.includes('SOUMISSION')) return 'badge-primary';
    if (act.includes('AI_') || act.includes('NVIDIA_') || act.includes('CLASSIFY') || act.includes('ANALYSIS')) return 'badge-info';
    return 'badge-neutral';
  }
}
