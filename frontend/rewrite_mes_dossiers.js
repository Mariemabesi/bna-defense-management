const fs = require('fs');

const dashContent = fs.readFileSync('/Users/yossr/Desktop/BNA/frontend/src/app/components/dashboard/dashboard.component.ts', 'utf8');

const sidebarStart = '<aside class="sidebar">';
const sidebarEnd = '</aside>';
const startIndex = dashContent.indexOf(sidebarStart);
const endIndex = dashContent.indexOf(sidebarEnd) + sidebarEnd.length;
const sidebarHTML = dashContent.substring(startIndex, endIndex);

const styleStart = '/* PREMIUM SIDEBAR STYLES */';
const styleEnd = '/* PREMIUM MAIN CONTENT */';
const sStartIdx = dashContent.indexOf(styleStart);
const sEndIdx = dashContent.indexOf(styleEnd);
const sidebarCSS = dashContent.substring(sStartIdx, sEndIdx);

const newComponent = `import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mes-dossiers',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: \`
    <div class="app-layout">
      <!-- SIDEBAR -->
      \${sidebarHTML}

      <!-- MAIN CONTENT -->
      <main class="main-content">
        <header class="top-header">
          <div class="header-title">
            <h1>Mes Dossiers</h1>
          </div>
          
          <div class="header-actions">
            <button class="notification-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <span class="badge-dot"></span>
            </button>
            <div class="user-profile">
              <div class="user-info">
                <span class="user-email">{{ currentUser?.username || 'Utilisateur' }}@bna.tn</span>
                <span class="user-role">{{ formatRoles() }}</span>
              </div>
              <div class="user-avatar">{{ getInitials() }}</div>
            </div>
          </div>
        </header>

        <div class="dashboard-content">
          <div class="page-header-actions">
            <h2>Liste de vos dossiers</h2>
            <button class="btn-primary" routerLink="/nouveau-dossier" *ngIf="isChargeDossier() || isAdmin()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Créer un Nouveau Dossier
            </button>
          </div>

          <div class="table-container" *ngIf="dossiers.length > 0">
            <table>
              <thead>
                <tr>
                  <th>Numéro</th>
                  <th>Type / Objet</th>
                  <th>Partie / Avocat</th>
                  <th>Statut</th>
                  <th>Étape Workflow</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let d of dossiers">
                  <td><strong>{{ d.numero }}</strong></td>
                  <td>{{ d.type }}</td>
                  <td>{{ d.intervenant }}</td>
                  <td>
                    <span class="badge" [ngClass]="getBadgeClass(d.statut)">
                      {{ d.statut }}
                    </span>
                  </td>
                  <td><span class="step-text">{{ d.etape }}</span></td>
                  <td>
                    <div class="actions-cell">
                      <button class="btn-action" title="Consulter Détails">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- EMPTY STATE WHEN NO DOSSIERS EXIST -->
          <div class="empty-state" *ngIf="dossiers.length === 0">
            <div class="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <h3>Aucun dossier trouvé</h3>
            <p>Vous n'avez pas encore créé ou été assigné à des dossiers.</p>
            <button class="btn-primary large" routerLink="/nouveau-dossier" *ngIf="isChargeDossier() || isAdmin()">
              Créer le premier dossier
            </button>
          </div>
        </div>
      </main>
    </div>
  \`,
  styles: [\`
    :host {
      --bg-color: #f0f4f8;
      --sidebar-width: 280px;
      --header-height: 90px;
      --bna-green: #008766;
      --bna-green-light: rgba(0, 135, 102, 0.08);
      --bna-green-hover: #007256;
      --bna-green-dark: #005641;
      --bna-grey: #40514e;
      --text-main: #1e293b;
      --text-muted: #64748b;
      --card-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
    }

    .app-layout {
      display: flex;
      min-height: 100vh;
      background-color: var(--bg-color);
      font-family: 'Outfit', 'Inter', sans-serif;
    }

    \${sidebarCSS}

    /* PREMIUM MAIN CONTENT */
    .main-content {
      flex: 1;
      margin-left: var(--sidebar-width);
      display: flex;
      flex-direction: column;
    }

    .top-header {
      height: var(--header-height);
      background: rgba(240, 244, 248, 0.8);
      backdrop-filter: blur(12px);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 48px;
      position: sticky;
      top: 0;
      z-index: 10;
      border-bottom: 1px solid rgba(0,0,0,0.03);
    }

    .header-title h1 {
      font-size: 24px;
      font-weight: 800;
      background: linear-gradient(135deg, var(--bna-green-dark) 0%, var(--bna-green) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
      letter-spacing: -0.5px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .notification-btn {
      background: white;
      border: 1px solid rgba(0,0,0,0.05);
      border-radius: 12px;
      color: var(--text-muted);
      cursor: pointer;
      position: relative;
      padding: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.02);
      transition: all 0.2s;
    }
    
    .notification-btn:hover {
      color: var(--bna-green);
      border-color: var(--bna-green-light);
      background: var(--bna-green-light);
    }

    .badge-dot {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 10px;
      height: 10px;
      background-color: #ef4444;
      border-radius: 50%;
      border: 2px solid white;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 8px 16px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.03);
      cursor: pointer;
      border: 1px solid rgba(0,0,0,0.02);
    }

    .user-info {
      text-align: right;
    }

    .user-email {
      display: block;
      font-size: 14px;
      font-weight: 700;
      color: var(--text-main);
    }

    .user-role {
      display: block;
      font-size: 12px;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .user-avatar {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, var(--bna-green) 0%, #10b981 100%);
      border-radius: 12px;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 18px;
    }

    .dashboard-content {
      padding: 32px 48px 48px 48px;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
    }

    .page-header-actions { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 24px; 
    }
    
    .page-header-actions h2 { 
      font-size: 20px; 
      color: var(--text-main); 
      margin: 0; 
      font-weight: 800; 
    }
    
    .btn-primary { 
      background: linear-gradient(135deg, var(--bna-green) 0%, #10b981 100%); 
      color: white; 
      border: none; 
      padding: 12px 24px; 
      border-radius: 12px; 
      font-weight: 700; 
      cursor: pointer; 
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s; 
      font-size: 15px;
      box-shadow: 0 4px 12px rgba(0,135,102,0.3);
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,135,102,0.4); }
    .btn-primary.large { padding: 16px 32px; font-size: 16px; margin-top: 16px; }

    .table-container { 
      background: white; 
      border-radius: 24px; 
      border: 1px solid rgba(0,0,0,0.03); 
      overflow: hidden; 
      box-shadow: var(--card-shadow); 
    }
    table { width: 100%; border-collapse: separate; border-spacing: 0; }
    th { 
      text-align: left; 
      padding: 20px 24px; 
      color: var(--text-muted); 
      font-size: 13px; 
      font-weight: 700; 
      text-transform: uppercase; 
      background: #f8fafc; 
      border-bottom: 1px solid rgba(0,0,0,0.04); 
    }
    td { 
      padding: 20px 24px; 
      color: var(--text-main); 
      font-size: 15px; 
      font-weight: 500;
      border-bottom: 1px solid rgba(0,0,0,0.03); 
    }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background-color: #f8fafc; }
    
    .badge { padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 700; display: inline-flex; align-items: center;}
    .badge.warning { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
    .badge.success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
    .badge.info { background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; }
    .badge.danger { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
    
    .step-text { font-size: 14px; color: var(--text-muted); font-weight: 600; background: #f1f5f9; padding: 6px 12px; border-radius: 8px; }

    .actions-cell { display: flex; gap: 8px; }
    .btn-action { background: #f1f5f9; color: var(--text-muted); border: none; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
    .btn-action:hover { background: var(--bna-green-light); color: var(--bna-green); }

    /* EMPTY STATE STYLES */
    .empty-state {
      background: white;
      border-radius: 24px;
      border: 1px dashed rgba(0, 135, 102, 0.3);
      padding: 80px 40px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: var(--card-shadow);
      margin-top: 24px;
    }
    
    .empty-icon {
      color: var(--bna-green);
      margin-bottom: 24px;
      opacity: 0.8;
      background: var(--bna-green-light);
      padding: 24px;
      border-radius: 50%;
    }
    
    .empty-state h3 {
      font-size: 24px;
      font-weight: 800;
      color: var(--text-main);
      margin: 0 0 8px 0;
    }
    
    .empty-state p {
      color: var(--text-muted);
      font-size: 16px;
      margin: 0 0 24px 0;
      max-width: 400px;
    }

    .nav-section-title {
      font-size: 11px;
      font-weight: 800;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin: 16px 0 8px 18px;
    }

    @media (max-width: 1024px) {
      .sidebar { transform: translateX(-100%); transition: transform 0.3s; }
      .main-content { margin-left: 0; }
      .top-header { padding: 0 24px; }
      .dashboard-content { padding: 24px; }
    }
  \`]
})
export class MesDossiersComponent implements OnInit {
  currentUser: any;
  
  // By default, showing no dossiers to trigger the empty state as requested
  dossiers = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit(): void {
  }

  getBadgeClass(statut: string): string {
    switch (statut) {
      case 'CLOTURE': return 'success';
      case 'EN_INSTRUCTION': return 'info';
      case 'PRE_VALIDATION': return 'warning';
      case 'VALIDATION': return 'danger';
      case 'REJETE': return 'danger';
      default: return 'info';
    }
  }

  getInitials(): string {
    if (!this.currentUser || !this.currentUser.username) return 'U';
    return this.currentUser.username.substring(0, 2).toUpperCase();
  }

  formatRoles(): string {
    if (!this.currentUser || !this.currentUser.roles) return 'Rôle';
    return this.currentUser.roles.map((r: string) => r.replace('ROLE_', '').replace('_', ' ')).join(', ');
  }

  isChargeDossier(): boolean {
    return this.authService.hasRole('ROLE_CHARGE_DOSSIER');
  }

  isPreValidateur(): boolean {
    return this.authService.hasRole('ROLE_PRE_VALIDATEUR');
  }

  isValidateur(): boolean {
    return this.authService.hasRole('ROLE_VALIDATEUR');
  }

  isReferentiel(): boolean {
    return this.authService.hasRole('ROLE_REFERENTIEL');
  }

  isAdmin(): boolean {
    return this.authService.hasRole('ROLE_ADMIN');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
`;

fs.mkdirSync('/Users/yossr/Desktop/BNA/frontend/src/app/components/mes-dossiers', { recursive: true });
fs.writeFileSync('/Users/yossr/Desktop/BNA/frontend/src/app/components/mes-dossiers/mes-dossiers.component.ts', newComponent, 'utf8');
