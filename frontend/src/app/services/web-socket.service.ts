import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket?: WebSocket;
  private reconnectInterval = 1000;
  private maxReconnectInterval = 16000;
  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  public isConnected$ = this.isConnectedSubject.asObservable();

  // Event streams for real-time notifications, chats, and alerts
  public chatMessage$ = new Subject<any>();
  public notification$ = new Subject<any>();
  public alert$ = new Subject<any>();
  public auditLog$ = new Subject<any>();

  constructor(private authService: AuthService) {
    this.authService.currentUser.subscribe(user => {
      if (user && this.authService.isLoggedIn()) {
        const token = user.token;
        if (token) {
          this.connect(token);
        }
      } else {
        this.disconnect();
      }
    });
  }

  private connect(token: string): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:8082/ws?token=${token}`;

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      this.isConnectedSubject.next(true);
      this.reconnectInterval = 1000;
      console.log('WebSocket successfully connected to BNA Real-Time Server.');
    };

    this.socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        this.handleMessage(payload);
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    this.socket.onclose = (event) => {
      this.isConnectedSubject.next(false);
      console.log(`WebSocket disconnected. Retrying in ${this.reconnectInterval}ms...`);
      this.scheduleReconnect(token);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket encountered an error:', error);
      this.socket?.close();
    };
  }

  private handleMessage(payload: any): void {
    switch (payload.type) {
      case 'CHAT':
        this.chatMessage$.next(payload.data);
        break;
      case 'NOTIFICATION':
        this.notification$.next(payload.data);
        break;
      case 'ALERT':
        this.alert$.next(payload.data);
        break;
      case 'AUDIT_LOG':
        this.auditLog$.next(payload.data);
        break;
      default:
        console.warn('Unknown WebSocket payload type:', payload.type);
    }
  }

  private scheduleReconnect(token: string): void {
    setTimeout(() => {
      this.reconnectInterval = Math.min(this.reconnectInterval * 2, this.maxReconnectInterval);
      this.connect(token);
    }, this.reconnectInterval);
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = undefined;
    }
    this.isConnectedSubject.next(false);
  }

  public send(payload: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    } else {
      console.warn('Unable to send WebSocket message: socket is not open.');
    }
  }
}
