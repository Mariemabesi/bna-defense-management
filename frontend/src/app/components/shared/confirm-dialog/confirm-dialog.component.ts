import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="onCancel.emit()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ title }}</h3>
          <button class="btn-close" (click)="onCancel.emit()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="modal-body">
          <p class="message">{{ message }}</p>
          <p class="warning">Cette opération est irréversible.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" (click)="onCancel.emit()">{{ cancelLabel }}</button>
          <button class="btn-primary" (click)="onConfirm.emit()">{{ confirmLabel }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center; z-index: 3000;
      animation: fadeIn 0.2s ease-out;
    }
    .modal-content {
      background: white; border-radius: 24px; width: 100%; max-width: 440px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden;
      animation: zoomIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .modal-header {
      padding: 24px 32px; border-bottom: 1px solid #f1f5f9;
      display: flex; justify-content: space-between; align-items: center;
    }
    .modal-header h3 { margin: 0; font-size: 18px; font-weight: 800; color: #1e293b; }
    .btn-close {
      background: none; border: none; cursor: pointer; color: #94a3b8;
      display: flex; align-items: center; justify-content: center; transition: 0.2s;
    }
    .btn-close:hover { color: #ef4444; transform: rotate(90deg); }
    
    .modal-body { padding: 32px; text-align: center; }
    .message { font-size: 15px; color: #334155; font-weight: 600; line-height: 1.6; margin-bottom: 8px; }
    .warning { font-size: 13px; color: #ef4444; font-weight: 700; margin: 0; }
    
    .modal-footer { padding: 24px 32px; background: #f8fafc; display: flex; gap: 12px; }
    .btn-primary { 
      flex: 1; background: #008766; color: white; border: none; padding: 12px; 
      border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s;
    }
    .btn-secondary { 
      flex: 1; background: white; color: #64748b; border: 1.5px solid #e2e8f0; 
      padding: 12px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s;
    }
    .btn-primary:hover { background: #007256; transform: translateY(-2px); }
    .btn-secondary:hover { background: #f1f5f9; border-color: #cbd5e1; transform: translateY(-2px); }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes zoomIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
  `]
})
export class ConfirmDialogComponent {
  @Input() title: string = 'Confirmation';
  @Input() message: string = 'Êtes-vous sûr de vouloir effectuer cette action ?';
  @Input() confirmLabel: string = 'Confirmer';
  @Input() cancelLabel: string = 'Annuler';

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') this.onCancel.emit();
    if (event.key === 'Enter') this.onConfirm.emit();
  }
}
