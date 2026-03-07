import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { NotificationService, Notification } from '../../services/notification.service';
import { UiService } from '../../services/ui.service';
import { DossierService } from '../../services/dossier.service';
import { Dossier } from '../../models/dossier.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="top-header">
      <div class="header-left">
        <button class="mobile-menu-btn" (click)="toggleSidebar()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <div class="header-search">
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
           <input type="text" placeholder="Rechercher un dossier, une référence..." 
                  [(ngModel)]="searchQuery" (input)="onSearchInput($event)">
           
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
        <!-- QUICK ACTION BASED ON ROLE -->
        <button class="header-quick-action charge" *ngIf="isChargeDossier()" (click)="quickAction('/nouveau-dossier')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Nouveau Dossier
        </button>
        <button class="header-quick-action admin" *ngIf="isAdmin()" (click)="quickAction('/referentiel')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>
          Gestion Référentiel
        </button>
        <button class="header-quick-action preval" *ngIf="isPreValidateur()" (click)="quickAction('/dashboard')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          Rapport Bordereau
        </button>
        <button class="header-quick-action val" *ngIf="isValidateur()" (click)="quickAction('/dashboard')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
          Batch Virement
        </button>
        <button class="header-quick-action admin" *ngIf="isAdmin()" (click)="quickAction('/dashboard')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          Logs Audit
        </button>

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
            <div class="notif-item" *ngFor="let n of roleNotifications" [class.unread]="!n.isRead" (click)="markRead(n)">
              <div class="notif-icon" [ngClass]="n.type.toLowerCase()"></div>
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
        <div class="user-profile">
          <div class="user-info">
            <span class="user-email">{{ currentUser?.username?.includes('@') ? currentUser.username : (currentUser?.username || 'Utilisateur') + '@bna.tn' }}</span>
            <span class="user-role">{{ formatRoles() }}</span>
          </div>
          <div class="user-avatar">{{ getInitials() }}</div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .top-header {
      height: 90px;
      background: rgba(240, 244, 248, 0.8);
      backdrop-filter: blur(12px);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 48px;
      position: sticky;
      top: 0;
      z-index: 10;
      border-bottom: 1px solid rgba(0,0,0,0.03);
    }

    .header-title h1 {
      font-size: 24px;
      font-weight: 800;
      background: linear-gradient(135deg, #005641 0%, #008766 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
      letter-spacing: -0.5px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .notification-btn {
      background: white;
      border: 1px solid rgba(0,0,0,0.05);
      border-radius: 12px;
      color: #64748b;
      cursor: pointer;
      position: relative;
      padding: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.02);
      transition: all 0.2s;
    }
    
    .notification-btn:hover {
      color: #008766;
      border-color: rgba(0, 135, 102, 0.08);
      background: rgba(0, 135, 102, 0.08);
    }

    .badge-dot {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 10px;
      height: 10px;
      background-color: #ef4444;
      border-radius: 50%;
      border: 2px solid white;
    }

    .header-search {
      display: flex;
      align-items: center;
      gap: 12px;
      background: white;
      padding: 10px 18px;
      border-radius: 14px;
      border: 1px solid rgba(0,0,0,0.05);
      width: 400px;
      margin-left: 24px;
      transition: all 0.3s;
    }
    .header-search:focus-within {
      width: 480px;
      border-color: #008766;
      box-shadow: 0 4px 12px rgba(0,135,102,0.05);
    }
    .header-search svg { color: #94a3b8; }
    .header-search input {
      border: none;
      outline: none;
      font-size: 14px;
      font-weight: 500;
      color: #1e293b;
      width: 100%;
    }
    .header-search input::placeholder { color: #94a3b8; }
    .header-search { position: relative; }

    .search-results-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border-radius: 16px;
      margin-top: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      border: 1px solid rgba(0,0,0,0.05);
      z-index: 1000;
      max-height: 400px;
      overflow-y: auto;
      padding: 8px;
    }

    .search-result-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 16px;
      border-radius: 12px;
      cursor: pointer;
       transition: all 0.2s;
    }
    .search-result-item:hover { background: #f8fafc; }
    .result-icon { font-size: 20px; }
    .result-details { flex: 1; display: flex; flex-direction: column; }
    .result-ref { font-size: 13px; font-weight: 800; color: var(--bna-green); }
    .result-title { font-size: 14px; color: #1e293b; font-weight: 500; }
    .result-status { font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 2px 8px; border-radius: 6px; }
    .result-status.ouvert { background: #dcfce7; color: #166534; }
    .result-status.cloture { background: #f1f5f9; color: #475569; }

    .header-quick-action {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 12px;
      border: none;
      font-size: 13px;
      font-weight: 700;
      color: white;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }
    .header-quick-action:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.1); }
    .header-quick-action.charge { background: linear-gradient(135deg, #008766 0%, #00a87f 100%); }
    .header-quick-action.referentiel { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
    .header-quick-action.preval { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
    .header-quick-action.val { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
    .header-quick-action.admin { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 8px 16px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.03);
      cursor: pointer;
      border: 1px solid rgba(0,0,0,0.02);
      margin-left: 12px;
    }

    .user-info {
      text-align: right;
    }

    .user-email {
      display: block;
      font-size: 14px;
      font-weight: 700;
      color: #1e293b;
    }

    .user-role {
      display: block;
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .user-avatar {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #008766 0%, #10b981 100%);
      border-radius: 12px;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 18px;
    }

    .count-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background: #ef4444;
      color: white;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 10px;
      border: 2px solid white;
    }

    .notif-dropdown {
      position: absolute;
      top: 80px;
      right: 48px;
      width: 320px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      border: 1px solid rgba(0,0,0,0.05);
      z-index: 100;
      overflow: hidden;
    }

    .notif-header {
      padding: 16px 20px;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .notif-header h3 { margin: 0; font-size: 16px; font-weight: 700; color: #1e293b; }
    .btn-clear { background: none; border: none; color: #64748b; font-size: 12px; cursor: pointer; }
    .btn-clear:hover { color: #ef4444; }

    .notif-list { max-height: 350px; overflow-y: auto; }
    .notif-item {
      padding: 16px 20px;
      display: flex;
      gap: 12px;
      cursor: pointer;
      border-bottom: 1px solid #f8fafc;
      transition: background 0.2s;
    }
    .notif-item:hover { background: #f8fafc; }
    .notif-item.unread { background: #f0f9ff; }
    
    .notif-icon { width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }
    .notif-icon.info { background: #3b82f6; }
    .notif-icon.success { background: #10b981; }
    .notif-icon.warning { background: #f59e0b; }

    .notif-msg { margin: 0; font-size: 13px; color: #334155; line-height: 1.4; font-weight: 500; }
    .notif-time { font-size: 11px; color: #94a3b8; }
    .notif-empty { padding: 40px 20px; text-align: center; color: #94a3b8; font-size: 14px; }

    .mobile-menu-btn {
      display: none;
      background: none;
      border: none;
      color: #005641;
      cursor: pointer;
      padding: 0;
      margin-right: 16px;
    }

    .header-left {
      display: flex;
      align-items: center;
    }

    @media (max-width: 1024px) {
      .top-header { padding: 0 24px; }
      .mobile-menu-btn { display: block; }
      .user-info { display: none; }
      .header-title h1 { font-size: 20px; }
    }
  `]
})
export class HeaderComponent implements OnInit {
  @Input() title: string = 'Action en Défense';
  currentUser: any;
  unreadCount = 0;
  showDropdown = false;
  roleNotifications: Notification[] = [];

  searchQuery = '';
  searchResults: Dossier[] = [];
  private searchSubject = new Subject<string>();

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private uiService: UiService,
    private dossierService: DossierService
  ) {
    this.currentUser = this.authService.currentUserValue;

    this.notificationService.notifications$.subscribe(all => {
      if (this.currentUser) {
        this.roleNotifications = all.filter(n =>
          n.role === 'ROLE_ADMIN' ||
          this.currentUser.roles.includes(n.role)
        );
        this.unreadCount = this.roleNotifications.filter(n => !n.isRead).length;
      }
    });
  }

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      if (query.trim().length > 1) {
        this.dossierService.searchDossiers(query).subscribe(results => {
          this.searchResults = results;
        });
      } else {
        this.searchResults = [];
      }
    });
  }

  onSearchInput(event: any) {
    this.searchSubject.next(this.searchQuery);
  }

  viewDossier(dossier: Dossier) {
    this.searchQuery = '';
    this.searchResults = [];
    this.uiService.navigate('/mes-dossiers', { highlight: dossier.reference }); 
  }

  toggleNotifications() {
    this.showDropdown = !this.showDropdown;
  }

  toggleSidebar() {
    this.uiService.toggleSidebar();
  }

  markRead(n: Notification) {
    this.notificationService.markAsRead(n.id);
  }

  clearAll() {
    this.notificationService.clearAll();
  }

  isChargeDossier(): boolean { return this.authService.hasRole('ROLE_CHARGE_DOSSIER'); }
  isPreValidateur(): boolean { return this.authService.hasRole('ROLE_PRE_VALIDATEUR'); }
  isValidateur(): boolean { return this.authService.hasRole('ROLE_VALIDATEUR'); }
  isAdmin(): boolean { return this.authService.hasRole('ROLE_ADMIN'); }

  quickAction(path: string, queryParams?: any) {
    this.uiService.navigate(path, queryParams);
  }

  getInitials(): string {
    if (!this.currentUser || !this.currentUser.username) return 'U';
    return this.currentUser.username.substring(0, 2).toUpperCase();
  }

  formatRoles(): string {
    if (!this.currentUser || !this.currentUser.roles) return 'Rôle';
    return this.currentUser.roles.map((r: string) => r.replace('ROLE_', '').replace('_', ' ')).join(', ');
  }
}
