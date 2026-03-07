const fs = require('fs');

const FILE_PATH = '/Users/yossr/Desktop/BNA/frontend/src/app/components/dashboard/dashboard.component.ts';
let content = fs.readFileSync(FILE_PATH, 'utf8');

// Replace standard imports with RouterLinkActive
content = content.replace(
  "import { Router, RouterLink } from '@angular/router';",
  "import { Router, RouterLink, RouterLinkActive } from '@angular/router';"
);
content = content.replace(
  "imports: [CommonModule, RouterLink],",
  "imports: [CommonModule, RouterLink, RouterLinkActive],"
);

// Fix the Sidebar Layout and Logo alignment
const sidebarStart = '<aside class="sidebar">';
const sidebarEnd = '</aside>';
const startIndex = content.indexOf(sidebarStart);
const endIndex = content.indexOf(sidebarEnd) + sidebarEnd.length;

const sidebarNew = `<aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo-wrapper">
             <img src="/assets/images/cleanly.png" alt="BNA Logo" class="sidebar-logo">
          </div>
          <div class="brand-text">Défense Premium</div>
        </div>
        
        <nav class="sidebar-nav">
          <div class="nav-top-group">
            <a class="nav-item" routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              Tableau de Bord
            </a>
            <a class="nav-item" routerLink="/nouveau-dossier" routerLinkActive="active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              Nouveau Dossier
            </a>
            <a class="nav-item" routerLink="/nouvelle-demande-frais" routerLinkActive="active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
              Demande Frais
            </a>
          </div>
          
          <div class="nav-bottom-group" style="margin-top: auto">
            <a class="nav-item logout" (click)="logout()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Déconnexion
            </a>
          </div>
        </nav>

        <div class="sidebar-footer">
          <div class="help-box">
            <div class="help-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <div class="help-content">
              <h4>Besoin d'aide ?</h4>
              <p>Support IT interne</p>
            </div>
          </div>
        </div>
      </aside>`;

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + sidebarNew + content.substring(endIndex);
}

