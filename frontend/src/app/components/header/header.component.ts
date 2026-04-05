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
      height: 90px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 48px;
      position: sticky;
      top: 0;
      z-index: 100;
      margin: 0;
      letter-spacing: -0.5px;
      border-bottom: 1px solid rgba(0,0,0,0.03);
    }
 
    /* MOBILE HEADER RESPONSIVENESS */
    @media (max-width: 1024px) {
      .top-header { padding: 0 20px; }
      .header-search { width: 100%; margin-left: 12px; }
      .header-search:focus-within { width: 100%; }
      .manual-sidebar-toggle { display: flex !important; }
    }
 
    @media (max-width: 768px) {
      .user-info { display: none; }
      .header-search { display: none; }
      .top-header { height: 75px; }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .notification-btn {
      background: white; border: 1px solid rgba(0,0,0,0.05); border-radius: 12px;
      color: #64748b; cursor: pointer; position: relative; padding: 10px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.02); transition: all 0.2s;
    }
    
    .notification-btn:hover { color: #008766; border-color: rgba(0, 135, 102, 0.08); background: rgba(0, 135, 102, 0.08); }

    .badge-dot { position: absolute; top: 6px; right: 6px; width: 10px; height: 10px; background-color: #ef4444; border-radius: 50%; border: 2px solid white; }

    .header-search { display: flex; align-items: center; gap: 12px; background: white; padding: 10px 18px; border-radius: 14px; border: 1px solid rgba(0,0,0,0.05); width: 400px; margin-left: 24px; transition: all 0.3s; position: relative; }
    .header-search:focus-within { width: 480px; border-color: #008766; box-shadow: 0 4px 12px rgba(0,135,102,0.05); }
    .header-search svg { color: #94a3b8; }
    .header-search input { border: none; outline: none; font-size: 14px; font-weight: 500; color: #1e293b; width: 100%; background: transparent; }
    .btn-ai-search { background: linear-gradient(135deg, #0ea5e9, #2563eb); color: white; border: none; border-radius: 8px; padding: 6px 12px; font-size: 11px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: 0.2s; white-space: nowrap; }
    .btn-ai-search:hover { transform: scale(1.05); box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3); }

    .search-results-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: white; border-radius: 16px; margin-top: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid rgba(0,0,0,0.05); z-index: 1000; max-height: 400px; overflow-y: auto; padding: 8px; }

    .notif-item.chat-notif { border-left: 4px solid #008766; background: rgba(0, 135, 102, 0.03); }
    .notif-item { display: flex; align-items: center; gap: 16px; padding: 12px 16px; transition: all 0.2s; cursor: pointer; }
    .result-ref { font-size: 13px; font-weight: 800; color: #008766; }
    .result-status { font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 2px 8px; border-radius: 6px; }
    .result-status.ouvert { background: #dcfce7; color: #166534; }

    .user-profile { display: flex; align-items: center; gap: 16px; padding: 8px 16px; background: white; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.03); cursor: pointer; border: 1px solid rgba(0,0,0,0.02); margin-left: 12px; }
    .user-info { text-align: right; }
    .user-email { display: block; font-size: 14px; font-weight: 700; color: #1e293b; }
    .user-role { display: block; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
    .user-avatar { width: 44px; height: 44px; background: linear-gradient(135deg, #008766 0%, #10b981 100%); border-radius: 12px; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; box-shadow: 0 4px 10px rgba(0,135,102,0.2); overflow: hidden; }
    .header-avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .notif-dropdown { position: absolute; top: 80px; right: 48px; width: 320px; background: white; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); border: 1px solid rgba(0,0,0,0.05); z-index: 100; overflow: hidden; }
    .notif-header { padding: 16px 20px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
    .notif-header h3 { margin: 0; font-size: 16px; font-weight: 700; color: #1e293b; }
    .btn-clear { background: none; border: none; color: #64748b; font-size: 12px; cursor: pointer; }

    .profile-dropdown { position: absolute; top: calc(100% + 12px); right: 0; width: 240px; background: white; border-radius: 20px; box-shadow: 0 20px 50px rgba(15, 23, 42, 0.15); border: 1px solid rgba(0,0,0,0.05); padding: 12px; z-index: 110; animation: slideIn 0.2s ease-out; }
    .dropdown-header { padding: 12px 16px; display: flex; flex-direction: column; gap: 4px; }
    .dropdown-header strong { font-size: 15px; color: #1e293b; font-weight: 800; }
    .dropdown-header span { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; }
    .divider { height: 1px; background: #f1f5f9; margin: 8px 0; }
    
    .dropdown-item { width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: none; background: none; color: #475569; font-size: 14px; font-weight: 600; cursor: pointer; border-radius: 12px; transition: all 0.2s; }
    .dropdown-item:hover { background: #f8fafc; color: #008766; transform: translateX(5px); }
    .dropdown-item.logout-inline { color: #ef4444; }
    .dropdown-item.logout-inline:hover { background: #fef2f2; color: #dc2626; }

    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; transition: 0.3s; }
    .modal-content { background: white; border-radius: 28px; width: 100%; max-width: 440px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; animation: zoomIn 0.3s ease-out; }
    .modal-header { padding: 24px 32px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #fafafa; }
    .modal-header h3 { margin: 0; font-size: 18px; font-weight: 800; color: #1e293b; }
    .btn-close { background: none; border: none; cursor: pointer; color: #94a3b8; transition: 0.2s; }
    .btn-close:hover { color: #ef4444; transform: rotate(90deg); }
    
    .modal-body { padding: 32px; display: flex; flex-direction: column; gap: 20px; }
    .form-group { display: flex; flex-direction: column; gap: 10px; }
    .form-group label { font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .form-control { padding: 12px 16px; border-radius: 12px; border: 2px solid #e2e8f0; font-size: 15px; font-weight: 500; background: #f8fafc; transition: 0.2s; }
    .form-control:focus { border-color: #008766; background: white; outline: none; box-shadow: 0 0 0 4px rgba(0,135,102,0.1); }
    
    .password-strength-meter { margin-top: 8px; display: flex; align-items: center; gap: 12px; }
    .strength-bar { height: 6px; border-radius: 3px; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); background: #e2e8f0; width: 100px; overflow: hidden; }
    .strength-bar.weak { background: #ef4444; }
    .strength-bar.good { background: #f59e0b; }
    .strength-bar.strong { background: #10b981; }
    .strength-label { font-size: 12px; font-weight: 800; color: #64748b; }

    .error-msg { color: #ef4444; font-size: 13px; font-weight: 700; text-align: center; background: #fef2f2; padding: 10px; border-radius: 10px; }
    .modal-footer { padding: 24px 32px; background: #fafafa; border-top: 1px solid #f1f5f9; display: flex; gap: 16px; }
    .btn-primary { flex: 1; background: #008766; color: white; border: none; padding: 14px; border-radius: 14px; font-weight: 800; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 12px rgba(0,135,102,0.2); }
    .btn-secondary { flex: 1; background: white; color: #64748b; border: 2px solid #e2e8f0; padding: 14px; border-radius: 14px; font-weight: 800; cursor: pointer; transition: 0.2s; }
    .btn-primary:hover { background: #007256; transform: translateY(-2px); }
    .btn-secondary:hover { background: #f1f5f9; transform: translateY(-2px); }

    .manual-sidebar-toggle { background: none; border: none; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 8px; transition: 0.2s; }
    .manual-sidebar-toggle:hover { color: #008766; transform: scale(1.1); }

    @keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
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
