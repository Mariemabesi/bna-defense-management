import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AffaireService, Affaire } from '../../services/affaire.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-affaire-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>

      <main class="main-content">
        <app-header title="Gestion des Affaires"></app-header>

        <div class="dashboard-content">

          <!-- PAGE HEADER -->
          <div class="page-header-actions slideIn">
            <div class="page-title-block">
              <h2>Gestion des Affaires</h2>
              <p class="page-subtitle">Consultez et gérez l'ensemble des procédures judiciaires en cours.</p>
            </div>
            <div class="header-btns">
              <button class="btn-secondary" (click)="exportListPdf()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Exporter PDF
              </button>
              <button class="btn-primary" routerLink="/nouvelle-affaire">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Nouvelle Affaire
              </button>
            </div>
          </div>

          <!-- STATS -->
          <div class="stats-row slideIn">
            <div class="stat-card">
              <div class="stat-val">{{ affaires.length }}</div>
              <div class="stat-label">Total des Affaires</div>
            </div>
            <div class="stat-card success">
              <div class="stat-val">{{ countByStatut('EN_COURS') }}</div>
              <div class="stat-label">En Cours</div>
            </div>
            <div class="stat-card green">
              <div class="stat-val">{{ countByStatut('GAGNE') }}</div>
              <div class="stat-label">Gagnées</div>
            </div>
            <div class="stat-card danger">
              <div class="stat-val">{{ countByStatut('PERDU') }}</div>
              <div class="stat-label">Perdues</div>
            </div>
          </div>

          <!-- FILTER BAR -->
          <div class="tabs-filter-container slideIn">
            <div class="search-filter-bar">
              <div class="search-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" [(ngModel)]="searchTerm" (input)="onFilter()" placeholder="Rechercher par référence ou titre...">
              </div>
              <div class="filter-select-group">
                <select [(ngModel)]="filterType" (change)="onFilter()">
                  <option value="">Tous les Types</option>
                  <option value="CIVIL">🏦 Civil</option>
                  <option value="PENAL">🚨 Pénal</option>
                  <option value="CREDIT">💰 Crédit</option>
                  <option value="LITIGE">⚖️ Litige</option>
                  <option value="GARANTIE">🛡️ Garantie</option>
                  <option value="PRUDHOMME">⚖️ Prud'hommes</option>
                  <option value="PATRIMOINE_IMMOBILIER">🏠 Immobilier</option>
                  <option value="IMM">🏠 IMM</option>
                </select>
                <select [(ngModel)]="filterStatut" (change)="onFilter()">
                  <option value="">Tous les Statuts</option>
                  <option value="EN_COURS">🔵 En Cours</option>
                  <option value="GAGNE">🟢 Gagné</option>
                  <option value="PERDU">🔴 Perdu</option>
                  <option value="CLASSE">⚪ Classé</option>
                </select>
              </div>
            </div>
          </div>

          <!-- TABLE -->
          <div class="table-container slideIn">
            <table>
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Titre / Objet</th>
                  <th>Type</th>
                  <th>Statut</th>
                  <th>Date Ouverture</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let a of filteredAffaires">
                  <td><strong class="ref-code">{{ a.referenceJudiciaire }}</strong></td>
                  <td>{{ a.titre }}</td>
                  <td><span class="badge-type">{{ a.type }}</span></td>
                  <td>
                    <span class="status-pill" [ngClass]="a.statut">{{ a.statut }}</span>
                  </td>
                  <td>{{ a.dateOuverture | date:'dd/MM/yyyy' }}</td>
                  <td>
                    <div class="actions-cell">
                      <button class="btn-icon" (click)="viewDetails(a)" title="Détails">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </button>
                      <button class="btn-icon" (click)="exportSinglePdf(a)" title="Générer PDF">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="filteredAffaires.length === 0">
                  <td colspan="6" class="empty-row">
                    <div class="empty-state-inline">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                      <p>Aucune affaire ne correspond à vos filtres.</p>
                      <button class="btn-primary" routerLink="/nouvelle-affaire">Créer une affaire</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  `,
  styles: [`
    /* ============================================
       PLATFORM CSS — matches MesDossiers exactly
       ============================================ */
    .dashboard-content { padding: 40px; }

    /* Page header */
    .page-header-actions {
      display: flex; justify-content: space-between;
      align-items: flex-start; margin-bottom: 32px;
    }
    .page-title-block h2 { font-size: 24px; font-weight: 800; color: #1e293b; margin: 0; }
    .page-subtitle { font-size: 14px; color: #64748b; margin: 4px 0 0; }
    .header-btns { display: flex; align-items: center; gap: 16px; }

    /* Stats */
    .stats-row {
      display: flex; gap: 16px; margin-bottom: 28px; flex-wrap: wrap;
    }
    .stat-card {
      flex: 1; min-width: 120px; background: white;
      border: 1px solid #e2e8f0; border-radius: 16px;
      padding: 20px 24px; text-align: center;
    }
    .stat-val { font-size: 28px; font-weight: 800; color: #1e293b; }
    .stat-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
    .stat-card.success { border-left: 3px solid #3b82f6; }
    .stat-card.success .stat-val { color: #2563eb; }
    .stat-card.green { border-left: 3px solid #10b981; }
    .stat-card.green .stat-val { color: #059669; }
    .stat-card.danger { border-left: 3px solid #ef4444; }
    .stat-card.danger .stat-val { color: #dc2626; }

    /* Buttons */
    .btn-primary {
      background: #008766; color: white; border: none;
      padding: 12px 24px; border-radius: 12px; font-weight: 700;
      font-size: 14px; cursor: pointer; display: flex; align-items: center;
      gap: 8px; transition: all 0.3s;
    }
    .btn-primary:hover { background: #00684d; transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,135,102,0.3); }
    .btn-secondary {
      background: #f1f5f9; color: #475569; border: none;
      padding: 12px 20px; border-radius: 12px; font-weight: 700;
      font-size: 14px; cursor: pointer; display: flex; align-items: center;
      gap: 8px; transition: all 0.2s;
    }
    .btn-secondary:hover { background: #e2e8f0; }

    /* Search & Filter bar */
    .tabs-filter-container { margin-bottom: 24px; }
    .search-filter-bar {
      background: white; border: 1px solid #e2e8f0; border-radius: 16px;
      padding: 14px 24px; display: flex; align-items: center; gap: 20px;
      flex-wrap: wrap;
    }
    .search-box {
      flex: 1; display: flex; align-items: center; gap: 10px;
      background: #f8fafc; border: 1.5px solid #f1f5f9; border-radius: 10px;
      padding: 10px 16px; min-width: 200px;
    }
    .search-box svg { color: #94a3b8; flex-shrink: 0; }
    .search-box input {
      border: none; background: transparent; width: 100%;
      font-size: 14px; outline: none; color: #1e293b; font-family: inherit;
    }
    .filter-select-group { display: flex; gap: 12px; }
    .filter-select-group select {
      padding: 10px 16px; border-radius: 10px; border: 1.5px solid #e2e8f0;
      font-size: 13px; font-weight: 600; color: #475569; background: #f8fafc;
      cursor: pointer; outline: none;
    }
    .filter-select-group select:focus { border-color: #008766; background: white; }

    /* Table */
    .table-container {
      background: white; border-radius: 20px;
      border: 1px solid #e2e8f0; overflow: hidden;
    }
    table { width: 100%; border-collapse: collapse; }
    thead { background: #f8fafc; }
    th {
      text-align: left; padding: 16px 24px;
      font-size: 11px; font-weight: 800; color: #64748b;
      text-transform: uppercase; letter-spacing: 0.8px;
      border-bottom: 1px solid #e2e8f0;
    }
    td {
      padding: 18px 24px; border-bottom: 1px solid #f8fafc;
      font-size: 14px; color: #334155; vertical-align: middle;
    }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #fcfcfd; }

    .ref-code { font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; color: #1e293b; }
    .badge-type {
      background: #f1f5f9; padding: 4px 10px; border-radius: 6px;
      font-size: 11px; font-weight: 800; color: #475569;
    }

    /* Status pills */
    .status-pill {
      padding: 5px 12px; border-radius: 50px;
      font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .status-pill.EN_COURS { background: #e0f2fe; color: #0369a1; }
    .status-pill.GAGNE    { background: #dcfce7; color: #15803d; }
    .status-pill.PERDU    { background: #fee2e2; color: #b91c1c; }
    .status-pill.CLASSE   { background: #f1f5f9; color: #64748b; }

    /* Action buttons */
    .actions-cell { display: flex; gap: 8px; align-items: center; }
    .btn-icon {
      width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
      border-radius: 10px; border: 1.5px solid #e2e8f0;
      background: #f8fafc; color: #64748b; cursor: pointer; transition: all 0.2s;
    }
    .btn-icon:hover { background: white; border-color: #008766; color: #008766; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,135,102,0.15); }

    /* Empty state */
    .empty-row { padding: 80px; text-align: center; }
    .empty-state-inline { display: flex; flex-direction: column; align-items: center; gap: 16px; color: #94a3b8; }
    .empty-state-inline svg { opacity: 0.3; }
    .empty-state-inline p { font-size: 16px; font-weight: 600; color: #94a3b8; margin: 0; }

    /* Animation */
    .slideIn { animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 1024px) {
      .dashboard-content { padding: 24px; }
      .page-header-actions { flex-direction: column; gap: 16px; }
      .search-filter-bar { flex-direction: column; align-items: stretch; }
      .stats-row { flex-wrap: wrap; }
    }
  `]
})
export class AffaireListComponent implements OnInit {
  affaires: Affaire[] = [];
  filteredAffaires: Affaire[] = [];

  searchTerm = '';
  filterType = '';
  filterStatut = '';

  constructor(
    private affaireService: AffaireService,
    private router: Router,
    public sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    this.loadAffaires();
  }

  loadAffaires() {
    this.affaireService.getAllAffaires().subscribe(data => {
      this.affaires = data;
      this.onFilter();
    });
  }

  onFilter() {
    this.filteredAffaires = this.affaires.filter(a => {
      const matchSearch = !this.searchTerm ||
        (a.referenceJudiciaire && a.referenceJudiciaire.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (a.titre && a.titre.toLowerCase().includes(this.searchTerm.toLowerCase()));
      const matchType   = !this.filterType   || a.type   === this.filterType;
      const matchStatut = !this.filterStatut || a.statut === this.filterStatut;
      return matchSearch && matchType && matchStatut;
    });
  }

  countByStatut(statut: string): number {
    return this.affaires.filter(a => a.statut === statut).length;
  }

  viewDetails(a: Affaire) {
    this.router.navigate(['/affaires', a.id]);
  }

  exportListPdf() {
    this.affaireService.exportListPdf().subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Liste_Affaires_${new Date().getTime()}.pdf`;
      link.click();
    });
  }

  exportSinglePdf(a: Affaire) {
    this.affaireService.exportSinglePdf(a.id!).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Affaire_${a.referenceJudiciaire}.pdf`;
      link.click();
    });
  }
}
