import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessage {
    id?: number;
    senderId: number;
    senderName?: string;
    receiverId?: number;
    content: string;
    timestamp?: string;
    isRead?: boolean;
}

export interface ChatPartner {
    id: number;
    username: string;
    fullName: string;
    avatarUrl?: string;
    role?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private apiUrl = 'http://localhost:8082/api/chat';

    constructor(private http: HttpClient) {}

    sendMessage(receiverId: number, content: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/send`, { receiverId, content });
    }

    getHistory(targetId: number): Observable<ChatMessage[]> {
        return this.http.get<ChatMessage[]>(`${this.apiUrl}/history/${targetId}`);
    }

    getPartners(): Observable<ChatPartner[]> {
        return this.http.get<ChatPartner[]>(`${this.apiUrl}/partners`);
    }

    findByAuxiliaire(auxId: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/find-by-auxiliaire/${auxId}`);
    }

    getSuggestedContacts(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/suggested-contacts`);
    }

    getPendingInvitations(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/invitations/pending`);
    }

    sendInvitation(targetId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/invitations/send/${targetId}`, {});
    }

    acceptInvitation(id: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/invitations/accept/${id}`, {});
    }

    rejectInvitation(id: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/invitations/reject/${id}`, {});
    }

    searchUsers(query: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/search-users?q=${query}`);
    }

    getUnreadCount(): Observable<{count: number}> {
        return this.http.get<{count: number}>(`${this.apiUrl}/unread-count`);
    }

    markAsRead(partnerId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/mark-as-read/${partnerId}`, {});
    }
}
