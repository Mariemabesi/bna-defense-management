import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = 'http://localhost:8082/api/search';
  private searchSubject = new BehaviorSubject<string>('');
  
  searchQuery$ = this.searchSubject.asObservable().pipe(
    debounceTime(300),
    distinctUntilChanged()
  );

  constructor(private http: HttpClient) {}

  updateSearch(query: string) {
    this.searchSubject.next(query);
  }

  globalSearch(query: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/global?q=${query}`);
  }

  get currentQuery(): string {
    return this.searchSubject.getValue();
  }
}
