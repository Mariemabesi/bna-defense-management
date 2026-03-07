import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="split-screen">
      <div class="left-pane">
        <div class="signup-content">
          <div class="logo-container">
            <img src="/assets/images/cleanly.png" alt="BNA BANK Logo" class="bna-main-logo">
          </div>
          
          <h2 class="auth-title">S'INSCRIRE</h2>
          
          <form (ngSubmit)="onSubmit()" #signupForm="ngForm">
            <div class="form-group">
              <label for="fullName">Nom complet</label>
              <div class="input-container">
                <input type="text" id="fullName" name="fullName" [(ngModel)]="fullName" required placeholder="Votre nom complet">
                <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
            </div>

            <div class="form-group">
              <label for="email">E-mail BNA</label>
              <div class="input-container">
                <input type="email" id="email" name="email" [(ngModel)]="email" required placeholder="nom.prenom@bna.tn">
                <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </div>
            </div>
            
            <div class="form-group">
              <label for="password">Mot de passe</label>
              <div class="input-container">
                <input type="password" id="password" name="password" [(ngModel)]="password" required placeholder="Minimum 8 caractères">
                <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
            </div>

            <div class="form-group">
              <label for="role">Rôle (Acteur)</label>
              <div class="input-container">
                <select id="role" name="role" [(ngModel)]="role" required class="form-control-select">
                  <option value="" disabled selected>Sélectionner votre rôle</option>
                  <option value="ROLE_CHARGE_DOSSIER">Chargé de dossier</option>
                  <option value="ROLE_PRE_VALIDATEUR">Pré-validateur</option>
                  <option value="ROLE_VALIDATEUR">Validateur</option>
                </select>
              </div>
            </div>

            <div class="error-msg" *ngIf="error">{{ error }}</div>

            <button type="submit" [disabled]="loading" class="btn-submit">
              <span *ngIf="!loading">Créer mon compte</span>
              <span *ngIf="loading" class="loader"></span>
            </button>
          </form>
          
          <div class="login-prompt">
            Vous avez déjà un compte ? <a routerLink="/login">Se connecter</a>
          </div>
          
          <div class="copyright">
            BNA BANK 2026 ©
          </div>
        </div>
      </div>
      
      <div class="right-pane">
        <div class="welcome-text">
          <h1>Rejoignez <br> Défense BNA <br> pour Réclamation</h1>
        </div>
        
        <div class="footer-links">
          <a href="#">FAQ</a>
          <a href="#">LABEL SECURITY</a>
          <a href="#">LABEL LEGAL</a>
          <a href="#">Contact</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .split-screen {
      height: 100vh;
      display: flex;
      font-family: 'Outfit', 'Inter', sans-serif;
      background: #fff;
    }
    
    .left-pane {
      flex: 5;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      background: white;
    }
    
    .signup-content {
      width: 100%;
      max-width: 380px;
    }
    
    .logo-container {
      margin-bottom: 40px;
      display: flex;
      justify-content: center;
    }
    
    .bna-main-logo {
      height: 70px;
      width: auto;
      object-fit: contain;
    }
    
    .auth-title {
      font-size: 28px;
      font-weight: 800;
      color: #004d3d;
      margin-bottom: 30px;
      letter-spacing: 1px;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    .form-group label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }
    
    .input-container {
      position: relative;
    }
    
    .input-container input, .input-container .form-control-select {
      width: 100%;
      padding: 12px 45px 12px 16px;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      font-size: 14px;
      background: #fff;
      transition: all 0.2s;
    }
    
    .input-container .form-control-select {
      appearance: none;
      padding: 12px 16px;
      cursor: pointer;
    }

    .input-container input:focus, .input-container .form-control-select:focus {
      outline: none;
      border-color: #008766;
      box-shadow: 0 0 0 4px rgba(0, 135, 102, 0.05);
    }
    
    .input-container .icon {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: #999;
    }
    
    .btn-submit {
      width: 100%;
      padding: 16px;
      background: #008766;
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      margin-top: 20px;
      margin-bottom: 24px;
    }
    
    .btn-submit:hover {
      background: #00684d;
      transform: translateY(-2px);
    }

    .error-msg {
      color: #ef4444;
      font-size: 13px;
      margin-bottom: 16px;
      text-align: center;
    }
    
    .login-prompt {
      text-align: center;
      font-size: 14px;
      color: #666;
      margin-bottom: 40px;
    }
    
    .login-prompt a {
      color: #004d3d;
      font-weight: 700;
      text-decoration: none;
    }
    
    .copyright {
      text-align: center;
      font-size: 12px;
      color: #999;
      font-weight: 600;
    }
    
    .right-pane {
      flex: 6;
      background: linear-gradient(135deg, #1a3a31 0%, #2d5a4c 100%);
      border-top-left-radius: 80px;
      border-bottom-left-radius: 80px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 100px;
      color: white;
      position: relative;
    }
    
    .welcome-text h1 {
      font-size: 64px;
      font-weight: 800;
      line-height: 1.1;
      margin: 0;
    }
    
    .footer-links {
      position: absolute;
      bottom: 40px;
      right: 60px;
      display: flex;
      gap: 24px;
    }
    
    .footer-links a {
      color: white;
      text-decoration: underline;
      font-size: 13px;
      font-weight: 500;
    }

    .loader {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    /* Responsive Styles */
    @media (max-width: 1024px) {
      .right-pane { padding: 40px; }
      .welcome-text h1 { font-size: 40px; }
    }
    
    @media (max-width: 768px) {
      .split-screen { flex-direction: column; }
      .right-pane { display: none; }
      .left-pane { flex: 1; padding: 24px; }
      .signup-content { max-width: 100%; }
      .auth-title { font-size: 24px; margin-bottom: 30px; }
    }
  `]
})
export class SignupComponent {
  fullName = '';
  email = '';
  password = '';
  role = '';
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit() {
    this.loading = true;
    this.error = '';

    const userData = {
      username: this.email,
      email: this.email,
      password: this.password,
      fullName: this.fullName,
      role: [this.role]
    };

    this.authService.register(userData).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: err => {
        this.error = 'Erreur lors de la création du compte. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }
}
