import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ReferentielService } from '../../services/referentiel.service';
import { AuthService } from '../../services/auth.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-litige',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>

      <main class="main-content">
        <app-header title="Identification Litige"></app-header>

        <div class="page-container">
          <!-- TOP FILTER TABS -->
          <div class="filter-tabs-container mb-6 animate-fade-in">
            <div class="filter-tab" [class.active]="clientType === 'ALL'" (click)="setClientType('ALL')">
              Tous les Clients
            </div>
            <div class="filter-tab" [class.active]="clientType === 'CJN'" (click)="setClientType('CJN')">
              🏢 Clients Moraux
            </div>
            <div class="filter-tab" [class.active]="clientType === 'PHYSIQUE'" (click)="setClientType('PHYSIQUE')">
              👤 Clients Physiques
            </div>
          </div>

          <!-- SEARCH & ACTION BAR -->
          <div class="control-deck shadow-premium mb-6">
            <div class="search-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" 
                     placeholder="Rechercher par nom, RNE, CIN..." 
                     [(ngModel)]="searchQuery" 
                     (ngModelChange)="onSearchChange($event)">
            </div>
            <div class="deck-actions">
               <button class="btn-refresh-icon" (click)="loadData()" title="Actualiser la liste">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6m-7 7H4v-6m16-4.5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4.5"></path></svg>
               </button>

               <button class="btn-primary-action" *ngIf="isAllowedToAdd()" (click)="showAddModal = true">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                 Ajouter un client
               </button>
            </div>
          </div>

          <!-- DATA TABLE -->
          <div class="registry-table-card shadow-premium animate-fade-in">
            <table class="elite-table">
              <thead>
                <tr>
                  <th>Nom / Raison Sociale</th>
                  <th>Identifiant</th>
                  <th>Type</th>
                  <th>Téléphone</th>
                  <th>Adresse</th>
                  <th class="actions-th">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of items" class="fade-in-row" (click)="onSelectItem(item)">
                  <td>
                    <div class="client-name-cell">
                      <div class="client-avatar" [class.moral]="item.type === 'CJN'">
                        {{ item.nom[0] }}
                      </div>
                      <div class="name-info">
                        <span class="main-name">{{ item.nom }} {{ item.prenom || '' }}</span>
                        <span class="sub-label" *ngIf="item.type === 'CJN'">Personne Morale</span>
                        <span class="sub-label" *ngIf="item.type === 'PHYSIQUE'">Particulier</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="id-badge" [class.rne]="item.type === 'CJN'">
                      {{ item.type === 'CJN' ? 'RNE: ' + item.identifiantFiscal : 'CIN: ' + item.cin }}
                    </span>
                  </td>
                  <td>
                    <span class="type-pill" [class.moral]="item.type === 'CJN'">
                      {{ item.type === 'CJN' ? 'MORAL' : 'PHYSIQUE' }}
                    </span>
                  </td>
                  <td>{{ item.telephone || '—' }}</td>
                  <td class="addr-cell">{{ item.adresse }}</td>
                  <td class="actions-td">
                    <button class="btn-view" (click)="$event.stopImmediatePropagation(); onSelectItem(item)">Détails</button>
                  </td>
                </tr>
                <tr *ngIf="items.length === 0 && !loading">
                  <td colspan="6" class="empty-state">
                    <div class="empty-msg">Aucun client trouvé.</div>
                  </td>
                </tr>
                <tr *ngIf="loading">
                  <td colspan="6" class="loading-state">
                    <div class="spinner-premium"></div>
                    <p>Chargement des données...</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ADD MODAL -->
        <div class="modal-overlay" *ngIf="showAddModal" (click)="showAddModal = false">
          <div class="premium-modal animate-scale-up" (click)="$event.stopPropagation()">
            <div class="modal-header-elite">
               <div class="modal-title-group">
                  <h2>✨ Nouveau Client</h2>
                  <p>Enregistrement d'une nouvelle partie au litige</p>
               </div>
               <button class="btn-close-modal" (click)="showAddModal = false">×</button>
            </div>
            <div class="modal-body-elite">
              <div class="form-grid">
                <div class="form-group full">
                  <label>Type de Client</label>
                  <div class="type-toggle">
                    <div class="toggle-opt" [class.active]="newClient.type === 'CJN'" (click)="newClient.type = 'CJN'">🏢 Moral (CJN)</div>
                    <div class="toggle-opt" [class.active]="newClient.type === 'PHYSIQUE'" (click)="newClient.type = 'PHYSIQUE'">👤 Physique</div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Nom <span style="color: #ef4444;">*</span></label>
                  <input type="text" [(ngModel)]="newClient.nom" placeholder="Entrez le nom...">
                </div>
                <div class="form-group" *ngIf="newClient.type === 'PHYSIQUE'">
                  <label>Prénom <span style="color: #ef4444;">*</span></label>
                  <input type="text" [(ngModel)]="newClient.prenom" placeholder="Entrez le prénom...">
                </div>
                <div class="form-group">
                  <label>{{ newClient.type === 'CJN' ? 'Identifiant Fiscal (RNE)' : 'Numéro CIN' }} <span style="color: #ef4444;">*</span></label>
                  <input type="text" [(ngModel)]="newClient.type === 'CJN' ? newClient.identifiantFiscal : newClient.cin" placeholder="Identifiant unique...">
                </div>
                <div class="form-group">
                  <label>Téléphone</label>
                  <input type="text" [(ngModel)]="newClient.telephone" placeholder="Numéro de contact...">
                </div>
                <div class="form-group full">
                  <label>Adresse Complète <span style="color: #ef4444;">*</span></label>
                  <textarea rows="3" [(ngModel)]="newClient.adresse" placeholder="Localisation, Ville, CP..."></textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer-elite">
              <button class="btn-cancel" (click)="showAddModal = false">Annuler</button>
              <button class="btn-save" (click)="saveClient()">
                {{ loading ? 'Enregistrement...' : 'Confirmer l\'ajout' }}
              </button>
            </div>
          </div>
        </div>

        <!-- DETAIL SIDE PANEL -->
        <div class="review-sidebar" *ngIf="selectedClient" [class.open]="selectedClient">
            <div class="rs-header">
               <div class="rs-title-group">
                  <h2>Fiche Client 🔍</h2>
               </div>
               <button class="btn-close-rs" (click)="selectedClient = null">×</button>
            </div>
            <div class="rs-body" *ngIf="selectedClient">
               <div class="rs-profile">
                  <div class="rs-avatar-large" [class.moral]="selectedClient.type === 'CJN'">
                    {{ selectedClient.nom[0] }}
                  </div>
                  <div class="rs-main-info">
                     <h3>{{ selectedClient.nom }} {{ selectedClient.prenom || '' }}</h3>
                     <span class="rs-type-label">{{ selectedClient.type === 'CJN' ? 'Moral' : 'Physique' }}</span>
                  </div>
               </div>
               <div class="rs-details-grid">
                  <div class="rs-field">
                     <label>Identifiant</label>
                     <p>{{ selectedClient.identifiantFiscal || selectedClient.cin }}</p>
                  </div>
                  <div class="rs-field full">
                     <label>Adresse</label>
                     <p>{{ selectedClient.adresse }}</p>
                  </div>
               </div>
            </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-layout { display: flex; min-height: 100vh; background: #fdfdfd; font-family: 'Outfit', sans-serif; }
    .main-content { flex: 1; margin-left: 280px; width: calc(100% - 280px); position: relative; }
    .page-container { padding: 48px; width: 100%; box-sizing: border-box; }
    .shadow-premium { box-shadow: 0 10px 40px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.03); }
    .filter-tabs-container { display: flex; gap: 12px; background: #f1f5f9; padding: 6px; border-radius: 16px; width: fit-content; }
    .filter-tab { padding: 10px 24px; border-radius: 12px; font-size: 14px; font-weight: 700; color: #64748b; cursor: pointer; }
    .filter-tab.active { background: white; color: #008766; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .control-deck { background: white; border-radius: 20px; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; }
    .search-box { position: relative; flex: 1; max-width: 450px; }
    .search-box svg { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
    .search-box input { width: 100%; padding: 12px 16px 12px 48px; border-radius: 14px; border: 2.5px solid #f8fafc; background: #f8fafc; font-weight: 600; }
    .deck-actions { display: flex; gap: 12px; }
    .btn-refresh-icon { width: 44px; height: 44px; border-radius: 12px; border: 2.5px solid #f8fafc; background: #f8fafc; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #94a3b8; }
    .btn-primary-action { background: #008766; color: white; border: none; padding: 0 28px; height: 44px; border-radius: 12px; font-weight: 800; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 10px; }
    .registry-table-card { background: white; border-radius: 28px; overflow: hidden; }
    .elite-table { width: 100%; border-collapse: collapse; }
    .elite-table th { text-align: left; padding: 24px 32px; background: #f8fafc; color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase; }
    .elite-table td { padding: 24px 32px; border-bottom: 1px solid #f8fafc; vertical-align: middle; cursor: pointer; }
    .client-avatar { width: 44px; height: 44px; border-radius: 14px; background: #e0f2fe; color: #0284c7; display: flex; align-items: center; justify-content: center; font-weight: 800; }
    .client-avatar.moral { background: #f0fdf4; color: #10b981; }
    .id-badge { background: #f1f5f9; padding: 6px 12px; border-radius: 10px; font-family: monospace; font-size: 12px; }
    .id-badge.rne { background: #f0fdf4; color: #008766; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 3000; }
    .premium-modal { background: white; width: 620px; border-radius: 32px; overflow: hidden; }
    .modal-header-elite { padding: 32px 40px; background: #f8fafc; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; }
    .modal-title-group h2 { margin: 0; font-size: 22px; }
    .modal-body-elite { padding: 40px; }
    .type-toggle { display: flex; gap: 8px; background: #f1f5f9; padding: 6px; border-radius: 14px; }
    .toggle-opt { flex: 1; padding: 12px; text-align: center; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 700; }
    .toggle-opt.active { background: white; color: #008766; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .form-group label { display: block; font-size: 11px; font-weight: 800; margin-bottom: 8px; }
    .form-group input, .form-group textarea { width: 100%; padding: 14px 18px; border-radius: 14px; border: 2px solid #f1f5f9; background: #f8fafc; }
    .form-group.full { grid-column: span 2; }
    .modal-footer-elite { padding: 32px 40px; display: flex; justify-content: flex-end; gap: 16px; }
    .btn-save { padding: 14px 32px; border-radius: 12px; border: none; background: #008766; color: white; font-weight: 800; cursor: pointer; }
    .review-sidebar { position: fixed; top: 0; right: -500px; width: 480px; height: 100vh; background: white; z-index: 2100; transition: right 0.5s; }
    .review-sidebar.open { right: 0; }
    .rs-header { padding: 40px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; }
    .rs-body { padding: 40px; }
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class LitigeComponent implements OnInit {
  clientType: 'ALL' | 'CJN' | 'PHYSIQUE' = 'ALL';
  searchQuery: string = '';
  items: any[] = [];
  selectedClient: any = null;
  loading: boolean = false;
  showAddModal: boolean = false;
  newClient = { nom: '', prenom: '', type: 'CJN' as 'CJN' | 'PHYSIQUE', identifiantFiscal: '', cin: '', adresse: '', telephone: '' };
  private searchSubject = new Subject<string>();

  constructor(private referentielService: ReferentielService, private authService: AuthService) { }

  ngOnInit(): void {
    this.loadData();
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => this.loadData());
  }

  loadData() {
    this.loading = true;
    const params: any = { search: this.searchQuery || null };
    if (this.clientType !== 'ALL') params.type = this.clientType;
    this.referentielService.getData('parties-litige', params).pipe(finalize(() => this.loading = false)).subscribe({
      next: (res) => this.items = res.content || res || [],
      error: () => this.items = []
    });
  }

  setClientType(type: 'ALL' | 'CJN' | 'PHYSIQUE') {
    this.clientType = type;
    this.loadData();
  }

  onSearchChange(query: string) { this.searchSubject.next(query); }
  onSelectItem(item: any) { this.selectedClient = item; }
  isAllowedToAdd() { return this.authService.hasRole('ROLE_CHARGE_DOSSIER') || this.authService.hasRole('ROLE_ADMIN'); }
  getMissingFields(): string[] {
    const missing = [];
    if (!this.newClient.nom) missing.push('Nom');
    if (!this.newClient.adresse) missing.push('Adresse');
    if (this.newClient.type === 'CJN' && !this.newClient.identifiantFiscal) missing.push('RNE');
    if (this.newClient.type === 'PHYSIQUE') {
      if (!this.newClient.prenom) missing.push('Prénom');
      if (!this.newClient.cin) missing.push('CIN');
    }
    return missing;
  }

  isFormValid() {
    return this.getMissingFields().length === 0;
  }
  saveClient() {
    console.log('Tentative d\'ajout client:', this.newClient);
    if (!this.isFormValid()) {
      const missing = this.getMissingFields().join(', ');
      alert("Veuillez remplir les champs obligatoires suivants : " + missing);
      return;
    }
    this.loading = true;
    this.referentielService.saveData('parties-litige', null, this.newClient)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.showAddModal = false;
          this.resetForm();
          this.loadData();
          alert("Client ajouté avec succès !");
        },
        error: (err) => {
          console.error('Save failed', err);
          if (err.status === 403) {
            alert("Erreur 403 : Accès refusé. Le serveur n'a peut-être pas encore pris en compte vos nouvelles permissions.");
          } else {
            alert("Erreur d'enregistrement (" + err.status + "). Détails: " + (err.error?.message || "Erreur serveur"));
          }
        }
      });
  }
  resetForm() { this.newClient = { nom: '', prenom: '', type: 'CJN', identifiantFiscal: '', cin: '', adresse: '', telephone: '' }; }
}
