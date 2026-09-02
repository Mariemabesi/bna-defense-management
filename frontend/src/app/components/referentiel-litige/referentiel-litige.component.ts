import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ReferentielService } from '../../services/referentiel.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
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
               <button class="btn-action view-btn" (click)="loadData()" title="Actualiser la liste">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 4v6h-6m-7 7H4v-6m16-4.5V4a2 2 0 0 0-2 2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4.5"></path></svg>
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
                    <button class="btn-action view-btn" (click)="$event.stopImmediatePropagation(); onSelectItem(item)" title="Voir Litiges & Dossiers">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
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

          <!-- PAGINATION -->
          <div class="pagination-footer slideIn animate-fade-in" *ngIf="totalPages > 1">
            <div class="pagination-info">
              Affichage de <b>{{ items.length }}</b> sur <b>{{ totalElements }}</b> clients
            </div>
            <div class="pagination-controls">
              <button class="btn-page" [disabled]="currentPage === 0" (click)="onPageChange(currentPage - 1)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                Précédent
              </button>
              
              <div class="page-numbers">
                <button 
                  *ngFor="let p of [].constructor(totalPages); let i = index" 
                  class="btn-number" 
                  [class.active]="i === currentPage"
                  (click)="onPageChange(i)">
                  {{ i + 1 }}
                </button>
              </div>

              <button class="btn-page" [disabled]="currentPage === totalPages - 1" (click)="onPageChange(currentPage + 1)">
                Suivant
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
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
                <div class="form-group" *ngIf="newClient.type === 'CJN'">
                  <label>Identifiant Fiscal (RNE) <span style="color: #ef4444;">*</span></label>
                  <input type="text" [(ngModel)]="newClient.identifiantFiscal" placeholder="Identifiant unique (RNE)...">
                </div>
                <div class="form-group" *ngIf="newClient.type === 'PHYSIQUE'">
                  <label>Numéro CIN <span style="color: #ef4444;">*</span></label>
                  <input type="text" [(ngModel)]="newClient.cin" placeholder="Numéro CIN...">
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
                {{ loading ? 'Enregistrement...' : 'Confirmer' }}
              </button>
            </div>
          </div>
        </div>

        <!-- DETAIL SIDE PANEL WITH LITIGATION IDENTIFICATION -->
        <div class="review-sidebar" *ngIf="selectedClient" [class.open]="selectedClient">
            <div class="rs-header">
               <div class="rs-title-group">
                  <h2>Fiche Client — Litiges 🔍</h2>
                  <p class="rs-subtitle">Identification des dossiers liés</p>
               </div>
               <button class="btn-close-rs" (click)="selectedClient = null; clientDossiers = []; loadingDossiers = false">×</button>
            </div>

            <div class="rs-body" *ngIf="selectedClient">

               <!-- CLIENT PROFILE CARD -->
               <div class="rs-profile">
                  <div class="rs-avatar-large" [class.moral]="selectedClient.type === 'CJN'">
                    {{ selectedClient.nom[0] }}
                  </div>
                  <div class="rs-main-info">
                     <h3>{{ selectedClient.nom }} {{ selectedClient.prenom || '' }}</h3>
                     <span class="rs-type-label">{{ selectedClient.type === 'CJN' ? '🏢 Personne Morale' : '👤 Personne Physique' }}</span>
                  </div>
               </div>

               <!-- CLIENT IDENTITY FIELDS -->
               <div class="rs-details-grid">
                  <div class="rs-field" *ngIf="selectedClient.type === 'CJN'">
                     <label>RNE (Identifiant Fiscal)</label>
                     <p>{{ selectedClient.identifiantFiscal || '—' }}</p>
                  </div>
                  <div class="rs-field" *ngIf="selectedClient.type === 'PHYSIQUE'">
                     <label>CIN</label>
                     <p>{{ selectedClient.cin || '—' }}</p>
                  </div>
                  <div class="rs-field" *ngIf="selectedClient.telephone">
                     <label>📞 Téléphone</label>
                     <p>{{ selectedClient.telephone }}</p>
                  </div>
                  <div class="rs-field full">
                     <label>📍 Adresse</label>
                     <p>{{ selectedClient.adresse }}</p>
                  </div>
               </div>

               <!-- LITIGATION STATS BANNER -->
               <div class="litigation-banner" *ngIf="!loadingDossiers">
                  <div class="lit-stat">
                     <span class="lit-count">{{ clientDossiers.length }}</span>
                     <span class="lit-label">Total Dossiers</span>
                  </div>
                  <div class="lit-stat accent-blue">
                     <span class="lit-count">{{ getDossiersEnCours() }}</span>
                     <span class="lit-label">En Cours</span>
                  </div>
                  <div class="lit-stat accent-green">
                     <span class="lit-count">{{ getDossiersClotures() }}</span>
                     <span class="lit-label">Clôturés</span>
                  </div>
                  <div class="lit-stat accent-red">
                     <span class="lit-count">{{ getDossiersUrgents() }}</span>
                     <span class="lit-label">Urgents</span>
                  </div>
               </div>

               <!-- DOSSIERS SECTION HEADER -->
               <div class="dossiers-section-header">
                  <h4>⚖️ Dossiers Juridiques Liés</h4>
                  <span class="dossiers-count-badge" *ngIf="clientDossiers.length > 0">{{ clientDossiers.length }}</span>
               </div>

               <!-- LOADING STATE -->
               <div class="dossiers-loading" *ngIf="loadingDossiers">
                  <div class="mini-spinner"></div>
                  <p>Chargement des dossiers...</p>
               </div>

               <!-- EMPTY STATE -->
               <div class="dossiers-empty" *ngIf="!loadingDossiers && clientDossiers.length === 0">
                  <div class="empty-icon">📂</div>
                  <p>Aucun dossier juridique n'est actuellement associé à ce client.</p>
               </div>

               <!-- DOSSIERS LIST -->
               <div class="dossiers-list" *ngIf="!loadingDossiers && clientDossiers.length > 0">
                  <div class="dossier-card" *ngFor="let d of clientDossiers"
                       [class.archived]="d.archived"
                       (click)="navigateToDossier(d)">
                     <div class="dossier-card-top">
                        <div class="dossier-ref">
                           <span class="ref-chip">{{ d.reference }}</span>
                           <span class="priority-dot" [class]="'prio-' + (d.priorite || 'BASSE').toLowerCase()" 
                                 [title]="'Priorité: ' + (d.priorite || 'BASSE')"></span>
                        </div>
                        <span class="statut-badge" [class]="getStatutClass(d.statut)">
                           {{ formatStatut(d.statut) }}
                        </span>
                     </div>

                     <h5 class="dossier-titre">{{ d.titre }}</h5>

                     <div class="dossier-meta">
                        <span class="meta-item" *ngIf="d.natureAffaire">
                           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path></svg>
                           {{ d.natureAffaire }}
                        </span>
                        <span class="meta-item" *ngIf="d.montantLitige">
                           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                           {{ d.montantLitige | number:'1.0-0' }} TND
                        </span>
                        <span class="verdict-tag" *ngIf="d.verdict" [class]="d.verdict === 'GAGNE' ? 'win' : 'loss'">
                           {{ d.verdict === 'GAGNE' ? '✅ Gagné' : '❌ Perdu' }}
                        </span>
                     </div>

                     <div class="dossier-nav-hint">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                        Voir le dossier
                     </div>
                  </div>
               </div>
            </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      --bna-green: #008766;
      --bna-green-light: rgba(0, 135, 102, 0.07);
    }
    .app-layout { display: flex; min-height: 100vh; background: #fdfdfd; font-family: 'Outfit', sans-serif; }
    .main-content { flex: 1; margin-left: 280px; width: calc(100% - 280px); position: relative; }
    .page-container { padding: 48px; width: 100%; box-sizing: border-box; }
    .shadow-premium { box-shadow: 0 10px 40px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.03); }
    .filter-tabs-container { display: flex; gap: 12px; background: #f1f5f9; padding: 6px; border-radius: 16px; width: fit-content; }
    .filter-tab { padding: 10px 24px; border-radius: 12px; font-size: 14px; font-weight: 700; color: #64748b; cursor: pointer; transition: all 0.2s; }
    .filter-tab.active { background: white; color: #008766; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .control-deck { background: white; border-radius: 20px; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; }
    .search-box { position: relative; flex: 1; max-width: 450px; }
    .search-box svg { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
    .search-box input { width: 100%; padding: 12px 16px 12px 48px; border-radius: 14px; border: 2.5px solid #f8fafc; background: #f8fafc; font-weight: 600; outline: none; }
    .deck-actions { display: flex; gap: 12px; }
    .btn-action { background: white; color: #64748b; border: 1px solid #f1f5f9; width: 40px; height: 40px; border-radius: 12px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .btn-action:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
    .view-btn { background: #f8fafc; color: #334155; border-color: #f1f5f9; }
    .view-btn:hover { background: white; color: #0f172a; border-color: #cbd5e1; }
    .btn-action svg { width: 16px; height: 16px; }
    .btn-primary-action { background: #008766; color: white; border: none; padding: 0 28px; height: 44px; border-radius: 12px; font-weight: 800; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.2s; }
    .btn-primary-action:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,135,102,0.3); }
    .registry-table-card { background: white; border-radius: 28px; overflow: hidden; }
    .elite-table { width: 100%; border-collapse: collapse; }
    .elite-table th { text-align: left; padding: 24px 32px; background: #f8fafc; color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase; }
    .elite-table td { padding: 20px 32px; border-bottom: 1px solid #f8fafc; vertical-align: middle; cursor: pointer; }
    .fade-in-row { transition: background 0.15s; }
    .fade-in-row:hover { background: #f8fafc; }
    .client-name-cell { display: flex; align-items: center; gap: 16px; }
    .client-avatar { width: 44px; height: 44px; border-radius: 14px; background: #e0f2fe; color: #0284c7; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; flex-shrink: 0; }
    .client-avatar.moral { background: #f0fdf4; color: #10b981; }
    .name-info { display: flex; flex-direction: column; }
    .main-name { font-weight: 700; color: #1e293b; font-size: 15px; }
    .sub-label { font-size: 12px; color: #94a3b8; font-weight: 600; }
    .id-badge { background: #f1f5f9; padding: 6px 12px; border-radius: 10px; font-family: monospace; font-size: 12px; color: #475569; }
    .id-badge.rne { background: #f0fdf4; color: #008766; }
    .type-pill { padding: 5px 12px; border-radius: 100px; font-size: 11px; font-weight: 800; background: #e0f2fe; color: #0284c7; }
    .type-pill.moral { background: #f0fdf4; color: #10b981; }
    .addr-cell { color: #64748b; font-size: 13px; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .empty-state, .loading-state { text-align: center; padding: 60px; color: #94a3b8; }

    /* MODAL */
    .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 3000; }
    .premium-modal { background: white; width: 620px; border-radius: 32px; overflow: hidden; }
    .modal-header-elite { padding: 32px 40px; background: #f8fafc; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; }
    .modal-title-group h2 { margin: 0; font-size: 22px; font-weight: 800; }
    .modal-title-group p { margin: 4px 0 0; color: #64748b; font-size: 14px; }
    .btn-close-modal { width: 36px; height: 36px; border-radius: 50%; border: none; background: #f1f5f9; color: #64748b; font-size: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
    .btn-close-modal:hover { background: #fee2e2; color: #ef4444; }
    .modal-body-elite { padding: 40px; }
    .type-toggle { display: flex; gap: 8px; background: #f1f5f9; padding: 6px; border-radius: 14px; }
    .toggle-opt { flex: 1; padding: 12px; text-align: center; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 700; color: #64748b; transition: 0.2s; }
    .toggle-opt.active { background: white; color: #008766; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .form-group label { display: block; font-size: 11px; font-weight: 800; margin-bottom: 8px; color: #64748b; text-transform: uppercase; }
    .form-group input, .form-group textarea { width: 100%; padding: 14px 18px; border-radius: 14px; border: 2px solid #f1f5f9; background: #f8fafc; font-family: inherit; box-sizing: border-box; outline: none; }
    .form-group input:focus, .form-group textarea:focus { border-color: #008766; }
    .form-group.full { grid-column: span 2; }
    .modal-footer-elite { padding: 32px 40px; display: flex; justify-content: flex-end; gap: 16px; background: #fafafa; border-top: 1px solid #f1f5f9; }
    .btn-cancel { padding: 14px 28px; border-radius: 12px; border: 2px solid #e2e8f0; background: white; color: #475569; font-weight: 700; cursor: pointer; }
    .btn-save { padding: 14px 32px; border-radius: 12px; border: none; background: #008766; color: white; font-weight: 800; cursor: pointer; }

    /* SIDE PANEL */
    .review-sidebar { 
      position: fixed; top: 0; right: -600px; width: 560px; height: 100vh; 
      background: white; z-index: 2100; transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: -20px 0 60px rgba(15, 23, 42, 0.12); border-left: 1px solid #f1f5f9;
      display: flex; flex-direction: column; overflow: hidden;
    }
    .review-sidebar.open { right: 0; }
    .rs-header { 
      padding: 32px 40px; border-bottom: 1px solid #f1f5f9; display: flex; 
      justify-content: space-between; align-items: flex-start; background: #ffffff; flex-shrink: 0;
    }
    .rs-title-group h2 { margin: 0 0 4px 0; font-size: 18px; font-weight: 800; color: #0f172a; }
    .rs-subtitle { margin: 0; font-size: 13px; color: #94a3b8; font-weight: 600; }
    .btn-close-rs { 
      width: 36px; height: 36px; border-radius: 50%; border: none; 
      background: #f8fafc; color: #64748b; font-size: 24px; cursor: pointer;
      display: flex; align-items: center; justify-content: center; transition: 0.2s; flex-shrink: 0;
    }
    .btn-close-rs:hover { background: #fee2e2; color: #ef4444; transform: rotate(90deg); }
    .rs-body { flex: 1; overflow-y: auto; padding: 32px 40px; background: #ffffff; }
    .rs-profile { 
      display: flex; flex-direction: column; align-items: center; text-align: center; 
      margin-bottom: 32px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      padding: 32px 24px; border-radius: 24px; border: 1px solid #f1f5f9;
    }
    .rs-avatar-large { 
      width: 88px; height: 88px; border-radius: 28px; background: #e0f2fe; color: #0284c7; 
      display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: 800;
      margin-bottom: 20px; box-shadow: 0 16px 32px rgba(2, 132, 199, 0.15);
      animation: avatarPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes avatarPop { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .rs-avatar-large.moral { background: #f0fdf4; color: #10b981; box-shadow: 0 16px 32px rgba(16, 185, 129, 0.15); }
    .rs-main-info h3 { margin: 0 0 10px 0; font-size: 22px; font-weight: 800; color: #0f172a; }
    .rs-type-label { padding: 6px 16px; border-radius: 100px; background: white; border: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; color: #64748b; }
    .rs-details-grid { display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px; }
    .rs-field { padding: 18px 20px; border-radius: 16px; border: 1.5px solid #f1f5f9; background: white; transition: all 0.2s; }
    .rs-field:hover { border-color: #e2e8f0; transform: translateX(4px); }
    .rs-field label { display: block; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.08em; }
    .rs-field p { margin: 0; font-size: 15px; font-weight: 700; color: #1e293b; }
    
    /* LITIGATION STATS BANNER */
    .litigation-banner {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
      margin-bottom: 28px; animation: fadeIn 0.4s ease-out;
    }
    .lit-stat {
      background: #f8fafc; border: 1.5px solid #f1f5f9; border-radius: 16px;
      padding: 16px 12px; text-align: center; transition: all 0.2s;
    }
    .lit-stat:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.06); }
    .lit-stat.accent-blue { background: #eff6ff; border-color: #bfdbfe; }
    .lit-stat.accent-green { background: #f0fdf4; border-color: #bbf7d0; }
    .lit-stat.accent-red { background: #fef2f2; border-color: #fecaca; }
    .lit-count { display: block; font-size: 28px; font-weight: 900; color: #0f172a; line-height: 1; margin-bottom: 6px; }
    .lit-stat.accent-blue .lit-count { color: #2563eb; }
    .lit-stat.accent-green .lit-count { color: #16a34a; }
    .lit-stat.accent-red .lit-count { color: #dc2626; }
    .lit-label { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }

    /* DOSSIERS SECTION */
    .dossiers-section-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 16px;
    }
    .dossiers-section-header h4 { margin: 0; font-size: 15px; font-weight: 800; color: #0f172a; }
    .dossiers-count-badge { 
      background: var(--bna-green); color: white; font-size: 12px; font-weight: 800;
      padding: 4px 12px; border-radius: 100px; 
    }
    .dossiers-loading { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 32px; color: #94a3b8; }
    .mini-spinner { width: 28px; height: 28px; border: 3px solid #f1f5f9; border-top-color: #008766; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .dossiers-empty { text-align: center; padding: 40px 24px; color: #94a3b8; }
    .empty-icon { font-size: 44px; margin-bottom: 12px; }
    .dossiers-empty p { font-size: 14px; font-weight: 600; }
    .dossiers-list { display: flex; flex-direction: column; gap: 12px; }
    .dossier-card {
      border: 1.5px solid #f1f5f9; border-radius: 18px; padding: 20px 24px;
      cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      background: white;
    }
    .dossier-card:hover { 
      border-color: var(--bna-green); background: var(--bna-green-light);
      transform: translateX(5px); box-shadow: 0 8px 24px rgba(0, 135, 102, 0.1);
    }
    .dossier-card.archived { opacity: 0.6; background: #fafafa; }
    .dossier-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
    .dossier-ref { display: flex; align-items: center; gap: 8px; }
    .ref-chip { background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 8px; font-family: monospace; font-size: 12px; font-weight: 700; }
    .priority-dot { width: 8px; height: 8px; border-radius: 50%; }
    .prio-haute { background: #ef4444; box-shadow: 0 0 6px rgba(239,68,68,0.5); }
    .prio-moyenne { background: #f59e0b; box-shadow: 0 0 6px rgba(245,158,11,0.5); }
    .prio-basse { background: #22c55e; }
    .dossier-titre { margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #1e293b; line-height: 1.4; }
    .dossier-meta { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 12px; }
    .meta-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #64748b; font-weight: 600; }
    .verdict-tag { padding: 3px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; }
    .verdict-tag.win { background: #f0fdf4; color: #16a34a; }
    .verdict-tag.loss { background: #fef2f2; color: #dc2626; }
    .dossier-nav-hint { 
      display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; 
      color: #008766; opacity: 0; transition: opacity 0.2s;
    }
    .dossier-card:hover .dossier-nav-hint { opacity: 1; }

    /* STATUT BADGES */
    .statut-badge { padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; white-space: nowrap; }
    .statut-ouvert { background: #eff6ff; color: #2563eb; }
    .statut-en_cours { background: #fef9c3; color: #a16207; }
    .statut-cloture { background: #f0fdf4; color: #16a34a; }
    .statut-refuse { background: #fef2f2; color: #dc2626; }
    .statut-valide { background: #ecfdf5; color: #059669; }
    .statut-attente { background: #faf5ff; color: #7c3aed; }
    .statut-default { background: #f1f5f9; color: #64748b; }

    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .animate-scale-up { animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes scaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

    /* PAGINATION STYLES */
    .pagination-footer {
      margin-top: 24px; display: flex; justify-content: space-between; align-items: center;
      padding: 0 8px;
    }
    .pagination-info { font-size: 13px; color: #64748b; }
    .pagination-info b { color: #1e293b; }
    .pagination-controls { display: flex; align-items: center; gap: 12px; }
    .page-numbers { display: flex; gap: 6px; }
    .btn-page {
      background: white; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 10px;
      font-size: 13px; font-weight: 700; color: #475569; cursor: pointer;
      display: flex; align-items: center; gap: 8px; transition: all 0.2s;
    }
    .btn-page:hover:not(:disabled) { background: #f8fafc; border-color: #cbd5e1; color: #1e293b; }
    .btn-page:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-number {
      width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
      background: white; border: 1px solid #e2e8f0; border-radius: 10px;
      font-size: 13px; font-weight: 700; color: #64748b; cursor: pointer; transition: all 0.2s;
    }
    .btn-number:hover { border-color: #cbd5e1; color: #1e293b; }
    .btn-number.active { background: #008766; border-color: #008766; color: white; }
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

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  // Litigation identification state
  clientDossiers: any[] = [];
  loadingDossiers: boolean = false;

  constructor(
    private referentielService: ReferentielService,
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadData();
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => this.loadData());
  }

  loadData() {
    this.loading = true;
    const params: any = {
      search: this.searchQuery || null,
      page: this.currentPage,
      size: this.pageSize
    };
    if (this.clientType !== 'ALL') params.type = this.clientType;
    this.referentielService.getData('parties-litige', params).pipe(finalize(() => this.loading = false)).subscribe({
      next: (res) => {
        this.items = res.content || res || [];
        this.totalElements = res.totalElements || this.items.length;
        this.totalPages = res.totalPages || 1;
      },
      error: () => {
        this.items = [];
        this.totalElements = 0;
        this.totalPages = 0;
      }
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadData();
  }

  setClientType(type: 'ALL' | 'CJN' | 'PHYSIQUE') {
    this.clientType = type;
    this.currentPage = 0;
    this.loadData();
  }

  onSearchChange(query: string) {
    this.currentPage = 0;
    this.searchSubject.next(query);
  }

  onSelectItem(item: any) {
    this.selectedClient = item;
    this.clientDossiers = [];
    this.loadingDossiers = true;
    // Load all dossiers linked to this PartieLitige
    this.http.get<any[]>(`/api/referentiel/parties-litige/${item.id}/dossiers`)
      .pipe(finalize(() => this.loadingDossiers = false))
      .subscribe({
        next: (dossiers) => this.clientDossiers = dossiers,
        error: () => this.clientDossiers = []
      });
  }

  navigateToDossier(dossier: any) {
    this.selectedClient = null;
    this.router.navigate(['/mes-dossiers'], { queryParams: { ref: dossier.reference } });
  }

  isAllowedToAdd() { return this.authService.hasRole('ROLE_CHARGE_DOSSIER') || this.authService.hasRole('ROLE_ADMIN'); }

  // Litigation stats helpers
  getDossiersEnCours(): number {
    return this.clientDossiers.filter(d => ['OUVERT', 'EN_COURS', 'EN_ATTENTE_PREVALIDATION', 'EN_ATTENTE_VALIDATION'].includes(d.statut)).length;
  }
  getDossiersClotures(): number {
    return this.clientDossiers.filter(d => ['CLOTURE', 'VALIDE'].includes(d.statut)).length;
  }
  getDossiersUrgents(): number {
    return this.clientDossiers.filter(d => d.priorite === 'HAUTE' && !['CLOTURE', 'VALIDE', 'REFUSE'].includes(d.statut)).length;
  }

  getStatutClass(statut: string): string {
    if (!statut) return 'statut-badge statut-default';
    const s = statut.toLowerCase();
    if (s === 'ouvert') return 'statut-badge statut-ouvert';
    if (s === 'en_cours') return 'statut-badge statut-en_cours';
    if (s.includes('cloture') || s === 'cloture') return 'statut-badge statut-cloture';
    if (s === 'refuse') return 'statut-badge statut-refuse';
    if (s === 'valide') return 'statut-badge statut-valide';
    if (s.includes('attente')) return 'statut-badge statut-attente';
    return 'statut-badge statut-default';
  }

  formatStatut(statut: string): string {
    if (!statut) return '—';
    const map: Record<string, string> = {
      'OUVERT': 'Ouvert',
      'EN_COURS': 'En cours',
      'EN_ATTENTE_PREVALIDATION': 'Pré-valid.',
      'EN_ATTENTE_VALIDATION': 'Validation',
      'EN_ATTENTE_PREVALIDATION_CLOTURE': 'Clôt. Pré-val.',
      'EN_ATTENTE_VALIDATION_CLOTURE': 'Clôt. Val.',
      'VALIDE': 'Validé',
      'CLOTURE': 'Clôturé',
      'REFUSE': 'Refusé',
    };
    return map[statut] || statut;
  }

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

  isFormValid() { return this.getMissingFields().length === 0; }

  saveClient() {
    if (!this.isFormValid()) {
      alert("Veuillez remplir les champs obligatoires : " + this.getMissingFields().join(', '));
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
          if (err.status === 403) {
            alert("Erreur 403 : Accès refusé.");
          } else {
            alert("Erreur d'enregistrement (" + err.status + "): " + (err.error?.message || "Erreur serveur"));
          }
        }
      });
  }

  resetForm() { this.newClient = { nom: '', prenom: '', type: 'CJN', identifiantFiscal: '', cin: '', adresse: '', telephone: '' }; }
}
