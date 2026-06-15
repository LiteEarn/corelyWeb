import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Session, SessionFilters } from './session.model';
import { API_CONFIG } from '../../core/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private apiUrl = API_CONFIG.baseURL + API_CONFIG.endpoints.sessions;

  constructor(private http: HttpClient) { }

  getAll(filters?: SessionFilters): Observable<Session[]> {
    let params = new HttpParams();
    if (filters?.search) {
      params = params.set('search', filters.search);
    }
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.instructorId) {
      params = params.set('instructorId', filters.instructorId);
    }
    return this.http.get<Session[]>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Session> {
    return this.http.get<Session>(`${this.apiUrl}/${id}`);
  }

  create(session: Session): Observable<Session> {
    return this.http.post<Session>(this.apiUrl, session);
  }

  update(id: string, session: Session): Observable<Session> {
    return this.http.put<Session>(`${this.apiUrl}/${id}`, session);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
