import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage, ChatPartner } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container" [class.open]="isOpen">
      <!-- Chat Toggle Button -->
      <button class="chat-toggle" (click)="toggleChat()" [class.has-unread]="hasUnread">
        <svg *ngIf="!isOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        <svg *ngIf="isOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      <!-- Main Chat Panel -->
      <div class="chat-panel" *ngIf="isOpen">
        <div class="chat-header">
          <div class="header-info">
            <span class="status-indicator"></span>
            <h3>BNA Messagerie</h3>
          </div>
          <p class="subtitle" *ngIf="!selectedPartner">Choisissez un contact pour démarrer</p>
          <p class="subtitle" *ngIf="selectedPartner">{{ selectedPartner.fullName }}</p>
        </div>

        <div class="chat-body">
          <!-- Partners List if none selected -->
            <div class="partners-list" *ngIf="!selectedPartner">
            <h4 class="section-title" *ngIf="suggestions.length > 0">Suggérés</h4>
            <div class="partner-item suggestion" *ngFor="let s of suggestions" (click)="selectPartner(s)">
              <div class="partner-avatar suggestion">{{ s.fullName.substring(0, 2).toUpperCase() }}</div>
              <div class="partner-info">
                <span class="partner-name">{{ s.fullName }}</span>
                <span class="partner-role">{{ s.role }}</span>
              </div>
            </div>

            <h4 class="section-title" *ngIf="partners.length > 0">Récent</h4>
            <div class="partner-item" *ngFor="let p of partners" (click)="selectPartner(p)">
              <div class="partner-avatar">{{ p.fullName.substring(0, 2).toUpperCase() }}</div>
              <div class="partner-info">
                <span class="partner-name">{{ p.fullName }}</span>
                <span class="partner-role">{{ p.username }}</span>
              </div>
            </div>
            <div class="no-partners" *ngIf="partners.length === 0">
              <p>Aucune conversation active.</p>
              <button class="btn-primary-chat" (click)="openSupport()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                Contacter le Support BNA
              </button>
            </div>
          </div>

          <!-- Messages History if partner selected -->
          <div class="messages-view" *ngIf="selectedPartner" #scrollMe>
            <button class="btn-back" (click)="selectedPartner = null">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
               Retour aux contacts
            </button>
            
            <div class="msg-group" *ngFor="let m of history">
              <div class="message" [class.sent]="m.senderId === currentUserId" [class.received]="m.senderId !== currentUserId">
                <div class="msg-bubble">{{ m.content }}</div>
                <div class="msg-time">{{ m.timestamp | date:'HH:mm' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Input -->
        <div class="chat-footer" *ngIf="selectedPartner">
          <input type="text" [(ngModel)]="newMessage" (keyup.enter)="sendMessage()" placeholder="Votre message..." class="chat-input shadow-none">
          <button class="btn-send" (click)="sendMessage()" [disabled]="!newMessage.trim()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-container { position: fixed; bottom: 30px; right: 30px; z-index: 10000; font-family: 'Outfit', sans-serif; }
    .chat-toggle {
      width: 65px; height: 65px; border-radius: 50%; background: linear-gradient(135deg, #008766 0%, #10b981 100%);
      color: white; border: none; cursor: pointer; box-shadow: 0 10px 25px rgba(0, 135, 102, 0.4);
      display: flex; align-items: center; justify-content: center; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .chat-toggle:hover { transform: scale(1.1) rotate(5deg); box-shadow: 0 15px 35px rgba(0, 135, 102, 0.5); }
    .chat-container.open .chat-toggle { background: #f1f5f9; color: #64748b; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
    
    .chat-panel {
      position: absolute; bottom: 85px; right: 0; width: 380px; height: 550px;
      background: white; border-radius: 30px; box-shadow: 0 20px 50px rgba(0,0,0,0.15);
      display: flex; flex-direction: column; overflow: hidden; animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
      border: 1px solid rgba(0,0,0,0.05);
    }
    
    .chat-header { padding: 25px; background: #fafafa; border-bottom: 1px solid #f1f5f9; }
    .header-info { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
    .status-indicator { width: 8px; height: 8px; border-radius: 50%; background: #10b981; }
    .chat-header h3 { margin: 0; font-size: 18px; font-weight: 800; color: #1e293b; }
    .subtitle { margin: 0; font-size: 13px; color: #94a3b8; font-weight: 500; }
    
    .chat-body { flex: 1; overflow-y: auto; padding: 15px; background: #fff; }
    .partners-list { display: flex; flex-direction: column; gap: 8px; }
    .partner-item { 
      display: flex; align-items: center; gap: 15px; padding: 12px; border-radius: 16px; 
      cursor: pointer; transition: 0.2s; 
    }
    .partner-item:hover { background: #f8fafc; transform: translateX(5px); }
    .partner-avatar { 
      width: 44px; height: 44px; border-radius: 14px; background: rgba(0,135,102,0.1); 
      color: #008766; display: flex; align-items: center; justify-content: center; font-weight: 700; 
    }
    .partner-info { display: flex; flex-direction: column; }
    .partner-name { font-weight: 700; color: #1e293b; font-size: 14px; }
    .partner-role { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }

    .section-title { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin: 15px 12px 5px; }
    .partner-item.suggestion { border: 1.5px dashed rgba(0,135,102,0.15); margin-bottom: 5px; }
    .partner-avatar.suggestion { background: rgba(37, 99, 235, 0.1); color: #2563eb; }
    
    .messages-view { display: flex; flex-direction: column; gap: 12px; }
    .btn-back { 
      background: none; border: none; color: #008766; font-size: 12px; font-weight: 700; 
      display: flex; align-items: center; gap: 5px; cursor: pointer; margin-bottom: 15px;
      padding: 0;
    }
    
    .message { display: flex; flex-direction: column; max-width: 85%; }
    .message.sent { align-self: flex-end; }
    .message.received { align-self: flex-start; }
    .msg-bubble { 
      padding: 12px 18px; border-radius: 20px; font-size: 14px; font-weight: 500; line-height: 1.5; 
    }
    .sent .msg-bubble { background: #008766; color: white; border-bottom-right-radius: 4px; }
    .received .msg-bubble { background: #f1f5f9; color: #1e293b; border-bottom-left-radius: 4px; }
    .msg-time { font-size: 10px; color: #94a3b8; margin-top: 5px; align-self: flex-end; }
    
    .chat-footer { padding: 20px; background: white; border-top: 1px solid #f1f5f9; display: flex; gap: 10px; align-items: center; }
    .chat-input { 
      flex: 1; border: none; background: #f1f5f9; padding: 12px 20px; border-radius: 12px; 
      font-size: 14px; font-weight: 500; font-family: inherit;
    }
    .btn-send { 
      width: 44px; height: 44px; border-radius: 12px; background: #008766; color: white; 
      border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s;
    }
    .btn-send:hover { transform: scale(1.05); background: #00684d; }
    .no-partners { padding: 40px 20px; text-align: center; color: #94a3b8; font-size: 13px; display: flex; flex-direction: column; gap: 15px; align-items: center; }
    .btn-primary-chat { 
      background: #008766; color: white; border: none; padding: 12px 20px; border-radius: 12px; 
      font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px;
      transition: all 0.2s; box-shadow: 0 4px 12px rgba(0,135,102,0.2);
    }
    .btn-primary-chat:hover { transform: translateY(-2px); background: #00684d; }

    @keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
  `],
})
export class ChatWidgetComponent implements OnInit, OnDestroy {
  isOpen = false;
  hasUnread = false;
  partners: ChatPartner[] = [];
  suggestions: any[] = [];
  selectedPartner: any | null = null;
  history: ChatMessage[] = [];
  newMessage = '';
  currentUserId: number | null = null;
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;
  
  private pollingSub?: Subscription;

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {
    const user = this.authService.currentUserValue;
    if (user) {
      this.currentUserId = user.id;
    }
  }

  ngOnInit(): void {
    this.loadPartners();
    // Poll for new messages every 5 seconds if open
    this.pollingSub = interval(5000).subscribe(() => {
      if (this.isOpen) {
        if (this.selectedPartner) {
          this.loadHistory(this.selectedPartner.id);
        } else {
          this.loadPartners();
        }
      }
    });

    // Listen for global contact requests (window events)
    (window as any).openChatWith = (id: number, name: string) => {
        this.startChatWith(id, name);
    };
  }

  ngOnDestroy(): void {
    if (this.pollingSub) this.pollingSub.unsubscribe();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.loadPartners();
      this.loadSuggestions();
    }
  }

  loadPartners() {
    this.chatService.getPartners().subscribe(data => {
        this.partners = data;
        this.hasUnread = data.some(p => p.id === this.currentUserId); // simplified
    });
  }

  loadSuggestions() {
    this.chatService.getSuggestedContacts().subscribe(data => this.suggestions = data);
  }

  selectPartner(p: ChatPartner) {
    this.selectedPartner = p;
    this.loadHistory(p.id);
  }

  loadHistory(partnerId: number) {
    this.chatService.getHistory(partnerId).subscribe(data => {
        this.history = data;
        setTimeout(() => {
          if (this.myScrollContainer) {
            this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
          }
        }, 50);
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedPartner) return;
    
    const partnerId = this.selectedPartner.id;
    const content = this.newMessage;
    
    this.chatService.sendMessage(partnerId, content).subscribe(() => {
      this.newMessage = '';
      this.loadHistory(partnerId);
    });
  }

  startChatWith(id: number, name: string) {
    this.isOpen = true;
    this.selectedPartner = { id, fullName: name, username: 'Collaborateur' };
    this.loadHistory(id);
  }

  openSupport() {
    const support = this.suggestions.find(s => s.isSupport);
    if (support) {
      this.selectPartner(support);
    } else {
      // Fallback if not loaded yet
      this.chatService.getSuggestedContacts().subscribe(data => {
        const s = data.find((x: any) => x.isSupport);
        if (s) this.selectPartner(s);
      });
    }
  }
}
