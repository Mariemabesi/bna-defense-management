import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ConfirmDialogConfig {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  private confirmSubject = new Subject<{ config: ConfirmDialogConfig, resolve: (value: boolean) => void }>();
  confirm$ = this.confirmSubject.asObservable();

  open(config: ConfirmDialogConfig): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.confirmSubject.next({
        config: {
          title: config.title || 'Confirmation',
          message: config.message || 'Êtes-vous sûr de vouloir effectuer cette action ? Cette opération est irréversible.',
          confirmLabel: config.confirmLabel || 'Confirmer',
          cancelLabel: config.cancelLabel || 'Annuler'
        },
        resolve: (confirmed: boolean) => {
          observer.next(confirmed);
          observer.complete();
        }
      });
    });
  }
}
