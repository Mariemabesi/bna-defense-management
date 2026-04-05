import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      <main class="main-content">
        <app-header title="Identité Souveraine"></app-header>
        
        <div class="page-container">
          <!-- EXECUTIVE IDENTITY BANNER -->
          <div class="identity-banner shadow-premium fade-in">
             <div class="avatar-deck-large shadow-premium hover-trigger" (click)="fileInput.click()">
                <div class="glow-ring"></div>
                <img *ngIf="currentUser?.avatarUrl" [src]="getFullUrl(currentUser.avatarUrl)" class="avatar-img">
                <div *ngIf="!currentUser?.avatarUrl" class="avatar-placeholder">
                   <span *ngIf="currentUser?.fullName || profileData.firstName">{{ getInitials() }}</span>
                </div>
                <div class="upload-overlay">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                </div>
             </div>
             <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/*" style="display: none">
             <div class="banner-body">
                <h1>{{ currentUser?.fullName || 'Personnel de la Banque' }}</h1>
                <p>Gestionnaire de Portefeuille • Département Juridique • BNA</p>
                <div class="persona-meta"><span class="role-badge">{{ currentUser?.role || 'UTILISATEUR' }}</span><span class="status-badge active">SESSION SÉCURISÉE</span></div>
             </div>
          </div>

          <!-- SOVEREIGN BENTO CARDS -->
          <div class="bento-grid-profile">
             <!-- DATA CARD -->
             <div class="premium-glass-card shadow-premium fade-in">
                <div class="card-header-sovereign">
                   <div class="aura-pulse-emerald"></div>
                   <h3>Données Personnelles</h3>
                </div>
                <div class="glass-body">
                   <div *ngIf="profileSuccess" class="success-toast-inline">{{ profileSuccess }}</div>
                   <div *ngIf="profileError" class="error-toast-inline">{{ profileError }}</div>
                   
                   <div class="input-unit">
                      <label>Matricule / Username</label>
                      <input type="text" [value]="currentUser?.username" class="glass-field-locked" disabled>
                   </div>
                   <div class="input-row">
                      <div class="input-unit">
                         <label>Prénom</label>
                         <input type="text" [(ngModel)]="profileData.firstName" class="glass-field">
                      </div>
                      <div class="input-unit">
                         <label>Nom</label>
                         <input type="text" [(ngModel)]="profileData.lastName" class="glass-field">
                      </div>
                   </div>
                   <div class="input-unit">
                      <label>Email Professionnel</label>
                      <input type="email" [(ngModel)]="profileData.email" class="glass-field">
                   </div>
                   <div class="form-action-footer">
                      <button class="btn-executive primary" [disabled]="isSavingProfile" (click)="saveProfile()">
                         {{ isSavingProfile ? 'MISE À JOUR...' : 'ENREGISTRER' }}
                      </button>
                   </div>
                </div>
             </div>

             <!-- SECURITY CARD -->
             <div class="premium-glass-card shadow-premium fade-in">
                <div class="card-header-sovereign">
                   <div class="aura-pulse-red"></div>
                   <h3>Sécurité du Compte</h3>
                </div>
                <div class="glass-body">
                   <div *ngIf="passwordSuccess" class="success-toast-inline">{{ passwordSuccess }}</div>
                   <div *ngIf="passwordError" class="error-toast-inline">{{ passwordError }}</div>
                   
                   <div class="input-unit">
                      <label>Ancien Mot de Passe</label>
                      <input type="password" [(ngModel)]="passwordData.oldPassword" class="glass-field" placeholder="••••••••">
                   </div>
                   <div class="input-unit">
                      <label>Nouveau Mot de Passe</label>
                      <input type="password" [(ngModel)]="passwordData.newPassword" (input)="onPasswordInput($event)" class="glass-field" placeholder="••••••••">
                      <div class="strength-deck" *ngIf="passwordData.newPassword">
                         <div class="deck-bar" [style.width.%]="(passwordStrength/4)*100" [class.weak]="passwordStrength <= 1" [class.good]="passwordStrength === 2" [class.strong]="passwordStrength >= 3"></div>
                         <span class="deck-label">{{ passwordStrengthLabel }}</span>
                      </div>
                   </div>
                   <div class="input-unit">
                      <label>Confirmer Nouveau</label>
                      <input type="password" [(ngModel)]="passwordData.confirmPassword" class="glass-field" placeholder="••••••••">
                   </div>
                   <div class="form-action-footer">
                      <button class="btn-executive secondary" [disabled]="isChangingPassword" (click)="changePassword()">
                         {{ isChangingPassword ? 'CHANGEMENT...' : 'MISE À JOUR SÉCURITÉ' }}
                      </button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-layout { display: flex; min-height: 100vh; background: transparent; }
    .main-content { flex: 1; margin-left: var(--sidebar-width); }
    .page-container { padding: 48px; max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px; animation: fadeUp 0.6s ease-out; }

    /* IDENTITY BANNER */
    .identity-banner { 
      background: white; border-radius: 32px; padding: 48px; display: flex; align-items: center; gap: 40px; position: relative; overflow: hidden;
      background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
    }
    .avatar-deck-large { 
      width: 120px; height: 120px; border-radius: 40px; position: relative; cursor: pointer; background: #0f172a;
      display: flex; align-items: center; justify-content: center; color: white; font-weight: 850; font-size: 32px;
    }
    .glow-ring { position: absolute; top: -10px; left: -10px; right: -10px; bottom: -10px; border-radius: 45px; border: 2px dashed var(--bna-emerald); opacity: 0.3; animation: spin-slow 10s linear infinite; }
    .avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 40px; }
    .upload-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); border-radius: 40px; display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.3s; }
    .avatar-deck-large:hover .upload-overlay { opacity: 1; }
    
    .banner-body h1 { font-size: 36px; font-weight: 900; color: #0f172a; margin: 0 0 8px 0; letter-spacing: -1.5px; }
    .banner-body p { font-size: 15px; color: #64748b; margin: 0 0 16px 0; font-weight: 600; }
    .persona-meta { display: flex; gap: 12px; }
    .role-badge { padding: 6px 14px; background: #0f172a; color: white; border-radius: 12px; font-size: 10px; font-weight: 850; letter-spacing: 1px; }
    .status-badge.active { padding: 6px 14px; background: #ecfdf5; color: #059669; border-radius: 12px; font-size: 10px; font-weight: 850; }

    /* BENTO GRID */
    .bento-grid-profile { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
    .premium-glass-card { background: white; border-radius: 32px; padding: 40px; }
    .card-header-sovereign { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 2px solid #f1f5f9; }
    .card-header-sovereign h3 { font-size: 18px; font-weight: 850; margin: 0; color: #1e293b; }
    
    .aura-pulse-emerald { width: 10px; height: 10px; background: var(--bna-emerald); border-radius: 50%; box-shadow: 0 0 10px var(--bna-emerald); }
    .aura-pulse-red { width: 10px; height: 10px; background: #ef4444; border-radius: 50%; box-shadow: 0 0 10px #ef4444; }

    .glass-body { display: flex; flex-direction: column; gap: 24px; }
    .input-unit { display: flex; flex-direction: column; gap: 10px; }
    .input-unit label { font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
    .input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    
    .glass-field { padding: 14px 18px; border-radius: 14px; border: 2.5px solid #f1f5f9; background: #f8fafc; font-size: 14px; font-weight: 700; color: #1e293b; transition: 0.3s; width: 100%; box-sizing: border-box; }
    .glass-field:focus { outline: none; border-color: var(--bna-emerald); background: white; box-shadow: 0 10px 20px rgba(0, 135, 102, 0.05); }
    .glass-field-locked { padding: 14px 18px; border-radius: 14px; border: 2.5px solid #f1f5f9; background: #f1f5f9; font-size: 14px; font-weight: 850; color: #94a3b8; width: 100%; box-sizing: border-box; }

    .strength-deck { margin-top: 8px; display: flex; align-items: center; gap: 12px; }
    .deck-bar { height: 4px; background: #f1f5f9; border-radius: 2px; transition: 0.4s; width: 80px; }
    .deck-bar.weak { background: #ef4444; }
    .deck-bar.good { background: #f59e0b; }
    .deck-bar.strong { background: #10b981; }
    .deck-label { font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; }

    .form-action-footer { margin-top: 24px; padding-top: 24px; border-top: 2px solid #f1f5f9; }
    .btn-executive { padding: 14px 28px; border-radius: 14px; border: none; font-weight: 850; font-size: 11px; letter-spacing: 1px; cursor: pointer; transition: 0.3s; width: 100%; }
    .btn-executive.primary { background: var(--bna-emerald); color: white; box-shadow: 0 10px 20px rgba(0, 135, 102, 0.15); }
    .btn-executive.secondary { background: #0f172a; color: white; }
    .btn-executive:hover { transform: translateY(-3px); filter: brightness(1.1); }

    .success-toast-inline { padding: 12px; background: #ecfdf5; color: #059669; border-radius: 12px; font-size: 12px; font-weight: 850; text-align: center; }
    .error-toast-inline { padding: 12px; background: #fef2f2; color: #ef4444; border-radius: 12px; font-size: 12px; font-weight: 850; text-align: center; }

    @keyframes spin-slow { to { transform: rotate(360deg); } }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 1024px) {
      .bento-grid-profile { grid-template-columns: 1fr; }
      .identity-banner { flex-direction: column; text-align: center; padding: 40px; }
      .persona-meta { justify-content: center; }
    }
  `]
})
export class ProfileComponent implements OnInit {
  currentUser: any;
  
  profileData = {
    firstName: '',
    lastName: '',
    email: ''
  };
  isSavingProfile = false;
  profileSuccess = '';
  profileError = '';

  passwordData = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  isChangingPassword = false;
  passwordSuccess = '';
  passwordError = '';
  
  passwordStrength = 0;
  passwordStrengthLabel = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
    if (this.currentUser) {
      this.profileData.email = this.currentUser.email || '';
      this.profileData.firstName = this.currentUser.firstName || '';
      this.profileData.lastName = this.currentUser.lastName || '';
      
      // If no details, try to infer from fullName
      if (!this.profileData.firstName && !this.profileData.lastName && this.currentUser.fullName) {
        const parts = this.currentUser.fullName.split(' ');
        this.profileData.firstName = parts[0];
        if (parts.length > 1) {
          this.profileData.lastName = parts.slice(1).join(' ');
        }
      }
    }
  }

  saveProfile() {
    this.profileError = '';
    this.profileSuccess = '';
    
    if (!this.profileData.email) {
      this.profileError = "L'email est requis.";
      return;
    }
    
    this.isSavingProfile = true;
    this.authService.updateProfile(this.profileData).subscribe({
      next: (res) => {
        this.isSavingProfile = false;
        this.profileSuccess = 'Profil mis à jour avec succès.';
        setTimeout(() => this.profileSuccess = '', 3000);
      },
      error: (err) => {
        this.isSavingProfile = false;
        this.profileError = err.error?.message || 'Erreur lors de la mise à jour.';
      }
    });
  }

  onPasswordInput(event: any) {
    const pwd = event.target.value;
    this.passwordStrength = this.checkStrength(pwd);
  }

  private checkStrength(pwd: string): number {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    
    const labels = ['Faible', 'Moyen', 'Bon', 'Fort', 'Très Fort'];
    this.passwordStrengthLabel = labels[strength] || 'Faible';
    return strength;
  }

  changePassword() {
    this.passwordError = '';
    this.passwordSuccess = '';

    if (!this.passwordData.oldPassword || !this.passwordData.newPassword) {
      this.passwordError = 'Veuillez remplir tous les champs.';
      return;
    }
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.passwordError = 'Les mots de passe ne correspondent pas.';
      return;
    }
    
    this.isChangingPassword = true;
    this.authService.changePassword({
      oldPassword: this.passwordData.oldPassword,
      newPassword: this.passwordData.newPassword
    }).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.passwordSuccess = 'Le mot de passe a été changé avec succès.';
        this.passwordData = { oldPassword: '', newPassword: '', confirmPassword: '' };
        this.passwordStrength = 0;
        this.passwordStrengthLabel = '';
        setTimeout(() => this.passwordSuccess = '', 3000);
      },
      error: (err) => {
        this.isChangingPassword = false;
        this.passwordError = err.error?.message || 'Erreur lors du changement.';
      }
    });
  }

  getInitials(): string {
    const fn = this.profileData.firstName || '';
    const ln = this.profileData.lastName || '';
    if (fn || ln) {
      return ((fn.charAt(0) || '') + (ln.charAt(0) || '')).toUpperCase();
    }
    if (this.currentUser?.username) {
      return this.currentUser.username.substring(0, 2).toUpperCase();
    }
    return 'U';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.authService.uploadAvatar(file).subscribe({
        next: (res) => {
          this.profileSuccess = 'Photo de profil mise à jour.';
          this.currentUser = this.authService.currentUserValue;
          setTimeout(() => this.profileSuccess = '', 3000);
        },
        error: (err) => {
          this.profileError = 'Erreur lors de l’upload de l’image.';
        }
      });
    }
  }

  getFullUrl(path: string): string {
    if (!path) return '';
    return `http://localhost:8082${path}`;
  }
}
