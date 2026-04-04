import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
    id: number;
    message: string;
    role: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING';
    timestamp: Date;
    isRead: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private notificationsSubject = new BehaviorSubject<Notification[]>([]);
    public notifications$ = this.notificationsSubject.asObservable();

    private nextId = 1;

    private chatUnreadCountSubject = new BehaviorSubject<number>(0);
    public chatUnreadCount$ = this.chatUnreadCountSubject.asObservable();

    constructor(private http: HttpClient) {
        // Initial check and periodic polling
        this.addNotification('Système initialisé', 'ROLE_ADMIN', 'SUCCESS');
        setInterval(() => this.updateChatUnreadCount(), 10000);
    }

    private updateChatUnreadCount() {
        // We need auth token, if not logged in this might fail.
        // Assuming interceptor handles it.
        this.http.get<{count: number}>('http://localhost:8082/api/chat/unread-count')
            .subscribe({
                next: (res: {count: number}) => this.chatUnreadCountSubject.next(res.count),
                error: () => {} // Silent ignore if not logged in
            });
    }

    setChatUnreadCount(count: number) {
        this.chatUnreadCountSubject.next(count);
    }

    addNotification(message: string, role: string, type: 'INFO' | 'SUCCESS' | 'WARNING' = 'INFO') {
        const current = this.notificationsSubject.value;
        const newNotif: Notification = {
            id: this.nextId++,
            message,
            role,
            type,
            timestamp: new Date(),
            isRead: false
        };
        this.notificationsSubject.next([newNotif, ...current]);
    }

    getNotificationsForRole(role: string): Notification[] {
        return this.notificationsSubject.value.filter(n => n.role === role || role === 'ROLE_ADMIN');
    }

    markAsRead(id: number) {
        const current = this.notificationsSubject.value.map(n =>
            n.id === id ? { ...n, isRead: true } : n
        );
        this.notificationsSubject.next(current);
    }

    clearAll() {
        this.notificationsSubject.next([]);
    }
}
