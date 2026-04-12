import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  // Always start with sidebar open for better usability
  private sidebarOpen = new BehaviorSubject<boolean>(true);
  sidebarOpen$ = this.sidebarOpen.asObservable();

  constructor(private router: Router) { 
    // Side bar remains open usually, no auto-close needed
    /*
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.close();
    });
    */
  }

  toggle() {
    const newState = !this.sidebarOpen.value;
    this.setOpen(newState);
  }

  close() {
    this.setOpen(false);
  }

  setOpen(open: boolean) {
    this.sidebarOpen.next(open);
    localStorage.setItem('sidebar', open ? 'open' : 'closed');
  }

  isOpen(): boolean {
    return this.sidebarOpen.value;
  }

  navigate(path: string, queryParams?: any) {
    this.router.navigate([path], { queryParams });
    this.close();
  }
}
