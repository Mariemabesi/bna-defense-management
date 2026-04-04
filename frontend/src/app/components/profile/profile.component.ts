import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container p-6">
      <div class="header mb-6 profile-header-flex">
        <div class="user-avatar-large shadow-lg">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" *ngIf="!currentUser?.fullName && !profileData.firstName">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span *ngIf="currentUser?.fullName || profileData.firstName">{{ getInitials() }}</span>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Mon Profil</h1>
          <p class="text-sm text-slate-500">Gérez vos informations personnelles et votre sécurité.</p>
        </div>
      </div>

      <div class="cards-container">
        <!-- Informations personnelles -->
        <div class="card">
          <div class="card-header">
            <h3>Données Personnelles</h3>
          </div>
          <div class="card-body">
            <div *ngIf="profileSuccess" class="success-msg">{{ profileSuccess }}</div>
            <div *ngIf="profileError" class="error-msg">{{ profileError }}</div>
            
            <div class="form-group">
              <label>Nom d'utilisateur</label>
              <input type="text" [value]="currentUser?.username" class="form-control" disabled>
            </div>
            
            <div class="form-row">
              <div class="form-group flex-1">
                <label>Nom</label>
                <input type="text" [(ngModel)]="profileData.lastName" class="form-control" placeholder="Votre nom">
              </div>
              <div class="form-group flex-1">
                <label>Prénom</label>
                <input type="text" [(ngModel)]="profileData.firstName" class="form-control" placeholder="Votre prénom">
              </div>
            </div>

            <div class="form-group">
              <label>Email</label>
              <input type="email" [(ngModel)]="profileData.email" class="form-control" placeholder="votre.email@bna.dz">
            </div>

            <div class="actions mt-4">
              <button class="btn-primary" [disabled]="isSavingProfile" (click)="saveProfile()">
                {{ isSavingProfile ? 'Enregistrement...' : 'Enregistrer les modifications' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Mot de passe -->
        <div class="card">
          <div class="card-header">
            <h3>Mot de passe</h3>
          </div>
          <div class="card-body">
            <div *ngIf="passwordSuccess" class="success-msg">{{ passwordSuccess }}</div>
            <div *ngIf="passwordError" class="error-msg">{{ passwordError }}</div>

            <div class="form-group">
              <label>Ancien mot de passe</label>
              <input type="password" [(ngModel)]="passwordData.oldPassword" class="form-control" placeholder="••••••••">
            </div>

            <div class="form-group">
              <label>Nouveau mot de passe</label>
              <input type="password" [(ngModel)]="passwordData.newPassword" (input)="onPasswordInput($event)" class="form-control" placeholder="••••••••">
              <div class="password-strength-meter" *ngIf="passwordData.newPassword">
                <div class="strength-bar" 
                     [style.width.%]="(passwordStrength/4)*100" 
                     [class.weak]="passwordStrength <= 1" 
                     [class.good]="passwordStrength === 2" 
                     [class.strong]="passwordStrength >= 3">
                </div>
                <span class="strength-label">{{ passwordStrengthLabel }}</span>
              </div>
            </div>

            <div class="form-group">
              <label>Confirmer le nouveau mot de passe</label>
              <input type="password" [(ngModel)]="passwordData.confirmPassword" class="form-control" placeholder="••••••••">
            </div>

            <div class="actions mt-4">
              <button class="btn-primary" [disabled]="isChangingPassword" (click)="changePassword()">
                {{ isChangingPassword ? 'Enregistrement...' : 'Changer le mot de passe' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 32px;
    }
    .profile-header-flex {
      display: flex;
      align-items: center;
      gap: 24px;
    }
    .user-avatar-large {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #008766 0%, #10b981 100%);
      border-radius: 20px;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 32px;
      box-shadow: 0 10px 25px rgba(0,135,102,0.3);
    }
    .header h1 {
      margin: 0;
      color: #1e293b;
      font-weight: 800;
      font-size: 28px;
    }
    .header p {
      margin: 8px 0 0 0;
      color: #64748b;
      font-size: 15px;
    }
    .cards-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-top: 24px;
    }
    @media (max-width: 768px) {
      .cards-container {
        grid-template-columns: 1fr;
      }
    }
    .card {
      background: white;
      border-radius: 16px;
      border: 1px solid rgba(0,0,0,0.05);
      box-shadow: 0 4px 12px rgba(0,0,0,0.02);
      overflow: hidden;
    }
    .card-header {
      padding: 20px 24px;
      border-bottom: 1px solid rgba(0,0,0,0.05);
      background: #fafafa;
    }
    .card-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #1e293b;
    }
    .card-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .form-row {
      display: flex;
      gap: 16px;
    }
    .flex-1 {
      flex: 1;
    }
    .form-group label {
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .form-control {
      padding: 12px 16px;
      border-radius: 12px;
      border: 2px solid #e2e8f0;
      font-size: 14px;
      font-weight: 500;
      background: #f8fafc;
      transition: 0.2s;
      width: 100%;
      box-sizing: border-box;
    }
    .form-control:focus {
      border-color: #008766;
      background: white;
      outline: none;
      box-shadow: 0 0 0 4px rgba(0,135,102,0.1);
    }
    .form-control:disabled {
      background: #f1f5f9;
      color: #94a3b8;
      cursor: not-allowed;
    }
    .btn-primary {
      background: #008766;
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: 0.2s;
      width: 100%;
    }
    .btn-primary:hover:not(:disabled) {
      background: #007256;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,135,102,0.2);
    }
    .btn-primary:disabled {
      background: #cbd5e1;
      cursor: not-allowed;
    }
    
    .password-strength-meter { margin-top: 4px; display: flex; align-items: center; gap: 12px; }
    .strength-bar { height: 4px; border-radius: 2px; transition: all 0.4s; background: #e2e8f0; width: 100px; }
    .strength-bar.weak { background: #ef4444; }
    .strength-bar.good { background: #f59e0b; }
    .strength-bar.strong { background: #10b981; }
    .strength-label { font-size: 11px; font-weight: 800; color: #64748b; }

    .error-msg {
      background: #fef2f2;
      color: #dc2626;
      padding: 12px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      border: 1px solid #fee2e2;
    }
    .success-msg {
      background: #ecfdf5;
      color: #059669;
      padding: 12px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      border: 1px solid #d1fae5;
    }
    .mt-4 { margin-top: 16px; }
    .mb-6 { margin-bottom: 24px; }
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
}
