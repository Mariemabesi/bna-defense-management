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
    .split-screen { height: 100vh; display: flex; background: #fff; overflow: hidden; }
    .left-pane { flex: 5; display: flex; align-items: center; justify-content: center; padding: 40px; background: #fff; }
    .signup-content { width: 100%; max-width: 420px; }
    .logo-container { margin-bottom: 24px; text-align: center; }
    .bna-main-logo { height: 50px; }
    .auth-title { font-size: 24px; font-weight: 800; color: #004d3d; margin-bottom: 32px; text-align: center; letter-spacing: 1px; }
    
    .form-group { margin-bottom: 20px; position: relative; }
    .form-group label { display: block; font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    
    .input-container { position: relative; display: flex; align-items: center; }
    .input-container input, .form-control-select { 
      width: 100%; padding: 12px 12px 12px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; transition: all 0.2s; 
    }
    .input-container input:focus { border-color: #008766; box-shadow: 0 0 0 3px rgba(0,135,102,0.1); }
    .icon { position: absolute; left: -30px; top: 50%; transform: translateY(-50%); color: #64748b; }

    .roles-checkbox-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 12px 0; }
    .role-checkbox { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; color: #475569; font-weight: 600; }
    .role-checkbox input { width: 18px; height: 18px; cursor: pointer; accent-color: #008766; }

    .btn-submit { 
      width: 100%; padding: 14px; background: #008766; color: white; border: none; border-radius: 8px; 
      font-weight: 700; cursor: pointer; transition: all 0.2s; margin-top: 10px;
    }
    .btn-submit:hover:not(:disabled) { background: #007256; transform: translateY(-1px); }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

    .login-prompt { margin-top: 20px; text-align: center; font-size: 14px; color: #64748b; }
    .login-prompt a { color: #008766; text-decoration: none; font-weight: 700; }
    .copyright { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; }

    .right-pane { 
      flex: 6; background: linear-gradient(135deg, #1a3a31 0%, #2d5a4c 100%); 
      border-top-left-radius: 60px; border-bottom-left-radius: 60px; padding: 80px; 
      display: flex; flex-direction: column; justify-content: center; color: white; position: relative;
    }
    .welcome-text h1 { font-size: 52px; font-weight: 800; line-height: 1.1; margin-bottom: 40px; }
    
    .footer-links { display: flex; gap: 24px; position: absolute; bottom: 40px; left: 80px; }
    .footer-links a { color: rgba(255,255,255,0.6); font-size: 13px; text-decoration: none; font-weight: 600; transition: color 0.2s; }
    .footer-links a:hover { color: white; }

    .error-msg { color: #ef4444; font-size: 13px; font-weight: 600; margin-bottom: 15px; text-align: center; background: #fef2f2; padding: 10px; border-radius: 8px; }
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
