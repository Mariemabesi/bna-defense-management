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
    <aside class="sidebar" [class.collapsed]="!(sidebarService.sidebarOpen$ | async)">
      <div class="sidebar-header">
        <div class="logo-card">
          <img src="/assets/images/cleanly.png" alt="BNA Logo" class="sidebar-logo">
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <!-- Dashboard (Shared) -->
        <a class="nav-item" routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          Tableau de Bord
        </a>

        <!-- ADMIN VIEW (As per Photo) -->
        <ng-container *ngIf="isAdmin()">
          <div class="nav-section-title">Administration Système</div>
          
          <a class="nav-item" routerLink="/admin/users" routerLinkActive="active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
            Gestion Utilisateurs
          </a>

          <a class="nav-item" routerLink="/litige" routerLinkActive="active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            Identification Litige
          </a>

          <a class="nav-item" routerLink="/referentiel" routerLinkActive="active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Référentiel
          </a>

          <a class="nav-item" routerLink="/admin/audit" routerLinkActive="active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Journaux d'Audit
          </a>

          <div class="nav-section-title">Réseau BNA</div>
          
          <a class="nav-item" routerLink="/invitations" routerLinkActive="active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="17" y1="11" x2="23" y2="11"></line></svg>
            Invitations & Réseau
          </a>

          <a class="nav-item" routerLink="/admin/chat" routerLinkActive="active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Messagerie Support
          </a>
        </ng-container>

        <!-- NON-ADMIN VIEW (Legacy structure) -->
        <ng-container *ngIf="!isAdmin()">
          <div class="nav-section-title">Gestion Opérationnelle</div>
          
          <a class="nav-item" routerLink="/mes-dossiers" routerLinkActive="active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            Tous les Dossiers
          </a>
          
          <a class="nav-item" routerLink="/affaires" routerLinkActive="active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Affaires
          </a>

          <a class="nav-item" routerLink="/litige" routerLinkActive="active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            Identification Litige
          </a>

          <a class="nav-item" routerLink="/action-justice" routerLinkActive="active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
            Action en Justice
          </a>

          <a class="nav-item" routerLink="/referentiel" routerLinkActive="active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Référentiel
          </a>

          <div class="nav-section-title">Finance</div>
          <a class="nav-item" routerLink="/mes-frais" routerLinkActive="active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            Suivi des Frais
          </a>

          <div class="nav-section-title">Réseau</div>
          <a class="nav-item" routerLink="/invitations" routerLinkActive="active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="17" y1="11" x2="23" y2="11"></line></svg>
            Invitations
          </a>
          <a class="nav-item" routerLink="/admin/chat" routerLinkActive="active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Messagerie
          </a>

          <!-- RECENT Widget -->
          <ng-container *ngIf="recentDossiers.length > 0">
            <div class="nav-section-title">Récents</div>
            <div class="fav-list">
              <a class="fav-item" *ngFor="let d of recentDossiers" (click)="onViewDossier(d)">
                <div class="fav-dot" [ngClass]="d.statut === 'OUVERT' ? 'green' : 'grey'"></div>
                <span>{{ d.reference }}</span>
              </a>
            </div>
          </ng-container>
        </ng-container>
      </nav>

      <div class="sidebar-footer" *ngIf="sidebarService.sidebarOpen$ | async">
        <div class="alerts-widget">
          <div class="alerts-header">
            <h4>Alertes</h4>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
          </div>
          <div class="alert-item">
            <div class="alert-dot red"></div>
            <div class="alert-content">
              <p>Upcoming deadline</p>
              <span>Dossier ref #D-240...</span>
            </div>
          </div>
          <div class="alert-item">
            <div class="alert-dot yellow"></div>
            <div class="alert-content">
              <p>Upcoming deadlines</p>
              <span>Upcoming deadlines...</span>
            </div>
          </div>
          <div class="alert-item">
            <div class="alert-dot green"></div>
            <div class="alert-content">
              <p>Priority notification</p>
              <span>Notifications connues sère no k a...</span>
            </div>
          </div>
        </div>
      </div>
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
