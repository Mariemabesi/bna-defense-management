import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogService } from '../shared/confirm-dialog/confirm-dialog.service';

interface UserDTO {
  id: number;
  username: string;
  email: string;
  enabled: boolean;
  roles: string[];
  managerUsername?: string;
  managerId?: number;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, FormsModule],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      <main class="main-content">
        <app-header title="Administration des Utilisateurs"></app-header>
        
        <div class="page-container">
          <!-- SOVEREIGN BANNER -->
          <div class="header-banner shadow-premium">
             <div class="banner-info">
                <h1>Régime des Identités</h1>
                <p>Gestion souveraine des accès, permissions et hiérarchie BNA.</p>
             </div>
             <div class="banner-actions">
                <button class="btn-add primary" (click)="showSignupModal = true">
                   Nouveau Compte
                </button>
             </div>
          </div>

          <!-- USER GRID -->
          <div class="user-grid-premium fade-in">
            <div class="user-identity-card shadow-premium" *ngFor="let u of users">
               <div class="card-aura" [ngClass]="getRoleClass(u.roles[0])"></div>
               
               <div class="card-status-dot" [class.active]="u.enabled"></div>

               <div class="card-inner">
                  <div class="profile-section">
                     <div class="avatar-glass">{{ u.username[0].toUpperCase() }}</div>
                     <div class="identity-info">
                        <h3>{{ u.username }}</h3>
                        <span>{{ u.email }}</span>
                     </div>
                  </div>

                  <div class="rank-pill" [ngClass]="getRoleClass(u.roles[0])">
                     <span class="rank-icon">
                        <svg *ngIf="isAdminRole(u)" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        <svg *ngIf="isValidateurRole(u)" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path></svg>
                     </span>
                     {{ (u.roles && u.roles[0]) ? u.roles[0].replace('ROLE_', '').replace('_', ' ') : 'NO ROLE' }}
                  </div>

                  <div class="manager-trace" *ngIf="u.managerUsername">
                     <span class="trace-label">Supervisé par</span>
                     <div class="manager-pill">{{ u.managerUsername }}</div>
                  </div>

                  <div class="card-controls">
                     <button class="btn-control" (click)="openEditModal(u)" title="Modifier Accès">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path></svg>
                     </button>
                     <button class="btn-control danger" (click)="toggleUserStatus(u)" title="Status Access">
                        <svg *ngIf="u.enabled" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line></svg>
                        <svg *ngIf="!u.enabled" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                     </button>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <!-- SIGNUP MODAL -->
        <div class="modal-overlay" *ngIf="showSignupModal" (click)="showSignupModal = false">
             <div class="modal-content" (click)="$event.stopPropagation()">
                <div class="modal-header">
                    <h2>Nouveau Compte</h2>
                    <button class="btn-close" (click)="showSignupModal = false">×</button>
                </div>
                <form (ngSubmit)="onSignup()">
                    <div class="form-group">
                        <label>Nom d'utilisateur</label>
                        <input type="text" [(ngModel)]="newAccount.username" name="username" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" [(ngModel)]="newAccount.email" name="email" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>Mot de passe</label>
                        <input type="password" [(ngModel)]="newAccount.password" name="password" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>Rôle & Profil</label>
                        <select [(ngModel)]="newAccount.role[0]" name="role" class="form-control" required>
                            <option value="ROLE_ADMIN">Administrateur</option>
                            <option value="ROLE_VALIDATEUR">Validateur (N2)</option>
                            <option value="ROLE_PRE_VALIDATEUR">Pré-validateur (N1)</option>
                            <option value="ROLE_CHARGE_DOSSIER">Chargé de Dossier (N0)</option>
                            <option value="ROLE_AVOCAT">Avocat / Auxiliaire</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Responsable Hiérarchique</label>
                        <select [(ngModel)]="newAccount.managerId" name="managerId" class="form-control">
                            <option [ngValue]="null">Aucun responsable (Top level)</option>
                            <option *ngFor="let user of users" [ngValue]="user.id">
                                {{ user.username }} ({{ user.roles[0].replace('ROLE_', '') }})
                            </option>
                        </select>
                        <p class="subtitle" style="font-size: 11px; margin-top: 4px;">
                           Validateur (N2) -> Pré-validateur (N1) -> Chargé (N0)
                        </p>
                    </div>

                    <!-- Lawyer selection if ROLE_AVOCAT is selected -->
                    <div class="form-group" *ngIf="isAvocatSelected()">
                        <label>Associer à un profil Avocat</label>
                        <select [(ngModel)]="newAccount.auxiliaireId" name="auxiliaireId" class="form-control" required>
                            <option [ngValue]="null">Choisir un avocat...</option>
                            <option *ngFor="let a of auxiliaires" [ngValue]="a.id">{{ a.nom }} ({{ a.specialite }})</option>
                        </select>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-secondary" (click)="showSignupModal = false">Annuler</button>
                        <button type="submit" class="btn-primary">Créer le compte</button>
                    </div>
                </form>
            </div>
         </div>
 
         <!-- EDIT MODAL -->
         <div class="modal-overlay" *ngIf="showEditModal" (click)="showEditModal = false">
              <div class="modal-content" (click)="$event.stopPropagation()">
                 <div class="modal-header">
                     <h2>Modifier Permissions: {{ editingUser?.username }}</h2>
                     <button class="btn-close" (click)="showEditModal = false">×</button>
                 </div>
                 <form (ngSubmit)="onUpdateUser()">
                     <div class="form-group">
                         <label>Nouveau Rôle</label>
                         <select [(ngModel)]="newRoles[0]" name="role" class="form-control" required>
                             <option value="ROLE_ADMIN">Administrateur</option>
                             <option value="ROLE_VALIDATEUR">Validateur (N2)</option>
                             <option value="ROLE_PRE_VALIDATEUR">Pré-validateur (N1)</option>
                             <option value="ROLE_CHARGE_DOSSIER">Chargé de Dossier (N0)</option>
                             <option value="ROLE_AVOCAT">Avocat / Auxiliaire</option>
                         </select>
                     </div>
 
                     <div class="form-group">
                         <label>Responsable Hiérarchique</label>
                         <select [(ngModel)]="updatedManagerId" name="managerId" class="form-control">
                             <option [ngValue]="null">Aucun responsable</option>
                             <option *ngFor="let user of users" [ngValue]="user.id">
                                 {{ user.username }} ({{ user.roles[0]?.replace('ROLE_', '') }})
                             </option>
                         </select>
                     </div>
 
                     <div class="modal-footer">
                         <button type="button" class="btn-secondary" (click)="showEditModal = false">Annuler</button>
                         <button type="submit" class="btn-primary">Enregistrer les modifications</button>
                     </div>
                 </form>
               </div>
          </div>
       </main>
     </div>
  `,
  styles: [`
    :host {
      --bna-green: #008766;
      --bna-green-light: rgba(0, 135, 102, 0.08);
      --text-main: #1e293b;
      --text-muted: #64748b;
    }

    .app-layout { display: flex; min-height: 100vh; background-color: #f8fafc; font-family: 'Outfit', sans-serif; }
    .main-content { flex: 1; display: flex; flex-direction: column; background: #f8fafc; }
    .dashboard-content { padding: 48px; max-width: 1600px; width: 100%; margin: 0 auto; }
    
    /* USER GRID */
    .user-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 32px; }
    
    .user-card {
      background: white; border-radius: 32px; padding: 28px;
      position: relative; overflow: hidden; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1.5px solid #f1f5f9; box-shadow: 0 10px 30px rgba(0,0,0,0.02);
    }
    .user-card:hover { transform: translateY(-8px); border-color: #008766; box-shadow: 0 15px 45px rgba(0, 135, 102, 0.08); }
    
    .card-status-pill {
      position: absolute; top: 24px; right: 24px; font-size: 10px; font-weight: 800;
      padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .card-status-pill.active { background: #f0fdf4; color: #16a34a; }
    .card-status-pill.suspended { background: #fef2f2; color: #dc2626; }
    
    .profile-header { display: flex; align-items: center; gap: 20px; margin-bottom: 32px; }
    .profile-avatar {
      width: 60px; height: 60px; background: #f8fafc; color: #008766;
      border-radius: 20px; display: flex; align-items: center; justify-content: center;
      font-size: 24px; font-weight: 800; border: 2px solid #f1f5f9;
    }
    .username { margin: 0; font-size: 18px; font-weight: 800; color: #1e293b; }
    .email { font-size: 13px; color: #64748b; font-weight: 600; }

    .tier-indicator {
      background: #f8fafc; border-radius: 20px; padding: 16px; 
      display: flex; align-items: center; gap: 16px; margin-bottom: 24px;
      border: 1px solid #f1f5f9;
    }
    .tier-icon {
      width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center;
      background: white; color: #64748b; box-shadow: 0 4px 12px rgba(0,0,0,0.04);
    }
    .tier-icon.admin { color: #8b5cf6; background: #f5f3ff; }
    .tier-icon.validator { color: #0ea5e9; background: #f0f9ff; }
    .tier-icon.charge { color: #008766; background: #f0fdf4; }
    
    .tier-info { display: flex; flex-direction: column; }
    .tier-label { font-size: 12px; font-weight: 800; color: #1e293b; text-transform: uppercase; }
    .tier-rank { font-size: 10px; font-weight: 700; color: #94a3b8; }

    .hierarchy-map { display: flex; flex-direction: column; gap: 8px; }
    .map-label { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; }
    .manager-link {
      display: flex; align-items: center; gap: 8px; padding: 8px 12px;
      background: #f1f5f9; color: #475569; border-radius: 10px; font-size: 12.5px; font-weight: 700;
    }

    .card-actions {
      margin-top: 32px; padding-top: 24px; border-top: 1px dashed #e2e8f0;
      display: flex; gap: 12px; justify-content: flex-end;
    }
    .btn-card-micro {
      width: 40px; height: 40px; border-radius: 12px; border: none;
      background: #f8fafc; color: #64748b; cursor: pointer; transition: 0.2s;
      display: flex; align-items: center; justify-content: center;
    }
    .btn-card-micro:hover { background: #008766; color: white; transform: translateY(-3px); }
    .btn-card-micro.danger:hover { background: #ef4444; }

    .page-header-actions { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .subtitle { color: var(--text-muted); font-size: 16px; margin: 4px 0 0 0; }

    th { text-align: left; padding: 24px; background: #f8fafc; font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #f1f5f9; }
    td { padding: 24px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    
    .user-cell { display: flex; align-items: center; gap: 16px; }
    .user-avatar { width: 44px; height: 44px; border-radius: 14px; background: var(--bna-green-light); color: var(--bna-green); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; }
    .user-info h4 { margin: 0; color: var(--text-main); font-size: 16px; font-weight: 700; }
    .user-info p { margin: 0; color: var(--text-muted); font-size: 13px; }

    .role-badge { 
      padding: 6px 12px; background: #f1f5f9; border-radius: 8px; font-size: 11px; 
      font-weight: 800; color: #475569; margin-right: 6px; text-transform: uppercase;
    }
    
    .badge { padding: 6px 14px; border-radius: 10px; font-size: 12px; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; }
    .badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; }
    .badge.active { background: #f0fdf4; color: #16a34a; }
    .badge.active::before { background: #16a34a; }
    .badge.suspended { background: #fef2f2; color: #dc2626; }
    .badge.suspended::before { background: #dc2626; }

    .manager-tag { 
      background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 8px; 
      font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;
      border: 1px solid #e2e8f0;
    }

    .btn-toggle { 
      padding: 10px 20px; border-radius: 12px; border: none; font-weight: 700; 
      cursor: pointer; transition: all 0.2s; font-size: 14px;
    }
    .btn-toggle.suspend { background: #fef2f2; color: #dc2626; }
    .btn-toggle.restore { background: #f0fdf4; color: #16a34a; }
    .btn-toggle:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    
    .btn-edit {
      background: white; border: 2px solid #e2e8f0; color: #475569; padding: 10px 18px; border-radius: 12px;
      font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; font-size: 14px;
    }
    .btn-edit:hover { background: #f8fafc; border-color: var(--bna-green); color: var(--bna-green); transform: translateY(-2px); }

    .btn-primary { 
      background: linear-gradient(135deg, var(--bna-green) 0%, #10b981 100%); 
      color: white; border: none; padding: 12px 28px; border-radius: 14px; 
      font-weight: 800; cursor: pointer; transition: all 0.3s; 
      box-shadow: 0 10px 20px -5px rgba(0, 135, 102, 0.3);
      display: flex; align-items: center; gap: 10px;
    }
    .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 15px 25px -5px rgba(0, 135, 102, 0.4); }

    .modal-overlay { 
      position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
      background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); 
      z-index: 2000; display: flex; align-items: center; justify-content: center; 
    }
    .modal-content { background: white; border-radius: 32px; width: 100%; max-width: 500px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); overflow: hidden; }
    .modal-header { padding: 32px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #fafafa; }
    .modal-header h2 { margin: 0; font-size: 24px; font-weight: 800; color: var(--text-main); }
    .btn-close { width: 40px; height: 40px; border-radius: 50%; border: none; background: #f1f5f9; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px; color: var(--text-muted); transition: 0.2s; }
    .btn-close:hover { background: #fee2e2; color: #ef4444; }

    form { padding: 32px; display: flex; flex-direction: column; gap: 24px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-group label { font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .form-control { padding: 14px; border-radius: 12px; border: 2px solid #e2e8f0; font-family: inherit; font-size: 15px; }
    .form-control:focus { outline: none; border-color: var(--bna-green); box-shadow: 0 0 0 4px var(--bna-green-light); }
    
    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 24px 32px; background: #fafafa; border-top: 1px solid #f1f5f9; }
    .btn-secondary { background: white; border: 2px solid #e2e8f0; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; color: var(--text-main); }

    @media (max-width: 1024px) {
      .main-content { padding-left: 0; }
    }
  `]
})
export class UserManagementComponent implements OnInit {
  users: UserDTO[] = [];
  auxiliaires: any[] = [];
  showSignupModal = false;
  newAccount = { username: '', email: '', password: '', role: ['ROLE_CHARGE_DOSSIER'], auxiliaireId: null as number | null, managerId: null as number | null };
  
  showEditModal = false;
  editingUser: UserDTO | null = null;
  newRoles: string[] = [];
  updatedManagerId: number | null = null;
  
  constructor(private http: HttpClient, private confirmService: ConfirmDialogService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadAuxiliaires();
  }

  loadAuxiliaires() {
    this.http.get<any[]>('/api/referentiel/auxiliaires').subscribe(data => {
        this.auxiliaires = data.filter(a => a.type === 'AVOCAT');
    });
  }

  isAvocatSelected(): boolean {
    return this.newAccount.role.includes('ROLE_AVOCAT');
  }

  loadUsers() {
    this.http.get<UserDTO[]>('/api/admin/users').subscribe(data => this.users = data);
  }

  toggleUserStatus(u: UserDTO) {
    this.confirmService.open({
        title: 'Confirmation de modification',
        message: `Voulez-vous ${u.enabled ? 'suspendre' : 'réactiver'} le compte de ${u.username} ?`
    }).subscribe(ok => {
        if (ok) {
            this.http.put(`/api/admin/users/${u.id}/toggle-status`, {}).subscribe({
                next: () => this.loadUsers(),
                error: (err) => alert('Erreur lors du changement de statut: ' + (err.error?.message || 'Problème serveur'))
            });
        }
    });
  }

  deleteUser(u: UserDTO) {
    this.confirmService.open({
        title: 'Suppression Définitive',
        message: `ATTENTION: Êtes-vous sûr de vouloir supprimer DÉFINITIVEMENT l'utilisateur ${u.username} ? Cette action est irréversible.`,
        confirmLabel: 'Supprimer',
        cancelLabel: 'Annuler'
    }).subscribe(ok => {
        if (ok) {
            this.http.delete(`/api/admin/users/${u.id}`).subscribe({
                next: () => {
                    alert('Utilisateur supprimé');
                    this.loadUsers();
                },
                error: (err) => alert('Erreur lors de la suppression: ' + (err.error?.message || 'Problème serveur'))
            });
        }
    });
  }

  onSignup() {
    this.http.post('/api/admin/users', this.newAccount).subscribe({
      next: () => {
        alert('Compte créé avec succès');
        this.showSignupModal = false;
        this.loadUsers();
      },
      error: (err) => alert(err.error?.message || 'Erreur lors de la création')
    });
  }

  openEditModal(u: UserDTO) {
    this.editingUser = u;
    this.newRoles = [...u.roles];
    this.updatedManagerId = u.managerId || null;
    this.showEditModal = true;
  }

  onUpdateUser() {
    if (!this.editingUser) return;
    this.http.put(`/api/admin/users/${this.editingUser.id}`, {
      role: this.newRoles,
      managerId: this.updatedManagerId
    }).subscribe({
      next: () => {
        alert('Utilisateur mis à jour avec succès');
        this.showEditModal = false;
        this.loadUsers();
      },
      error: (err) => alert(err.error?.message || 'Erreur lors de la mise à jour')
    });
  }

  // --- UI HELPERS ---
  getRoleClass(role: string): string {
    if (role?.includes('ADMIN')) return 'admin';
    if (role?.includes('VALIDATEUR')) return 'validator';
    return 'charge';
  }

  getRankLabel(role: string): string {
    if (role?.includes('ADMIN')) return 'Niveau Système';
    if (role?.includes('VALIDATEUR')) return 'Niveau N2-N1';
    return 'Niveau Opérationnel (N0)';
  }

  isAdminRole(u: UserDTO): boolean { return u.roles[0]?.includes('ADMIN'); }
  isValidateurRole(u: UserDTO): boolean { return u.roles[0]?.includes('VALIDATEUR'); }
  isChargeRole(u: UserDTO): boolean { return u.roles[0]?.includes('CHARGE'); }
}
