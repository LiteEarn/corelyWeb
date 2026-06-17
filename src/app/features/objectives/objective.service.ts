import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Objective, ObjectiveFilters } from './objective.model';
import { API_CONFIG } from '../../core/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ObjectiveService {
  private apiUrl = API_CONFIG.baseURL + API_CONFIG.endpoints.objectives;

  constructor(private http: HttpClient) { }

  getAll(filters?: ObjectiveFilters): Observable<Objective[]> {
    let params = new HttpParams();
    if (filters?.search) {
      params = params.set('search', filters.search);
    }
    if (filters?.studentId) {
      params = params.set('studentId', filters.studentId);
    }
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    return this.http.get<Objective[]>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Objective> {
    return this.http.get<Objective>(`${this.apiUrl}/${id}`);
  }

  create(objective: Objective): Observable<Objective> {
    console.log('ObjectiveService create chamado', objective);
    return this.http.post<Objective>(this.apiUrl, objective);
  }

  update(id: string, objective: Objective): Observable<Objective> {
    return this.http.put<Objective>(`${this.apiUrl}/${id}`, objective);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