// Add premium aesthetics CSS
const premiumCSS = `
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

    /* PREMIUM SIDEBAR STYLES */
    .sidebar {
      width: var(--sidebar-width);
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-right: 1px solid rgba(0,0,0,0.04);
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      z-index: 20;
      box-shadow: 4px 0 24px rgba(0,0,0,0.02);
    }

    .sidebar-header {
      padding: 32px 24px 24px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      border-bottom: 1px solid rgba(0,0,0,0.04);
    }

    .logo-wrapper {
      padding: 12px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.04);
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
    }

    .sidebar-logo {
      height: 60px;
      width: auto;
      object-fit: contain;
    }

    .brand-text {
      font-size: 14px;
      font-weight: 800;
      color: var(--bna-green-dark);
      text-transform: uppercase;
      letter-spacing: 1.5px;
      text-align: center;
    }

    .sidebar-nav {
      padding: 32px 20px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .nav-top-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 18px;
      border-radius: 14px;
      color: var(--text-muted);
      font-size: 15px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .nav-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 4px;
      background: var(--bna-green);
      transform: scaleY(0);
      transition: transform 0.3s ease;
      border-radius: 0 4px 4px 0;
    }

    .nav-item:hover {
      background-color: var(--bna-green-light);
      color: var(--bna-green-hover);
      transform: translateX(4px);
    }

    .nav-item.active {
      background: linear-gradient(90deg, var(--bna-green-light) 0%, rgba(255,255,255,0) 100%);
      color: var(--bna-green);
      font-weight: 700;
    }

    .nav-item.active::before {
      transform: scaleY(1);
    }

    .nav-item.active svg {
      stroke: var(--bna-green);
      filter: drop-shadow(0 2px 4px rgba(0,135,102,0.3));
    }

    .nav-item.logout {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.05);
    }

    .nav-item.logout:hover {
      background-color: rgba(239, 68, 68, 0.1);
      color: #dc2626;
      transform: translateX(4px);
    }
    .nav-item.logout::before {
      background: #dc2626;
    }

    .sidebar-footer {
      padding: 0 20px 24px 20px;
    }

    .help-box {
      background: linear-gradient(135deg, white 0%, #f8fafc 100%);
      padding: 16px;
      border-radius: 16px;
      border: 1px solid rgba(0,0,0,0.04);
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.02);
      transition: transform 0.2s;
    }
    
    .help-box:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0,0,0,0.04);
    }

    .help-icon {
      background: var(--bna-green-light);
      color: var(--bna-green);
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .help-content h4 {
      margin: 0 0 4px 0;
      font-size: 14px;
      font-weight: 700;
      color: var(--text-main);
    }

    .help-content p {
      margin: 0;
      font-size: 12px;
      color: var(--text-muted);
    }

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
      transition: transform 0.2s;
      border: 1px solid rgba(0,0,0,0.02);
    }
    
    .user-profile:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0,0,0,0.05);
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
      box-shadow: 0 4px 10px rgba(0,135,102,0.3);
    }

    .dashboard-content {
      padding: 32px 48px 48px 48px;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
    }

    .stats-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); 
      gap: 24px; 
      margin-bottom: 48px; 
    }
    
    .stat-card { 
      background: white; 
      padding: 28px; 
      border-radius: 24px; 
      box-shadow: var(--card-shadow); 
      border: 1px solid rgba(0,0,0,0.02); 
      display: flex; 
      align-items: center; 
      gap: 24px; 
      transition: all 0.3s ease; 
      position: relative;
      overflow: hidden;
    }
    
    .stat-card::after {
      content: '';
      position: absolute;
      top: 0; right: 0; bottom: 0; left: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 100%);
      pointer-events: none;
    }
    
    .stat-card:hover { 
      transform: translateY(-6px); 
      box-shadow: 0 20px 30px -10px rgba(0,0,0,0.08); 
    }
    
    .stat-icon { 
      width: 64px; 
      height: 64px; 
      border-radius: 18px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      flex-shrink: 0;
      font-size: 28px;
    }
    .stat-icon.green { background: linear-gradient(135deg, rgba(0, 135, 102, 0.1) 0%, rgba(16, 185, 129, 0.2) 100%); color: var(--bna-green); }
    .stat-icon.grey { background: rgba(100, 116, 139, 0.1); color: var(--text-muted); }
    .stat-icon.warning { background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.2) 100%); color: #d97706; }
    .stat-icon.danger { background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.2) 100%); color: #dc2626; }
    .stat-icon.info { background: linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(79, 70, 229, 0.2) 100%); color: #4f46e5; }
    
    .label { font-size: 15px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; }
    .value { font-size: 32px; font-weight: 800; color: var(--text-main); line-height: 1; margin-bottom: 8px;}
    .trend { font-size: 13px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 6px; }
    .trend.positive { color: #059669; background: #d1fae5; }
    .status-indicator, .action-needed { font-size: 14px; font-weight: 600; }
    .action-needed { color: #d97706; }
    .status-indicator { color: var(--text-muted); }

    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .recent-section h2 { font-size: 20px; color: var(--text-main); margin: 0; font-weight: 800; letter-spacing: -0.5px; }
    
    .actions-group { display: flex; gap: 16px; }
    .btn-primary { 
      background: linear-gradient(135deg, var(--bna-green) 0%, #10b981 100%); 
      color: white; 
      border: none; 
      padding: 12px 24px; 
      border-radius: 12px; 
      font-weight: 700; 
      cursor: pointer; 
      transition: all 0.2s; 
      font-size: 15px;
      box-shadow: 0 4px 12px rgba(0,135,102,0.3);
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,135,102,0.4); }
    
    .btn-secondary { 
      background: white; 
      color: var(--bna-green); 
      border: 2px solid var(--bna-green-light); 
      padding: 10px 24px; 
      border-radius: 12px; 
      font-weight: 700; 
      cursor: pointer; 
      transition: all 0.2s; 
      font-size: 15px; 
    }
    .btn-secondary:hover { border-color: var(--bna-green); background: var(--bna-green-light); transform: translateY(-2px); }

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
      letter-spacing: 1px;
      background: #f8fafc; 
      border-bottom: 1px solid rgba(0,0,0,0.04); 
    }
    td { 
      padding: 20px 24px; 
      color: var(--text-main); 
      font-size: 15px; 
      font-weight: 500;
      border-bottom: 1px solid rgba(0,0,0,0.03); 
      transition: background 0.2s;
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
    .btn-action { background: #f1f5f9; color: var(--text-muted); border: none; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; }
    .btn-action:hover { background: var(--bna-green-light); color: var(--bna-green); transform: translateY(-2px); }
    .btn-action.warning-bg { background: #fffbeb; color: #d97706; }
    .btn-action.warning-bg:hover { background: #f59e0b; color: white; }
    .btn-action.danger-bg { background: #f0fdf4; color: #10b981; }
    .btn-action.danger-bg:hover { background: #10b981; color: white; }

    @media (max-width: 1024px) {
      .sidebar { transform: translateX(-100%); transition: transform 0.3s; }
      .main-content { margin-left: 0; }
      .top-header { padding: 0 24px; }
      .dashboard-content { padding: 24px; }
      .stats-grid { grid-template-columns: 1fr; }
    }
    `;

// Strip out the old styles and replace them
const styleStartIndex = content.indexOf('styles: [`');
const styleEndIndex = content.lastIndexOf('\`]\\n})');
if (styleStartIndex !== -1) {
  content = content.substring(0, styleStartIndex + 10) + premiumCSS + '`]\n})' + content.split('\n})')[1];
}

content = content.replace(
  '<div class="user-avatar"></div>',
  '<div class="user-avatar">{{ getInitials() }}</div>'
);

content = content.replace(
  'formatRoles(): string {',
  `getInitials(): string {
    if (!this.currentUser || !this.currentUser.username) return 'U';
    return this.currentUser.username.substring(0, 2).toUpperCase();
  }

  formatRoles(): string {`
);

fs.writeFileSync(FILE_PATH, content, 'utf8');
