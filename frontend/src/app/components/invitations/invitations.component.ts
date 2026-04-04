import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-invitations',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      <main class="main-content">
        <app-header title="Invitations Messagerie"></app-header>
        
        <div class="dashboard-content animate-in">
          <div class="page-intro">
            <h1>Réseau & Collaborations</h1>
            <p>Bâtissez votre réseau professionnel interne pour une communication directe et efficace.</p>
          </div>

          <div class="invitation-layout">
            <!-- DISCOVER COLLABORATORS -->
            <div class="glass-card main-search">
              <div class="card-header-pro">
                 <div class="icon-box green">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="18" y1="8" x2="23" y2="13"></line><line x1="23" y1="8" x2="18" y2="13"></line></svg>
                 </div>
                 <div>
                    <h3>Découvrir des Collaborateurs</h3>
                    <p>Recherchez des membres par nom ou fonction pour étendre votre réseau.</p>
                 </div>
              </div>
              
              <div class="search-pro-box">
                <div class="input-wrapper">
                  <svg class="search-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input type="text" [(ngModel)]="searchQuery" (input)="onSearch()" placeholder="Taper un nom, un rôle (ex: Validateur)..." class="pro-input">
                </div>
              </div>

              <div class="user-results-grid" *ngIf="searchResults.length > 0">
                <div class="user-card-pro" *ngFor="let user of searchResults">
                  <div class="user-avatar-pro">{{ user.fullName.substring(0,1).toUpperCase() }}</div>
                  <div class="user-meta">
                    <span class="user-full-name">{{ user.fullName }}</span>
                    <span class="user-email-tag">{{ user.email }}</span>
                    <span class="tag-role" [ngClass]="user.role.toLowerCase()">{{ user.role }}</span>
                  </div>
                  <button class="btn-invite-pro" (click)="sendInvite(user.id)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="19" y1="11" x2="22" y2="11"></line><line x1="20.5" y1="9.5" x2="20.5" y2="12.5"></line></svg>
                    Inviter
                  </button>
                </div>
              </div>

              <div class="empty-placeholder" *ngIf="searchQuery && searchResults.length === 0">
                 <div class="empty-icon-box">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                 </div>
                 <p>Aucun collaborateur trouvé pour "{{ searchQuery }}"</p>
              </div>
            </div>

            <!-- INVITATIONS SIDEBAR -->
            <div class="invitations-sidebar">
              <div class="glass-card compact">
                <div class="card-header-pro small">
                   <h3>Invitations Reçues</h3>
                   <span class="badge-pulse" *ngIf="pending.length > 0">{{ pending.length }}</span>
                </div>
                
                <div class="pending-stack" *ngIf="pending.length > 0">
                  <div class="pending-item-pro" *ngFor="let inv of pending">
                    <div class="pending-avatar">{{ inv.senderName.substring(0,1).toUpperCase() }}</div>
                    <div class="pending-info">
                       <span class="p-name">{{ inv.senderName }}</span>
                       <span class="p-role">{{ inv.role }}</span>
                    </div>
                    <div class="p-actions">
                       <button class="btn-sm-reject" (click)="reject(inv.id)" title="Refuser">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                       </button>
                       <button class="btn-sm-accept" (click)="accept(inv.id)" title="Accepter">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                       </button>
                    </div>
                  </div>
                </div>

                <div class="empty-mini" *ngIf="pending.length === 0">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                  <p>Aucune invitation en attente</p>
                </div>
              </div>

              <!-- NETWORK STATS -->
              <div class="glass-card stats-mini-card mt-4">
                 <div class="stats-icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                 </div>
                 <div class="stats-data">
                    <span class="s-label">Réseau Direct</span>
                    <span class="s-value">Actif</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      --sidebar-width: 280px;
      --bna-green: #008766;
      --bg-color: #f0f4f8;
      --text-main: #1e293b;
    }

    .app-layout {
      display: flex;
      min-height: 100vh;
      background-color: var(--bg-color);
      font-family: 'Outfit', sans-serif;
    }

    .main-content {
      flex: 1;
      padding-left: var(--sidebar-width);
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .dashboard-content { 
      max-width: 1400px; 
      width: 100%;
      margin: 0 auto; 
      padding: 42px 48px !important; 
    }

    .page-intro { margin-bottom: 40px; }
    .page-intro h1 { font-size: 36px; font-weight: 900; color: #1e293b; margin: 0 0 10px 0; letter-spacing: -1.5px; }
    .page-intro p { font-size: 18px; color: #64748b; font-weight: 500; }
    
    .invitation-layout { display: grid; grid-template-columns: 1fr 380px; gap: 40px; align-items: flex-start; }
    
    .glass-card { 
      background: rgba(255, 255, 255, 0.9); 
      backdrop-filter: blur(20px); 
      border-radius: 32px; 
      padding: 40px; 
      border: 1px solid rgba(255, 255, 255, 0.8); 
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.05);
      transition: all 0.3s ease;
    }
    .glass-card:hover { box-shadow: 0 35px 60px -15px rgba(0,0,0,0.08); }

    .card-header-pro { display: flex; align-items: center; gap: 24px; margin-bottom: 40px; }
    .card-header-pro.small { margin-bottom: 30px; justify-content: space-between; }
    
    .icon-box { 
      width: 60px; height: 60px; border-radius: 18px; display: flex; align-items: center; justify-content: center;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .icon-box.green { background: #ecfdf5; color: #008766; box-shadow: 0 10px 20px rgba(0,135,102,0.1); }
    .glass-card:hover .icon-box { transform: scale(1.1) rotate(-5deg); }

    .card-header-pro h3 { margin: 0 0 6px 0; font-size: 24px; font-weight: 850; color: #1e293b; letter-spacing: -0.5px; }

    .search-pro-box { margin-bottom: 35px; }
    .search-svg { margin-right: 15px; color: #94a3b8; }
    .pro-input { 
      width: 100%; padding: 20px 28px; border-radius: 22px; border: 2.5px solid #f1f5f9; 
      background: #f8fafc; font-family: inherit; font-size: 16px; font-weight: 500; transition: all 0.4s;
    }
    .pro-input:focus { border-color: #008766; background: white; box-shadow: 0 15px 35px rgba(0,135,102,0.12); transform: translateY(-2px); }

    .user-results-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .user-card-pro { 
      background: white; border-radius: 28px; padding: 24px; border: 1.5px solid #f1f5f9; 
      display: flex; flex-direction: column; align-items: center; text-align: center; transition: all 0.3s;
    }
    .user-card-pro:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.06); border-color: #008766; }
    
    .user-avatar-pro { 
      width: 72px; height: 72px; border-radius: 24px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); 
      color: #008766; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 900; 
      margin-bottom: 20px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
    }
    
    .user-meta { margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px; align-items: center; }
    .user-full-name { font-weight: 850; color: #1e293b; font-size: 17px; }
    .user-email-tag { font-size: 13px; color: #64748b; font-weight: 500; }
    
    .tag-role { 
      padding: 6px 14px; border-radius: 12px; font-size: 11px; font-weight: 800; 
      text-transform: uppercase; letter-spacing: 1px; margin-top: 5px;
    }
    .tag-role.admin { background: #fee2e2; color: #ef4444; }
    .tag-role.validateur { background: #dcfce7; color: #10b981; }

    .btn-invite-pro { 
      width: 100%; padding: 14px; border-radius: 16px; background: linear-gradient(135deg, #008766 0%, #00a87f 100%); 
      color: white; border: none; font-weight: 800; cursor: pointer; display: flex; align-items: center; 
      justify-content: center; gap: 12px; transition: all 0.3s; box-shadow: 0 10px 20px rgba(0,135,102,0.2);
    }
    .btn-invite-pro:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(0,135,102,0.3); }

    /* PENDING ITEMS */
    .pending-item-pro { 
      padding: 18px; border-radius: 22px; background: white; border: 1.5px solid #f1f5f9; 
      display: flex; align-items: center; gap: 16px; margin-bottom: 12px;
    }
    .pending-avatar { width: 50px; height: 50px; border-radius: 16px; background: #ecfdf5; color: #008766; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 18px; }
    .pending-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .p-name { font-weight: 800; color: #1e293b; font-size: 15px; }
    .p-role { font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    
    .p-actions { display: flex; gap: 10px; }
    .btn-sm-accept { background: #008766; color: white; border: none; border-radius: 12px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; }
    .btn-sm-reject { background: #f8fafc; color: #94a3b8; border: none; border-radius: 12px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; }
    .btn-sm-accept:hover { background: #00684d; transform: scale(1.15); }
    .btn-sm-reject:hover { background: #fee2e2; color: #ef4444; transform: scale(1.15); }

    .stats-mini-card { 
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; 
      border: none; padding: 25px; box-shadow: 0 15px 30px rgba(30,41,59,0.2);
      display: flex; align-items: center; gap: 20px;
    }
    .stats-icon-box { background: rgba(255,255,255,0.1); width: 48px; height: 48px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
    .stats-data { display: flex; flex-direction: column; gap: 4px; }
    .s-label { font-size: 11px; font-weight: 700; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px; line-height: 1.2; }
    .s-value { font-size: 19px; font-weight: 850; letter-spacing: -0.5px; }

    .animate-in { animation: slideInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes slideInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
    
    .badge-pulse { background: #ef4444; color: white; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 900; animation: pulse 2s infinite; }
    @keyframes pulse { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); } 70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { transform: scale(1); } }

    @media (max-width: 1200px) {
      .invitation-layout { grid-template-columns: 1fr; }
      .main-content { padding-left: var(--sidebar-width); }
    }
  `]
})
export class InvitationComponent implements OnInit {
  searchQuery = '';
  searchResults: any[] = [];
  pending: any[] = [];

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.loadPending();
  }

  loadPending() {
    this.chatService.getPendingInvitations().subscribe(data => this.pending = data);
  }

  onSearch() {
    if (this.searchQuery.length < 2) {
      this.searchResults = [];
      return;
    }
    this.chatService.searchUsers(this.searchQuery).subscribe(data => this.searchResults = data);
  }

  sendInvite(id: number) {
    this.chatService.sendInvitation(id).subscribe(() => {
      this.searchQuery = '';
      this.searchResults = [];
      alert('Invitation envoyée !');
    });
  }

  accept(id: number) {
    this.chatService.acceptInvitation(id).subscribe(() => this.loadPending());
  }

  reject(id: number) {
    this.chatService.rejectInvitation(id).subscribe(() => this.loadPending());
  }
}
