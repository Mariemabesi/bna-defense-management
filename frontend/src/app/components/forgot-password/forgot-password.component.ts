import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
           <img src="assets/logo-bna.png" alt="BNA Logo" class="auth-logo">
           <h2>Récupération</h2>
        </div>
        
        <div *ngIf="step === 1" class="fade-in">
          <p>Entrez votre adresse e-mail pour recevoir un code OTP.</p>
          <div class="input-group">
            <span class="icon">&#64;</span>
            <input type="email" [(ngModel)]="email" placeholder="Email" class="form-control">
          </div>
          <button (click)="sendOtp()" [disabled]="loading || !email" class="btn-primary">
            {{ loading ? 'Envoi...' : 'Envoyer OTP' }}
          </button>
        </div>

        <div *ngIf="step === 2" class="fade-in">
          <p>Entrez le code OTP reçu par e-mail ({{email}}).</p>
          <div class="input-group">
            <span class="icon">#</span>
            <input type="text" [(ngModel)]="otp" placeholder="Code OTP (6 chiffres)" class="form-control" maxlength="6">
          </div>
          <button (click)="verifyOtp()" [disabled]="loading || otp.length < 6" class="btn-primary">
            {{ loading ? 'Vérification...' : 'Vérifier OTP' }}
          </button>
        </div>

        <div *ngIf="step === 3" class="fade-in">
          <p>Définissez votre nouveau mot de passe.</p>
          <div class="input-group">
            <span class="icon">*</span>
            <input type="password" [(ngModel)]="newPassword" placeholder="Nouveau mot de passe" class="form-control">
          </div>
          <button (click)="resetPassword()" [disabled]="loading || !newPassword" class="btn-primary">
            {{ loading ? 'Réinitialisation...' : 'Réinitialiser' }}
          </button>
        </div>

        <div *ngIf="message" class="alert" [class.success]="isSuccess">
          {{ message }}
        </div>

        <div class="auth-footer">
          <a routerLink="/login">← Retour à la connexion</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { height: 100vh; display: flex; align-items: center; justify-content: center; background: #f0f4f8; }
    .auth-card { background: white; padding: 48px; border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.05); width: 100%; max-width: 440px; }
    .auth-header { text-align: center; margin-bottom: 32px; }
    .auth-logo { height: 50px; margin-bottom: 16px; }
    h2 { font-size: 24px; color: #1e293b; margin: 0; font-weight: 800; }
    p { color: #64748b; margin-bottom: 32px; font-size: 15px; text-align: center; line-height: 1.5; }
    
    .input-group { position: relative; margin-bottom: 24px; }
    .icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-weight: bold; }
    .form-control { width: 100%; padding: 14px 14px 14px 44px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 15px; transition: all 0.2s; }
    .form-control:focus { border-color: #008766; outline: none; box-shadow: 0 0 0 4px rgba(0,135,102,0.1); }
    
    .btn-primary { width: 100%; padding: 14px; background: #008766; color: white; border: none; border-radius: 12px; cursor: pointer; font-size: 16px; font-weight: 700; transition: all 0.2s; }
    .btn-primary:hover { background: #007256; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,135,102,0.2); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    
    .alert { margin-top: 24px; padding: 14px; border-radius: 12px; font-size: 14px; text-align: center; background: #fee2e2; color: #ef4444; font-weight: 600; border: 1px solid #fecaca; }
    .alert.success { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }
    
    .auth-footer { margin-top: 32px; text-align: center; }
    a { color: #64748b; text-decoration: none; font-size: 14px; font-weight: 600; transition: color 0.2s; }
    a:hover { color: #008766; }
    
    .fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ForgotPasswordComponent {
  email = '';
  otp = '';
  resetToken = '';
  newPassword = '';
  step = 1;
  loading = false;
  message = '';
  isSuccess = false;

  constructor(private authService: AuthService, private router: Router) {}

  sendOtp() {
    this.loading = true;
    this.message = '';
    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.step = 2;
        this.loading = false;
        this.isSuccess = true;
        this.message = 'Code OTP envoyé à votre adresse e-mail.';
      },
      error: (err) => {
        this.message = 'Utilisateur non trouvé ou erreur e-mail.';
        this.loading = false;
        this.isSuccess = false;
      }
    });
  }

  verifyOtp() {
    this.loading = true;
    this.message = '';
    this.authService.verifyOtp(this.email, this.otp).subscribe({
      next: (res: any) => {
        // Point 13: Store the UUID token for step 3
        this.resetToken = res.token || res.uuid;
        this.step = 3;
        this.loading = false;
        this.isSuccess = true;
        this.message = 'OTP valide. Veuillez définir votre nouveau mot de passe.';
      },
      error: () => {
        this.message = 'Code OTP invalide ou expiré.';
        this.loading = false;
        this.isSuccess = false;
      }
    });
  }

  resetPassword() {
    this.loading = true;
    this.message = '';
    this.authService.resetPassword(this.email, this.resetToken, this.newPassword).subscribe({
      next: () => {
        this.loading = false;
        this.isSuccess = true;
        this.message = 'Votre mot de passe a été réinitialisé ! Redirection...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.message = err.error?.message || 'Erreur lors de la réinitialisation.';
        this.loading = false;
        this.isSuccess = false;
      }
    });
  }
}

