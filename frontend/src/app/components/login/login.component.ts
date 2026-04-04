import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    template: `
    <div class="split-screen">
      <div class="left-pane">
        <div class="login-content">
          <div class="logo-container">
            <img src="/assets/images/cleanly.png" alt="BNA BANK Logo" class="bna-main-logo">
          </div>
          
          <h2 class="auth-title">S'IDENTIFIER</h2>
          
          <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
            <div class="form-group">
              <label for="username">Identifiant</label>
              <div class="input-container">
                <input type="text" id="username" name="username" [(ngModel)]="username" required placeholder="Identifiant">
                <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
            </div>
            
            <div class="form-group">
              <label for="password">Mot de passe</label>
              <div class="input-container">
                <input type="password" id="password" name="password" [(ngModel)]="password" required placeholder="Mot de passe">
                <svg class="icon cursor-pointer" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </div>
            </div>

            <div class="form-extras">
              <label class="checkbox-container">
                <input type="checkbox" name="remember">
                <span class="checkmark"></span>
                <span class="label-text">Se souvenir de moi</span>
              </label>
              <a routerLink="/forgot-password" class="forgot-link">Mot de passe oublié?</a>
            </div>
            
            <div class="error-msg" *ngIf="error">{{ error }}</div>
            
            <button type="submit" [disabled]="loading" class="btn-submit">
              <span *ngIf="!loading">Se connecter</span>
              <span *ngIf="loading" class="loader"></span>
            </button>
          </form>
          
          <div class="signup-prompt">
            Vous n'avez pas un compte ? <a routerLink="/signup">S'inscrire</a>
          </div>
          
          <div class="copyright">
            BNA BANK 2026 ©
          </div>
        </div>
      </div>
      
      <div class="right-pane">
        <div class="welcome-text">
          <h1>Défense BNA <br> pour <br> Réclamation</h1>
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
    
    .login-content {
      width: 100%;
      max-width: 380px;
    }
    
    .logo-container {
      margin-bottom: 50px;
      display: flex;
      justify-content: center;
    }
    
    .bna-main-logo {
      height: 80px;
      width: auto;
      object-fit: contain;
    }
    
    .auth-title {
      font-size: 28px;
      font-weight: 800;
      color: #004d3d;
      margin-bottom: 40px;
      letter-spacing: 1px;
    }
    
    .form-group {
      margin-bottom: 24px;
    }
    
    .form-group label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin-bottom: 10px;
    }
    
    .input-container {
      position: relative;
    }
    
    .input-container input {
      width: 100%;
      padding: 14px 45px 14px 16px;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      font-size: 15px;
      background: #fff;
      transition: all 0.2s;
    }
    
    .input-container input:focus {
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
    
    .form-extras {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
      margin-bottom: 32px;
    }
    
    .checkbox-container {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      font-size: 13px;
      color: #ff8c00; /* Warm orange from screenshot */
      font-weight: 600;
    }
    
    .forgot-link {
      color: #777;
      font-size: 13px;
      text-decoration: underline;
      font-weight: 500;
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
      margin-bottom: 24px;
    }
    
    .btn-submit:hover {
      background: #00684d;
      transform: translateY(-2px);
    }
    
    .signup-prompt {
      text-align: center;
      font-size: 14px;
      color: #666;
      margin-bottom: 60px;
    }
    
    .signup-prompt a {
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
      background: linear-gradient(135deg, #2d5a4c 0%, #1a3a31 100%);
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
      .login-content { max-width: 100%; }
      .auth-title { font-size: 24px; margin-bottom: 30px; }
    }
  `]
})
export class LoginComponent {
    username = '';
    password = '';
    loading = false;
    error = '';

    constructor(private authService: AuthService, private router: Router) { }

    onSubmit() {
        this.loading = true;
        this.error = '';

        this.authService.login(this.username, this.password).subscribe({
            next: () => {
                this.router.navigate(['/dashboard']);
            },
            error: err => {
                this.error = 'Identifiant ou mot de passe incorrect';
                this.loading = false;
            }
        });
    }
}
