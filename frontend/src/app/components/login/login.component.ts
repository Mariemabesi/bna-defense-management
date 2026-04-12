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
          <h1> Action en <br> Défense BNA</h1>
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
    .split-screen { height: 100vh; display: flex; background: #fff; overflow-y: auto; }
    .left-pane { flex: 5; display: flex; align-items: center; justify-content: center; padding: 40px; background: #fff; min-height: 100vh; }
    .login-content { width: 100%; max-width: 400px; animation: fadeIn 0.8s ease-out; }
    .logo-container { margin-bottom: 40px; text-align: center; }
    .bna-main-logo { height: 75px; object-fit: contain; }
    .auth-title { font-size: 28px; font-weight: 900; color: #004d3d; margin-bottom: 32px; text-align: center; letter-spacing: 1.5px; }
    
    .form-group { margin-bottom: 24px; }
    .form-group label { display: block; font-size: 13px; font-weight: 800; color: #1e293b; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.8px; }
    
    .input-container { position: relative; display: flex; align-items: center; }
    .input-container input { 
      width: 100%; padding: 16px 48px 16px 16px; border: 1.8px solid #e2e8f0; border-radius: 12px; font-size: 15px; outline: none; transition: all 0.3s; 
      color: #1e293b; background: #f8fafc;
    }
    .input-container input::placeholder { color: #94a3b8; font-weight: 500; }
    .input-container input:focus { border-color: #008766; background: white; box-shadow: 0 0 0 4px rgba(0,135,102,0.1); }
    .icon { position: absolute; right: 16px; color: #64748b; transition: color 0.3s; pointer-events: none; }
    .input-container input:focus + .icon { color: #008766; }

    .form-extras { display: flex; justify-content: space-between; align-items: center; margin: 16px 0 32px; }
    .checkbox-container { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 14px; color: #475569; font-weight: 600; }
    .checkbox-container input { width: 18px; height: 18px; accent-color: #008766; cursor: pointer; }
    .forgot-link { color: #64748b; font-size: 14px; text-decoration: none; font-weight: 700; transition: 0.2s; }
    .forgot-link:hover { color: #008766; text-decoration: underline; }

    .btn-submit { 
      width: 100%; padding: 16px; background: linear-gradient(135deg, #008766 0%, #005a44 100%); color: white; border: none; border-radius: 12px; 
      font-weight: 800; font-size: 16px; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 10px 20px rgba(0, 135, 102, 0.2);
    }
    .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 25px rgba(0, 135, 102, 0.3); }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

    .signup-prompt { margin-top: 32px; text-align: center; font-size: 15px; color: #64748b; font-weight: 600; }
    .signup-prompt a { color: #008766; text-decoration: none; font-weight: 800; border-bottom: 2px solid transparent; transition: 0.2s; }
    .signup-prompt a:hover { border-bottom-color: #008766; }
    
    .copyright { margin-top: 48px; text-align: center; font-size: 12px; color: #94a3b8; font-weight: 700; letter-spacing: 1px; }

    .right-pane { 
      flex: 6; background: linear-gradient(135deg, #0f172a 0%, #064e3b 100%); 
      border-top-left-radius: 60px; border-bottom-left-radius: 60px; padding: 80px; 
      display: flex; flex-direction: column; justify-content: center; color: white; position: relative;
      overflow: hidden;
    }
    .right-pane::before {
      content: ''; position: absolute; top: -100px; right: -100px; width: 400px; height: 400px;
      background: radial-gradient(circle, rgba(0,135,102,0.15) 0%, transparent 70%); border-radius: 50%;
    }
    
    .welcome-text h1 { font-size: 64px; font-weight: 900; line-height: 1.05; margin: 0; letter-spacing: -2px; }
    
    .footer-links { display: flex; gap: 32px; position: absolute; bottom: 60px; left: 80px; }
    .footer-links a { color: rgba(255,255,255,0.5); font-size: 14px; text-decoration: none; font-weight: 700; transition: 0.3s; }
    .footer-links a:hover { color: #008766; transform: translateY(-2px); }

    .error-msg { color: #ef4444; font-size: 14px; font-weight: 700; margin-bottom: 20px; text-align: center; background: #fef2f2; padding: 14px; border-radius: 12px; border-left: 4px solid #ef4444; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 1024px) {
      .right-pane { display: none; }
      .left-pane { flex: 1; padding: 24px; }
      .login-content { max-width: 100%; }
      .welcome-text h1 { font-size: 44px; }
    }
    
    @media (max-width: 480px) {
      .auth-title { font-size: 24px; }
      .form-extras { flex-direction: column; align-items: flex-start; gap: 12px; }
      .forgot-link { font-size: 13px; }
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
