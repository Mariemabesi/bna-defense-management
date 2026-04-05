import { Component, Input, OnInit } from '@angular/core';
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
        <button class="manual-sidebar-toggle" (click)="toggleSidebar()" title="Afficher/Masquer le menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle>
          </svg>
        </button>
        <div class="header-search">
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Rechercher par référence, titre..." 
                   [(ngModel)]="searchQuery" (input)="onSearch($event)" (keyup.enter)="goToDossiers()">
            <button class="btn-ai-search" (click)="onAiSearch()" title="Recherche Intelligente (IA)">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 2a10 10 0 0 1 10 10h-10V2z"></path><path d="M12 12L2.2 7.3"></path><path d="M12 12l9.8 4.7"></path><path d="M12 12v10"></path></svg>
               IA
            </button>
           
           <!-- SEARCH RESULTS DROPDOWN -->
           <div class="search-results-dropdown" *ngIf="searchResults.length > 0 && searchQuery">
             <div class="search-result-item" *ngFor="let result of searchResults" 
                  (click)="viewDossier(result)">
               <div class="result-icon">📄</div>
               <div class="result-details">
                 <span class="result-ref">{{ result.reference }}</span>
                 <span class="result-title">{{ result.titre }}</span>
               </div>
               <span class="result-status" [ngClass]="result.statut.toLowerCase()">{{ result.statut }}</span>
             </div>
           </div>
        </div>
      </div>
      
      <div class="header-actions">
        <button class="notification-btn" (click)="toggleNotifications()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          <span class="badge-dot" *ngIf="unreadCount > 0"></span>
        </button>
        
        <!-- NOTIFICATIONS DROPDOWN -->
        <div class="notif-dropdown" *ngIf="showDropdown">
          <div class="notif-header">
            <h3>Notifications</h3>
            <button class="btn-clear" (click)="clearAll()">Tout effacer</button>
          </div>
          <div class="notif-list">
            <!-- CHAT NOTIFICATION ITEM -->
            <div class="notif-item unread chat-notif" *ngIf="chatUnreadCount > 0">
               <div class="notif-body">
                 <p class="notif-msg">Vous avez {{ chatUnreadCount }} nouveaux messages chat</p>
                 <span class="notif-time">Maintenant</span>
               </div>
            </div>
            
            <div class="notif-item" *ngFor="let n of roleNotifications" [class.unread]="!n.read" (click)="markRead(n)">
              <div class="notif-body">
                <p class="notif-msg">{{ n.message }}</p>
                <span class="notif-time">{{ n.timestamp | date:'shortTime' }}</span>
              </div>
            </div>
            <div class="notif-empty" *ngIf="roleNotifications.length === 0">
              Aucune notification
            </div>
          </div>
        </div>
        
        <div class="profile-container">
          <div class="user-profile" (click)="toggleProfileMenu()">
            <div class="user-avatar">
              <img *ngIf="currentUser?.avatarUrl" [src]="getFullUrl(currentUser.avatarUrl)" class="header-avatar-img">
              <span *ngIf="!currentUser?.avatarUrl">{{ getInitials() }}</span>
            </div>
            <div class="user-info">
              <span class="user-email">{{ currentUser?.username }}</span>
              <span class="user-role">{{ formatRoles() }}</span>
            </div>
          </div>

          <div class="profile-dropdown" *ngIf="showProfileDropdown">
            <div class="dropdown-header">
              <strong>{{ currentUser?.fullName || currentUser?.username }}</strong>
              <span>{{ formatRoles() }}</span>
            </div>
            <div class="divider"></div>
            <button class="dropdown-item" (click)="openProfile()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Mon Profil
            </button>
            <button class="dropdown-item logout-inline" (click)="logout()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <!-- Change Password Modal Removed - using Profile page -->
    </header>
  `,
  styles: [`
    .top-header {
      height: 95px;
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(30px) saturate(180%);
      -webkit-backdrop-filter: blur(30px) saturate(180%);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 48px;
      position: sticky;
      top: 0;
      z-index: 1000;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }
 
    .header-search { 
      display: flex; align-items: center; gap: 14px; 
      background: rgba(255, 255, 255, 0.03); 
      padding: 14px 28px; border-radius: 20px; 
      border: 1px solid rgba(0, 135, 102, 0.2); 
      width: 440px; margin-left: 24px; 
      transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1); 
      position: relative;
    }
    .header-search:focus-within { 
      width: 580px; 
      background: rgba(255, 255, 255, 0.05);
      border-color: #008766; 
      box-shadow: 0 0 25px rgba(0, 135, 102, 0.15); 
    }
    .header-search svg { color: #008766; opacity: 0.8; }
    .header-search input { 
      border: none; outline: none; font-size: 15px; font-weight: 700; 
      color: #f8fafc; width: 100%; background: transparent; 
    }
    .header-search input::placeholder { color: #475569; font-weight: 600; }

    .header-actions { display: flex; align-items: center; gap: 24px; }
    .notification-btn {
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 14px;
      color: #94a3b8; cursor: pointer; position: relative; padding: 12px;
      display: flex; align-items: center; justify-content: center;
      transition: 0.3s;
    }
    .notification-btn:hover { color: #008766; border-color: #008766; background: rgba(0, 135, 102, 0.08); }
    .badge-dot { position: absolute; top: 10px; right: 10px; width: 8px; height: 8px; background-color: #ef4444; border-radius: 50%; box-shadow: 0 0 10px #ef4444; }

    .user-profile { 
      display: flex; align-items: center; gap: 16px; padding: 10px 20px; 
      background: rgba(255, 255, 255, 0.03); border-radius: 18px; 
      cursor: pointer; border: 1px solid rgba(255, 255, 255, 0.05); 
      transition: 0.3s;
    }
    .user-profile:hover { transform: translateY(-3px); background: rgba(255,255,255,0.05); border-color: #008766; }
    .user-email { display: block; font-size: 14px; font-weight: 800; color: #f8fafc; }
    .user-role { display: block; font-size: 11px; color: #475569; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; }
    .user-avatar { 
      width: 44px; height: 44px; background: linear-gradient(135deg, #008766 0%, #005641 100%); 
      border-radius: 12px; color: white; display: flex; align-items: center; justify-content: center; 
      font-weight: 900; font-size: 18px;
    }

    .btn-ai-search { 
      background: linear-gradient(135deg, #008766 0%, #005641 100%); 
      color: white; border: none; border-radius: 10px; 
      padding: 8px 14px; font-size: 10px; font-weight: 950; 
      cursor: pointer; display: flex; align-items: center; gap: 6px; 
      transition: all 0.3s; letter-spacing: 1px;
    }

    .notif-dropdown, .profile-dropdown {
      position: absolute; top: 105px; right: 48px; width: 320px;
      background: #0f172a; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05);
      box-shadow: 0 40px 100px rgba(0,0,0,0.5); z-index: 2000; overflow: hidden;
      backdrop-filter: blur(40px); animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .dropdown-header h3, .dropdown-header strong { color: #f8fafc !important; }
    .dropdown-item { color: #94a3b8 !important; }
    .dropdown-item:hover { background: rgba(255,255,255,0.03) !important; color: #008766 !important; }

    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

    /* RESPONSIVE Calibrations */
    @media (max-width: 1024px) {
      .top-header { padding: 0 20px; height: 80px; }
      .header-search { display: none !important; }
      .manual-sidebar-toggle { display: flex !important; }
      .notif-dropdown, .profile-dropdown { right: 20px; top: 90px; }
    }
    @media (max-width: 768px) {
      .user-info { display: none; }
      .header-actions { gap: 16px; }
    }
    
    .manual-sidebar-toggle { 
       display: none; background: none; border: none; color: #94a3b8; 
       cursor: pointer; padding: 10px; transition: 0.3s;
    }
    .manual-sidebar-toggle:hover { color: #008766; transform: scale(1.1); }
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
  showProfileDropdown = false;
  private searchSubject = new Subject<string>();



  constructor(
    public authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    public sidebarService: SidebarService,
    private searchService: SearchService,
    private dossierService: DossierService,
    private confirmDialog: ConfirmDialogService
  ) { }

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
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchService.updateSearch(query);
      if (query.trim().length > 1) {
        this.dossierService.searchDossiers(query).subscribe(results => {
          this.searchResults = results.slice(0, 5); // Limit to 5 results
        });
      } else {
        this.searchResults = [];
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
    this.dossierService.searchDossiersSimple(this.searchQuery).subscribe({
      next: (results) => {
        // AI search normally returns a specialized list or highlights. 
        // For now, let's just use the shared search layout.
        this.searchResults = results.slice(0, 5);
      }
    });
  }

  viewDossier(dossier: Dossier) {
    const ref = dossier.reference;
    this.searchQuery = '';
    this.searchResults = [];
    this.searchService.updateSearch(''); // Reset global search to show specific dossier
    this.router.navigate(['/mes-dossiers'], { queryParams: { highlight: ref } });
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
    this.confirmDialog.open({
      title: 'Déconnexion',
      message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      confirmLabel: 'Se déconnecter',
      cancelLabel: 'Annuler'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }

  getFullUrl(path: string): string {
    if (!path) return '';
    return `http://localhost:8082${path}`;
  }
}
