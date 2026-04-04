import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private confirmSubject = new Subject<{ message: string, resolve: (value: boolean) => void }>();
  confirm$ = this.confirmSubject.asObservable();

  show(message: string = 'Êtes-vous sûr de vouloir effectuer cette action ?'): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmSubject.next({ message, resolve });
    });
  }
}
