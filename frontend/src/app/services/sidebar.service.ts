import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  // Read state from localStorage, default to true (open) if not set
  private sidebarOpen = new BehaviorSubject<boolean>(localStorage.getItem('sidebar') !== 'closed');
  sidebarOpen$ = this.sidebarOpen.asObservable();

  constructor(private router: Router) { }

  toggle() {
    const newState = !this.sidebarOpen.value;
    this.sidebarOpen.next(newState);
    localStorage.setItem('sidebar', newState ? 'open' : 'closed');
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
    // Point 3: Sidebar must NOT auto-collapse on navigation
  }
}
