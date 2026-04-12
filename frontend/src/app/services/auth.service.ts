import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { User, LoginResponse } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject: BehaviorSubject<User | null>;
    public currentUser: Observable<User | null>;
    private apiUrl = '/api/auth';

    constructor(private http: HttpClient) {
        const savedUser = localStorage.getItem('currentUser');
        this.currentUserSubject = new BehaviorSubject<User | null>(savedUser ? JSON.parse(savedUser) : null);
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User | null {
        return this.currentUserSubject.value;
    }

    login(username: string, password: string): Observable<User> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password })
            .pipe(map(response => {
                const user: User = {
                    id: response.id,
                    username: response.username,
                    email: response.email,
                    roles: response.roles,
                    token: response.token
                };
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
                return user;
            }));
    }

    register(userData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, userData);
    }

    forgotPassword(email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/forgot-password`, { email });
    }

    verifyOtp(email: string, otp: string): Observable<{uuid: string}> {
        return this.http.post<{uuid: string}>(`${this.apiUrl}/verify-otp`, { email, otp });
    }

    resetPassword(email: string, uuid: string, newPassword: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/reset-password`, { email, uuid, newPassword });
    }


    changePassword(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/change-password`, data);
    }

    updateProfile(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/update-profile`, data).pipe(map(response => {
            const currentUser = this.currentUserValue;
            if (currentUser) {
                const updatedUser = { ...currentUser, ...data };
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                this.currentUserSubject.next(updatedUser);
            }
            return response;
        }));
    }

    uploadAvatar(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<any>(`${this.apiUrl}/upload-avatar`, formData).pipe(map(res => {
            const currentUser = this.currentUserValue;
            if (currentUser && res.message) {
                const updatedUser = { ...currentUser, avatarUrl: res.message };
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                this.currentUserSubject.next(updatedUser);
            }
            return res;
        }));
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }

    isLoggedIn(): boolean {
        return !!this.currentUserValue;
    }

    hasRole(role: string): boolean {
        return this.currentUserValue?.roles.includes(role) || false;
    }
}
