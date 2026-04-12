import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReferentielService } from '../../services/referentiel.service';
import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { NotificationService } from '../../services/notification.service';
import { SidebarService } from '../../services/sidebar.service';

interface RefSection {
  id: string;
  title: string;
  count: number;
  icon: string;
  description: string;
  color: string;
  path: string;
}

@Component({
  selector: 'app-referentiel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>

      <main class="main-content">
        <app-header title="Administration du Référentiel"></app-header>

        <div class="dashboard-content">
          <!-- WELCOME BANNER -->
          <div class="welcome-banner shadow-premium">
            <div class="banner-text">
              <h1>Hub de Référentiel</h1>
              <p>Pilotez les données maîtresses du système de défense BNA. Gestion centralisée des partenaires, juridictions et barèmes.</p>
            </div>
            <div class="banner-stats">
               <div class="stat-pill">
                  <span class="dot live"></span>
                  <span class="stat-label">Données Intègres</span>
               </div>
               <div class="stat-pill">
                  <span class="stat-val">{{ totalItems }}</span>
                  <span class="stat-label">Entrées Totales</span>
               </div>
            </div>
          </div>

          <!-- SECTION GRID -->
          <div class="hub-grid">
             <!-- PARTNERS GROUP -->
             <div class="hub-section">
                <div class="section-title">
                   <span class="s-icon">👥</span>
                   <h3>Partenaires & Auxiliaires</h3>
                </div>
                <div class="cards-stack">
                   <div class="ref-card" *ngFor="let s of sectionsGroup1" [style.border-left-color]="s.color">
                      <div class="card-interaction" [routerLink]="['/referentiel', s.id]">
                         <div class="card-icon" [style.background]="s.color + '15'">{{ s.icon }}</div>
                         <div class="card-body">
                            <h4>{{ s.title }}</h4>
                            <p>{{ s.description }}</p>
                         </div>
                         <div class="card-action">
                            <span class="count">{{ s.count }}</span>
                         </div>
                      </div>
                      <div class="card-admin-footer">
                         <button class="btn-card-add" *ngIf="isAdmin()" [routerLink]="['/referentiel', s.id]" [queryParams]="{action: 'add'}">Ajouter +</button>
                         <button class="btn-card-details" [routerLink]="['/referentiel', s.id]">Review {{ s.icon }}</button>
                      </div>
                   </div>
                </div>
             </div>

             <!-- JURIDICTIONS GROUP -->
             <div class="hub-section">
                <div class="section-title">
                   <span class="s-icon">🏛️</span>
                   <h3>Juridictions & Cours</h3>
                </div>
                <div class="cards-stack">
                   <div class="ref-card" *ngFor="let s of sectionsGroup2" [style.border-left-color]="s.color">
                      <div class="card-interaction" [routerLink]="['/referentiel', s.id]">
                         <div class="card-icon" [style.background]="s.color + '15'">{{ s.icon }}</div>
                         <div class="card-body">
                            <h4>{{ s.title }}</h4>
                            <p>{{ s.description }}</p>
                         </div>
                         <div class="card-action">
                            <span class="count">{{ s.count }}</span>
                         </div>
                      </div>
                      <div class="card-admin-footer">
                         <button class="btn-card-add" *ngIf="isAdmin()" [routerLink]="['/referentiel', s.id]" [queryParams]="{action: 'add'}">Ajouter +</button>
                         <button class="btn-card-details" [routerLink]="['/referentiel', s.id]">Review {{ s.icon }}</button>
                      </div>
                   </div>
                </div>
             </div>


          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-layout { font-family: 'Outfit', sans-serif; display: flex; min-height: 100vh; background: #fdfdfd; }
    .main-content { flex: 1; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); margin-left: 280px; width: 100%; }

    
    .dashboard-content { padding: 48px; max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 48px; }

    .shadow-premium { box-shadow: 0 10px 40px rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.03); }

    /* BANNER */
    .welcome-banner {
      background: #1e293b;
      padding: 60px 80px; border-radius: 40px; color: white;
      display: flex; justify-content: space-between; align-items: center;
      position: relative; overflow: hidden;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .welcome-banner::after {
      content: ''; position: absolute; bottom: -20%; right: -10%; width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%);
      pointer-events: none;
    }
    .banner-text h1 { font-size: 42px; font-weight: 800; margin: 0 0 16px 0; letter-spacing: -1.5px; }
    .banner-text p { font-size: 19px; color: #94a3b8; max-width: 650px; margin: 0; line-height: 1.6; font-weight: 500; }
    
    .banner-stats { display: flex; gap: 40px; }
    .stat-pill { background: rgba(255,255,255,0.04); padding: 16px 32px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); text-align: center; }
    .stat-val { font-size: 28px; font-weight: 800; color: #10b981; margin-bottom: 4px; display: block; }
    .stat-label { font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 2px; }

    /* HUB GRID */
    .hub-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
    .hub-section { display: flex; flex-direction: column; gap: 32px; }
    .section-title h3 { font-size: 18px; font-weight: 800; color: #1e293b; margin: 0; letter-spacing: -0.5px; opacity: 0.9; }

    /* OBSIDIAN CARD REDESIGN */
    .ref-card {
      background: white; border-radius: 28px; 
      border: 1.5px solid #f1f5f9;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden; position: relative;
    }
    
    .card-interaction { display: flex; align-items: center; gap: 24px; padding: 28px 32px; cursor: pointer; }
    .card-icon { 
      width: 64px; height: 64px; border-radius: 22px; 
      display: flex; align-items: center; justify-content: center; 
      font-size: 28px; transition: transform 0.3s;
      box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);
    }
    
    .card-body h4 { margin: 0 0 6px 0; font-size: 19px; font-weight: 800; color: #1e293b; }
    .card-body p { margin: 0; font-size: 14px; color: #64748b; line-height: 1.5; }
    
    .count { 
      background: #f8fafc; color: #1e293b; font-size: 13px; font-weight: 800; 
      padding: 8px 16px; border-radius: 30px; border: 1px solid #f1f5f9;
    }

    .card-admin-footer { 
      display: flex; background: #fafbfc; padding: 4px; gap: 4px;
      border-top: 1px solid #f1f5f9; margin-top: -1px;
    }
    .btn-card-add, .btn-card-details {
      flex: 1; padding: 14px; border: none; background: transparent; 
      font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;
      cursor: pointer; border-radius: 14px; transition: 0.2s;
    }
    .btn-card-add { color: #008766; }
    .btn-card-add:hover { background: #008766; color: white; }
    .btn-card-details { color: #64748b; }
    .btn-card-details:hover { background: #f1f5f9; color: #1e293b; }

    .ref-card:hover { 
      transform: translateY(-8px); 
      border-color: rgba(0, 135, 102, 0.2);
      box-shadow: 0 25px 60px rgba(0,0,0,0.05); 
    }
    .ref-card:hover .card-icon { transform: scale(1.1) rotate(-5deg); }

    @media (max-width: 1200px) { .hub-grid { grid-template-columns: 1fr; } }
  `]
})
export class ReferentielComponent implements OnInit {
  totalItems: number = 0;

  // Partners & Auxiliaires
  sectionsGroup1: RefSection[] = [
    { id: 'avocats', title: 'Avocats', count: 42, icon: '', description: 'Annuaire des avocats partenaires (Civil, Pénal, Foncier).', color: '#008766', path: '/referentiel/avocats' },
    { id: 'huissiers', title: 'Huissiers', count: 28, icon: '', description: 'Gestion des notifications et exécutions judiciaires.', color: '#d97706', path: '/referentiel/huissiers' },
    { id: 'experts', title: 'Experts Judiciaires', count: 15, icon: '', description: 'Référentiel des experts certifiés par domaine.', color: '#2563eb', path: '/referentiel/experts' }
  ];

  // Juridictions
  sectionsGroup2: RefSection[] = [
    { id: 'tribunaux', title: 'Tribunaux', count: 12, icon: '', description: 'Première instance, Cantonal, Immobilier, Commercial.', color: '#475569', path: '/referentiel/tribunaux' },
    { id: 'cours-appel', title: 'Cours d\'Appel', count: 6, icon: '', description: 'Gestion des juridictions de second degré.', color: '#6366f1', path: '/referentiel/cours-appel' },
    { id: 'parquets', title: 'Parquets', count: 4, icon: '', description: 'Procureurs et Ministère Public.', color: '#ef4444', path: '/referentiel/parquets' }
  ];



  constructor(
    private referentielService: ReferentielService,
    private authService: AuthService,
    private notificationService: NotificationService,
    public sidebarService: SidebarService
  ) { }

  ngOnInit(): void {
    this.totalItems = 152; // To be calculated dynamically
  }

  isAdmin(): boolean { return this.authService.hasRole('ROLE_ADMIN'); }
}
