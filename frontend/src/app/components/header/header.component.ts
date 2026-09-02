import { Component, Input, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { NotificationService, Notification } from '../../services/notification.service';
import { Router } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';
import { SearchService } from '../../services/search.service';
import { DossierService } from '../../services/dossier.service';
import { Dossier } from '../../models/dossier.model';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="top-header">
      <div class="header-left">
      </div>

      <div class="header-center">
        <h1 class="page-title">{{ title === 'Action en Défense' ? 'Action en Défense BNA V2' : title }}</h1>
      </div>
      
      <div class="header-right">
        <div class="header-search-container">
          <div class="header-search">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" placeholder="Rechercher dossier, avocat, tribunal..." 
                     [(ngModel)]="searchQuery" (input)="onSearch($event)" (focus)="onSearchFocus()" (keyup.enter)="goToDossiers()">
              <div *ngIf="loadingSearch" class="search-loader"></div>
          </div>

          <!-- GLOBAL SEARCH RESULTS DROPDOWN -->
          <div class="search-results-dropdown" *ngIf="showSearchResults && (globalResults.dossiers.length > 0 || globalResults.auxiliaires.length > 0 || (searchQuery.length > 1 && !loadingSearch))">
            
            <div *ngIf="loadingSearch" class="search-status">Recherche en cours...</div>
            
            <div *ngIf="!loadingSearch && globalResults.dossiers.length === 0 && globalResults.auxiliaires.length === 0" class="search-status">
              Aucun résultat pour "{{searchQuery}}"
            </div>

            <ng-container *ngIf="!loadingSearch">
              <!-- DOSSIERS CATEGORY -->
              <div class="search-category" *ngIf="globalResults.dossiers.length > 0">
                <div class="category-title">Dossiers</div>
                <div class="result-item" *ngFor="let d of globalResults.dossiers" (click)="viewDossier(d)">
                  <div class="result-icon dossier"></div>
                  <div class="result-info">
                    <span class="result-name">{{ d.reference }}</span>
                    <span class="result-sub">{{ d.titre }}</span>
                  </div>
                  <div class="result-status" [ngClass]="d.statut?.toLowerCase()">{{ d.statut }}</div>
                </div>
              </div>

              <!-- AUXILIAIRES CATEGORY -->
              <div class="search-category" *ngIf="globalResults.auxiliaires.length > 0">
                <div class="category-title">Auxiliaires & Avocats</div>
                <div class="result-item" *ngFor="let a of globalResults.auxiliaires" (click)="viewAuxiliaire(a)">
                  <div class="result-icon auxiliaire"></div>
                  <div class="result-info">
                    <span class="result-name">{{ a.nom }}</span>
                    <span class="result-sub">{{ a.type }} • {{ a.specialite || a.region }}</span>
                  </div>
                </div>
              </div>
            </ng-container>
          </div>
        </div>

        <button class="notification-btn" (click)="toggleNotifications()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          <span class="badge-dot" *ngIf="unreadCount > 0"></span>
        </button>
        
        <div class="profile-container">
          <div class="user-profile" id="menu-profile" (click)="toggleProfileMenu()">
            <div class="user-avatar">
              <img *ngIf="currentUser?.avatarUrl" [src]="getFullUrl(currentUser.avatarUrl)" class="header-avatar-img">
              <span *ngIf="!currentUser?.avatarUrl">{{ getInitials() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- NOTIFICATION DROPDOWN -->
      <div class="notif-dropdown" *ngIf="showDropdown">
        <div class="dropdown-header">
          <h3>Notifications</h3>
          <button class="text-btn" (click)="clearAll()">Tout marquer lu</button>
        </div>
        <div class="dropdown-body">
          <div *ngIf="roleNotifications.length === 0" class="empty-state">
            Aucune nouvelle notification
          </div>
          <div class="notif-item" *ngFor="let n of roleNotifications" (click)="markRead(n)">
            <div class="notif-icon" [ngClass]="n.type.toLowerCase()"></div>
            <div class="notif-content">
              <p class="notif-message">{{ n.message }}</p>
              <span class="notif-time">{{ n.timestamp | date:'shortTime' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- PROFILE DROPDOWN -->
      <div class="profile-dropdown" *ngIf="showProfileDropdown">
        <div class="dropdown-user-info">
          <div class="user-avatar-lg">{{ getInitials() }}</div>
          <div class="user-text">
            <span class="name">{{ currentUser?.fullName || currentUser?.username }}</span>
            <span class="role">{{ formatRoles() }}</span>
          </div>
        </div>
        <div class="dropdown-divider"></div>
        <button class="dropdown-item" (click)="openProfile()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          Mon Profil
        </button>
        <button class="dropdown-item danger" id="btn-logout" (click)="logout()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Déconnexion
        </button>
      </div>
    </header>
  `,
  styles: [`
    .top-header {
      height: var(--header-height);
      background: transparent;
      display: grid;
      grid-template-columns: 1fr 2fr 1fr;
      align-items: center;
      padding: 0 40px;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-center {
      text-align: center;
    }

    .page-title {
      font-size: 18px;
      font-weight: 800;
      color: var(--text-main);
      margin: 0;
    }

    .header-right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 20px;
    }

    .header-search-container {
      position: relative;
    }

    .header-search {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #ffffff;
      padding: 8px 16px;
      border-radius: 20px;
      width: 280px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--soft-shadow);
      border: 1px solid var(--border-color);
    }

    .header-search:focus-within {
      width: 400px;
      box-shadow: var(--premium-shadow);
      border-color: var(--bna-green);
    }

    .header-search input {
      border: none;
      outline: none;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-main);
      width: 100%;
      background: transparent;
    }

    .header-search svg {
      color: var(--text-light);
    }

    .search-loader {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(0, 135, 102, 0.1);
      border-top-color: var(--bna-green);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* RESULTS DROPDOWN */
    .search-results-dropdown {
      position: absolute;
      top: 50px;
      left: 0;
      right: 0;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
      border: 1px solid rgba(255,255,255,0.8);
      z-index: 1000;
      max-height: 480px;
      overflow-y: auto;
      padding: 12px 0;
      animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .search-status {
      padding: 20px;
      text-align: center;
      font-size: 13px;
      color: var(--text-muted);
      font-weight: 600;
    }

    .search-category {
      margin-bottom: 16px;
    }

    .category-title {
      padding: 8px 20px;
      font-size: 11px;
      font-weight: 800;
      color: var(--bna-green);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .result-item {
      padding: 12px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .result-item:hover {
      background: rgba(0, 135, 102, 0.05);
    }

    .result-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f1f5f9;
      flex-shrink: 0;
      position: relative;
    }

    .result-icon.dossier::before { content: '📁'; font-size: 18px; }
    .result-icon.auxiliaire::before { content: '⚖️'; font-size: 18px; }

    .result-info {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }

    .result-name {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .result-sub {
      font-size: 12px;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .result-status {
      font-size: 10px;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 6px;
      text-transform: uppercase;
    }

    .result-status.ouvert { background: #dcfce7; color: #166534; }
    .result-status.cloture { background: #f1f5f9; color: #475569; }
    .result-status.refuse { background: #fee2e2; color: #991b1b; }


    .notification-btn {
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 50%;
      color: var(--text-muted);
      cursor: pointer;
      position: relative;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--soft-shadow);
      transition: all 0.2s;
    }
    
    .notification-btn:hover {
      color: var(--bna-green);
      transform: translateY(-2px);
      box-shadow: var(--premium-shadow);
    }

    .badge-dot {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 8px;
      height: 8px;
      background-color: #ef4444;
      border-radius: 50%;
      border: 2px solid white;
    }

    .user-profile {
      cursor: pointer;
      transition: all 0.2s;
    }

    .user-profile:hover {
      transform: scale(1.05);
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--bna-green) 0%, var(--bna-green-accent) 100%);
      border-radius: 50%;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 14px;
      box-shadow: var(--premium-shadow);
      overflow: hidden;
      border: 2px solid #ffffff;
    }

    .header-avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .manual-sidebar-toggle {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      transition: all 0.2s;
    }

    .manual-sidebar-toggle:hover {
      color: var(--bna-green);
      transform: scale(1.1);
    }

    /* DROPDOWNS RE-STYLED */
    .profile-dropdown, .notif-dropdown {
      position: absolute;
      top: 75px;
      right: 40px;
      background: #ffffff;
      border-radius: var(--radius-md);
      box-shadow: 0 10px 40px rgba(0,0,0,0.12);
      border: 1px solid var(--border-color);
      z-index: 1000;
      padding: 0;
      width: 320px;
      overflow: hidden;
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .dropdown-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
    }

    .dropdown-header h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 800;
      color: var(--text-main);
    }

    .text-btn {
      background: none;
      border: none;
      color: var(--bna-green);
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
    }

    .dropdown-body {
      max-height: 400px;
      overflow-y: auto;
    }

    .empty-state {
      padding: 40px 20px;
      text-align: center;
      color: var(--text-muted);
      font-size: 13px;
    }

    .notif-item {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      gap: 12px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .notif-item:hover {
      background: #f1f5f9;
    }

    .notif-icon {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-top: 6px;
      flex-shrink: 0;
    }

    .notif-icon.info { background: #3b82f6; }
    .notif-icon.success { background: #10b981; }
    .notif-icon.warning { background: #f59e0b; }

    .notif-message {
      margin: 0;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-main);
      line-height: 1.4;
    }

    .notif-time {
      font-size: 11px;
      color: var(--text-muted);
    }

    .dropdown-user-info {
      padding: 24px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      background: linear-gradient(to bottom, #f8fafc, #ffffff);
    }

    .user-avatar-lg {
      width: 56px;
      height: 56px;
      background: var(--bna-green);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 800;
      box-shadow: 0 4px 12px rgba(0, 135, 102, 0.2);
    }

    .user-text {
      display: flex;
      flex-direction: column;
    }

    .user-text .name {
      font-size: 15px;
      font-weight: 800;
      color: var(--text-main);
    }

    .user-text .role {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .dropdown-divider {
      height: 1px;
      background: var(--border-color);
    }

    .dropdown-item {
      width: 100%;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      background: none;
      border: none;
      color: var(--text-main);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }

    .dropdown-item:hover {
      background: #f1f5f9;
      color: var(--bna-green);
    }

    .dropdown-item.danger:hover {
      color: #ef4444;
      background: #fef2f2;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-10px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]
})
export class HeaderComponent implements OnInit {
  @Input() title: string = 'Action en Défense';
  currentUser: any;
  unreadCount = 0;
  chatUnreadCount = 0;
  showDropdown = false;
  roleNotifications: Notification[] = [];

  searchQuery = '';
  searchResults: Dossier[] = [];
  globalResults: { dossiers: Dossier[], auxiliaires: any[] } = { dossiers: [], auxiliaires: [] };
  showSearchResults = false;
  loadingSearch = false;
  showProfileDropdown = false;
  private searchSubject = new Subject<string>();



  constructor(
    public authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    public sidebarService: SidebarService,
    private searchService: SearchService,
    private dossierService: DossierService,
    private confirmDialog: ConfirmDialogService,
    private eRef: ElementRef
  ) { }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if(!this.eRef.nativeElement.contains(event.target)) {
      this.showSearchResults = false;
      this.showProfileDropdown = false;
    }
  }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });

    this.notificationService.notifications$.subscribe(all => {
      this.roleNotifications = all;
    });

    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });

    this.notificationService.chatUnreadCount$.subscribe(count => {
      this.chatUnreadCount = count;
    });

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchService.updateSearch(query);
      if (query.trim().length > 1) {
        this.loadingSearch = true;
        this.showSearchResults = true;
        this.searchService.globalSearch(query).subscribe({
          next: (results) => {
            this.globalResults = results;
            this.loadingSearch = false;
          },
          error: () => {
            this.loadingSearch = false;
          }
        });
      } else {
        this.globalResults = { dossiers: [], auxiliaires: [] };
        this.showSearchResults = false;
        this.loadingSearch = false;
      }
    });
  }

  onSearch(event: any) {
    const query = event.target.value;
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  onAiSearch() {
    if (!this.searchQuery.trim()) return;
    this.notificationService.addNotification("Lancement d'une recherche sémantique IA...", "ROLE_ADMIN", "INFO");
    this.dossierService.searchDossiers(this.searchQuery).subscribe({
      next: (results: any[]) => {
        // AI search normally returns a specialized list or highlights. 
        // For now, let's just use the shared search layout.
        this.searchResults = results.slice(0, 5);
      }
    });
  }

  viewDossier(dossier: Dossier) {
    const ref = dossier.reference;
    this.searchQuery = '';
    this.showSearchResults = false;
    this.globalResults = { dossiers: [], auxiliaires: [] };
    this.searchService.updateSearch(''); 
    this.router.navigate(['/mes-dossiers'], { queryParams: { highlight: ref } });
  }

  viewAuxiliaire(aux: any) {
    this.searchQuery = '';
    this.showSearchResults = false;
    this.globalResults = { dossiers: [], auxiliaires: [] };
    this.router.navigate(['/referentiel/auxiliaires'], { queryParams: { q: aux.nom } });
  }

  onSearchFocus() {
    if (this.searchQuery.length > 1) {
      this.showSearchResults = true;
    }
  }

  goToDossiers() {
    if (this.searchQuery.trim().length > 1) {
      this.router.navigate(['/mes-dossiers']);
      this.searchResults = [];
    }
  }

  toggleNotifications() {
    this.showDropdown = !this.showDropdown;
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }

  markRead(n: Notification) {
    this.notificationService.markAsRead(n.id).subscribe();
    if (n.dossier && n.dossier.reference) {
      this.showDropdown = false;
      this.router.navigate(['/mes-dossiers'], { queryParams: { highlight: n.dossier.reference } });
    }
  }

  clearAll() {
    this.notificationService.markAllAsRead().subscribe();
  }

  getInitials(): string {
    if (!this.currentUser) return 'U';
    if (this.currentUser.fullName) {
      const parts = this.currentUser.fullName.split(' ');
      if (parts.length > 1) return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
      return parts[0][0].toUpperCase();
    }
    return (this.currentUser.username || 'U').substring(0, 2).toUpperCase();
  }

  formatRoles(): string {
    if (!this.currentUser || !this.currentUser.roles) return 'Rôle';
    return this.currentUser.roles.map((r: string) => r.replace('ROLE_', '').replace('_', ' ')).join(', ');
  }

  toggleProfileMenu() {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  openProfile() {
    this.router.navigate(['/profil']);
    this.showProfileDropdown = false;
  }

  logout() {
    this.showProfileDropdown = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getFullUrl(path: string): string {
    if (!path) return '';
    return `http://localhost:8082${path}`;
  }
}
