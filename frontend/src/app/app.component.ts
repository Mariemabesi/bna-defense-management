import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { ConfirmDialogService, ConfirmDialogConfig } from './services/confirm-dialog.service';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, ConfirmDialogComponent],
  template: `
    <router-outlet></router-outlet>
    <app-confirm-dialog 
      [show]="showConfirm" 
      [title]="confirmConfig.title || 'Confirmation'"
      [message]="confirmConfig.message || ''"
      [confirmLabel]="confirmConfig.confirmLabel || 'Confirmer'"
      [cancelLabel]="confirmConfig.cancelLabel || 'Annuler'"
      (confirmed)="onConfirmed()"
      (cancelled)="onCancelled()">
    </app-confirm-dialog>
  `,
  styles: [`
    .app-container { display: flex; height: 100vh; background: var(--bna-light-grey); color: var(--text-primary); font-family: 'Outfit', sans-serif; }
    
    .side-nav { width: 280px; background: var(--white); padding: 32px 20px; border-right: 1px solid var(--bna-border); display: flex; flex-direction: column; }
    
    .nav-branding { display: flex; align-items: center; gap: 12px; margin-bottom: 48px; padding-left: 0; }
    .nav-logo { height: 32px; width: auto; }
    .app-name { font-size: 18px; font-weight: 700; color: var(--bna-grey); letter-spacing: -0.5px; }
    
    .nav-links { list-style: none; padding: 0; margin: 0; flex: 1; }
    .nav-links li { display: flex; align-items: center; gap: 12px; padding: 14px 16px; margin-bottom: 8px; cursor: pointer; border-radius: 12px; transition: all 0.2s ease; color: var(--text-secondary); font-weight: 500; }
    .nav-links li:hover { background: var(--bna-light-grey); color: var(--bna-green); }
    .nav-links li.active { background: rgba(0, 135, 102, 0.08); color: var(--bna-green); font-weight: 600; }
    .nav-links li svg { transition: transform 0.2s; }
    .nav-links li:hover svg { transform: translateX(2px); }
    
    .nav-footer { margin-top: auto; }
    .help-box { background: var(--bna-light-grey); padding: 16px; border-radius: 16px; display: flex; flex-direction: column; gap: 4px; }
    .help-box span { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .help-box small { font-size: 11px; color: var(--text-secondary); }
    
    .main-content { flex: 1; overflow-y: auto; position: relative; }
    .main-content.full-width { width: 100%; }

    /* Responsive Styles */
    @media (max-width: 768px) {
      .side-nav {
        width: 80px;
        padding: 32px 10px;
      }
      .app-name, .nav-links li span, .help-box, .nav-footer {
        display: none;
      }
      .nav-branding {
        justify-content: center;
        margin-bottom: 30px;
      }
      .nav-links li {
        justify-content: center;
        padding: 14px;
      }
      .nav-links li svg {
        margin: 0;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'Action en Défense BNA';
  showConfirm = false;
  confirmConfig: ConfirmDialogConfig = {};
  private currentResolver: ((value: boolean) => void) | null = null;

  constructor(
    public authService: AuthService, 
    private router: Router,
    private confirmDialog: ConfirmDialogService
  ) { }

  ngOnInit() {
    this.confirmDialog.confirm$.subscribe(data => {
      this.confirmConfig = data.config;
      this.showConfirm = true;
      this.currentResolver = data.resolve;
    });
  }

  onConfirmed() {
    if (this.currentResolver) {
      this.currentResolver(true);
      this.currentResolver = null;
    }
    this.showConfirm = false;
  }

  onCancelled() {
    if (this.currentResolver) {
      this.currentResolver(false);
      this.currentResolver = null;
    }
    this.showConfirm = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
