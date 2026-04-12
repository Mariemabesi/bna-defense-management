import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchSubject = new BehaviorSubject<string>('');
  searchQuery$ = this.searchSubject.asObservable().pipe(
    debounceTime(300),
    distinctUntilChanged()
  );

  updateSearch(query: string) {
    this.searchSubject.next(query);
  }

  get currentQuery(): string {
    return this.searchSubject.getValue();
  }
}
