import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="paginator-container">
      <div class="page-info">
        Page <strong>{{ currentPage + 1 }}</strong> sur <strong>{{ totalPages }}</strong>
        <span class="total-items">({{ totalElements }} éléments)</span>
      </div>
      
      <div class="pagination-controls">
        <button 
          class="page-btn prev" 
          [disabled]="currentPage === 0" 
          (click)="onPageChange(currentPage - 1)"
          title="Précédent">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"></path></svg>
        </button>
        
        <div class="page-numbers">
          <button 
            *ngFor="let page of visiblePages" 
            class="page-number" 
            [class.active]="page === currentPage"
            (click)="onPageChange(page)">
            {{ page + 1 }}
          </button>
        </div>

        <button 
          class="page-btn next" 
          [disabled]="currentPage >= totalPages - 1" 
          (click)="onPageChange(currentPage + 1)"
          title="Suivant">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"></path></svg>
        </button>
      </div>

      <div class="page-size">
        <select [value]="pageSize" (change)="onSizeChange($event)">
          <option [value]="5">5 / page</option>
          <option [value]="10">10 / page</option>
          <option [value]="20">20 / page</option>
          <option [value]="50">50 / page</option>
        </select>
      </div>
    </div>
  `,
  styles: [`
    .paginator-container {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 24px; background: white; border-top: 1px solid #f1f5f9;
      border-radius: 0 0 24px 24px; font-size: 14px; color: #64748b;
    }
    .page-info strong { color: #1e293b; font-weight: 700; }
    .total-items { margin-left: 8px; color: #94a3b8; font-size: 12px; }
    
    .pagination-controls { display: flex; align-items: center; gap: 8px; }
    .page-btn {
      width: 36px; height: 36px; border-radius: 10px; border: 1px solid #e2e8f0;
      background: white; color: #1e293b; display: flex; align-items: center;
      justify-content: center; cursor: pointer; transition: all 0.2s;
    }
    .page-btn:hover:not(:disabled) { background: #f8fafc; border-color: #cbd5e1; color: #008766; }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    
    .page-numbers { display: flex; gap: 4px; }
    .page-number {
      min-width: 36px; height: 36px; border-radius: 10px; border: none;
      background: transparent; color: #64748b; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
    }
    .page-number:hover { background: #f1f5f9; color: #1e293b; }
    .page-number.active { background: #008766; color: white; }
    
    .page-size select {
      padding: 6px 12px; border-radius: 8px; border: 1px solid #e2e8f0;
      background: #f8fafc; color: #1e293b; font-weight: 600; outline: none;
      cursor: pointer;
    }
    .page-size select:focus { border-color: #008766; }
  `]
})
export class PaginatorComponent {
  @Input() currentPage = 0;
  @Input() totalPages = 0;
  @Input() totalElements = 0;
  @Input() pageSize = 10;
  
  @Output() pageChange = new EventEmitter<number>();
  @Output() sizeChange = new EventEmitter<number>();

  get visiblePages(): number[] {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible);
    
    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }
    
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  }

  onPageChange(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.pageChange.emit(page);
    }
  }

  onSizeChange(event: any) {
    this.sizeChange.emit(parseInt(event.target.value, 10));
  }
}
