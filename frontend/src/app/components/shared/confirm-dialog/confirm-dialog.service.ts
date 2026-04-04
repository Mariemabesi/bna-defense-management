import { Injectable, ApplicationRef, createComponent, ComponentRef, EnvironmentInjector, Type } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { ConfirmDialogComponent } from './confirm-dialog.component';

export interface ConfirmConfig {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  private componentRef?: ComponentRef<ConfirmDialogComponent>;

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  open(config: ConfirmConfig): Observable<boolean> {
    const confirmation$ = new Subject<boolean>();

    // 1. Create the component
    this.componentRef = createComponent(ConfirmDialogComponent, {
      environmentInjector: this.injector
    });

    // 2. Set inputs
    if (config.title) this.componentRef.instance.title = config.title;
    if (config.message) this.componentRef.instance.message = config.message;
    if (config.confirmLabel) this.componentRef.instance.confirmLabel = config.confirmLabel;
    if (config.cancelLabel) this.componentRef.instance.cancelLabel = config.cancelLabel;

    // 3. Set up outputs
    this.componentRef.instance.onConfirm.subscribe(() => {
      confirmation$.next(true);
      this.close();
    });

    this.componentRef.instance.onCancel.subscribe(() => {
      confirmation$.next(false);
      this.close();
    });

    // 4. Attach to app and DOM
    this.appRef.attachView(this.componentRef.hostView);
    const domElem = (this.componentRef.hostView as any).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    return confirmation$.asObservable();
  }

  private close() {
    if (this.componentRef) {
      this.appRef.detachView(this.componentRef.hostView);
      this.componentRef.destroy();
    }
  }
}
