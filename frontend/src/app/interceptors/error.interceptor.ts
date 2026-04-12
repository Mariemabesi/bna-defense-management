import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && !req.url.includes('/api/auth/')) {
                console.warn('Session expirée ou non autorisée (401). Redirection...');
                authService.logout();
                router.navigate(['/login']);
            } else if (error.status === 403) {
                console.error('Accès refusé (403) : vous n\'avez pas les permissions pour cette action.');
            }

            const errorMessage = error.error?.message || error.statusText;
            return throwError(() => new Error(errorMessage));
        })
    );
};
