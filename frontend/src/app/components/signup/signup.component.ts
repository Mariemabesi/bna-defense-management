import { Component, OnInit } from '@angular/core';
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
              <label>Rôle (Choisissez un seul acteur)</label>
              <div class="roles-checkbox-grid">
                <label *ngFor="let r of availableRoles" class="role-checkbox">
                  <input type="radio" name="userRole" [value]="r.value" (change)="setRole(r.value)" [checked]="selectedRole === r.value">
                  <span class="role-label">{{ r.label }}</span>
                </label>
              </div>
            </div>

            <div class="form-group" *ngIf="selectedRole === 'ROLE_CHARGE_DOSSIER'">
              <label for="supervisorId">Superviseur (Super Validateur)</label>
              <div class="input-container">
                <select id="supervisorId" name="supervisorId" [(ngModel)]="supervisorId" class="form-control-select">
                  <option [ngValue]="null">Aucun superviseur</option>
                  <option *ngFor="let s of supervisors" [value]="s.id">{{ s.username }}</option>
                </select>
              </div>
            </div>

            <div class="error-msg" *ngIf="error">{{ error }}</div>

            <button type="submit" [disabled]="loading || !selectedRole" class="btn-submit">
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
          <h1>Rejoignez <br> Défense BNA <br> Action en Défense BNA</h1>
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
    .signup-content { width: 100%; max-width: 440px; animation: fadeIn 0.8s ease-out; }
    .logo-container { margin-bottom: 32px; text-align: center; }
    .bna-main-logo { height: 65px; object-fit: contain; }
    .auth-title { font-size: 26px; font-weight: 900; color: #004d3d; margin-bottom: 32px; text-align: center; letter-spacing: 1.5px; }
    
    .form-group { margin-bottom: 24px; }
    .form-group label { display: block; font-size: 13px; font-weight: 800; color: #1e293b; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.8px; }
    
    .input-container { position: relative; display: flex; align-items: center; }
    .input-container input, .form-control-select { 
      width: 100%; padding: 14px 16px 14px 48px; border: 1.8px solid #e2e8f0; border-radius: 12px; font-size: 15px; outline: none; transition: all 0.3s; 
      color: #1e293b; background: #f8fafc;
    }
    .input-container input::placeholder { color: #94a3b8; font-weight: 500; }
    .input-container input:focus { border-color: #008766; background: white; box-shadow: 0 0 0 4px rgba(0,135,102,0.1); }
    .icon { position: absolute; left: 16px; color: #64748b; transition: color 0.3s; pointer-events: none; }
    .input-container input:focus + .icon { color: #008766; }

    .roles-checkbox-grid { display: grid; grid-template-columns: 1fr; gap: 10px; margin: 16px 0; }
    .role-checkbox { 
      display: flex; align-items: center; gap: 12px; cursor: pointer; font-size: 14px; color: #475569; font-weight: 700; 
      padding: 12px 16px; border: 1.5px solid #f1f5f9; border-radius: 10px; transition: 0.2s;
    }
    .role-checkbox:hover { background: #f8fafc; border-color: #e2e8f0; }
    .role-checkbox input { width: 20px; height: 20px; cursor: pointer; accent-color: #008766; }
    .role-checkbox input:checked + .role-label { color: #008766; }

    .btn-submit { 
      width: 100%; padding: 16px; background: linear-gradient(135deg, #008766 0%, #005a44 100%); color: white; border: none; border-radius: 12px; 
      font-weight: 800; font-size: 16px; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); margin-top: 10px;
      box-shadow: 0 10px 20px rgba(0, 135, 102, 0.2);
    }
    .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 25px rgba(0, 135, 102, 0.3); }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }

    .login-prompt { margin-top: 24px; text-align: center; font-size: 15px; color: #64748b; font-weight: 600; }
    .login-prompt a { color: #008766; text-decoration: none; font-weight: 800; border-bottom: 2px solid transparent; transition: 0.2s; }
    .login-prompt a:hover { border-bottom-color: #008766; }
    
    .copyright { margin: 48px 0 20px; text-align: center; font-size: 12px; color: #94a3b8; font-weight: 700; letter-spacing: 1px; }

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
    
    .welcome-text h1 { font-size: 56px; font-weight: 900; line-height: 1.05; margin-bottom: 40px; letter-spacing: -2px; }
    
    .footer-links { display: flex; gap: 32px; position: absolute; bottom: 60px; left: 80px; }
    .footer-links a { color: rgba(255,255,255,0.5); font-size: 14px; text-decoration: none; font-weight: 700; transition: 0.3s; }
    .footer-links a:hover { color: #008766; transform: translateY(-2px); }

    .error-msg { color: #ef4444; font-size: 14px; font-weight: 700; margin-bottom: 20px; text-align: center; background: #fef2f2; padding: 14px; border-radius: 12px; border-left: 4px solid #ef4444; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 1024px) {
      .right-pane { display: none; }
      .left-pane { flex: 1; padding: 24px; }
      .signup-content { max-width: 100%; }
      .welcome-text h1 { font-size: 42px; }
    }

    @media (max-width: 480px) {
      .auth-title { font-size: 22px; }
      .roles-checkbox-grid { grid-template-columns: 1fr; }
      .logo-container { margin-bottom: 20px; }
      .login-prompt { font-size: 14px; }
    }
  `]
})
export class SignupComponent implements OnInit {
  fullName = '';
  email = '';
  password = '';
  selectedRole: string = '';
  supervisorId: number | null = null;
  supervisors: any[] = [];
  loading = false;
  error = '';

  availableRoles = [
    { label: 'Chargé de dossier', value: 'ROLE_CHARGE_DOSSIER' },
    { label: 'Pré-validateur', value: 'ROLE_PRE_VALIDATEUR' },
    { label: 'Validateur', value: 'ROLE_VALIDATEUR' },
    { label: 'Super Validateur', value: 'ROLE_SUPER_VALIDATEUR' }
  ];

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.loadSupervisors();
  }

  loadSupervisors() {
    // This would fetch users with ROLE_SUPER_VALIDATEUR
    this.supervisors = [{ id: 1, username: 'SuperV_Admin' }]; // Demo fallback
  }

  setRole(role: string) {
    this.selectedRole = role;
  }

  onSubmit() {
    this.loading = true;
    this.error = '';

    const userData = {
      username: this.email,
      email: this.email,
      password: this.password,
      fullName: this.fullName,
      role: [this.selectedRole],
      supervisorId: this.supervisorId,
      isSuperValidateur: this.selectedRole === 'ROLE_SUPER_VALIDATEUR'
    };

    this.authService.register(userData).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la création. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }
}
