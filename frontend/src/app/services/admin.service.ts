import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserDTO {
    id: number;
    username: string;
    email: string;
    enabled: boolean;
    roles: string[];
}

export interface AuditLogDTO {
    id: number;
    userEmail: string;
    action: string;
    entityName: string;
    entityId: number;
    details: string;
    timestamp: string;
}

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private apiUrl = 'http://localhost:8082/api/admin';

    constructor(private http: HttpClient) { }

    getUsers(): Observable<UserDTO[]> {
        return this.http.get<UserDTO[]>(`${this.apiUrl}/users`);
    }

    getLogs(): Observable<AuditLogDTO[]> {
        return this.http.get<AuditLogDTO[]>(`${this.apiUrl}/logs`);
    }
}
