import { Injectable } from '@angular/core';
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

    constructor() {
        // Some initial demo notifications
        this.addNotification('Système initialisé', 'ROLE_ADMIN', 'SUCCESS');
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
