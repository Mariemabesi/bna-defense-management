import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="show" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="warning-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <h3>{{ title }}</h3>
        </div>
        <div class="modal-body">
          <p class="message">{{ message }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" (click)="onCancel()">{{ cancelLabel }}</button>
          <button class="btn-primary" (click)="onConfirm()">{{ confirmLabel }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center; z-index: 9999;
      animation: fadeIn 0.2s ease-out;
    }
    .modal-content {
      background: white; border-radius: 24px; width: 100%; max-width: 440px; padding: 32px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden;
      animation: zoomIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .modal-header {
      display: flex; flex-direction: column; align-items: center; gap: 16px; margin-bottom: 24px;
    }
    .warning-icon {
      width: 64px; height: 64px; background: #fff7ed; color: #f97316;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
    }
    .modal-header h3 { margin: 0; font-size: 20px; font-weight: 800; color: #1e293b; }
    
    .modal-body { text-align: center; margin-bottom: 32px; }
    .message { font-size: 16px; color: #64748b; font-weight: 500; line-height: 1.6; }
    
    .modal-footer { display: flex; gap: 12px; }
    .btn-primary { 
      flex: 1; background: #008766; color: white; border: none; padding: 14px; 
      border-radius: 14px; font-weight: 700; cursor: pointer; transition: 0.2s;
    }
    .btn-secondary { 
      flex: 1; background: #f1f5f9; color: #64748b; border: none; 
      padding: 14px; border-radius: 14px; font-weight: 700; cursor: pointer; transition: 0.2s;
    }
    .btn-primary:hover { background: #007256; transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 135, 102, 0.3); }
    .btn-secondary:hover { background: #e2e8f0; transform: translateY(-2px); }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes zoomIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
  `]
})
export class ConfirmDialogComponent {
  @Input() show: boolean = false;
  @Input() title: string = 'Confirmation';
  @Input() message: string = 'Êtes-vous sûr de vouloir effectuer cette action ?';
  @Input() confirmLabel: string = 'Confirmer';
  @Input() cancelLabel: string = 'Annuler';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (!this.show) return;
    if (event.key === 'Escape') this.onCancel();
    if (event.key === 'Enter') this.onConfirm();
  }
}
