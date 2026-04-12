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
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo-wrapper">
           <img src="/assets/images/cleanly.png" alt="BNA Logo" class="sidebar-logo">
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <div class="nav-top-group">
          <!-- Main Dashboard Link -->
          <a class="nav-item" routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Tableau de Bord
          </a>
          
          <!-- ADMIN SECTION -->
          <ng-container *ngIf="isAdmin()">
            <div class="nav-section-title">ADMINISTRATION SYSTÈME</div>
            
            <a class="nav-item" routerLink="/admin/users" routerLinkActive="active">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
               Gestion Utilisateurs
            </a>

            <a class="nav-item" routerLink="/litige" routerLinkActive="active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 2a10 10 0 0 1 10 10h-10V2z"></path><path d="M12 12L2.2 7.3"></path><path d="M12 12l9.8 4.7"></path><path d="M12 12v10"></path></svg>
              Identification Litige
            </a>

            <a class="nav-item group-header" routerLink="/referentiel" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="toggleReferentiel()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Référentiel
            </a>
            <div class="nav-submenu" *ngIf="isReferentielOpen">
              <div class="menu-category-title">Acteurs Juridiques</div>
              <a class="nav-item sub-item" routerLink="/referentiel/avocats" routerLinkActive="active">Avocats</a>
              <a class="nav-item sub-item" routerLink="/referentiel/experts" routerLinkActive="active">Experts</a>
              <a class="nav-item sub-item" routerLink="/referentiel/huissiers" routerLinkActive="active">Huissiers</a>
              <a class="nav-item sub-item" routerLink="/referentiel/notaires" routerLinkActive="active">Notaires</a>
              <!-- Submenu remains same for Admin -->
            </div>
            
            <a class="nav-item" routerLink="/admin/logs" routerLinkActive="active">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
               Journaux d'Audit
            </a>
          </ng-container>

          <!-- NON-ADMIN DOSSIER MANAGEMENT -->
          <ng-container *ngIf="!isAdmin()">
            <div class="nav-section-title">GESTION DES DOSSIERS</div>
            <a class="nav-item" routerLink="/mes-dossiers" routerLinkActive="active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              Tous les Dossiers
            </a>
            <a class="nav-item" routerLink="/affaires" routerLinkActive="active" *ngIf="isChargeDossier()" style="font-weight: 800;">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
               Affaires
            </a>
            <a class="nav-item" routerLink="/litige" routerLinkActive="active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 2a10 10 0 0 1 10 10h-10V2z"></path><path d="M12 12L2.2 7.3"></path><path d="M12 12l9.8 4.7"></path><path d="M12 12v10"></path></svg>
              Identification Litige
            </a>
            <a class="nav-item group-header" routerLink="/referentiel" routerLinkActive="active" (click)="toggleReferentiel()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Référentiel
            </a>
            <a class="nav-item" routerLink="/action-justice" routerLinkActive="active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
              Action en Justice
            </a>
          </ng-container>

          <!-- FINANCIAL (NON-ADMIN) -->
          <ng-container *ngIf="(isChargeDossier() || isPreValidateur() || isValidateur()) && !isAdmin()">
            <div class="nav-section-title"> GESTION FINANCIÈRE</div>
            <a class="nav-item" routerLink="/mes-frais" routerLinkActive="active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
              Suivi des Frais
            </a>
          </ng-container>

          <!-- SHARED NETWORK SECTION -->
          <div class="nav-section-title">RÉSEAU BNA</div>
          <a class="nav-item" routerLink="/invitations" routerLinkActive="active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="17" y1="11" x2="23" y2="11"></line></svg>
            Invitations & Réseau
          </a>
          <a class="nav-item" routerLink="/admin/chat" routerLinkActive="active">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
             Messagerie Support
          </a>

          <!-- RECENT DOSSIERS -->
          <ng-container *ngIf="recentDossiers.length > 0 && !isAdmin()">
            <div class="nav-section-title">DOSSIERS RÉCENTS</div>
            <div class="fav-list">
              <a class="fav-item" *ngFor="let d of recentDossiers" (click)="onViewDossier(d)">
                <div class="fav-dot" [ngClass]="d.statut === 'OUVERT' ? 'green' : 'grey'"></div>
                <span>{{ d.reference }}</span>
              </a>
            </div>
          </ng-container>
        </div>
      </nav>


      
    </aside>
  `,
  styleUrls: ['./sidebar.component.css']
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
