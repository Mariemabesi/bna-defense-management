import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="show" (click)="onCancel()" aria-modal="true" role="dialog">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="warning-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <h3>{{ title }}</h3>
        </div>
        <div class="modal-body">
          <p>{{ message }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" (click)="onCancel()">{{ cancelLabel }}</button>
          <button class="btn-confirm" (click)="onConfirm()" #confirmBtn>{{ confirmLabel }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center; z-index: 9999;
      animation: fadeIn 0.2s ease-out;
    }
    .modal-content {
      background: white; width: 440px; border-radius: 24px; padding: 32px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden;
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .modal-header { display: flex; flex-direction: column; align-items: center; gap: 16px; margin-bottom: 24px; }
    .warning-icon {
      width: 64px; height: 64px; background: #fff7ed; color: #f97316;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
    }
    h3 { margin: 0; font-size: 20px; color: #1e293b; font-weight: 800; }
    .modal-body { text-align: center; margin-bottom: 32px; }
    .modal-body p { color: #64748b; font-size: 16px; font-weight: 500; line-height: 1.5; }
    .modal-footer { display: flex; gap: 12px; }
    button {
      flex: 1; padding: 14px; border-radius: 14px; font-size: 15px; font-weight: 700;
      cursor: pointer; transition: all 0.2s; border: none; outline: none;
    }
    button:focus { box-shadow: 0 0 0 4px rgba(0, 135, 102, 0.1); }
    .btn-cancel { background: #f1f5f9; color: #64748b; }
    .btn-cancel:hover { background: #e2e8f0; }
    .btn-confirm { background: #008766; color: white; }
    .btn-confirm:hover { background: #007256; transform: translateY(-1px); box-shadow: 0 10px 15px -3px rgba(0, 135, 102, 0.3); }
    .btn-confirm:active { transform: translateY(0); }
  `]
})
export class ConfirmDialogComponent {
  @Input() show = false;
  @Input() title = 'Confirmation';
  @Input() message = 'Êtes-vous sûr de vouloir effectuer cette action ? Cette opération est irréversible.';
  @Input() confirmLabel = 'Confirmer';
  @Input() cancelLabel = 'Annuler';
  
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  @HostListener('window:keydown.escape', ['$event'])
  handleEscape() { if (this.show) this.onCancel(); }

  @HostListener('window:keydown.enter', ['$event'])
  handleEnter() { if (this.show) this.onConfirm(); }

  onConfirm() { this.confirmed.emit(); this.show = false; }
  onCancel() { this.cancelled.emit(); this.show = false; }
}
