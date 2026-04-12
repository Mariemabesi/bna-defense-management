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
    <div class="auth-wrapper">
      <div class="auth-glass-card">
        <div class="auth-accent-top"></div>
        
        <div class="auth-header">
           <div class="logo-circle">
             <img src="/assets/images/cleanly.png" alt="BNA Logo" class="auth-logo-img">
           </div>
           <h2>Récupération</h2>
           <p class="subtitle">Sécurisation de votre accès • Action en Défense BNA</p>
        </div>
        
        <div class="step-content">
          <div *ngIf="step === 1" class="fade-in-up">
            <p class="description">Veuillez renseigner votre e-mail institutionnel pour recevoir votre code d'authentification OTP.</p>
            <div class="premium-group">
              <label>Adresse E-mail</label>
              <div class="input-with-icon">
                <svg class="field-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <input type="email" [(ngModel)]="email" placeholder="nom.prenom@bna.tn" class="premium-control">
              </div>
            </div>
            <button (click)="sendOtp()" [disabled]="loading || !email" class="btn-premium">
              <span *ngIf="!loading">Obtenir mon code OTP</span>
              <span *ngIf="loading" class="loader"></span>
            </button>
          </div>

          <div *ngIf="step === 2" class="fade-in-up">
            <p class="description">Un code de vérification à 6 chiffres a été transmis à : <br><strong>{{email}}</strong></p>
            <div class="premium-group">
              <label>Code de Validation</label>
              <div class="input-with-icon">
                <svg class="field-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <input type="text" [(ngModel)]="otp" placeholder="Code OTP (6 chiffres)" class="premium-control" maxlength="6">
              </div>
            </div>
            <button (click)="verifyOtp()" [disabled]="loading || otp.length < 1" class="btn-premium">
              <span *ngIf="!loading">Vérifier le code</span>
              <span *ngIf="loading" class="loader"></span>
            </button>
          </div>

          <div *ngIf="step === 3" class="fade-in-up">
            <p class="description">Authentification réussie. Veuillez définir votre nouveau mot de passe de sécurité.</p>
            <div class="premium-group">
              <label>Nouveau Mot de passe</label>
              <div class="input-with-icon">
                <svg class="field-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <input type="password" [(ngModel)]="newPassword" placeholder="Nouveau mot de passe" class="premium-control">
              </div>
            </div>
            <button (click)="resetPassword()" [disabled]="loading || !newPassword" class="btn-premium">
              <span *ngIf="!loading">Réinitialiser l'accès</span>
              <span *ngIf="loading" class="loader"></span>
            </button>
          </div>

          <div *ngIf="message" class="premium-alert" [class.is-success]="isSuccess">
             <div class="alert-icon">
               <svg *ngIf="!isSuccess" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
               <svg *ngIf="isSuccess" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
             </div>
             {{ message }}
          </div>
        </div>

        <div class="auth-footer">
          <a routerLink="/login" class="back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="15 18 9 12 15 6"></polyline></svg>
            Retour au portail
          </a>
        </div>
      </div>
      
      <div class="branding-watermark">BNA DEFENSE</div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;900&display=swap');

    .auth-wrapper { 
      min-height: 100vh; display: flex; align-items: center; justify-content: center; 
      background: linear-gradient(135deg, #0f172a 0%, #064e3b 100%); 
      padding: 24px; position: relative; font-family: 'Outfit', sans-serif; overflow: hidden;
    }
    
    .auth-wrapper::before {
      content: ''; position: absolute; top: -10%; left: -5%; width: 50%; height: 50%;
      background: radial-gradient(circle, rgba(0, 135, 102, 0.15) 0%, transparent 70%); border-radius: 50%; blur: 80px;
    }

    .auth-glass-card { 
      background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(20px); padding: 56px; border-radius: 40px; 
      width: 100%; max-width: 520px; position: relative; overflow: hidden;
      box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.2);
      animation: cardIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .auth-accent-top { position: absolute; top: 0; left: 0; right: 0; height: 6px; background: linear-gradient(90deg, #008766, #00c896, #008766); }

    .auth-header { text-align: center; margin-bottom: 48px; }
    .logo-circle { width: 100px; height: 100px; background: #f8fafc; border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; border: 2px solid #f1f5f9; box-shadow: 0 10px 20px rgba(0,0,0,0.02); }
    .auth-logo-img { height: 50px; object-fit: contain; }

    h2 { font-size: 32px; color: #004d3d; margin: 0 0 8px; font-weight: 900; letter-spacing: -1px; }
    .subtitle { font-size: 13px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    
    .description { color: #475569; margin-bottom: 40px; font-size: 16px; text-align: center; line-height: 1.6; font-weight: 500; }
    
    .premium-group { margin-bottom: 32px; }
    .premium-group label { display: block; font-size: 12px; font-weight: 800; color: #1e293b; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.8px; }
    
    .input-with-icon { position: relative; display: flex; align-items: center; }
    .field-icon { position: absolute; left: 18px; color: #94a3b8; transition: color 0.3s; z-index: 10; }
    
    .premium-control { 
      width: 100%; padding: 18px 18px 18px 54px; border: 2.5px solid #f1f5f9; border-radius: 18px; 
      font-size: 16px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); background: #f8fafc; color: #1e293b; font-weight: 600;
    }
    .premium-control::placeholder { color: #cbd5e1; font-weight: 500; }
    .premium-control:focus { border-color: #008766; outline: none; background: white; box-shadow: 0 15px 30px rgba(0,135,102,0.1); }
    .premium-control:focus ~ .field-icon { color: #008766; }
    
    .btn-premium { 
      width: 100%; padding: 18px; background: linear-gradient(135deg, #008766 0%, #005a44 100%); color: white; border: none; 
      border-radius: 18px; cursor: pointer; font-size: 17px; font-weight: 800; transition: all 0.4s;
      box-shadow: 0 20px 40px rgba(0, 135, 102, 0.25);
      position: relative; display: flex; align-items: center; justify-content: center; gap: 12px;
    }
    .btn-premium:hover:not(:disabled) { transform: translateY(-4px); box-shadow: 0 25px 50px rgba(0, 135, 102, 0.35); }
    .btn-premium:active { transform: translateY(-1px); }
    .btn-premium:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    
    .premium-alert { 
      margin-top: 32px; padding: 20px; border-radius: 18px; font-size: 14px; text-align: center; 
      background: #fff1f2; color: #e11d48; font-weight: 700; border: 1.5px solid #fecdd3;
      display: flex; align-items: center; justify-content: center; gap: 12px;
      animation: alertPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .premium-alert.is-success { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
    
    .auth-footer { margin-top: 48px; text-align: center; border-top: 2px solid #f1f5f9; padding-top: 32px; }
    .back-link { color: #64748b; text-decoration: none; font-size: 15px; font-weight: 800; transition: all 0.3s; display: inline-flex; align-items: center; gap: 10px; }
    .back-link:hover { color: #008766; transform: translateX(-6px); }
    
    .branding-watermark { position: absolute; bottom: 40px; right: 40px; font-size: 80px; font-weight: 900; color: rgba(255,255,255,0.03); pointer-events: none; }

    .loader { width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid white; border-radius: 50%; animation: spin 0.8s linear infinite; }
    
    @keyframes cardIn { from { opacity: 0; transform: translateY(40px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes alertPop { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
    @keyframes fadeIn-up { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .fade-in-up { animation: fadeIn-up 0.5s ease-out; }

    @media (max-width: 600px) {
      .auth-glass-card { padding: 40px 24px; border-radius: 0; height: 100%; max-width: 100%; border: none; }
      h2 { font-size: 28px; }
      .description { font-size: 14px; }
    }
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
