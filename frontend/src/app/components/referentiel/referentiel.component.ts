import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReferentielService, Auxiliaire, Tribunal } from '../../services/referentiel.service';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-referentiel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>

      <main class="main-content">
        <app-header title="Référentiel Auxiliaires"></app-header>

        <div class="dashboard-content">
          <div class="page-header-actions">
            <div>
              <h2>Gestion des Partenaires Juridiques</h2>
              <p class="subtitle">Annuaire centralisé des avocats, huissiers et experts mandatés par la BNA.</p>
            </div>
            <div class="actions-group" style="display: flex; gap: 12px;">
              <button class="btn-secondary" (click)="exportAnnuaire()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Exporter Annuaire
              </button>
              <button class="btn-primary" *ngIf="canManageReferentiel()" (click)="showModal = true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="16" y1="11" x2="22" y2="11"></line></svg>
                Nouvel Auxiliaire
              </button>
            </div>
          </div>

          <div class="filter-tabs">
            <button class="tab" [class.active]="activeTab === 'ALL'" (click)="activeTab = 'ALL'">Partenaires</button>
            <button class="tab" [class.active]="activeTab === 'AVOCAT'" (click)="activeTab = 'AVOCAT'">Avocats</button>
            <button class="tab" [class.active]="activeTab === 'HUISSIER'" (click)="activeTab = 'HUISSIER'">Huissiers</button>
            <button class="tab" [class.active]="activeTab === 'EXPERT'" (click)="activeTab = 'EXPERT'">Experts</button>
            <button class="tab" [class.active]="activeTab === 'ACTEURS_JURIDIQUES'" (click)="activeTab = 'ACTEURS_JURIDIQUES'">Acteures Juridiques (Notaires...)</button>
            <button class="tab" [class.active]="activeTab === 'TRIBUNAL'" (click)="activeTab = 'TRIBUNAL'">Jurisdictions</button>
            <button class="tab" [class.active]="activeTab === 'PROCEDURES'" (click)="activeTab = 'PROCEDURES'">Procédures</button>
            <button class="tab" [class.active]="activeTab === 'FINANCE'" (click)="activeTab = 'FINANCE'">Finance & Fiscalité</button>
          </div>

          <div class="aux-grid" *ngIf="activeTab !== 'TRIBUNAL'">
            <div class="aux-card" *ngFor="let aux of filteredAuxiliaires()">
              <div class="aux-type-badge" [ngClass]="aux.type.toLowerCase()">{{ aux.type }}</div>
              <div class="aux-main">
                <div class="aux-avatar">{{ getInitials(aux.nom) }}</div>
                <div class="aux-info">
                  <h3>{{ aux.nom }}</h3>
                  <p class="specialite">{{ aux.specialite || 'Généraliste' }}</p>
                </div>
              </div>
              <div class="aux-details">
                <div class="detail-row">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  <span>{{ aux.adresse }}</span>
                </div>
                <div class="detail-row">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  <span>{{ aux.telephone }}</span>
                </div>
              </div>
              <div class="aux-footer">
                <div style="display: flex; gap: 12px; align-items: center;">
                  <button class="btn-text" [routerLink]="['/avocat-detail', aux.id]">Profil</button>
                  <button class="btn-text highlight" (click)="contacter(aux)">Contacter</button>
                </div>
                <button class="btn-icon-only" (click)="contacter(aux)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </button>
              </div>

            </div>
          </div>

          <!-- TRIBUNAL / JURISDICTION VIEW -->
          <div class="tribunal-container" *ngIf="activeTab === 'TRIBUNAL'">
            <div class="card-list">
              <div class="table-card" *ngFor="let t of filteredTribunaux()">
                <div class="table-card-header">
                  <div class="court-icon">{{ getCourtIcon(t.type) }}</div>
                  <div class="court-info">
                    <h3>{{ t.nom }}</h3>
                    <div class="badge-group">
                      <span class="region-badge">{{ t.region }}</span>
                      <span class="type-badge" *ngIf="t.type">{{ t.type }}</span>
                    </div>
                  </div>
                </div>
                <div class="table-card-body">
                  <div class="info-row" *ngIf="t.chefParquet">
                    <strong>Chef du Parquet:</strong> <span>{{ t.chefParquet }}</span>
                  </div>
                  <div class="info-row" *ngIf="t.arbitreDesigne">
                    <strong>Arbitre désigné:</strong> <span>{{ t.arbitreDesigne }}</span>
                  </div>
                  <div class="info-row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span>{{ t.adresse || 'Adresse non renseignée' }}</span>
                  </div>
                  <div class="info-row" *ngIf="t.telephone">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    <span>{{ t.telephone }}</span>
                  </div>
                  
                  <div class="card-actions-bottom" *ngIf="canManageReferentiel()">
                     <button class="btn-action-outline" (click)="editTribunal(t)">
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                       Modifier
                     </button>
                     <button class="btn-action-outline delete" (click)="confirmDeleteTribunal(t)">
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                       Supprimer
                     </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- PROCEDURES & FINANCE LISTS -->
          <div class="generic-list-container" *ngIf="['PROCEDURES', 'FINANCE'].includes(activeTab)">
            <div class="referentiel-info-card">
              <h3>Référentiels {{ activeTab === 'PROCEDURES' ? 'Procéduraux' : 'Financiers' }}</h3>
              <p>Liste des nomenclatures et grilles tarifaires officielles.</p>
              
              <div class="list-grid">
                <div class="list-item-pro" *ngFor="let item of genericList">
                   <div class="item-main">
                     <span class="item-name">{{ item.nom }}</span>
                     <span class="item-desc" *ngIf="item.description">{{ item.description }}</span>
                   </div>
                   <div class="item-value" *ngIf="item.valeur || item.taux">
                     {{ item.valeur ? (item.valeur | number:'1.2-2') + ' TND' : (item.taux + '%') }}
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- NEW AUXILIAIRE MODAL -->
        <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Ajouter un Auxiliaire</h2>
              <button class="btn-close" (click)="closeModal()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <form (ngSubmit)="saveAuxiliaire()">
              <div class="form-group">
                <label>Nom & Prénom *</label>
                <input type="text" [(ngModel)]="newAux.nom" name="nom" required class="form-control" placeholder="Ex: Maître Ben Ali">
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Profession *</label>
                  <select [(ngModel)]="newAux.type" name="type" required class="form-control">
                    <option value="AVOCAT">Avocat</option>
                    <option value="HUISSIER">Huissier</option>
                    <option value="EXPERT">Expert</option>
                    <option value="NOTAIRE">Notaire</option>
                    <option value="MANDATAIRE">Mandataire</option>
                    <option value="GREFFIER">Greffier</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Spécialité</label>
                  <input type="text" [(ngModel)]="newAux.specialite" name="specialite" class="form-control" placeholder="Ex: Droit des Affaires">
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Email *</label>
                  <input type="email" [(ngModel)]="newAux.email" name="email" required class="form-control" placeholder="email@domaine.com">
                </div>
                <div class="form-group">
                  <label>Téléphone *</label>
                  <input type="text" [(ngModel)]="newAux.telephone" name="telephone" required class="form-control" placeholder="Numéro de contact">
                </div>
              </div>

              <div class="form-group">
                <label>Adresse du cabinet *</label>
                <textarea [(ngModel)]="newAux.adresse" name="adresse" required class="form-control" rows="2" placeholder="Adresse complète"></textarea>
              </div>
              
              <div class="modal-footer">
                <button type="button" class="btn-secondary" (click)="closeModal()">Annuler</button>
                <button type="submit" class="btn-primary" [disabled]="!isFormValid()">Enregistrer Partenaire</button>
              </div>
            </form>
          </div>
        </div>

        <!-- NEW TRIBUNAL MODAL -->
        <div class="modal-overlay" *ngIf="showTribunalModal" (click)="closeTribunalModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ currentTribunalId ? 'Modifier' : 'Ajouter' }} un Tribunal</h2>
              <button class="btn-close" (click)="closeTribunalModal()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <form (ngSubmit)="saveTribunal()">
              <div class="form-group">
                <label>Nom du Tribunal *</label>
                <input type="text" [(ngModel)]="newTribunal.nom" name="nom" required class="form-control" placeholder="Ex: Tribunal de Première Instance de Tunis">
              </div>
              <div class="form-group">
                <label>Région / Gouvernorat *</label>
                <input type="text" [(ngModel)]="newTribunal.region" name="region" required class="form-control" placeholder="Ex: Tunis">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Téléphone</label>
                  <input type="text" [(ngModel)]="newTribunal.telephone" name="telephone" class="form-control" placeholder="71 ...">
                </div>
              </div>
              <div class="form-group">
                <label>Adresse détaillée</label>
                <textarea [(ngModel)]="newTribunal.adresse" name="adresse" class="form-control" rows="2" placeholder="Rue, Ville..."></textarea>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn-secondary" (click)="closeTribunalModal()">Annuler</button>
                <button type="submit" class="btn-primary" [disabled]="!isTribunalFormValid()">
                  {{ currentTribunalId ? 'Mettre à jour' : 'Enregistrer Tribunal' }}
                </button>
              </div>
            </form>
          </div>
        </div>

      </main>
    </div>
  `,
  styles: [`
    :host {
      --bg-color: #f8fafc;
      --sidebar-width: 280px;
      --bna-green: #008766;
      --bna-green-light: rgba(0, 135, 102, 0.08);
      --bna-green-dark: #00684d;
      --text-main: #1e293b;
      --text-muted: #64748b;
      --card-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
    }

    .app-layout { display: flex; min-height: 100vh; background-color: var(--bg-color); font-family: 'Outfit', sans-serif; }
    .main-content { flex: 1; margin-left: var(--sidebar-width); display: flex; flex-direction: column; }
    .dashboard-content { padding: 40px; max-width: 1400px; width: 100%; margin: 0 auto; }
    
    .page-header-actions { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
    .page-header-actions h2 { font-size: 32px; font-weight: 800; color: var(--text-main); margin: 0 0 8px 0; letter-spacing: -0.5px; }
    .subtitle { color: var(--text-muted); font-size: 16px; margin: 0; font-weight: 500; }
    
    .filter-tabs { display: flex; gap: 8px; margin-bottom: 32px; background: #e2e8f0; padding: 6px; border-radius: 16px; width: fit-content; }
    .tab { padding: 10px 24px; border-radius: 12px; border: none; background: transparent; color: var(--text-muted); font-weight: 700; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); font-size: 14px; }
    .tab.active { background: white; color: var(--bna-green); box-shadow: 0 4px 12px rgba(0,0,0,0.08); transform: translateY(-1px); }
    .tab:hover:not(.active) { color: var(--text-main); background: rgba(255,255,255,0.5); }
    
    .aux-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 32px; }
    .aux-card { 
      background: white; border-radius: 28px; padding: 32px; border: 1px solid rgba(0,0,0,0.04); 
      box-shadow: var(--card-shadow); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative;
      overflow: hidden;
    }
    .aux-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 6px; background: transparent; transition: 0.3s; }
    .aux-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1); }
    .aux-card:hover::before { background: var(--bna-green); }
    
    .aux-type-badge { position: absolute; top: 32px; right: 32px; padding: 6px 12px; border-radius: 10px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
    .aux-type-badge.avocat { background: #eff6ff; color: #2563eb; }
    .aux-type-badge.huissier { background: #fffbeb; color: #d97706; }
    .aux-type-badge.expert { background: #f0fdf4; color: #166534; }
    
    .aux-main { display: flex; align-items: center; gap: 20px; margin-bottom: 28px; }
    .aux-avatar { width: 64px; height: 64px; border-radius: 20px; background: var(--bna-green-light); color: var(--bna-green); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 24px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05); }
    .aux-info h3 { margin: 0; font-size: 20px; font-weight: 800; color: var(--text-main); }
    .specialite { margin: 4px 0 0 0; font-size: 15px; color: var(--text-muted); font-weight: 600; }
    
    .aux-details { display: flex; flex-direction: column; gap: 16px; padding: 24px 0; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; margin-bottom: 24px; }
    .detail-row { display: flex; align-items: flex-start; gap: 14px; color: #475569; font-size: 14px; line-height: 1.5; }
    .detail-row svg { color: var(--text-muted); margin-top: 2px; flex-shrink: 0; }
    
    .aux-footer { display: flex; justify-content: space-between; align-items: center; }
    .btn-text { background: none; border: none; color: var(--bna-green); font-weight: 700; font-size: 14px; cursor: pointer; padding: 0; transition: 0.2s; border-bottom: 2px solid transparent; }
    .btn-text:hover { color: var(--bna-green-dark); border-bottom-color: var(--bna-green-dark); }
    .btn-text.highlight { color: #2563eb; }
    .btn-text.highlight:hover { border-bottom-color: #2563eb; }
    
    .btn-icon-only { width: 44px; height: 44px; border-radius: 14px; border: 1.5px solid #e2e8f0; background: white; color: var(--text-muted); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s; }
    .btn-icon-only:hover { background: var(--bna-green-light); color: var(--bna-green); border-color: var(--bna-green); transform: rotate(15deg); }
    
    /* MODAL PROFESSIONAL DESIGN */
    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px);
      z-index: 2000; display: flex; align-items: center; justify-content: center;
      animation: fadeIn 0.3s ease-out;
    }
    .modal-content {
      background: white; border-radius: 32px; width: 100%; max-width: 700px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); overflow: hidden;
      animation: zoomIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); margin: 24px;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .modal-header {
      padding: 32px 40px; border-bottom: 1px solid #f1f5f9;
      display: flex; justify-content: space-between; align-items: center;
      background: #fafafa;
    }
    .modal-header h2 { margin: 0; font-size: 24px; font-weight: 800; color: var(--text-main); }
    .btn-close {
      background: #f1f5f9; border: none; cursor: pointer; color: var(--text-muted);
      width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    .btn-close:hover { background: #fee2e2; color: #ef4444; transform: rotate(90deg); }
    
    form { padding: 40px; display: flex; flex-direction: column; gap: 28px; }
    .form-group { display: flex; flex-direction: column; gap: 10px; }
    .form-group label { font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    
    .form-control {
      padding: 14px 20px; border-radius: 12px; border: 2px solid #e2e8f0; font-size: 15px;
      font-weight: 500; color: var(--text-main); transition: all 0.2s; background: #f8fafc;
      font-family: inherit;
    }
    .form-control:focus { outline: none; border-color: var(--bna-green); background: white; box-shadow: 0 0 0 5px var(--bna-green-light); }
    .form-control::placeholder { color: #94a3b8; }
    
    .modal-footer {
      padding: 32px 40px; background: #fafafa; border-top: 1px solid #f1f5f9;
      display: flex; justify-content: flex-end; gap: 16px;
    }

    .btn-secondary {
      background: white; color: var(--text-main); border: 2px solid #e2e8f0; padding: 12px 28px;
      border-radius: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s;
    }
    .btn-secondary:hover { background: #f1f5f9; border-color: #cbd5e1; transform: translateY(-2px); }
    
    .btn-primary { 
      background: linear-gradient(135deg, var(--bna-green) 0%, #10b981 100%); 
      color: white; border: none; padding: 13px 32px; 
      border-radius: 14px; font-weight: 800; cursor: pointer; 
      transition: all 0.3s; box-shadow: 0 10px 15px -3px rgba(0, 135, 102, 0.3);
    }
    .btn-primary:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 25px -5px rgba(0, 135, 102, 0.4); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; transform: none; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes zoomIn { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }

    @media (max-width: 1024px) {
      .main-content { margin-left: 0; }
      .dashboard-content { padding: 24px; }
      .page-header-actions { flex-direction: column; gap: 24px; }
      .actions-group { width: 100%; }
      .btn-primary, .btn-secondary { flex: 1; justify-content: center; }
    }

    /* TRIBUNAL & GENERIC LIST STYLING */
    .card-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 24px; }
    .table-card { 
      background: white; border-radius: 20px; padding: 24px; border: 1px solid #f1f5f9;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); transition: 0.3s;
    }
    .table-card:hover { transform: translateY(-5px); box-shadow: 0 12px 20px -5px rgba(0,0,0,0.1); border-color: var(--bna-green-light); }
    
    .table-card-header { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 20px; position: relative; }
    .court-icon { 
      width: 48px; height: 48px; border-radius: 12px; background: #f8fafc; 
      display: flex; align-items: center; justify-content: center; font-size: 24px;
      border: 1px solid #f1f5f9;
    }
    .court-info h3 { margin: 0 0 8px 0; font-size: 18px; font-weight: 800; color: var(--text-main); line-height: 1.2; }
    .badge-group { display: flex; gap: 8px; flex-wrap: wrap; }
    .region-badge { padding: 4px 10px; background: #eff6ff; color: #2563eb; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .type-badge { padding: 4px 10px; background: #f1f5f9; color: #64748b; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    
    .table-card-body { border-top: 1px solid #f8fafc; padding-top: 16px; display: flex; flex-direction: column; gap: 12px; }
    .info-row { display: flex; gap: 10px; font-size: 14px; color: var(--text-main); align-items: center; }
    .info-row svg { color: var(--text-muted); flex-shrink: 0; }
    .info-row strong { font-weight: 700; color: var(--text-muted); min-width: 110px; }

    .actions { position: absolute; top: 0; right: 0; }
    
    .card-actions-bottom { display: flex; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; }
    .btn-action-outline {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
      padding: 10px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: white;
      color: var(--text-muted); font-size: 13px; font-weight: 700; cursor: pointer; transition: 0.2s;
    }
    .btn-action-outline:hover { background: var(--bna-green-light); color: var(--bna-green); border-color: var(--bna-green); }
    .btn-action-outline.delete:hover { background: #fef2f2; color: #ef4444; border-color: #fca5a5; }

    /* GENERIC LISTS */
    .referentiel-info-card { background: white; border-radius: 24px; padding: 40px; border: 1px solid #f1f5f9; }
    .referentiel-info-card h3 { font-size: 24px; font-weight: 800; color: var(--text-main); margin-bottom: 8px; }
    .list-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(500px, 1fr)); gap: 16px; margin-top: 32px; }
    .list-item-pro { 
      padding: 20px 24px; background: #f8fafc; border-radius: 16px; display: flex; 
      justify-content: space-between; align-items: center; border: 1px solid transparent; transition: 0.2s;
    }
    .list-item-pro:hover { border-color: var(--bna-green); background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .item-main { display: flex; flex-direction: column; gap: 4px; }
    .item-name { font-weight: 700; color: var(--text-main); font-size: 15px; }
    .item-desc { font-size: 13px; color: var(--text-muted); }
    .item-value { font-weight: 800; color: var(--bna-green); font-size: 16px; }
  `]
})
export class ReferentielComponent implements OnInit {
  auxiliaires: Auxiliaire[] = [];
  tribunaux: any[] = [];
  activeTab: string = 'ALL';
  showModal = false;
  showTribunalModal = false;
  genericList: any[] = [];

  newAux: Omit<Auxiliaire, 'id' | 'createdAt'> = {
    nom: '',
    type: 'AVOCAT',
    adresse: '',
    telephone: '',
    email: '',
    specialite: '',
    numOrdreNational: ''
  };

  newTribunal: any = { nom: '', region: '', adresse: '', telephone: '' };
  currentTribunalId: number | null = null;

  constructor(
    private referentielService: ReferentielService,
    private chatService: ChatService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadAuxiliaires();
    this.loadTribunaux();

    this.route.params.subscribe(params => {
      const type = params['type'];
      if (type) {
        switch(type) {
          case 'avocats': this.activeTab = 'AVOCAT'; break;
          case 'experts': this.activeTab = 'EXPERT'; break;
          case 'huissiers': this.activeTab = 'HUISSIER'; break;
          case 'notaires': this.activeTab = 'ACTEURS_JURIDIQUES'; break;
          case 'mandataires': this.activeTab = 'ACTEURS_JURIDIQUES'; break;
          case 'greffiers': this.activeTab = 'ACTEURS_JURIDIQUES'; break;
          case 'tribunaux': this.activeTab = 'TRIBUNAL'; break;
          case 'cours-appel': this.activeTab = 'TRIBUNAL'; break;
          case 'cours-cassation': this.activeTab = 'TRIBUNAL'; break;
          case 'parquets': this.activeTab = 'TRIBUNAL'; break;
          case 'arbitrage': this.activeTab = 'TRIBUNAL'; break;
          case 'types-proceduraux': this.activeTab = 'PROCEDURES'; this.loadGeneric('types-proceduraux'); break;
          case 'natures-affaires': this.activeTab = 'PROCEDURES'; this.loadGeneric('natures-affaires'); break;
          case 'phases-procedurales': this.activeTab = 'PROCEDURES'; this.loadGeneric('phases-procedurales'); break;
          case 'baremes': this.activeTab = 'FINANCE'; this.loadGeneric('baremes'); break;
          case 'tva-timbres': this.activeTab = 'FINANCE'; this.loadGeneric('tva-timbres'); break;
          default: this.activeTab = 'ALL';
        }
      }
    });

    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'Ajouter Auxiliaire') {
        this.showModal = true;
      } else if (params['action'] === 'Nouveau Tribunal') {
        this.activeTab = 'TRIBUNAL';
        this.showTribunalModal = true;
      }
    });
  }

  loadAuxiliaires() {
    this.referentielService.getAuxiliaires().subscribe(data => this.auxiliaires = data);
  }

  loadTribunaux() {
    this.referentielService.getTribunaux().subscribe(data => this.tribunaux = data);
  }

  filteredAuxiliaires(): Auxiliaire[] {
    if (this.activeTab === 'ALL') return this.auxiliaires;
    if (this.activeTab === 'ACTEURS_JURIDIQUES') {
        return this.auxiliaires.filter(a => ['NOTAIRE', 'MANDATAIRE', 'GREFFIER'].includes(a.type));
    }
    const standardTypes = ['AVOCAT', 'HUISSIER', 'EXPERT'];
    if (standardTypes.includes(this.activeTab)) {
        return this.auxiliaires.filter(a => a.type === this.activeTab);
    }
    return [];
  }

  getInitials(nom: string): string {
    return nom.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  isAdmin(): boolean { return this.authService.hasRole('ROLE_ADMIN'); }
  canManageReferentiel(): boolean { 
    return this.authService.hasRole('ROLE_ADMIN') || 
           this.authService.hasRole('ROLE_SUPER_VALIDATEUR') || 
           this.authService.hasRole('ROLE_REFERENTIEL'); 
  }
  isChargeDossier(): boolean { return this.authService.hasRole('ROLE_CHARGE_DOSSIER'); }

  closeModal() {
    this.showModal = false;
    this.newAux = { nom: '', type: 'AVOCAT', adresse: '', telephone: '', email: '', specialite: '' };
  }

  isFormValid(): boolean {
    return !!(this.newAux.nom && this.newAux.type && this.newAux.email && this.newAux.telephone && this.newAux.adresse);
  }

  saveAuxiliaire() {
    if (!this.isFormValid()) return;

    this.referentielService.addAuxiliaire(this.newAux).subscribe({
      next: (saved: Auxiliaire) => {
        this.auxiliaires = [saved, ...this.auxiliaires];
        this.notificationService.addNotification("Auxiliaire ajouté avec succès !", "ROLE_ADMIN", "SUCCESS");
        this.closeModal();
      },
      error: () => this.notificationService.addNotification("Erreur lors de l'ajout.", "ROLE_ADMIN", "WARNING")
    });
  }
  closeTribunalModal() {
    this.showTribunalModal = false;
    this.currentTribunalId = null;
    this.newTribunal = { nom: '', region: '', adresse: '', telephone: '' };
  }

  isTribunalFormValid(): boolean {
    return !!(this.newTribunal.nom && this.newTribunal.region);
  }

  saveTribunal() {
    if (!this.isTribunalFormValid()) return;

    if (this.currentTribunalId) {
      this.referentielService.updateTribunal(this.currentTribunalId, this.newTribunal).subscribe({
        next: () => {
          this.notificationService.addNotification("Tribunal mis à jour.", "ROLE_ADMIN", "SUCCESS");
          this.loadTribunaux();
          this.closeTribunalModal();
        }
      });
    } else {
      this.referentielService.addTribunal(this.newTribunal).subscribe({
        next: () => {
          this.notificationService.addNotification("Tribunal ajouté.", "ROLE_ADMIN", "SUCCESS");
          this.loadTribunaux();
          this.closeTribunalModal();
        },
        error: () => this.notificationService.addNotification("Erreur lors de l'ajout.", "ROLE_ADMIN", "WARNING")
      });
    }
  }

  editTribunal(t: Tribunal) {
    this.currentTribunalId = t.id || null;
    this.newTribunal = { ...t };
    this.showTribunalModal = true;
  }

  confirmDeleteTribunal(t: Tribunal) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${t.nom} ?`)) {
      this.referentielService.deleteTribunal(t.id!).subscribe(() => {
        this.notificationService.addNotification("Tribunal supprimé.", "ROLE_ADMIN", "INFO");
        this.loadTribunaux();
      });
    }
  }

  loadGeneric(type: string) {
    this.referentielService.getItems(type).subscribe(data => this.genericList = data);
  }

  filteredTribunaux() {
    return this.tribunaux;
  }

  getCourtIcon(type: string | undefined): string {
    switch (type) {
      case 'APPEL': return '⚖️';
      case 'CASSATION': return '🏛️';
      case 'PARQUET': return '🛡️';
      case 'ARBITRAGE': return '🤝';
      default: return '🏛️';
    }
  }

  exportAnnuaire(): void {
    if (this.auxiliaires.length === 0) {
      this.notificationService.addNotification("Aucun auxiliaire à exporter.", "ROLE_REFERENTIEL", "WARNING");
      return;
    }
    const headers = ['Nom', 'Type', 'Spécialité', 'Téléphone', 'Email', 'Adresse', 'Date Ajout'];
    const rows = this.auxiliaires.map(aux => [
      aux.nom,
      aux.type,
      aux.specialite || 'Généraliste',
      aux.telephone,
      aux.email,
      aux.adresse,
      aux.createdAt ? new Date(aux.createdAt).toLocaleDateString() : ''
    ]);
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(';'))
    ].join('\n');

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'annuaire_auxiliaires.csv';
    link.click();
    this.notificationService.addNotification("Annuaire exporté (CSV).", "ROLE_REFERENTIEL", "SUCCESS");
  }

  contacter(aux: Auxiliaire) {
    this.chatService.findByAuxiliaire(aux.id!).subscribe({
        next: (user: any) => {
            if (window && (window as any).openChatWith) {
                (window as any).openChatWith(user.id, user.fullName);
            }
        },
        error: () => {
            this.notificationService.addNotification(
                `Cet auxiliaire (${aux.nom}) n'est pas encore inscrit à la messagerie directe.`, 
                'ROLE_REFERENTIEL', 
                'WARNING'
            );
        }
    });
  }
}
