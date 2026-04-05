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
        <app-header title="Commandement des Tiers"></app-header>
        
        <div class="page-container">
          <!-- SOVEREIGN REGISTRY HEADER -->
          <div class="banner-registry shadow-premium fade-in">
             <div class="banner-body-deck">
                <h1 class="executive-title-deck">REGISTRE DES PARTENAIRES</h1>
                <p class="executive-subtitle-deck">Gestion souveraine des auxiliaires, experts et juridictions mandatés par la BNA.</p>
             </div>
             <div class="banner-actions-deck">
                <button class="btn-executive secondary" (click)="exportAnnuaire()">EXPORTER CSV</button>
                <button class="btn-executive primary" *ngIf="canManageReferentiel()" (click)="showModal = true">+ NOUVEAU PARTENAIRE</button>
             </div>
          </div>

          <!-- SOVEREIGN COMMAND TABS -->
          <div class="tabs-command-deck shadow-premium fade-in">
             <button class="t-btn" [class.active]="activeTab === 'ALL'" (click)="activeTab = 'ALL'">PARTENAIRES</button>
             <button class="t-btn" [class.active]="activeTab === 'AVOCAT'" (click)="activeTab = 'AVOCAT'">AVOCATS</button>
             <button class="t-btn" [class.active]="activeTab === 'HUISSIER'" (click)="activeTab = 'HUISSIER'">HUISSIERS</button>
             <button class="t-btn" [class.active]="activeTab === 'EXPERT'" (click)="activeTab = 'EXPERT'">EXPERTS</button>
             <button class="t-btn" [class.active]="activeTab === 'TRIBUNAL'" (click)="activeTab = 'TRIBUNAL'">JURIDICTIONS</button>
             <button class="t-btn" [class.active]="activeTab === 'PROCEDURES'" (click)="activeTab = 'PROCEDURES'">PROCÉDURES</button>
             <button class="t-btn" [class.active]="activeTab === 'FINANCE'" (click)="activeTab = 'FINANCE'">FINANCE</button>
          </div>

          <!-- SOVEREIGN PARTNER GRID -->
          <div class="registry-grid-deck" *ngIf="activeTab !== 'TRIBUNAL' && !['PROCEDURES', 'FINANCE'].includes(activeTab)">
             <div class="premium-partner-card shadow-premium fade-in" *ngFor="let aux of filteredAuxiliaires()">
                <div class="tier-indicator" [ngClass]="aux.type.toLowerCase()"></div>
                <div class="card-head-deck">
                   <div class="avatar-aura-deck">{{ getInitials(aux.nom) }}</div>
                   <div class="info-aura-deck">
                      <h3>{{ aux.nom }}</h3>
                      <span class="type-tag">{{ aux.type }}</span>
                   </div>
                </div>
                <div class="card-body-deck">
                   <div class="meta-row-deck"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> <span>{{ aux.adresse }}</span></div>
                   <div class="meta-row-deck"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> <span>{{ aux.telephone || 'N/A' }}</span></div>
                </div>
                <div class="card-footer-deck">
                   <button class="btn-ghost-deck" [routerLink]="['/avocat-detail', aux.id]">CONSULTER PROFIL</button>
                   <button class="btn-aura-deck" (click)="contacter(aux)">CONTACTER</button>
                </div>
             </div>
          </div>

          <!-- JURISDICTION GRID -->
          <div class="registry-grid-deck" *ngIf="activeTab === 'TRIBUNAL'">
             <div class="premium-partner-card shadow-premium fade-in" *ngFor="let t of filteredTribunaux()">
                <div class="card-head-deck">
                   <div class="avatar-aura-deck court">{{ getCourtIcon(t.type) }}</div>
                   <div class="info-aura-deck">
                      <h3>{{ t.nom }}</h3>
                      <span class="type-tag">{{ t.region }}</span>
                   </div>
                </div>
                <div class="card-body-deck">
                   <div class="meta-row-deck"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> <span>{{ t.adresse || 'Tunisie' }}</span></div>
                </div>
                <div class="card-footer-deck" *ngIf="canManageReferentiel()">
                   <button class="btn-ghost-deck" (click)="editTribunal(t)">ÉDITER</button>
                   <button class="btn-ghost-deck danger" (click)="confirmDeleteTribunal(t)">SUPPRIMER</button>
                </div>
             </div>
          </div>
        </div>

        <!-- SOVEREIGN MODALS -->
        <div class="modal-overlay-sovereign" *ngIf="showModal" (click)="closeModal()">
           <div class="modal-bento shadow-premium fade-in" (click)="$event.stopPropagation()">
              <div class="bento-header">
                 <h2>AJOUTER UN AUXILIAIRE</h2>
                 <button (click)="closeModal()" class="close-btn-ghost"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
              </div>
              <form class="bento-form" (ngSubmit)="saveAuxiliaire()">
                 <div class="bento-row">
                    <div class="i-unit"><label>Dénomination / Nom Complet</label><input type="text" [(ngModel)]="newAux.nom" name="n" class="g-field"></div>
                    <div class="i-unit"><label>Profession</label><select [(ngModel)]="newAux.type" name="t" class="g-select"><option value="AVOCAT">Avocat</option><option value="HUISSIER">Huissier</option><option value="EXPERT">Expert</option></select></div>
                 </div>
                 <div class="bento-row">
                    <div class="i-unit"><label>Email Professionnel</label><input type="email" [(ngModel)]="newAux.email" name="e" class="g-field"></div>
                    <div class="i-unit"><label>Coordonnées Mobiles</label><input type="text" [(ngModel)]="newAux.telephone" name="p" class="g-field"></div>
                 </div>
                 <div class="i-unit"><label>Siège / Bureau</label><textarea [(ngModel)]="newAux.adresse" name="a" class="g-area"></textarea></div>
                 <div class="bento-footer"><button type="submit" class="btn-executive primary" [disabled]="!isFormValid()">ENREGISTRER PARTENAIRE</button></div>
              </form>
           </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-layout { display: flex; min-height: 100vh; background: transparent; }
    .main-content { flex: 1; margin-left: var(--sidebar-width); }
    .page-container { padding: 48px; max-width: 1300px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px; animation: fadeUp 0.6s ease-out; }

    /* HEADER BANNER */
    .banner-registry { 
      background: white; border-radius: 32px; padding: 40px; display: flex; justify-content: space-between; align-items: center;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border-left: 6px solid var(--bna-emerald);
    }
    .executive-title-deck { font-size: 32px; font-weight: 900; color: #0f172a; margin: 0 0 8px 0; letter-spacing: -1.5px; }
    .executive-subtitle-deck { font-size: 15px; color: #64748b; font-weight: 600; margin: 0; }
    .banner-actions-deck { display: flex; gap: 16px; }

    /* TABS COMMAND */
    .tabs-command-deck { 
      background: #0f172a; border-radius: 20px; padding: 8px; display: flex; gap: 8px; width: fit-content;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2); margin-top: -20px; z-index: 10;
    }
    .t-btn { 
      background: transparent; border: none; padding: 10px 20px; color: #94a3b8; font-weight: 850; font-size: 11px;
      letter-spacing: 1.5px; cursor: pointer; transition: 0.3s; border-radius: 14px;
    }
    .t-btn.active { background: var(--bna-emerald); color: white; box-shadow: 0 4px 15px rgba(0, 135, 102, 0.4); transform: translateY(-2px); }
    .t-btn:hover:not(.active) { color: white; background: rgba(255,255,255,0.1); }

    /* REGISTRY GRID */
    .registry-grid-deck { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 32px; }
    .premium-partner-card { 
      background: white; border-radius: 32px; padding: 32px; position: relative; overflow: hidden; 
      transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); display: flex; flex-direction: column; gap: 24px;
    }
    .premium-partner-card:hover { transform: translateY(-10px); box-shadow: 0 25px 50px rgba(0, 135, 102, 0.08); }
    .tier-indicator { position: absolute; top: 0; left: 0; right: 0; height: 6px; }
    .tier-indicator.avocat { background: #2563eb; }
    .tier-indicator.huissier { background: #ea580c; }
    .tier-indicator.expert { background: var(--bna-emerald); }

    .card-head-deck { display: flex; align-items: center; gap: 20px; }
    .avatar-aura-deck { 
      width: 60px; height: 60px; border-radius: 18px; background: #f1f5f9; 
      display: flex; align-items: center; justify-content: center; font-weight: 850; font-size: 22px; color: #0f172a;
    }
    .avatar-aura-deck.court { background: #0f172a; font-size: 28px; }
    .info-aura-deck h3 { font-size: 19px; font-weight: 850; color: #1e293b; margin: 0; }
    .type-tag { font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }

    .card-body-deck { display: flex; flex-direction: column; gap: 14px; padding: 20px 0; border-top: 2px solid #f8fafc; border-bottom: 2px solid #f8fafc; }
    .meta-row-deck { display: flex; align-items: flex-start; gap: 12px; color: #64748b; font-size: 13px; font-weight: 600; line-height: 1.4; }
    .meta-row-deck svg { color: #94a3b8; flex-shrink: 0; }

    .card-footer-deck { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; }
    .btn-ghost-deck { background: none; border: none; color: #94a3b8; font-weight: 850; font-size: 10px; letter-spacing: 1px; cursor: pointer; transition: 0.2s; }
    .btn-ghost-deck:hover { color: #0f172a; }
    .btn-ghost-deck.danger:hover { color: #ef4444; }
    .btn-aura-deck { background: #eff6ff; color: #2563eb; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 850; font-size: 10px; letter-spacing: 1px; cursor: pointer; }
    .btn-aura-deck:hover { background: #2563eb; color: white; transform: rotate(-3deg); }

    /* MODAL OVERHAUL */
    .modal-overlay-sovereign { position: fixed; inset: 0; background: rgba(15,23,42,0.6); backdrop-filter: blur(10px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px; animation: fadeIn 0.4s; }
    .modal-bento { background: white; border-radius: 32px; width: 100%; max-width: 650px; padding: 48px; border: 1px solid rgba(255,255,255,0.4); }
    .bento-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
    .bento-header h2 { font-size: 24px; font-weight: 950; color: #0f172a; letter-spacing: -1px; margin: 0; }
    .close-btn-ghost { background: none; border: none; color: #94a3b8; cursor: pointer; transition: 0.3s; }
    .close-btn-ghost:hover { transform: rotate(90deg); color: #ef4444; }

    .bento-form { display: flex; flex-direction: column; gap: 28px; }
    .bento-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .i-unit { display: flex; flex-direction: column; gap: 10px; }
    .i-unit label { font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; }
    .g-field, .g-select, .g-area { padding: 14px 18px; border-radius: 14px; border: 2.5px solid #f1f5f9; background: #f8fafc; font-family: inherit; font-size: 14px; font-weight: 700; color: #1e293b; transition: 0.3s; width: 100%; box-sizing: border-box; }
    .g-field:focus, .g-select:focus { border-color: var(--bna-emerald); outline: none; background: white; box-shadow: 0 10px 20px rgba(0, 135, 102, 0.05); }

    .bento-footer { margin-top: 20px; display: flex; justify-content: flex-end; }
    .btn-executive { padding: 16px 32px; border-radius: 16px; border: none; font-weight: 850; letter-spacing: 1px; font-size: 11px; cursor: pointer; transition: 0.3s; }
    .btn-executive.primary { background: var(--bna-emerald); color: white; box-shadow: 0 10px 20px rgba(0, 135, 102, 0.2); }
    .btn-executive.secondary { background: #f8fafc; color: #64748b; }
    .btn-executive:hover:not(:disabled) { transform: translateY(-3px); }

    @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `],
x; }
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
