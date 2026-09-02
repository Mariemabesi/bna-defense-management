import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage, ChatPartner } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-admin-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>

      <main class="main-content">
        <app-header title="Messagerie Support & Audit"></app-header>

        <div class="dashboard-content">
          <div class="chat-main-wrapper">
            <!-- PARTNERS SIDEBAR -->
            <div class="chat-sidebar">
              <div class="sidebar-header">
                <h3>Conversations</h3>
                <button class="btn-new" (click)="toggleNewConv()" [title]="showNewConv ? 'Fermer' : 'Nouvelle conversation'">
                  <svg *ngIf="!showNewConv" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  <svg *ngIf="showNewConv" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              <!-- NEW CONVERSATION PANEL -->
              <div class="new-conv-panel" *ngIf="showNewConv">
                <div class="search-box">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input type="text" placeholder="Rechercher un utilisateur..." [(ngModel)]="searchQuery" (input)="onSearch()">
                </div>

                <!-- Suggested contacts (shown when search is empty) -->
                <div *ngIf="!searchQuery.trim() && suggestedContacts.length > 0">
                  <div class="section-label">Contacts suggérés</div>
                  <div class="partner-item suggested"
                       *ngFor="let s of suggestedContacts"
                       (click)="startConversation(s)">
                    <div class="partner-avatar suggested-av">{{ s.fullName.substring(0,2).toUpperCase() }}</div>
                    <div class="partner-info">
                      <span class="partner-name">{{ s.fullName }}</span>
                      <span class="partner-role-mini">{{ s.role }}</span>
                    </div>
                  </div>
                </div>
                <div class="no-results" *ngIf="!searchQuery.trim() && suggestedContacts.length === 0">
                  Aucun contact suggéré.
                </div>

                <!-- Search results -->
                <div *ngIf="searchQuery.trim()">
                  <div class="section-label">Résultats</div>
                  <div class="no-results" *ngIf="searchResults.length === 0 && !searching">Aucun utilisateur trouvé.</div>
                  <div class="partner-item suggested"
                       *ngFor="let u of searchResults"
                       (click)="startConversation(u)">
                    <div class="partner-avatar suggested-av">{{ u.fullName.substring(0,2).toUpperCase() }}</div>
                    <div class="partner-info">
                      <span class="partner-name">{{ u.fullName }}</span>
                      <span class="partner-role-mini">{{ u.role }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- History filter search -->
              <div class="search-box" *ngIf="!showNewConv">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" placeholder="Filtrer conversations..." [(ngModel)]="searchTerm">
              </div>

              <!-- Partners list -->
              <div class="partners-list" *ngIf="!showNewConv">
                <div class="empty-partners" *ngIf="filteredPartners().length === 0">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  <p>Aucune conversation</p>
                  <button class="btn-start-conv" (click)="toggleNewConv()">+ Nouvelle conversation</button>
                </div>

                <div class="partner-item"
                     *ngFor="let p of filteredPartners()"
                     [class.active]="selectedPartner?.id === p.id"
                     (click)="selectPartner(p)">
                  <div class="partner-avatar">{{ p.fullName.substring(0,2).toUpperCase() }}</div>
                  <div class="partner-info">
                    <span class="partner-name">{{ p.fullName }}</span>
                    <span class="partner-role-mini">{{ p.role || 'Utilisateur' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- CHAT AREA -->
            <div class="chat-area" *ngIf="selectedPartner">
              <div class="chat-area-header">
                <div class="partner-details">
                  <div class="partner-avatar header">{{ selectedPartner.fullName.substring(0,2).toUpperCase() }}</div>
                  <div>
                    <h4>{{ selectedPartner.fullName }}</h4>
                    <p class="role-badge">{{ selectedPartner.role || 'Utilisateur BNA' }} #{{ selectedPartner.id }}</p>
                  </div>
                </div>
                <div class="header-actions">
                  <button class="btn-icon" title="Exporter historique">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  </button>
                </div>
              </div>

              <div class="messages-container" #scrollMe [scrollTop]="scrollMe.scrollHeight">
                <div class="msg-group" *ngFor="let m of history">
                   <div class="message" [class.sent]="m.senderId === currentUserId" [class.received]="m.senderId !== currentUserId">
                      <div class="message-meta" *ngIf="m.senderId !== currentUserId">{{ selectedPartner.fullName }}</div>
                      <div class="msg-bubble">{{ m.content }}</div>
                      <div class="msg-time">{{ m.timestamp | date:'HH:mm' }}</div>
                   </div>
                </div>
                <div class="no-messages" *ngIf="history.length === 0">
                  <p>Aucun message. Démarrez la conversation !</p>
                </div>
              </div>

              <form class="chat-input-area" (ngSubmit)="sendMessage()">
                <input type="text" [(ngModel)]="newMessage" name="newMessage" placeholder="Répondre à {{ selectedPartner.fullName }}..." class="form-control">
                <button type="submit" class="btn-send" [disabled]="!newMessage.trim()">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  Envoyer
                </button>
              </form>
            </div>

            <!-- EMPTY STATE -->
            <div class="chat-empty" *ngIf="!selectedPartner">
               <div class="empty-illustration">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#008766" stroke-width="1"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
               </div>
               <h3>BNA Messagerie</h3>
               <p>Sélectionnez une conversation ou démarrez-en une nouvelle.</p>
               <button class="btn-start-conv hero" (click)="toggleNewConv()">+ Nouvelle conversation</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-content { 
      height: calc(100vh - 90px); 
      display: flex; 
      flex-direction: column;
      padding: 32px 48px;
    }
    .chat-main-wrapper { 
      display: flex; flex: 1; min-height: 0; background: white; border-radius: 24px; 
      box-shadow: 0 10px 40px rgba(0,0,0,0.03); overflow: hidden; border: 1px solid #f1f5f9;
    }
    
    /* SIDEBAR */
    .chat-sidebar { width: 320px; border-right: 1px solid #f1f5f9; display: flex; flex-direction: column; }
    .sidebar-header { padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; }
    .sidebar-header h3 { margin: 0; font-size: 18px; font-weight: 800; color: #1e293b; }

    .btn-new {
      width: 36px; height: 36px; border-radius: 10px; border: none;
      background: #008766; color: white; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s; flex-shrink: 0;
    }
    .btn-new:hover { background: #006b51; transform: translateY(-1px); }

    .search-box { padding: 12px 16px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #f1f5f9; }
    .search-box input { flex: 1; border: none; background: transparent; font-size: 14px; color: #1e293b; outline: none; }

    .new-conv-panel { flex: 1; overflow-y: auto; }
    .section-label { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; padding: 12px 16px 4px; }
    
    .partners-list { flex: 1; overflow-y: auto; padding: 10px; }
    .partner-item { 
      display: flex; align-items: center; gap: 14px; padding: 12px 14px; border-radius: 14px; 
      cursor: pointer; transition: 0.2s; margin-bottom: 4px;
    }
    .partner-item:hover { background: #f8fafc; }
    .partner-item.active { background: #eff6ff; }
    .partner-item.suggested { margin: 0; border-radius: 0; padding: 12px 16px; }
    .partner-item.suggested:hover { background: #f0fdf4; }

    .partner-avatar { 
      width: 44px; height: 44px; border-radius: 14px; background: rgba(0,135,102,0.1); 
      color: #008766; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; flex-shrink: 0;
    }
    .partner-avatar.suggested-av { background: #f0fdf4; }
    .partner-item.active .partner-avatar { background: #008766; color: white; }
    .partner-avatar.header { background: #008766; color: white; }
    .partner-info { display: flex; flex-direction: column; min-width: 0; }
    .partner-name { font-weight: 700; color: #1e293b; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .partner-role-mini { font-size: 11px; color: #008766; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.8; }

    .no-results { padding: 16px; font-size: 13px; color: #94a3b8; text-align: center; }

    .empty-partners { 
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 40px 20px; gap: 12px; text-align: center;
    }
    .empty-partners p { font-size: 13px; color: #94a3b8; margin: 0; font-weight: 500; }

    .btn-start-conv {
      background: #008766; color: white; border: none; padding: 10px 20px;
      border-radius: 12px; font-weight: 700; font-size: 13px; cursor: pointer; transition: all 0.2s;
    }
    .btn-start-conv:hover { background: #006b51; transform: translateY(-1px); }
    .btn-start-conv.hero { padding: 14px 28px; font-size: 15px; border-radius: 14px; margin-top: 8px; }
    
    /* CHAT AREA */
    .chat-area { flex: 1; display: flex; flex-direction: column; }
    .chat-area-header { padding: 20px 32px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
    .partner-details { display: flex; align-items: center; gap: 15px; }
    .partner-details h4 { margin: 0; font-size: 16px; font-weight: 800; }
    .role-badge { margin: 2px 0 0; font-size: 12px; color: #64748b; font-weight: 600; }
    .btn-icon { background: none; border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px; cursor: pointer; color: #64748b; display: flex; }
    .btn-icon:hover { background: #f8fafc; }
    
    .messages-container { flex: 1; overflow-y: auto; padding: 32px; background: #fafafa; display: flex; flex-direction: column; gap: 20px; }
    .no-messages { display: flex; align-items: center; justify-content: center; flex: 1; color: #94a3b8; font-size: 14px; font-style: italic; }
    .message { display: flex; flex-direction: column; max-width: 70%; }
    .message.sent { align-self: flex-end; }
    .message.received { align-self: flex-start; }
    .message-meta { font-size: 11px; font-weight: 800; color: #94a3b8; margin-bottom: 6px; padding-left: 10px; text-transform: uppercase; }
    .msg-bubble { padding: 14px 20px; border-radius: 20px; font-size: 14px; font-weight: 500; line-height: 1.6; }
    .sent .msg-bubble { background: #008766; color: white; border-top-right-radius: 4px; box-shadow: 0 4px 12px rgba(0,135,102,0.2); }
    .received .msg-bubble { background: white; color: #1e293b; border-top-left-radius: 4px; border: 1px solid #f1f5f9; }
    .msg-time { font-size: 10px; color: #94a3b8; margin-top: 6px; align-self: flex-end; font-weight: 600; }
    
    .chat-input-area { padding: 24px 32px; background: white; border-top: 1px solid #f1f5f9; display: flex; gap: 15px; }
    .form-control { flex: 1; padding: 14px 20px; border-radius: 15px; border: 1.5px solid #e2e8f0; font-family: inherit; font-size: 14px; transition: 0.2s; }
    .form-control:focus { outline: none; border-color: #008766; background: #f8fafc; }
    .btn-send { 
      padding: 0 24px; border-radius: 15px; background: #008766; color: white; border: none; 
      font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s;
    }
    .btn-send:hover:not(:disabled) { background: #00684d; transform: translateY(-2px); }
    .btn-send:disabled { opacity: 0.4; cursor: not-allowed; }
    
    /* EMPTY AREA */
    .chat-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center; background: #fafafa; gap: 12px; }
    .empty-illustration { background: rgba(0,135,102,0.1); padding: 32px; border-radius: 50%; }
    .chat-empty h3 { margin: 0; font-size: 22px; font-weight: 800; color: #1e293b; }
    .chat-empty p { margin: 0; color: #64748b; font-size: 16px; max-width: 400px; }
    
    @media (max-width: 1024px) {
      .dashboard-content { padding: 16px; }
      .chat-sidebar { width: 80px; }
      .partner-info, .sidebar-header h3, .search-box, .new-conv-panel { display: none; }
      .partner-item { justify-content: center; padding: 10px; }
    }
  `]
})
export class AdminChatComponent implements OnInit, OnDestroy {
  partners: ChatPartner[] = [];
  selectedPartner: ChatPartner | null = null;
  history: ChatMessage[] = [];
  searchTerm = '';
  newMessage = '';
  currentUserId: number | null = null;

  // New conversation panel
  showNewConv = false;
  searchQuery = '';
  searchResults: any[] = [];
  suggestedContacts: any[] = [];
  searching = false;
  private searchTimeout?: any;

  private pollingSub?: Subscription;

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {
    const user = this.authService.currentUserValue;
    if (user) this.currentUserId = user.id;
  }

  ngOnInit(): void {
    this.loadPartners();
    this.loadSuggestedContacts();
    this.pollingSub = interval(4000).subscribe(() => {
      this.loadPartners();
      if (this.selectedPartner) this.loadHistory(this.selectedPartner.id);
    });
  }

  ngOnDestroy(): void {
    if (this.pollingSub) this.pollingSub.unsubscribe();
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
  }

  loadPartners() {
    this.chatService.getPartners().subscribe(data => this.partners = data);
  }

  loadSuggestedContacts() {
    this.chatService.getSuggestedContacts().subscribe({
      next: (data) => this.suggestedContacts = data,
      error: () => this.suggestedContacts = []
    });
  }

  filteredPartners() {
    return this.partners.filter(p =>
      p.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      p.username.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  toggleNewConv() {
    this.showNewConv = !this.showNewConv;
    this.searchQuery = '';
    this.searchResults = [];
  }

  onSearch() {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }
    this.searching = true;
    this.searchTimeout = setTimeout(() => {
      this.chatService.searchUsers(this.searchQuery).subscribe({
        next: (results) => {
          this.searchResults = results;
          this.searching = false;
        },
        error: () => { this.searchResults = []; this.searching = false; }
      });
    }, 300);
  }

  startConversation(contact: any) {
    const partner: ChatPartner = {
      id: contact.id,
      username: contact.username || contact.fullName,
      fullName: contact.fullName,
      role: contact.role
    };
    this.showNewConv = false;
    this.searchQuery = '';
    this.searchResults = [];

    // Add to partners list if not already present
    if (!this.partners.find(p => p.id === partner.id)) {
      this.partners = [partner, ...this.partners];
    }
    this.selectPartner(partner);
  }

  selectPartner(p: ChatPartner) {
    this.selectedPartner = p;
    this.loadHistory(p.id);
  }

  loadHistory(id: number) {
    this.chatService.getHistory(id).subscribe(data => this.history = data);
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedPartner) return;
    const pId = this.selectedPartner.id;
    const msg = this.newMessage;
    this.chatService.sendMessage(pId, msg).subscribe(() => {
      this.newMessage = '';
      this.loadHistory(pId);
      this.loadPartners();
    });
  }
}
