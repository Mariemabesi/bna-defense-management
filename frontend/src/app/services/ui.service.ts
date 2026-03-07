import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class UiService {
    private sidebarVisible = new BehaviorSubject<boolean>(false);
    sidebarVisible$ = this.sidebarVisible.asObservable();

    constructor(private router: Router) { }

    toggleSidebar() {
        this.sidebarVisible.next(!this.sidebarVisible.value);
    }

    hideSidebar() {
        this.sidebarVisible.next(false);
    }

    navigate(path: string, queryParams?: any) {
        this.router.navigate([path], { queryParams });
        this.hideSidebar();
    }
}
