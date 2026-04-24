import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface Notification {
    id: number;
    message: string;
    role: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING';
    timestamp: string;
    read: boolean;
    dossier?: {
        id: number;
        reference: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private notificationsSubject = new BehaviorSubject<Notification[]>([]);
    public notifications$ = this.notificationsSubject.asObservable();

    private unreadCountSubject = new BehaviorSubject<number>(0);
    public unreadCount$ = this.unreadCountSubject.asObservable();

    private apiUrl = '/api/notifications';

    constructor(private http: HttpClient) {
        this.refreshNotifications();
        setInterval(() => this.refreshNotifications(), 30000);
    }

    // Bridge for legacy components or quick UI alerts
    addNotification(message: string, role: string = 'ROLE_ADMIN', type: 'INFO' | 'SUCCESS' | 'WARNING' = 'INFO') {
        const payload = { message, role, type };
        this.http.post<Notification>(this.apiUrl, payload).subscribe({
            next: () => this.refreshNotifications()
        });
    }

    refreshNotifications() {
        this.http.get<Notification[]>(this.apiUrl)
            .subscribe({
                next: (res) => this.notificationsSubject.next(res),
                error: (err) => console.error('Error fetching notifications:', err)
            });
        
        this.http.get<{count: number}>(`${this.apiUrl}/unread-count`)
            .subscribe({
                next: (res) => this.unreadCountSubject.next(res.count),
                error: (err) => {}
            });
    }

    markAsRead(id: number): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}/read`, {}).pipe(
            tap(() => this.refreshNotifications())
        );
    }

    markAllAsRead(): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/read-all`, {}).pipe(
            tap(() => this.refreshNotifications())
        );
    }

    // Keep chat count separate (if needed by existing UI)
    private chatUnreadCountSubject = new BehaviorSubject<number>(0);
    public chatUnreadCount$ = this.chatUnreadCountSubject.asObservable();

    updateChatUnreadCount() {
        this.http.get<{count: number}>('/api/chat/unread-count')
            .subscribe({
                next: (res: {count: number}) => this.chatUnreadCountSubject.next(res.count),
                error: () => {}
            });
    }

    setChatUnreadCount(count: number) {
        this.chatUnreadCountSubject.next(count);
    }
}
