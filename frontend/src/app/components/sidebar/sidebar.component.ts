import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DossierService } from '../../services/dossier.service';
import { Dossier } from '../../models/dossier.model';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="sidebar-overlay" *ngIf="(sidebarService.sidebarOpen$ | async)" (click)="toggle()"></div>
    <aside class="sidebar" 
           [class.collapsed]="!(sidebarService.sidebarOpen$ | async)"
           [class.mobile-visible]="(sidebarService.sidebarOpen$ | async)">
      <div class="sidebar-header">
        <div class="logo-wrapper">
           <img src="/assets/images/cleanly.png" alt="BNA Logo" class="sidebar-logo">
        </div>
        <div class="brand-text">Action en Défense BNA</div>
      </div>
      
      <nav class="sidebar-nav">
        <div class="nav-top-group">
          <a class="nav-item" routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Tableau de Bord
          </a>
          
          <ng-container *ngIf="!isAdmin()">
            <div class="nav-section-title">GESTION DES DOSSIERS</div>
            <a class="nav-item" routerLink="/mes-dossiers" routerLinkActive="active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              Tous les Dossiers
            </a>
            <a class="nav-item" routerLink="/nouveau-dossier" routerLinkActive="active" *ngIf="isChargeDossier()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              Nouveau Dossier
            </a>
          </ng-container>

          <div class="nav-item group-header" (click)="toggleReferentiel()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Référentiel
            <svg class="chevron" [class.open]="isReferentielOpen" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          <div class="nav-submenu" *ngIf="isReferentielOpen">
            <!-- ⚖️ Acteurs Juridiques -->
            <div class="menu-category-title">⚖️ Acteurs Juridiques</div>
            <a class="nav-item sub-item" routerLink="/referentiel/avocats" routerLinkActive="active">Avocats</a>
            <a class="nav-item sub-item" routerLink="/referentiel/experts" routerLinkActive="active">Experts</a>
            <a class="nav-item sub-item" routerLink="/referentiel/huissiers" routerLinkActive="active">Huissiers</a>
            <a class="nav-item sub-item" routerLink="/referentiel/notaires" routerLinkActive="active">Notaires</a>
            <a class="nav-item sub-item" routerLink="/referentiel/mandataires" routerLinkActive="active">Mandataires</a>
            <a class="nav-item sub-item" routerLink="/referentiel/greffiers" routerLinkActive="active">Greffiers</a>

            <!-- 🏛️ Juridictions Tunisiennes -->
            <div class="menu-category-title">🏛️ Juridictions</div>
            <a class="nav-item sub-item" routerLink="/referentiel/tribunaux" routerLinkActive="active">Tribunaux</a>
            <a class="nav-item sub-item" routerLink="/referentiel/cours-appel" routerLinkActive="active">Cours d'Appel</a>
            <a class="nav-item sub-item" routerLink="/referentiel/cours-cassation" routerLinkActive="active">Cours de Cassation</a>
            <a class="nav-item sub-item" routerLink="/referentiel/parquets" routerLinkActive="active">Parquets (Ministère Public)</a>
            <a class="nav-item sub-item" routerLink="/referentiel/arbitrage" routerLinkActive="active">Médiation & Arbitrage</a>

            <!-- 📋 Références Procédurales -->
            <div class="menu-category-title">📋 Procédures</div>
            <a class="nav-item sub-item" routerLink="/referentiel/types-proceduraux" routerLinkActive="active">Types de Procédures</a>
            <a class="nav-item sub-item" routerLink="/referentiel/natures-affaires" routerLinkActive="active">Natures d'Affaires</a>
            <a class="nav-item sub-item" routerLink="/referentiel/phases-procedurales" routerLinkActive="active">Phases de Procédure</a>

            <!-- 💰 Références Financières -->
            <div class="menu-category-title">💰 Finances & Fiscalité</div>
            <a class="nav-item sub-item" routerLink="/referentiel/baremes" routerLinkActive="active">Barèmes des Frais</a>
            <a class="nav-item sub-item" routerLink="/referentiel/tva-timbres" routerLinkActive="active">TVA & Timbre Fiscal</a>
            <a class="nav-item sub-item" routerLink="/referentiel/devises" routerLinkActive="active">Devises</a>
            <a class="nav-item sub-item" routerLink="/referentiel/modes-reglement" routerLinkActive="active">Modes de Règlement</a>
          </div>
          
          <ng-container *ngIf="(isChargeDossier() || isPreValidateur() || isValidateur()) && !isAdmin()">
            <div class="nav-section-title"> GESTION FINANCIÈRE</div>
            <a class="nav-item" routerLink="/mes-frais" routerLinkActive="active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
              Suivi des Frais
            </a>
            <a class="nav-item" routerLink="/frais-review" routerLinkActive="active" *ngIf="isPreValidateur() || isAdmin()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Revue des Honoraires
            </a>
          </ng-container>

          <div class="nav-section-title">RÉSEAU BNA</div>
          <a class="nav-item" routerLink="/invitations" routerLinkActive="active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="17" y1="11" x2="23" y2="11"></line></svg>
            Invitations & Réseau
          </a>

          
          <ng-container *ngIf="isAdmin()">
            <div class="nav-section-title">ADMINISTRATION SYSTÈME</div>
            <a class="nav-item" routerLink="/admin/users" routerLinkActive="active">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
               Gestion Utilisateurs
            </a>
            <a class="nav-item" routerLink="/admin/logs" routerLinkActive="active">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
               Journaux d'Audit
            </a>
            <a class="nav-item" routerLink="/admin/chat" routerLinkActive="active">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
               Messagerie Support
            </a>
            <a class="nav-item" routerLink="/parametres" routerLinkActive="active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              Configuration
            </a>
          </ng-container>

          <div class="nav-section-title" *ngIf="recentDossiers.length > 0 && !isAdmin()">DOSSIERS RÉCENTS</div>
          <div class="fav-list" *ngIf="!isAdmin()">
            <a class="fav-item" *ngFor="let d of recentDossiers" (click)="onViewDossier(d)">
              <div class="fav-dot" [ngClass]="d.statut === 'OUVERT' ? 'green' : 'grey'"></div>
              <span>{{ d.reference }}</span>
            </a>
          </div>

          <div class="nav-section-title">ÉCHÉANCES CLÉS</div>
          <div class="deadline-box">
            <div class="deadline-item">
              <span class="deadline-date">24 Mar</span>
              <span class="deadline-text">Audience Tribunal Tunis</span>
            </div>
            <div class="deadline-item">
              <span class="deadline-date">02 Avr</span>
              <span class="deadline-text">Dépôt Bordereau Frais</span>
            </div>
          </div>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="help-box">
          <div class="help-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <div class="help-content">
            <h4>Besoin d'aide ?</h4>
            <p>Support IT interne</p>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 250px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-right: 1px solid rgba(0,0,0,0.04);
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      z-index: 20;
      box-shadow: 4px 0 24px rgba(0,0,0,0.02);
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .sidebar.collapsed { width: 70px; }
    .sidebar.collapsed .brand-text, 
    .sidebar.collapsed .nav-section-title,
    .sidebar.collapsed .help-content,
    .sidebar.collapsed .nav-item span:not(.icon),
    .sidebar.collapsed .nav-item::after,
    .sidebar.collapsed .badge-dot,
    .sidebar.collapsed .deadline-box,
    .sidebar.collapsed .fav-list { display: none; }
    
    /* Ensure icon-only mode works for navigation items */
    .sidebar.collapsed .nav-item { justify-content: center; padding: 14px 0; }
    .sidebar.collapsed .nav-item svg { margin: 0; }
    .sidebar.collapsed .logo-wrapper { padding: 8px; }
    .sidebar.collapsed .sidebar-logo { height: 32px; }
    .sidebar-overlay {
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.3);
      backdrop-filter: blur(4px);
      z-index: 15;
      display: none;
    }
    @media (max-width: 1024px) {
      .sidebar {
        transform: translateX(-100%);
      }
      .sidebar.mobile-visible {
        transform: translateX(0);
      }
      .sidebar-overlay {
        display: block;
      }
    }
    .sidebar-header {
      padding: 32px 24px 24px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      border-bottom: 1px solid rgba(0,0,0,0.04);
    }
    .logo-wrapper {
      padding: 12px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.04);
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
    }
    .sidebar-logo { height: 60px; width: auto; object-fit: contain; }
    .brand-text {
      font-size: 14px; font-weight: 800; color: #005641;
      text-transform: uppercase; letter-spacing: 1.5px; text-align: center;
    }
    .sidebar-nav { padding: 32px 20px; display: flex; flex-direction: column; flex: 1; overflow-y: auto; }
    .nav-top-group { display: flex; flex-direction: column; gap: 8px; }
    .nav-section-title {
      font-size: 11px; font-weight: 700; color: #94a3b8;
      text-transform: uppercase; letter-spacing: 1.2px; margin: 24px 0 12px 18px;
    }
    .nav-item {
      display: flex; align-items: center; gap: 14px; padding: 14px 18px;
      border-radius: 14px; color: #64748b; font-size: 15px; font-weight: 600;
      text-decoration: none; cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative; overflow: hidden;
    }
    .nav-item::before {
      content: ''; position: absolute; left: 0; top: 50%; height: 70%; width: 5px;
      background: #008766; transform: translateY(-50%) scaleY(0);
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border-radius: 0 4px 4px 0;
    }
    .nav-item:hover { background-color: rgba(0, 135, 102, 0.08); color: #007256; transform: translateX(4px); }
    .nav-item.active { background: rgba(0, 135, 102, 0.08); color: #008766; font-weight: 700; }
    .nav-item.active::before { transform: translateY(-50%) scaleY(1); }
    .nav-item.active svg { stroke: #008766; filter: drop-shadow(0 2px 4px rgba(0,135,102,0.3)); }
    .sidebar-footer { padding: 0 20px 24px 20px; }
    .help-box {
      background: #f8fafc; padding: 20px; border-radius: 20px; border: 1px solid rgba(0,0,0,0.03);
      display: flex; align-items: center; gap: 16px; transition: all 0.2s;
    }
    .help-box:hover { background: white; transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.06); border-color: rgba(0, 135, 102, 0.1); }
    .help-icon {
      background: white; color: #008766; width: 44px; height: 44px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.03); border: 1px solid rgba(0, 135, 102, 0.1);
    }
    .help-content h4 { margin: 0 0 4px 0; font-size: 14px; font-weight: 800; color: #1e293b; }
    .help-content p { margin: 0; font-size: 12px; color: #64748b; }
    .fav-list { display: flex; flex-direction: column; gap: 4px; padding: 0 12px; }
    .fav-item { 
      display: flex; align-items: center; gap: 12px; padding: 10px 14px; 
      border-radius: 10px; font-size: 14px; color: #1e293b; font-weight: 500;
      text-decoration: none; transition: all 0.2s;
    }
    .fav-item:hover { background: #f1f5f9; color: #008766; }
    .fav-dot { width: 8px; height: 8px; border-radius: 50%; }
    .fav-dot.green { background: #10b981; }
    .fav-dot.grey { background: #94a3b8; }
    .deadline-box { display: flex; flex-direction: column; gap: 8px; padding: 0 12px; }
    .deadline-item { 
      display: flex; align-items: center; gap: 12px; padding: 10px; 
      background: rgba(255,255,255,0.5); border-radius: 12px; border: 1px solid rgba(0,0,0,0.02);
    }
    .deadline-date { 
      font-size: 11px; font-weight: 800; color: white; background: #008766; 
      padding: 4px 6px; border-radius: 6px; min-width: 45px; text-align: center;
    }
    .deadline-text { font-size: 12px; font-weight: 600; color: #1e293b; }
    .chevron { margin-left: auto; transition: transform 0.3s; }
    .chevron.open { transform: rotate(180deg); }
    .sub-item { padding-left: 52px; font-size: 14px; opacity: 0.85; }
    .menu-category-title {
      font-size: 10px; font-weight: 800; color: #94a3b8;
      text-transform: uppercase; letter-spacing: 1px;
      padding: 12px 24px 6px 44px; margin-top: 8px;
      border-top: 1px solid rgba(0,0,0,0.02);
    }
    .group-header { cursor: pointer; }
    .group-header:hover { background: rgba(0, 135, 102, 0.05); }
  `]
})
export class SidebarComponent implements OnInit {
  recentDossiers: Dossier[] = [];
  isReferentielOpen = false;
  constructor(
    private authService: AuthService,
    private dossierService: DossierService,
    private router: Router,
    public sidebarService: SidebarService
  ) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.loadRecentDossiers();
    }
  }

  toggle() {
    this.sidebarService.toggle();
  }

  toggleReferentiel() {
    this.isReferentielOpen = !this.isReferentielOpen;
  }

  loadRecentDossiers(): void {
    this.dossierService.getRecentDossiers().subscribe({
      next: (data: Dossier[]) => {
        this.recentDossiers = data;
      }
    });
  }

  isChargeDossier(): boolean {
    return this.authService.hasRole('ROLE_CHARGE_DOSSIER');
  }

  isPreValidateur(): boolean {
    return this.authService.hasRole('ROLE_PRE_VALIDATEUR');
  }

  isValidateur(): boolean {
    return this.authService.hasRole('ROLE_VALIDATEUR');
  }

  isAdmin(): boolean {
    return this.authService.hasRole('ROLE_ADMIN');
  }

  isSuperValidateur(): boolean {
    return this.authService.hasRole('ROLE_SUPER_VALIDATEUR');
  }

  onViewDossier(d: Dossier): void {
    this.router.navigate(['/mes-dossiers'], { queryParams: { highlight: d.reference } });
  }
}
