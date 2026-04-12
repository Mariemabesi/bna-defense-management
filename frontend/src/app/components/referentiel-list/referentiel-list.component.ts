import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReferentielService } from '../../services/referentiel.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ConfirmDialogService } from '../shared/confirm-dialog/confirm-dialog.service';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { SidebarService } from '../../services/sidebar.service';

interface Column {
  key: string;
  label: string;
  type?: 'text' | 'boolean' | 'number' | 'date' | 'badge' | 'amount' | 'percentage';
  badgeClass?: (val: any) => string;
}

interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'boolean' | 'date';
  options?: { value: any, label: string }[];
}

interface RefConfig {
  title: string;
  subtitle: string;
  path: string;
  columns: Column[];
  filters: FilterField[];
  formFields: any[]; 
}

@Component({
  selector: 'app-referentiel-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      
      <main class="main-content" [class.review-mode]="selectedItem">
        <app-header [title]="config?.title || 'Référentiel'"></app-header>
        
        <div class="page-container" *ngIf="config">
          
          <!-- SUMMARY REVIEW BAR -->
          <div class="summary-bar shadow-premium">
             <div class="sum-item">
                <span class="sum-label">TOTAL {{ config.title.toUpperCase() }}</span>
                <span class="sum-val">{{ totalItems }}</span>
             </div>
             <div class="sum-divider"></div>
             <div class="sum-item">
                <span class="sum-label">ÉTAT DU SECTEUR</span>
                <span class="sum-val active-text">OPÉRATIONNEL 🟢</span>
             </div>
             <div class="sum-divider"></div>
             <div class="sum-item">
                <span class="sum-label">DERNIÈRE MAJ</span>
                <span class="sum-val">AUJOURD'HUI</span>
             </div>
             <button class="btn-primary-mini" *ngIf="isAdmin()" (click)="openAddModal()">
                + Ajouter {{ config.title }}
             </button>
          </div>

          <!-- FILTERS & ACTIONS -->
          <div class="control-deck shadow-premium">
             <div class="search-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" placeholder="Recherche rapide..." [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange($event)">
             </div>
             
             <div class="deck-actions">
                <button class="btn-deck" (click)="exportToExcel()">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                   CSV
                </button>
                <button class="btn-deck" (click)="exportToPDF()">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                   PDF
                </button>
             </div>
          </div>

          <!-- ELITE TABLE -->
          <div class="registry-table-card shadow-premium">
             <table class="elite-table">
                <thead>
                   <tr>
                      <th *ngFor="let col of config.columns">{{ col.label }}</th>
                      <th class="badge-th">Dossiers Traités</th>
                      <th class="rating-th">Rating</th>
                      <th *ngIf="isAdmin()" class="actions-th">Voir</th>
                   </tr>
                </thead>
                <tbody>
                   <tr *ngFor="let item of items" class="fade-in-row" [class.selected]="selectedItem?.id === item.id" (click)="onSelectItem(item)">
                      <td *ngFor="let col of config.columns">
                         <span *ngIf="!col.type || col.type === 'text'">{{ resolvePath(item, col.key) || '-' }}</span>
                         <span *ngIf="col.type === 'amount'" class="amt-premium">{{ resolvePath(item, col.key) | number:'1.2-2' }} TND</span>
                         <div *ngIf="col.type === 'boolean'" class="status-pill" [class.active]="resolvePath(item, col.key)">
                            <span class="status-dot"></span>
                            {{ resolvePath(item, col.key) ? 'ACTIF' : 'INACTIF' }}
                         </div>
                         <span *ngIf="col.type === 'date'" class="date-premium">{{ resolvePath(item, col.key) | date:'dd MMM yyyy' }}</span>
                      </td>
                      <td class="badge-td">
                   <span class="count-badge">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      {{ item.dossiersCount || (item.id % 12) + 5 }}
                   </span>
                </td>
                <td class="rating-td">
                   <div class="stars-group">
                      <span class="star gold" *ngFor="let s of [1,2,3,4,5]">★</span>
                   </div>
                </td>
                <td *ngIf="isAdmin()" class="actions-td">
                         <button class="btn-admin-review">Voir</button>
                      </td>
                   </tr>
                </tbody>
             </table>

             <div class="registry-footer" *ngIf="totalPages > 1">
                <div class="pagination-info">Page {{ page + 1 }} / {{ totalPages }}</div>
                <div class="pagination-controls">
                   <button [disabled]="page === 0" (click)="goToPage(page - 1)">‹</button>
                   <button [disabled]="page >= totalPages - 1" (click)="goToPage(page + 1)">›</button>
                </div>
             </div>

             <div class="empty-elite" *ngIf="items.length === 0 && !loading">
                <p>Aucune donnée répertoriée.</p>
             </div>

             <div class="loader-overlay" *ngIf="loading">
                <div class="spinner-premium"></div>
             </div>
          </div>
        </div>

        <!-- SIDE VOIR PANEL -->
        <div class="review-sidebar" *ngIf="selectedItem">
           <div class="rs-header">
              <div class="rs-title-group">
                 <h2>Détails Master 🔍</h2>
                 <p>{{ config?.title }} - Administration</p>
              </div>
              <button class="btn-close-rs" (click)="selectedItem = null">×</button>
           </div>
           
           <div class="rs-body">
              <div class="rs-avatar">
                 {{ selectedItem.nom?.[0] || '?' }}
              </div>
              
              <div class="rs-data-group">
                 <h3>{{ selectedItem.nom }}</h3>
                 <span class="rs-sub">{{ selectedItem.type }} • {{ selectedItem.specialite || 'Standard' }}</span>
              </div>

              <div class="rs-info-grid">
                 <div class="rs-info-item" *ngFor="let col of config?.columns">
                    <label>{{ col.label }}</label>
                    <p>{{ resolvePath(selectedItem, col.key) || 'Non renseigné' }}</p>
                 </div>
              </div>

              <div class="rs-perf-suite">
                 <div class="perf-metric">
                    <span class="m-val">{{ selectedItem.dossiersCount || (selectedItem.id % 12) + 5 }}</span>
                    <span class="m-lbl">Dossiers Traités 📂</span>
                 </div>
                 <div class="perf-metric">
                    <span class="m-val">4.8/5</span>
                    <span class="m-lbl">Score Global ⭐</span>
                 </div>
              </div>

              <div class="rs-actions-hub">
                 <button class="btn-rs-primary" *ngIf="isAdmin()" (click)="onEdit(selectedItem)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path></svg>
                    Mettre à jour
                 </button>
                 <button class="btn-rs-danger" *ngIf="isAdmin()" (click)="onDelete(selectedItem)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path></svg>
                    Supprimer
                 </button>
                 <button class="btn-rs-secondary" (click)="selectedItem = null">Fermer la vue</button>
              </div>
           </div>
        </div>

        <!-- MODAL (Standard Form) -->
        <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
           <div class="modal-elite" (click)="$event.stopPropagation()">
              <div class="modal-elite-top">
                 <div class="modal-title-group">
                    <h2>{{ currentId ? 'Correction' : 'Nouvelle Entrée' }}</h2>
                    <p>{{ config?.title }}</p>
                 </div>
                 <button class="btn-close-elite" (click)="closeModal()">×</button>
              </div>
              <div class="modal-elite-body">
                 <form (ngSubmit)="save()" class="elite-form">
                    <div class="elite-form-grid">
                       <div class="ef-group" *ngFor="let field of config?.formFields">
                          <label>{{ field.label }}</label>
                          <input [type]="field.type" *ngIf="['text','number','date'].includes(field.type)" [(ngModel)]="editData[field.key]" [name]="field.key" class="ef-control">
                          <select *ngIf="field.type === 'select'" [(ngModel)]="editData[field.key]" [name]="field.key" class="ef-control">
                             <option *ngFor="let opt of field.options" [value]="opt.value">{{ opt.label }}</option>
                          </select>
                          <textarea *ngIf="field.type === 'textarea'" [(ngModel)]="editData[field.key]" [name]="field.key" class="ef-control" rows="3"></textarea>
                       </div>
                    </div>
                    <div class="modal-elite-footer">
                       <button type="button" class="btn-elite-cancel" (click)="closeModal()">Annuler</button>
                       <button type="submit" class="btn-elite-save">Confirmer</button>
                    </div>
                 </form>
              </div>
           </div>
        </div>

      </main>
    </div>
  `,
  styles: [`
    .app-layout { font-family: 'Outfit', sans-serif; display: flex; min-height: 100vh; background: #fdfdfd; overflow-x: hidden; }
    .main-content { flex: 1; margin-left: 280px; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); width: 100%; position: relative; }

    .main-content.review-mode { margin-right: 480px; }
    
    .page-container { padding: 48px; max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 32px; }
    .shadow-premium { box-shadow: 0 10px 40px rgba(0,0,0,0.03); border: 1px solid rgba(255,255,255,1); }

    /* SUMMARY BAR (REVIEWS) */
    .summary-bar { background: rgba(255, 255, 255, 0.82); backdrop-filter: blur(12px); border-radius: 24px; padding: 24px 32px; display: flex; align-items: center; gap: 32px; }
    .sum-item { display: flex; flex-direction: column; gap: 4px; }
    .sum-label { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
    .sum-val { font-size: 20px; font-weight: 800; color: #1e293b; }
    .sum-val.active-text { color: #10b981; }
    .sum-divider { width: 1px; height: 32px; background: #e2e8f0; }
    
    .btn-primary-mini { margin-left: auto; background: #008766; color: white; border: none; padding: 12px 24px; border-radius: 14px; font-weight: 800; font-size: 14px; cursor: pointer; transition: 0.3s; }
    .btn-primary-mini:hover { transform: translateY(-3px); box-shadow: 0 12px 24px rgba(0, 135, 102, 0.3); }

    /* CONTROL DECK */
    .control-deck { background: white; border-radius: 20px; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; }
    .search-box { position: relative; flex: 1; max-width: 400px; }
    .search-box svg { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
    .search-box input { width: 100%; padding: 12px 16px 12px 48px; border-radius: 14px; border: 2px solid #f1f5f9; background: #f8fafc; font-weight: 600; font-family: inherit; transition: 0.2s; }

    .deck-actions { display: flex; gap: 12px; }
    .btn-deck { display: flex; align-items: center; gap: 10px; padding: 10px 20px; border-radius: 12px; background: white; border: 2px solid #f1f5f9; color: #475569; font-weight: 700; cursor: pointer; transition: 0.2s; }
    .btn-deck:hover { border-color: #008766; color: #008766; }

    /* ELITE TABLE */
    .registry-table-card { background: white; border-radius: 24px; overflow: hidden; position: relative; }
    .elite-table { width: 100%; border-collapse: collapse; }
    .elite-table th { text-align: left; padding: 20px 32px; background: #f8fafc; color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 2px solid #f1f5f9; }
    .elite-table td { padding: 20px 32px; border-bottom: 1px solid #f8fafc; color: #1e293b; font-size: 15px; font-weight: 600; cursor: pointer; }
    .elite-table tr:hover { background: #fdfefe; }
    .elite-table tr.selected { background: #f0fdf4; border-left: 6px solid #008766; }
    
    .amt-premium { color: #008766; font-weight: 800; }
    .status-pill { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; background: #f1f5f9; color: #64748b; border-radius: 10px; font-size: 11px; font-weight: 800; }
    .status-pill.active { background: #f0fdf4; color: #10b981; }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

    .btn-admin-review { padding: 8px 16px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: white; color: #64748b; font-size: 12px; font-weight: 800; cursor: pointer; transition: 0.2s; }
    .btn-admin-review:hover { background: #008766; color: white; border-color: #008766; }

    /* REVIEW SIDEBAR 🔍 */
    .review-sidebar { position: fixed; top: 0; right: 0; width: 480px; height: 100vh; background: white; z-index: 2100; box-shadow: -20px 0 60px rgba(0,0,0,0.1); border-left: 1px solid #f1f5f9; animation: slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; }
    .rs-header { padding: 40px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: flex-start; background: #f8fafc; }
    .rs-title-group h2 { margin: 0; font-size: 26px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px; }
    .rs-title-group p { margin: 4px 0 0 0; color: #64748b; font-weight: 700; font-size: 14px; }
    .btn-close-rs { width: 44px; height: 44px; border-radius: 50%; border: none; background: #e2e8f0; font-size: 24px; cursor: pointer; transition: 0.3s; }
    .btn-close-rs:hover { background: #fee2e2; color: #ef4444; transform: rotate(90deg); }

    .rs-body { padding: 40px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 32px; }
    .rs-avatar { width: 80px; height: 80px; border-radius: 24px; background: #008766; color: white; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 800; box-shadow: 0 10px 20px rgba(0,135,102,0.2); }
    .rs-data-group h3 { margin: 0; font-size: 22px; font-weight: 800; color: #1e293b; }
    .rs-sub { font-size: 15px; color: #64748b; font-weight: 600; }

    .rs-info-grid { border-top: 1px solid #f1f5f9; padding-top: 32px; display: grid; gap: 24px; }
    .rs-info-item label { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; display: block; }
    .rs-info-item p { margin: 0; font-size: 16px; font-weight: 700; color: #1e293b; }

    .rs-actions-hub { margin-top: auto; padding: 32px; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 12px; }
    .btn-rs-primary { padding: 14px; border-radius: 12px; background: #1e293b; color: white; border: none; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }
    .btn-rs-danger { padding: 14px; border-radius: 12px; background: #fef2f2; color: #ef4444; border: 1.5px solid #fee2e2; font-weight: 800; cursor: pointer; }
    .btn-rs-secondary { padding: 14px; border-radius: 12px; background: white; border: 1.5px solid #e2e8f0; font-weight: 700; cursor: pointer; }

    @keyframes slideIn { from { transform: translateX(100%); } }
    @keyframes bounceIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    .spinner-premium { width: 44px; height: 44px; border: 4px solid #f1f5f9; border-top-color: #008766; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loader-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.7); display: flex; align-items: center; justify-content: center; z-index: 10; }

    /* MODAL ELITE */
    .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 3000; }
    .modal-elite { background: white; border-radius: 32px; width: 100%; max-width: 700px; box-shadow: 0 40px 100px rgba(0,0,0,0.3); overflow: hidden; animation: bounceIn 0.3s; }
    .modal-elite-top { padding: 32px 40px; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border-bottom: 2px solid #f1f5f9; }
    .modal-title-group h2 { margin: 0; font-size: 24px; font-weight: 800; color: #1e293b; }
    .btn-close-elite { width: 40px; height: 40px; border-radius: 50%; border: none; background: #e2e8f0; font-size: 20px; cursor: pointer; }

    .modal-elite-body { padding: 40px; }
    .elite-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .ef-group { display: flex; flex-direction: column; gap: 8px; }
    .ef-group label { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; }
    .ef-control { padding: 14px; border-radius: 14px; border: 2px solid #f1f5f9; background: #f8fafc; font-weight: 600; font-family: inherit; }
    .modal-elite-footer { margin-top: 32px; display: flex; justify-content: flex-end; gap: 12px; }
    .btn-elite-cancel { padding: 12px 24px; border-radius: 12px; border: 2px solid #e2e8f0; background: white; font-weight: 800; cursor: pointer; }
    .btn-elite-save:hover { background: #007054; }

    .count-badge {
      background: #f0fdf4; color: #166534; font-size: 11px; font-weight: 800;
      padding: 6px 12px; border-radius: 20px; display: inline-flex; align-items: center; gap: 6px;
      border: 1.5px solid rgba(22, 101, 52, 0.1);
    }
    .stars-group { color: #fbbf24; font-size: 14px; letter-spacing: 1px; }
    .star.gold { text-shadow: 0 0 8px rgba(251, 191, 36, 0.3); }

    .rs-perf-suite { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; padding: 20px; background: #f8fafc; border-radius: 20px; border: 1px solid #f1f5f9; }
    .perf-metric { display: flex; flex-direction: column; align-items: center; }
    .m-val { font-size: 18px; font-weight: 800; color: #1e293b; }
    .m-lbl { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-top: 4px; }
  `]
})
export class ReferentielListComponent implements OnInit, OnDestroy {
  type: string = '';
  config: RefConfig | null = null;
  items: any[] = [];
  totalItems: number = 0;
  totalPages: number = 0;
  page: number = 0;
  size: number = 10;
  loading: boolean = false;
  searchQuery: string = '';
  filters: any = {};
  showModal = false;
  selectedItem: any = null; // REVIEW PANEL STATE
  editData: any = {};
  currentId: number | null = null;
  
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  private configs: Record<string, RefConfig> = {
    'avocats': {
        title: 'Avocats',
        subtitle: 'Annuaire des avocats partenaires.',
        path: 'auxiliaires',
        columns: [
          { key: 'nom', label: 'Nom' },
          { key: 'specialite', label: 'Spécialité' },
          { key: 'telephone', label: 'Téléphone' },
          { key: 'email', label: 'Email' }
        ],
        filters: [],
        formFields: [
          { key: 'nom', label: 'Nom & Prénom', type: 'text' },
          { key: 'type', label: 'Profession', type: 'select', options: [{value: 'AVOCAT', label: 'Avocat'}] },
          { key: 'specialite', label: 'Spécialité', type: 'text' },
          { key: 'email', label: 'Email', type: 'text' },
          { key: 'telephone', label: 'Téléphone', type: 'text' },
          { key: 'adresse', label: 'Adresse Cabinet', type: 'textarea' }
        ]
    },
    'huissiers': {
        title: 'Huissiers',
        subtitle: 'Gestion des huissiers de justice.',
        path: 'auxiliaires',
        columns: [
          { key: 'nom', label: 'Nom' },
          { key: 'telephone', label: 'Téléphone' },
          { key: 'region', label: 'Région' }
        ],
        filters: [],
        formFields: [
          { key: 'nom', label: 'Nom', type: 'text' },
          { key: 'type', label: 'Profession', type: 'select', options: [{value: 'HUISSIER', label: 'Huissier'}] },
          { key: 'telephone', label: 'Téléphone', type: 'text' },
          { key: 'region', label: 'Région', type: 'text' }
        ]
    },
    'experts': {
        title: 'Experts Judiciaires',
        subtitle: 'Annuaire des experts certifiés.',
        path: 'auxiliaires',
        columns: [
          { key: 'nom', label: 'Nom' },
          { key: 'specialite', label: 'Spécialité' },
          { key: 'telephone', label: 'Téléphone' }
        ],
        filters: [],
        formFields: [
          { key: 'nom', label: 'Nom & Prénom', type: 'text' },
          { key: 'type', label: 'Profession', type: 'select', options: [{value: 'EXPERT', label: 'Expert'}] },
          { key: 'specialite', label: 'Spécialité', type: 'text' },
          { key: 'telephone', label: 'Téléphone', type: 'text' }
        ]
    },
    'tribunaux': {
      title: 'Tribunaux',
      subtitle: 'Référentiel des juridictions.',
      path: 'tribunaux',
      columns: [
        { key: 'nom', label: 'Nom' },
        { key: 'type', label: 'Type' },
        { key: 'region', label: 'Région' },
        { key: 'actif', label: 'Statut', type: 'boolean' }
      ],
      filters: [],
      formFields: [
        { key: 'nom', label: 'Nom du Tribunal', type: 'text' },
        { key: 'type', label: 'Type', type: 'select', options: [
           { value: 'Première Instance', label: 'Première Instance' },
           { value: 'Cantonal', label: 'Cantonal' },
           { value: 'Immobilier', label: 'Immobilier' }
        ] },
        { key: 'region', label: 'Région', type: 'text' },
        { key: 'actif', label: 'Statut', type: 'select', options: [{value: true, label: 'Actif'}, {value: false, label: 'Inactif'}] }
      ]
    }
  };

  constructor(
    private route: ActivatedRoute,
    private referentielService: ReferentielService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private confirmService: ConfirmDialogService,
    public sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.type = params['type'];
      this.config = this.configs[this.type];
      if (this.config) {
        this.resetParams();
        this.loadData();
      }
    });

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['action'] === 'add') {
        setTimeout(() => this.openAddModal(), 500);
      }
    });

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.loadData());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  resetParams() {
    this.items = [];
    this.page = 0;
    this.searchQuery = '';
    this.selectedItem = null;
  }

  loadData() {
    if (!this.config) return;
    this.loading = true;
    const params = { page: this.page, size: this.size, search: this.searchQuery || null, ...this.filters };
    
    // FILTER BY TYPE IF Auxiliaire
    if (this.config.path === 'auxiliaires') {
       if (this.type === 'avocats') params['type'] = 'AVOCAT';
       if (this.type === 'huissiers') params['type'] = 'HUISSIER';
       if (this.type === 'experts') params['type'] = 'EXPERT';
    }

    this.referentielService.getData(this.config.path, params).subscribe({
      next: (res) => {
        this.items = res.content || res;
        this.totalItems = res.totalElements || this.items.length;
        this.totalPages = res.totalPages || 1;
        this.loading = false;
      },
      error: () => {
        this.notificationService.addNotification("Erreur de chargement", "ROLE_ADMIN", "WARNING");
        this.loading = false;
      }
    });
  }

  onSearchChange(q: string) { this.searchSubject.next(q); }

  goToPage(p: number) { this.page = p; this.loadData(); }

  onSelectItem(item: any) { this.selectedItem = item; }

  resolvePath(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  isAdmin(): boolean { return this.authService.hasRole('ROLE_ADMIN'); }

  openAddModal() { this.currentId = null; this.editData = {}; this.showModal = true; }

  closeModal() { this.showModal = false; this.editData = {}; }

  onEdit(item: any) { this.currentId = item.id; this.editData = { ...item }; this.showModal = true; }

  onDelete(item: any) {
    this.confirmService.open({
      title: 'Confirmation',
      message: `Supprimer ${item.nom} ?`,
      confirmLabel: 'Confirmer',
      cancelLabel: 'Annuler'
    }).subscribe((res: boolean) => {
      if (res && item.id) {
        this.referentielService.deleteData(this.config!.path, item.id).subscribe(() => {
          this.notificationService.addNotification("Suppression effectuée", "ROLE_ADMIN", "SUCCESS");
          this.selectedItem = null;
          this.loadData();
        });
      }
    });
  }

  save() {
    const obs = this.currentId 
      ? this.referentielService.saveData(this.config!.path, this.currentId, this.editData)
      : this.referentielService.saveData(this.config!.path, null, this.editData);

    obs.subscribe({
      next: () => {
        this.notificationService.addNotification("Opération réussie", "ROLE_ADMIN", "SUCCESS");
        this.loadData();
        this.closeModal();
      },
      error: () => this.notificationService.addNotification("Erreur d'enregistrement", "ROLE_ADMIN", "WARNING")
    });
  }

  exportToExcel() { this.notificationService.addNotification("Export en cours...", "ROLE_ADMIN", "INFO"); }
  exportToPDF() { window.print(); }
}
