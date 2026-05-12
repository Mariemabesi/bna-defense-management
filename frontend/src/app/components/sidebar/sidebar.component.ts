import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DossierService } from '../../services/dossier.service';
import { Dossier } from '../../models/dossier.model';
import { SidebarService } from '../../services/sidebar.service';
import { NotificationService, Notification } from '../../services/notification.service';
import { AudienceService } from '../../services/audience.service';

interface AlertItem {
  type: 'red' | 'yellow' | 'green';
  title: string;
  subtitle: string;
}


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

        <!-- ADMIN VIEW -->
        <ng-container *ngIf="isAdmin()">
          <div class="nav-section-title">Administration Système</div>
          
          <a class="nav-item" routerLink="/admin/users" routerLinkActive="active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
            Gestion Utilisateurs
          </a>

          <div class="nav-item-wrapper" [class.open]="isReferentielOpen">
            <a class="nav-item" (click)="toggleReferentiel()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Référentiel
              <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </a>
            <div class="submenu">
              <a class="submenu-item" routerLink="/litige" routerLinkActive="active">Identification Litige</a>
              <a class="submenu-item" routerLink="/referentiel/avocats" routerLinkActive="active">Avocats</a>
              <a class="submenu-item" routerLink="/referentiel/huissiers" routerLinkActive="active">Huissiers</a>
              <a class="submenu-item" routerLink="/referentiel/experts" routerLinkActive="active">Experts</a>
              <a class="submenu-item" routerLink="/referentiel/tribunaux" routerLinkActive="active">Tribunaux</a>
            </div>
          </div>

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

        <!-- NON-ADMIN VIEW -->
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

          <a class="nav-item" routerLink="/action-justice" routerLinkActive="active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
            Action en Justice
          </a>

          <div class="nav-item-wrapper" [class.open]="isReferentielOpen">
            <a class="nav-item" (click)="toggleReferentiel()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Référentiel
              <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </a>
            <div class="submenu">
              <a class="submenu-item" routerLink="/litige" routerLinkActive="active">Identification Litige</a>
              <a class="submenu-item" routerLink="/referentiel/avocats" routerLinkActive="active">Avocats</a>
              <a class="submenu-item" routerLink="/referentiel/huissiers" routerLinkActive="active">Huissiers</a>
              <a class="submenu-item" routerLink="/referentiel/experts" routerLinkActive="active">Experts</a>
              <a class="submenu-item" routerLink="/referentiel/tribunaux" routerLinkActive="active">Tribunaux</a>
            </div>
          </div>

          <div class="nav-section-title">Finance</div>
          <a class="nav-item" routerLink="/mes-frais" routerLinkActive="active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            Gestion des Frais
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
        <div class="alerts-widget" *ngIf="dynamicAlerts.length > 0">
          <div class="alerts-header">
            <h4>Alertes</h4>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
          </div>
          <div class="alert-item" *ngFor="let alert of dynamicAlerts">
            <div class="alert-dot" [ngClass]="alert.type"></div>
            <div class="alert-content">
              <p>{{ alert.title }}</p>
              <span>{{ alert.subtitle }}</span>
            </div>
          </div>
        </div>
        <div class="alerts-widget empty" *ngIf="dynamicAlerts.length === 0">
           <p>Aucune alerte critique</p>
        </div>
      </div>
    </aside>
  `,
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  recentDossiers: Dossier[] = [];
  dynamicAlerts: AlertItem[] = [];
  isReferentielOpen = false;

  constructor(
    private authService: AuthService,
    private dossierService: DossierService,
    private notificationService: NotificationService,
    private audienceService: AudienceService,
    private router: Router,
    public sidebarService: SidebarService
  ) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.loadRecentDossiers();
      this.loadDynamicAlerts();
    }
  }

  loadDynamicAlerts(): void {
    import('rxjs').then(({ combineLatest }) => {
      combineLatest([
        this.audienceService.getStats(),
        this.notificationService.notifications$
      ]).subscribe(([stats, notifs]) => {
        const alerts: AlertItem[] = [];

        // 1. Critical Audience Alerts (Urgent < 48h)
        if (stats.countUrgent > 0) {
          alerts.push({
            type: 'red',
            title: 'Audience Urgente',
            subtitle: `${stats.countUrgent} audience(s) sous 48h`
          });
        }

        // 2. Next Audience Alert (Closest future OR overdue PREVUE)
        if (stats.nextAudience) {
          const date = new Date(stats.nextAudience.dateHeure);
          const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
          const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
          const salleText = (stats.nextAudience.salle && stats.nextAudience.salle.trim())
            ? ` (Salle: ${stats.nextAudience.salle})` : '';

          alerts.push({
            type: 'yellow',
            title: 'Prochaine Audience',
            subtitle: `${stats.nextAudience.tribunal?.nom || 'TPI'} — ${dateStr} at ${timeStr}${salleText}`
          });
        }

        // 3. Notification Alerts
        const unread = notifs.filter(n => !n.read);
        if (unread.length > 0) {
          alerts.push({
            type: 'green',
            title: 'Nouveaux messages',
            subtitle: `${unread.length} notification(s) non lue(s)`
          });
        }

        this.dynamicAlerts = alerts.slice(0, 3);
      });
    });
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
