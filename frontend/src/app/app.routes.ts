import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { DossierFormComponent } from './components/dossier-form/dossier-form.component';
import { FraisFormComponent } from './components/frais-form/frais-form.component';
import { MesDossiersComponent } from './components/mes-dossiers/mes-dossiers.component';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

const authGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    if (authService.isLoggedIn()) {
        return true;
    }
    return router.parseUrl('/login');
};

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'forgot-password', loadComponent: () => import('./components/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'mes-dossiers', component: MesDossiersComponent, canActivate: [authGuard] },
    { path: 'nouveau-dossier', component: DossierFormComponent, canActivate: [authGuard] },
    { path: 'modifier-dossier/:id', component: DossierFormComponent, canActivate: [authGuard] },
    { path: 'nouvelle-demande-frais', component: FraisFormComponent, canActivate: [authGuard] },
    { path: 'mes-frais', loadComponent: () => import('./components/mes-frais/mes-frais.component').then(m => m.MesFraisComponent), canActivate: [authGuard] },
    // ⚖️ RÉFÉRENTIEL MODULE (Dynamic Engine)
    { path: 'referentiel/:type', loadComponent: () => import('./components/referentiel-list/referentiel-list.component').then(m => m.ReferentielListComponent), canActivate: [authGuard] },
    { path: 'invitations', loadComponent: () => import('./components/invitations/invitations.component').then(m => m.InvitationComponent), canActivate: [authGuard] },
    { path: 'admin/users', loadComponent: () => import('./components/user-management/user-management.component').then(m => m.UserManagementComponent), canActivate: [authGuard] },
    { path: 'admin/logs', loadComponent: () => import('./components/audit-logs/audit-logs.component').then(m => m.AuditLogsComponent), canActivate: [authGuard] },
    { path: 'admin/chat', loadComponent: () => import('./components/admin-chat/admin-chat.component').then(m => m.AdminChatComponent), canActivate: [authGuard] },
    { path: 'frais-review', loadComponent: () => import('./components/frais-review/frais-review.component').then(m => m.FraisReviewComponent), canActivate: [authGuard] },
    { path: 'avocat-detail/:id', loadComponent: () => import('./components/avocat-detail/avocat-detail.component').then(m => m.AvocatDetailComponent), canActivate: [authGuard] },
    { path: 'profil', loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard] },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: '**', redirectTo: 'dashboard' }
];
