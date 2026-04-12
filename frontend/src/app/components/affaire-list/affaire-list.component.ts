import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AffaireService, Affaire } from '../../services/affaire.service';

@Component({
  selector: 'app-affaire-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-container">
      <!-- DASHBOARD HEADER -->
      <div class="premium-header shadow-premium animate-fade-in">
        <div class="header-left">
           <h1>📁 Gestion des Affaires</h1>
           <p>Consultez et gérez l'ensemble des procédures judiciaires en cours</p>
        </div>
        <div class="header-actions">
           <button class="btn-secondary" (click)="exportListPdf()">
             <span>📥</span> Exporter PDF
           </button>
           <button class="btn-primary" routerLink="/nouvelle-affaire">
             <span>+</span> Nouvelle Affaire
           </button>
        </div>
      </div>

      <!-- FILTER BAR -->
      <div class="filter-bar glass-card shadow-soft animate-slide-up">
        <div class="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" [(ngModel)]="searchTerm" (input)="onFilter()" placeholder="Rechercher par référence ou titre...">
        </div>
        <div class="filters">
          <select [(ngModel)]="filterType" (change)="onFilter()">
            <option value="">Tous les Types</option>
            <option value="CREDIT">💰 Crédit</option>
            <option value="LITIGE">⚖️ Litige</option>
            <option value="GARANTIE">🛡️ Garantie</option>
            <option value="CIVIL">🏦 Civil</option>
            <option value="PENAL">🚨 Pénal</option>
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

      <!-- STATS BAR -->
      <div class="stats-row animate-slide-up">
        <div class="stat-card">
          <div class="stat-val">{{ affaires.length }}</div>
          <div class="stat-label">Total des Affaires</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">{{ countByStatut('EN_COURS') }}</div>
          <div class="stat-label">En Cours</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">{{ countByStatut('GAGNE') }}</div>
          <div class="stat-label">Gagnées</div>
        </div>
      </div>

      <!-- LISTABLE AREA -->
      <div class="glass-table-wrapper shadow-premium animate-slide-up">
        <table class="premium-table">
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
            <tr *ngFor="let a of filteredAffaires" class="table-row">
              <td class="bold-cell">{{ a.referenceJudiciaire }}</td>
              <td>{{ a.titre }}</td>
              <td><span class="badge-type">{{ a.type }}</span></td>
              <td>
                <span class="status-pill" [ngClass]="a.statut">
                  {{ a.statut }}
                </span>
              </td>
              <td>{{ a.dateOuverture | date:'dd/MM/yyyy' }}</td>
              <td class="actions-cell">
                <button class="btn-icon" (click)="viewDetails(a)" title="Détails">👁️</button>
                <button class="btn-icon" (click)="exportSinglePdf(a)" title="Générer PDF">📄</button>
              </td>
            </tr>
            <tr *ngIf="filteredAffaires.length === 0">
              <td colspan="6" class="empty-state">
                <div class="empty-msg">🔍 Aucune affaire ne correspond à vos filtres</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 40px; background: #fafbfc; min-height: 100vh; }
    
    .premium-header {
      background: white; border-radius: 20px; padding: 40px;
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 30px; border: 1px solid #f1f5f9;
    }
    .header-left h1 { font-size: 26px; color: #1e293b; margin: 0; }
    .header-left p { color: #64748b; margin: 8px 0 0; }
    .header-actions { display: flex; gap: 15px; position: relative; z-index: 100; }

    .filter-bar { 
      background: white; padding: 15px 30px; border-radius: 18px; margin-bottom: 30px;
      display: flex; justify-content: space-between; align-items: center; gap: 20px;
      border: 1px solid #f1f5f9; position: relative; z-index: 50;
    }
    .search-box { flex: 1; position: relative; display: flex; align-items: center; }
    .search-box svg { position: absolute; left: 15px; color: #94a3b8; }
    .search-box input { width: 100%; padding: 12px 15px 12px 45px; border-radius: 12px; border: 1.5px solid #f1f5f9; background: #f8fafc; font-size: 14px; outline: none; }
    .search-box input:focus { border-color: #008766; background: white; }
    .filters { display: flex; gap: 12px; }
    .filters select { padding: 10px 15px; border-radius: 10px; border: 1.5px solid #f1f5f9; font-size: 13px; font-weight: 600; color: #475569; outline: none; background: #f8fafc; cursor: pointer; }

    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; position: relative; z-index: 10; }
    .stat-card { background: white; padding: 25px; border-radius: 18px; border: 1px solid #f1f5f9; text-align: center; }
    .stat-val { font-size: 28px; font-weight: 800; color: #1e293b; }
    .stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; margin-top: 5px; }

    .btn-primary { background: #008766; color: white; padding: 12px 24px; border-radius: 12px; font-weight: 700; border: none; cursor: pointer; transition: 0.3s; }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 135, 102, 0.3); }
    .btn-secondary { background: #f1f5f9; color: #475569; padding: 12px 20px; border-radius: 12px; font-weight: 700; border: none; cursor: pointer; transition: 0.2s; }
    .btn-secondary:hover { background: #e2e8f0; }

    .glass-table-wrapper { background: white; border-radius: 24px; padding: 10px; border: 1px solid #f1f5f9; }
    .premium-table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 18px 20px; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 800; }
    td { padding: 18px 20px; border-bottom: 1px solid #f8fafc; font-size: 14px; }
    .bold-cell { font-weight: 700; color: #1e293b; }
    
    .badge-type { background: #f1f5f9; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; color: #475569; }

    .status-pill { padding: 6px 14px; border-radius: 50px; font-size: 11px; font-weight: 800; }
    .status-pill.EN_COURS { background: #e0f2fe; color: #0369a1; }
    .status-pill.GAGNE { background: #dcfce7; color: #15803d; }
    .status-pill.PERDU { background: #fee2e2; color: #b91c1c; }

    .actions-cell { display: flex; gap: 8px; }
    .btn-icon { background: #f8fafc; border: 1px solid #f1f5f9; padding: 8px; border-radius: 10px; cursor: pointer; transition: 0.2s; font-size: 16px; }
    .btn-icon:hover { background: #f1f5f9; border-color: #e2e8f0; transform: scale(1.1); }

    .empty-state { padding: 60px; text-align: center; color: #94a3b8; }

    .animate-fade-in { animation: fadeIn 0.6s ease-out; }
    .animate-slide-up { animation: slideUp 0.6s ease-out both; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AffaireListComponent implements OnInit {
  affaires: Affaire[] = [];
  filteredAffaires: Affaire[] = [];
  
  searchTerm: string = '';
  filterType: string = '';
  filterStatut: string = '';

  constructor(private affaireService: AffaireService) {}

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
      
      const matchType = !this.filterType || a.type === this.filterType;
      const matchStatut = !this.filterStatut || a.statut === this.filterStatut;

      return matchSearch && matchType && matchStatut;
    });
  }

  countByStatut(statut: string): number {
    return this.affaires.filter(a => a.statut === statut).length;
  }

  viewDetails(a: Affaire) {
    // Navigate to detail or open modal (to be implemented)
    console.log('View details', a);
  }

  exportListPdf() {
    this.affaireService.exportListPdf().subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Liste_Affaires_${new Date().getTime()}.pdf`;
      a.click();
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
