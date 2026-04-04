import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { FormsModule } from '@angular/forms';

interface UserDTO {
  id: number;
  username: string;
  email: string;
  enabled: boolean;
  roles: string[];
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
        <div class="dashboard-content">
          <div class="page-header-actions">
            <div>
              <h2>Gestion des Accès</h2>
              <p class="subtitle">Suspension et activation des comptes utilisateurs.</p>
            </div>
            <button class="btn-primary" (click)="showSignupModal = true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="16" y1="11" x2="22" y2="11"></line></svg>
              Créer Nouveau Compte
            </button>
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Roles</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let u of users">
                  <td><strong>{{ u.username }}</strong></td>
                  <td>{{ u.email }}</td>
                  <td>
                    <span class="role-badge" *ngFor="let r of u.roles">{{ r.replace('ROLE_', '') }}</span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="u.enabled ? 'active' : 'suspended'">
                      {{ u.enabled ? 'ACTIF' : 'SUSPENDU' }}
                    </span>
                  </td>
                  <td>
                    <button class="btn-toggle" [ngClass]="u.enabled ? 'suspend' : 'restore'" (click)="toggleUserStatus(u)">
                      {{ u.enabled ? 'Suspendre' : 'Restaurer' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
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
                        <label>Rôles</label>
                        <select multiple [(ngModel)]="newAccount.role" name="role" class="form-control" required>
                            <option value="ROLE_CHARGE_DOSSIER">Chargé de Dossier</option>
                            <option value="ROLE_PRE_VALIDATEUR">Pré-validateur</option>
                            <option value="ROLE_VALIDATEUR">Validateur</option>
                            <option value="ROLE_ADMIN">Administrateur</option>
                        </select>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-secondary" (click)="showSignupModal = false">Annuler</button>
                        <button type="submit" class="btn-primary">Créer le compte</button>
                    </div>
                </form>
             </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-layout { display: flex; min-height: 100vh; background-color: #f8fafc; }
    .main-content { flex: 1; margin-left: 280px; }
    .dashboard-content { padding: 40px; }
    .table-container { background: white; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); overflow: hidden; margin-top: 32px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 20px; background: #f1f5f9; font-size: 13px; color: #64748b; }
    td { padding: 20px; border-bottom: 1px solid #f1f5f9; }
    .role-badge { padding: 4px 8px; background: #e2e8f0; border-radius: 6px; font-size: 11px; font-weight: 700; margin-right: 4px; }
    .badge { padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 800; }
    .badge.active { background: #f0fdf4; color: #16a34a; }
    .badge.suspended { background: #fef2f2; color: #dc2626; }
    .btn-toggle { padding: 8px 16px; border-radius: 8px; border: none; font-weight: 700; cursor: pointer; transition: 0.2s; }
    .btn-toggle.suspend { background: #fee2e2; color: #dc2626; }
    .btn-toggle.restore { background: #dcfce7; color: #16a34a; }
    .btn-toggle:hover { opacity: 0.8; transform: translateY(-2px); }
    
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; }
    .modal-content { background: white; border-radius: 24px; width: 500px; padding: 0; overflow: hidden; }
    .modal-header { padding: 24px 32px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; }
    form { padding: 32px; display: flex; flex-direction: column; gap: 20px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-control { padding: 12px; border-radius: 10px; border: 1.5px solid #e2e8f0; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 12px; }
    .btn-primary { background: #008766; color: white; padding: 12px 24px; border-radius: 10px; border: none; font-weight: 700; cursor: pointer; }
    .btn-secondary { background: #f1f5f9; color: #64748b; padding: 12px 24px; border-radius: 10px; border: none; font-weight: 700; cursor: pointer; }
    .btn-close { font-size: 24px; border: none; background: none; cursor: pointer; }
    .page-header-actions { display: flex; justify-content: space-between; align-items: flex-start; }
    .subtitle { color: #64748b; margin-top: 4px; }
  `]
})
export class UserManagementComponent implements OnInit {
  users: UserDTO[] = [];
  showSignupModal = false;
  newAccount = { username: '', email: '', password: '', role: ['ROLE_CHARGE_DOSSIER'] };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.http.get<UserDTO[]>('http://localhost:8082/api/admin/users').subscribe(data => this.users = data);
  }

  toggleUserStatus(u: UserDTO) {
    this.http.put(`http://localhost:8082/api/admin/users/${u.id}/toggle-status`, {}).subscribe(() => this.loadUsers());
  }

  onSignup() {
    this.http.post('http://localhost:8082/api/admin/users', this.newAccount).subscribe({
      next: () => {
        alert('Compte créé avec succès');
        this.showSignupModal = false;
        this.loadUsers();
      },
      error: (err) => alert(err.error?.message || 'Erreur lors de la création')
    });
  }
}
