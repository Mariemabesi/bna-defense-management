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
  formFields: any[]; // for modal
}

@Component({
  selector: 'app-referentiel-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      
      <main class="main-content">
        <app-header [title]="config?.title || 'Référentiel'"></app-header>
        
        <div class="page-container" *ngIf="config">
          <!-- TOP HEADER WITH ACTIONS -->
          <div class="header-banner shadow-premium">
             <div class="banner-info">
                <h1>{{ config.title }}</h1>
                <p>{{ config.subtitle }}</p>
             </div>
             <div class="banner-actions">
                <button class="btn-export secondary" (click)="exportToExcel()">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Excel
                </button>
                <button class="btn-export secondary" (click)="exportToPDF()">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                  PDF
                </button>
                <button class="btn-add primary" *ngIf="isAdmin()" (click)="openAddModal()">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Nouveau
                </button>
             </div>
          </div>

          <!-- FILTERS BAR -->
          <div class="filter-bar shadow-premium">
             <div class="search-input">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" placeholder="Rechercher..." [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange($event)">
             </div>
             
             <div class="extra-filters" *ngIf="config.filters.length > 0">
                <ng-container *ngFor="let f of config.filters">
                   <!-- Select type filter -->
                   <select *ngIf="f.type === 'select'" [(ngModel)]="filters[f.key]" (change)="loadData()" class="filter-select">
                      <option [value]="null">{{ f.label }} (Tous)</option>
                      <option *ngFor="let opt of f.options" [value]="opt.value">{{ opt.label }}</option>
                   </select>
                   <!-- Boolean type filter -->
                   <select *ngIf="f.type === 'boolean'" [(ngModel)]="filters[f.key]" (change)="loadData()" class="filter-select">
                      <option [value]="null">{{ f.label }} (Tous)</option>
                      <option [value]="true">Actif</option>
                      <option [value]="false">Inactif</option>
                   </select>
                </ng-container>
             </div>

             <div class="results-info">
                <span>{{ totalItems }} resultats</span>
             </div>
          </div>

          <!-- DATA LIST / GRID -->
          <div class="table-card shadow-premium" [class.grid-view]="isAuxiliaireView()">
             <!-- Standard Table for Jurisdictions / Procedures -->
             <table class="data-table" *ngIf="!isAuxiliaireView()">
                <thead>
                   <tr>
                      <th *ngFor="let col of config.columns">{{ col.label }}</th>
                      <th *ngIf="isAdmin()" class="actions-col">Actions</th>
                   </tr>
                </thead>
                <tbody>
                   <tr *ngFor="let item of items" class="fade-in">
                      <td *ngFor="let col of config.columns">
                         <!-- Text / Default -->
                         <span *ngIf="!col.type || col.type === 'text'">{{ resolvePath(item, col.key) || '-' }}</span>
                         
                         <!-- Amount TND -->
                         <span *ngIf="col.type === 'amount'" class="val-amount">{{ resolvePath(item, col.key) | number:'1.2-2' }} TND</span>
                         
                         <!-- Percentage -->
                         <span *ngIf="col.type === 'percentage'" class="val-pct">{{ resolvePath(item, col.key) }}%</span>
                         
                         <!-- Badge -->
                         <span *ngIf="col.type === 'badge'" class="status-badge" [ngClass]="col.badgeClass ? col.badgeClass(resolvePath(item, col.key)) : ''">
                            {{ resolvePath(item, col.key) }}
                         </span>
                         
                         <!-- Boolean/Actif -->
                         <span *ngIf="col.type === 'boolean'">
                            <span class="dot" [class.active]="resolvePath(item, col.key)"></span>
                            {{ resolvePath(item, col.key) ? 'Actif' : 'Inactif' }}
                         </span>

                         <!-- Date -->
                         <span *ngIf="col.type === 'date'">{{ resolvePath(item, col.key) | date:'dd/MM/yyyy' }}</span>
                      </td>
                      <td *ngIf="isAdmin()" class="actions-cell">
                         <button class="btn-micro" (click)="onEdit(item)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                         </button>
                         <button class="btn-micro delete" (click)="onDelete(item)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                         </button>
                      </td>
                   </tr>
                </tbody>
             </table>

             <!-- Premium Cards for Avocats / Huissiers -->
             <div class="grid-container" *ngIf="isAuxiliaireView()">
                <div class="aux-card fade-in" *ngFor="let item of sortedItems()">
                   <div class="card-status-dot active"></div>
                   <div class="card-prio-ribbon" *ngIf="item.dossiersCount > 5">TOP TIER</div>
                   
                   <div class="card-head">
                      <div class="avatar">{{ item.nom[0] }}</div>
                      <div class="head-info">
                         <h3>{{ item.nom }}</h3>
                         <span class="specialty">{{ item.specialite || (type === 'huissiers' ? 'Huissier de Justice' : 'Généraliste') }}</span>
                      </div>
                   </div>

                   <div class="card-metrics">
                      <div class="metric">
                         <span class="m-val">{{ item.rating || '4.8' }} ⭐</span>
                         <span class="m-label">Score BNA</span>
                      </div>
                      <div class="metric">
                         <span class="m-val">{{ item.dossiersCount || 0 }}</span>
                         <span class="m-label">Affaires</span>
                      </div>
                   </div>

                   <div class="card-contacts">
                      <div class="contact-row">
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.32-2.32a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                         <span>{{ item.telephone || '—' }}</span>
                      </div>
                      <div class="contact-row">
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                         <span>{{ item.email || '—' }}</span>
                      </div>
                   </div>

                   <div class="card-footer" *ngIf="isAdmin()">
                      <button (click)="onEdit(item)" class="btn-card second">Modifier</button>
                      <button (click)="onDelete(item)" class="btn-card danger">Supprimer</button>
                   </div>
                </div>
             </div>

             <!-- PAGING -->
             <div class="pagination-footer" *ngIf="totalPages > 1">
                <button [disabled]="page === 0" (click)="goToPage(page - 1)">Précédent</button>
                <div class="page-numbers">
                   Page {{ page + 1 }} sur {{ totalPages }}
                </div>
                <button [disabled]="page >= totalPages - 1" (click)="goToPage(page + 1)">Suivant</button>
             </div>

             <!-- EMPTY STATE -->
             <div class="empty-state" *ngIf="items.length === 0 && !loading">
                <img src="/assets/images/empty.svg" alt="Vide" *ngIf="false">
                <p>Aucune donnée trouvée.</p>
             </div>

             <!-- LOADING -->
             <div class="loader-overlay" *ngIf="loading">
                <div class="spinner"></div>
             </div>
          </div>
        </div>

        <!-- CRUD MODAL -->
        <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
           <div class="modal-card" (click)="$event.stopPropagation()">
              <div class="modal-top">
                 <h2>{{ currentId ? 'Modifier' : 'Ajouter' }} {{ config?.title }}</h2>
                 <button class="close-icon" (click)="closeModal()">×</button>
              </div>
              <div class="modal-body">
                 <form (ngSubmit)="save()">
                    <div class="form-grid">
                       <div class="f-group" *ngFor="let field of config?.formFields">
                          <label>{{ field.label }} {{ field.required ? '*' : '' }}</label>
                          <input *ngIf="field.type === 'text'" type="text" [(ngModel)]="editData[field.key]" [name]="field.key" class="f-control" [required]="field.required">
                          <input *ngIf="field.type === 'number'" type="number" [(ngModel)]="editData[field.key]" [name]="field.key" class="f-control" [required]="field.required">
                          <input *ngIf="field.type === 'date'" type="date" [(ngModel)]="editData[field.key]" [name]="field.key" class="f-control" [required]="field.required">
                          
                          <select *ngIf="field.type === 'select'" [(ngModel)]="editData[field.key]" [name]="field.key" class="f-control" [required]="field.required">
                             <option value="">Sélectionner...</option>
                             <option *ngFor="let opt of field.options" [value]="opt.value">{{ opt.label }}</option>
                          </select>
                          
                          <label class="switch" *ngIf="field.type === 'boolean'">
                             <input type="checkbox" [(ngModel)]="editData[field.key]" [name]="field.key">
                             <span class="slider"></span>
                             <span class="sw-label">Actif</span>
                          </label>

                          <textarea *ngIf="field.type === 'textarea'" [(ngModel)]="editData[field.key]" [name]="field.key" class="f-control" rows="3"></textarea>
                       </div>
                    </div>
                    <div class="modal-footer">
                       <button type="button" class="btn-cancel" (click)="closeModal()">Annuler</button>
                       <button type="submit" class="btn-save">Enregistrer</button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-layout { display: flex; min-height: 100vh; background: transparent; }
    .main-content { flex: 1; margin-left: var(--sidebar-width); }
    .page-container { padding: 48px; max-width: 1500px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px; animation: fadeUp 0.6s ease-out; }
    
    .shadow-premium { box-shadow: 0 10px 40px rgba(0,0,0,0.03); border: 1.5px solid rgba(0,0,0,0.015); }
    
    /* HEADER BANNER */
    .header-banner { 
      background: white; border-radius: 32px; padding: 48px; 
      display: flex; justify-content: space-between; align-items: center; 
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border-left: 5px solid var(--bna-emerald);
    }
    .banner-info h1 { font-size: 36px; font-weight: 850; color: #0f172a; margin: 0 0 10px 0; letter-spacing: -1.2px; }
    .banner-info p { font-size: 17px; color: #64748b; margin: 0; font-weight: 600; }
    
    /* FILTER BAR */
    .filter-bar { background: white; border-radius: 24px; padding: 24px 36px; display: flex; align-items: center; gap: 32px; }
    .search-input input { 
      width: 100%; padding: 14px 20px 14px 52px; border-radius: 16px; 
      border: 1.5px solid #f1f5f9; background: #f8fafc; font-size: 15px; 
      transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); font-weight: 700; 
    }
    .search-input input:focus { border-color: var(--bna-emerald); background: white; box-shadow: 0 0 30px rgba(0, 135, 102, 0.1); }
    
    /* TABLE */
    .table-card { 
      background: white; border-radius: 32px; overflow-x: auto; position: relative; min-height: 400px; 
      -webkit-overflow-scrolling: touch;
    }
    
    @media (max-width: 768px) {
      .table-card { border-radius: 20px; }
      .data-table th, .data-table td { padding: 14px 16px !important; font-size: 13px !important; }
      .header-banner { padding: 24px; border-radius: 20px; flex-direction: column; gap: 20px; text-align: center; }
      .banner-actions { width: 100%; flex-direction: column; }
      .filter-bar { padding: 16px; border-radius: 16px; gap: 16px; }
      .search-input { min-width: 100% !important; }
    }
    .data-table th { padding: 24px 32px; background: #f8fafc; color: #475569; font-size: 11px; font-weight: 900; letter-spacing: 2px; }
    .data-table td { padding: 24px 32px; border-bottom: 1px solid #f1f5f9; font-size: 15px; font-weight: 650; }
    .data-table tr:hover { background: #fcfdfe; }
    
    /* CARDS */
    .aux-card { 
      background: white; border-radius: 32px; padding: 32px; 
      border: 1.8px solid #f1f5f9; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .aux-card:hover { transform: translateY(-12px); border-color: var(--bna-emerald); box-shadow: 0 30px 60px rgba(0, 135, 102, 0.08); }
    .card-prio-ribbon { background: var(--bna-emerald); font-size: 9px; letter-spacing: 2px; }
    .avatar { border-radius: 20px; background: #f1f5f9; color: var(--bna-emerald); }
    
    .btn-micro { border-radius: 10px; background: #f8fafc; transition: 0.2s; }
    .btn-micro:hover { transform: scale(1.1); color: var(--bna-emerald); }
    
    .status-badge { padding: 6px 14px; border-radius: 12px; font-size: 11px; font-weight: 850; letter-spacing: 0.8px; }
    
    @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes bounceIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
    
    .spinner { width: 40px; height: 40px; border: 4px solid #f1f5f9; border-top-color: #008766; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loader-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.7); display: flex; align-items: center; justify-content: center; z-index: 10; }
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
  editData: any = {};
  currentId: number | null = null;
  
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // CONFIGURATION MAP
  private configs: Record<string, RefConfig> = {
    'avocats': {
        title: 'Avocats',
        subtitle: 'Annuaire des avocats partenaires de la BNA.',
        path: 'auxiliaires',
        columns: [
          { key: 'nom', label: 'Nom' },
          { key: 'specialite', label: 'Spécialité' },
          { key: 'dossiersCount', label: 'Affaires', type: 'number' },
          { key: 'rating', label: 'Score', type: 'number' },
          { key: 'telephone', label: 'Téléphone' }
        ],
        filters: [],
        formFields: [
          { key: 'nom', label: 'Nom & Prénom', type: 'text', required: true },
          { key: 'type', label: 'Type', type: 'select', options: [{value: 'AVOCAT', label: 'Avocat'}], required: true },
          { key: 'specialite', label: 'Spécialité', type: 'text' },
          { key: 'dossiersCount', label: 'Volume d\'affaires (Dossiers)', type: 'number' },
          { key: 'rating', label: 'Rating BNA (0-5)', type: 'number' },
          { key: 'email', label: 'Email', type: 'text', required: true },
          { key: 'telephone', label: 'Téléphone', type: 'text', required: true },
          { key: 'adresse', label: 'Adresse Cabinet', type: 'textarea' }
        ]
    },
    'experts': {
        title: 'Experts Judiciaires',
        subtitle: 'Annuaire des experts certifiés par les cours.',
        path: 'auxiliaires',
        columns: [
          { key: 'nom', label: 'Nom' },
          { key: 'specialite', label: 'Spécialité' },
          { key: 'telephone', label: 'Téléphone' }
        ],
        filters: [],
        formFields: [
          { key: 'nom', label: 'Nom & Prénom', type: 'text', required: true },
          { key: 'type', label: 'Type', type: 'select', options: [{value: 'EXPERT', label: 'Expert'}], required: true },
          { key: 'specialite', label: 'Spécialité', type: 'text' },
          { key: 'email', label: 'Email', type: 'text' },
          { key: 'telephone', label: 'Téléphone', type: 'text' }
        ]
    },
    'huissiers': {
        title: 'Huissiers de Justice',
        subtitle: 'Gestion des huissiers pour significations et exécutions.',
        path: 'auxiliaires',
        columns: [
          { key: 'nom', label: 'Nom' },
          { key: 'dossiersCount', label: 'Exécutions', type: 'number' },
          { key: 'telephone', label: 'Téléphone' },
          { key: 'region', label: 'Région' }
        ],
        filters: [],
        formFields: [
          { key: 'nom', label: 'Nom', type: 'text', required: true },
          { key: 'type', label: 'Type', type: 'select', options: [{value: 'HUISSIER', label: 'Huissier'}], required: true },
          { key: 'dossiersCount', label: 'Volume d\'exécutions', type: 'number' },
          { key: 'telephone', label: 'Téléphone', type: 'text' },
          { key: 'region', label: 'Région', type: 'text' }
        ]
    },
    'tribunaux': {
      title: 'Tribunaux',
      subtitle: 'Gestion des tribunaux de première instance et spécialisés.',
      path: 'tribunaux',
      columns: [
        { key: 'nom', label: 'Nom' },
        { key: 'type', label: 'Type' },
        { key: 'region', label: 'Région' },
        { key: 'actif', label: 'Statut', type: 'boolean' }
      ],
      filters: [
        { key: 'type', label: 'Type', type: 'select', options: [
           { value: 'Première Instance', label: 'Première Instance' },
           { value: 'Cantonal', label: 'Cantonal' },
           { value: 'Immobilier', label: 'Immobilier' },
           { value: 'Commercial', label: 'Commercial' }
        ]},
        { key: 'actif', label: 'Statut', type: 'boolean' }
      ],
      formFields: [
        { key: 'nom', label: 'Nom du Tribunal', type: 'text', required: true },
        { key: 'type', label: 'Type', type: 'select', options: [
           { value: 'Première Instance', label: 'Première Instance' },
           { value: 'Cantonal', label: 'Cantonal' },
           { value: 'Immobilier', label: 'Immobilier' },
           { value: 'Commercial', label: 'Commercial' }
        ], required: true },
        { key: 'region', label: 'Région', type: 'text', required: true },
        { key: 'gouvernorat', label: 'Gouvernorat', type: 'text' },
        { key: 'adresse', label: 'Adresse', type: 'textarea' },
        { key: 'telephone', label: 'Téléphone', type: 'text' },
        { key: 'email', label: 'Email', type: 'text' },
        { key: 'president', label: 'Président', type: 'text' },
        { key: 'competenceTerritoriale', label: 'Compétence Territoriale', type: 'text' },
        { key: 'actif', label: 'Statut', type: 'boolean' }
      ]
    },
    'cours-appel': {
      title: 'Cours d\'Appel',
      subtitle: 'Gestion des juridictions d\'appel à travers la Tunisie.',
      path: 'cours-appel',
      columns: [
        { key: 'nom', label: 'Nom' },
        { key: 'region', label: 'Région' },
        { key: 'president', label: 'Président' },
        { key: 'actif', label: 'Statut', type: 'boolean' }
      ],
      filters: [{ key: 'actif', label: 'Statut', type: 'boolean' }],
      formFields: [
        { key: 'nom', label: 'Nom de la Cour', type: 'text', required: true },
        { key: 'region', label: 'Région', type: 'text', required: true },
        { key: 'president', label: 'Président', type: 'text' },
        { key: 'adresse', label: 'Adresse', type: 'text' },
        { key: 'telephone', label: 'Téléphone', type: 'text' },
        { key: 'competenceTerritoriale', label: 'Compétence', type: 'text' },
        { key: 'actif', label: 'Statut', type: 'boolean' }
      ]
    },
    'cours-cassation': {
      title: 'Cour de Cassation',
      subtitle: 'Suivi des arrêts de la Cour de Cassation.',
      path: 'cours-cassation',
      columns: [
        { key: 'chambre', label: 'Chambre' },
        { key: 'referenceArret', label: 'Référence' },
        { key: 'resultat', label: 'Résultat', type: 'badge', badgeClass: (v:any) => v === 'Cassé' ? 'danger' : 'success' },
        { key: 'dateArret', label: 'Date', type: 'date' }
      ],
      filters: [
        { key: 'resultat', label: 'Résultat', type: 'select', options: [
           { value: 'Cassé', label: 'Cassé' },
           { value: 'Rejeté', label: 'Rejeté' },
           { value: 'Renvoyé', label: 'Renvoyé' }
        ]}
      ],
      formFields: [
        { key: 'chambre', label: 'Chambre', type: 'select', options: [
           { value: 'Civile', label: 'Civile' },
           { value: 'Commerciale', label: 'Commerciale' },
           { value: 'Pénale', label: 'Pénale' },
           { value: 'Sociale', label: 'Sociale' }
        ], required: true },
        { key: 'referenceArret', label: 'Référence de l\'arrêt', type: 'text', required: true },
        { key: 'dateArret', label: 'Date de l\'arrêt', type: 'date', required: true },
        { key: 'resultat', label: 'Résultat', type: 'select', options: [
           { value: 'Cassé', label: 'Cassé' },
           { value: 'Rejeté', label: 'Rejeté' },
           { value: 'Renvoyé', label: 'Renvoyé' }
        ], required: true },
        { key: 'notes', label: 'Observations', type: 'textarea' }
      ]
    },
    'parquets': {
      title: 'Parquets',
      subtitle: 'Ministère Public et Parquets près les tribunaux.',
      path: 'parquets',
      columns: [
        { key: 'chefParquet', label: 'Chef du Parquet' },
        { key: 'tribunal.nom', label: 'Tribunal' },
        { key: 'region', label: 'Région' },
        { key: 'telephone', label: 'Téléphone' }
      ],
      filters: [],
      formFields: [
        { key: 'chefParquet', label: 'Chef du Parquet', type: 'text', required: true },
        { key: 'region', label: 'Région', type: 'text' },
        { key: 'telephone', label: 'Téléphone', type: 'text' },
        { key: 'email', label: 'Email', type: 'text' }
      ]
    },
    'arbitrage': {
      title: 'Médiation & Arbitrage',
      subtitle: 'Centres de résolution amiable des litiges.',
      path: 'centres-mediation',
      columns: [
        { key: 'nom', label: 'Nom du Centre' },
        { key: 'arbitreDesigne', label: 'Arbitre' },
        { key: 'type', label: 'Type' },
        { key: 'resultat', label: 'Résultat' }
      ],
      filters: [
        { key: 'type', label: 'Type', type: 'select', options: [
           { value: 'Médiation', label: 'Médiation' },
           { value: 'Arbitrage', label: 'Arbitrage' }
        ]}
      ],
      formFields: [
        { key: 'nom', label: 'Nom du Centre', type: 'text', required: true },
        { key: 'arbitreDesigne', label: 'Arbitre désigné', type: 'text' },
        { key: 'type', label: 'Type', type: 'select', options: [
           { value: 'Médiation', label: 'Médiation' },
           { value: 'Arbitrage', label: 'Arbitrage' }
        ] },
        { key: 'dateSession', label: 'Date de session', type: 'date' },
        { key: 'resultat', label: 'Résultat', type: 'text' },
        { key: 'adresse', label: 'Adresse', type: 'text' },
        { key: 'observations', label: 'Observations', type: 'textarea' }
      ]
    },
    'types-proceduraux': {
        title: 'Types de Procédures',
        subtitle: 'Classification maîtresse des procédures judiciaires.',
        path: 'types-procedure',
        columns: [
          { key: 'nom', label: 'Nom' },
          { key: 'code', label: 'Code' },
          { key: 'delaiMoyen', label: 'Délai Moyen (Jours)', type: 'number' }
        ],
        filters: [],
        formFields: [
          { key: 'nom', label: 'Nom', type: 'text', required: true },
          { key: 'code', label: 'Code', type: 'text', required: true },
          { key: 'description', label: 'Description', type: 'textarea' },
          { key: 'delaiMoyen', label: 'Délai moyen (jours)', type: 'number' }
        ]
    },
    'natures-affaires': {
        title: 'Natures d\'Affaires',
        subtitle: 'Types de contentieux bancaires et commerciaux.',
        path: 'natures-affaire',
        columns: [
          { key: 'nom', label: 'Nom' },
          { key: 'code', label: 'Code' },
          { key: 'typeProcedure.nom', label: 'Procédure Associée' }
        ],
        filters: [],
        formFields: [
          { key: 'nom', label: 'Nom', type: 'text', required: true },
          { key: 'code', label: 'Code', type: 'text', required: true },
          { key: 'description', label: 'Description', type: 'textarea' }
        ]
    },
    'phases-procedurales': {
        title: 'Phases de Procédure',
        subtitle: 'Étapes officielles du parcours judiciaire Tunisien.',
        path: 'phases-procedure',
        columns: [
          { key: 'ordre', label: 'Ordre', type: 'number' },
          { key: 'nom', label: 'Phase' },
          { key: 'delaiLegalEstimé', label: 'Délai Légal (Jours)', type: 'number' }
        ],
        filters: [],
        formFields: [
          { key: 'nom', label: 'Nom de la phase', type: 'text', required: true },
          { key: 'ordre', label: 'Ordre numérique', type: 'number', required: true },
          { key: 'description', label: 'Description', type: 'textarea' },
          { key: 'delaiLegalEstimé', label: 'Délai légal estimé (jours)', type: 'number' }
        ]
    },
    'baremes': {
        title: 'Barèmes des Frais',
        subtitle: 'Grilles tarifaires par type de procédure et tribunal.',
        path: 'baremes-frais',
        columns: [
          { key: 'nom', label: 'Nom du Barème' },
          { key: 'typeProcedure', label: 'Procédure' },
          { key: 'montantDeBase', label: 'Montant', type: 'amount' },
          { key: 'uniteCalcul', label: 'Unité' }
        ],
        filters: [],
        formFields: [
          { key: 'nom', label: 'Nom du barème', type: 'text', required: true },
          { key: 'typeProcedure', label: 'Type de procédure', type: 'text', required: true },
          { key: 'tribunalType', label: 'Type de tribunal', type: 'text' },
          { key: 'montantDeBase', label: 'Montant de base (TND)', type: 'number', required: true },
          { key: 'uniteCalcul', label: 'Unité de calcul', type: 'select', options: [
             { value: 'Forfait', label: 'Forfait' },
             { value: 'Pourcentage', label: 'Pourcentage' },
             { value: 'Par audience', label: 'Par audience' }
          ] }
        ]
    },
    'tva-timbres': {
        title: 'TVA & Timbre Fiscal',
        subtitle: 'Paramètres fiscaux en vigueur.',
        path: 'tva-timbre',
        columns: [
          { key: 'typeTaxe', label: 'Type de Taxe' },
          { key: 'taux', label: 'Taux', type: 'percentage' },
          { key: 'dateEntreeVigueur', label: 'Entrée en vigueur', type: 'date' }
        ],
        filters: [],
        formFields: [
          { key: 'typeTaxe', label: 'Type de taxe', type: 'select', options: [
             { value: 'TVA', label: 'TVA' },
             { value: 'Timbre', label: 'Timbre' },
             { value: 'Droit d\'enregistrement', label: 'Droit d\'enregistrement' }
          ], required: true },
          { key: 'taux', label: 'Taux (%)', type: 'number', required: true },
          { key: 'dateEntreeVigueur', label: 'Date d\'entrée en vigueur', type: 'date' },
          { key: 'descriptionLegale', label: 'Description légale', type: 'textarea' }
        ]
    },
    'devises': {
        title: 'Devises',
        subtitle: 'Gestion des monnaies et taux de conversion.',
        path: 'devises',
        columns: [
          { key: 'nom', label: 'Devise' },
          { key: 'codeIso', label: 'Code ISO' },
          { key: 'tauxConversionVersTND', label: 'Taux (vs TND)', type: 'amount' }
        ],
        filters: [],
        formFields: [
          { key: 'nom', label: 'Nom de la devise', type: 'text', required: true },
          { key: 'codeIso', label: 'Code ISO (EUR, USD...)', type: 'text', required: true },
          { key: 'symbole', label: 'Symbole', type: 'text' },
          { key: 'tauxConversionVersTND', label: 'Taux de conversion vers TND', type: 'number', required: true }
        ]
    },
    'modes-reglement': {
        title: 'Modes de Règlement',
        subtitle: 'Modes de paiement acceptés pour les frais.',
        path: 'modes-reglement',
        columns: [
          { key: 'nom', label: 'Mode' },
          { key: 'code', label: 'Code' },
          { key: 'actif', label: 'Actif', type: 'boolean' }
        ],
        filters: [{ key: 'actif', label: 'Statut', type: 'boolean' }],
        formFields: [
          { key: 'nom', label: 'Nom du mode', type: 'text', required: true },
          { key: 'code', label: 'Code', type: 'text', required: true },
          { key: 'description', label: 'Description', type: 'textarea' },
          { key: 'actif', label: 'Actif', type: 'boolean' }
        ]
    }
  };

  constructor(
    private route: ActivatedRoute,
    private referentielService: ReferentielService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private confirmService: ConfirmDialogService
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

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.loadData();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  resetParams() {
    this.items = [];
    this.page = 0;
    this.searchQuery = '';
    this.filters = {};
  }

  loadData() {
    if (!this.config) return;
    this.loading = true;
    
    const params = {
      page: this.page,
      size: this.size,
      search: this.searchQuery || null,
      ...this.filters
    };

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

  onSearchChange(q: string) {
    this.searchSubject.next(q);
  }

  goToPage(p: number) {
    this.page = p;
    this.loadData();
  }

  isAdmin() { return this.authService.hasRole('ROLE_ADMIN'); }

  resolvePath(obj: any, path: string) {
    return path.split('.').reduce((prev, curr) => prev ? prev[curr] : null, obj);
  }

  openAddModal() {
    this.currentId = null;
    this.editData = {};
    if (this.config) {
        this.config.formFields.forEach(f => {
            if (f.type === 'boolean') this.editData[f.key] = true;
        });
    }
    this.showModal = true;
  }

  onEdit(item: any) {
    this.currentId = item.id;
    this.editData = { ...item };
    this.showModal = true;
  }

  onDelete(item: any) {
    if (!this.config) return;
    this.confirmService.open({
        title: 'Confirmation de Suppression',
        message: 'Êtes-vous sûr de vouloir effectuer cette action ?'
    }).subscribe(ok => {
        if (ok) {
            this.referentielService.deleteData(this.config?.path || '', item.id).subscribe({
                next: () => {
                    this.notificationService.addNotification("Élément supprimé", "ROLE_ADMIN", "SUCCESS");
                    this.loadData();
                },
                error: (err) => {
                    const msg = err.error?.message || "Impossible de supprimer cet élément (possiblement lié à des dossiers).";
                    this.notificationService.addNotification(msg, "ROLE_ADMIN", "WARNING");
                }
            });
        }
    });
  }

  closeModal() {
    this.showModal = false;
  }

  save() {
    if (!this.config) return;
    this.referentielService.saveData(this.config.path, this.currentId, this.editData).subscribe({
        next: () => {
            this.notificationService.addNotification(this.currentId ? "Mis à jour" : "Ajouté", "ROLE_ADMIN", "SUCCESS");
            this.closeModal();
            this.loadData();
        },
        error: () => this.notificationService.addNotification("Erreur lors de l'enregistrement", "ROLE_ADMIN", "WARNING")
    });
  }

  exportToExcel() {
    if (this.items.length === 0) {
      this.notificationService.addNotification("Aucune donnée à exporter.", "ROLE_ADMIN", "WARNING");
      return;
    }
    const headers = this.config?.columns.map(c => c.label).join(';');
    const rows = this.items.map(item => 
      this.config?.columns.map(col => {
        const val = this.resolvePath(item, col.key);
        return `"${(val || '').toString().replace(/"/g, '""')}"`;
      }).join(';')
    );
    const csvContent = "\uFEFF" + headers + "\n" + rows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${this.config?.path}_export.csv`);
    document.body.appendChild(link);
    link.click();
    this.notificationService.addNotification("Export CSV (compatible Excel) réussi.", "ROLE_ADMIN", "SUCCESS");
  }

  exportToPDF() {
    window.print();
  }

  isAuxiliaireView() {
    return ['avocats', 'huissiers', 'experts', 'experts-judiciaires'].includes(this.type);
  }

  sortedItems() {
    // Sort by dossiersCount (popularity) descending by default for cards
    return [...this.items].sort((a, b) => (b.dossiersCount || 0) - (a.dossiersCount || 0));
  }
}
