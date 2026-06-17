import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Evolution, EvolutionFilters } from './evolution.model';
import { API_CONFIG } from '../../core/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class EvolutionService {
  private apiUrl = API_CONFIG.baseURL + API_CONFIG.endpoints.evolutions;

  constructor(private http: HttpClient) { }

  getAll(filters?: EvolutionFilters): Observable<Evolution[]> {
    let params = new HttpParams();
    if (filters?.studentId) {
      params = params.set('studentId', filters.studentId);
    }
    if (filters?.objectiveId) {
      params = params.set('objectiveId', filters.objectiveId);
    }
    if (filters?.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      params = params.set('endDate', filters.endDate);
    }
    if (filters?.title) {
      params = params.set('title', filters.title);
    }
    return this.http.get<Evolution[]>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Evolution> {
    return this.http.get<Evolution>(`${this.apiUrl}/${id}`);
  }

  create(evolution: Evolution): Observable<Evolution> {
    console.log('EvolutionService create chamado', evolution);
    return this.http.post<Evolution>(this.apiUrl, evolution);
  }

  update(id: string, evolution: Evolution): Observable<Evolution> {
    return this.http.put<Evolution>(`${this.apiUrl}/${id}`, evolution);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
