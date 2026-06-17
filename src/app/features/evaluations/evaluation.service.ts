import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Evaluation, EvaluationFilters } from './evaluation.model';
import { API_CONFIG } from '../../core/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  private apiUrl = API_CONFIG.baseURL + API_CONFIG.endpoints.evaluations;

  constructor(private http: HttpClient) { }

  getAll(filters?: EvaluationFilters): Observable<Evaluation[]> {
    let params = new HttpParams();
    if (filters?.studentId) {
      params = params.set('studentId', filters.studentId);
    }
    if (filters?.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      params = params.set('endDate', filters.endDate);
    }
    return this.http.get<Evaluation[]>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Evaluation> {
    return this.http.get<Evaluation>(`${this.apiUrl}/${id}`);
  }

  create(evaluation: Evaluation): Observable<Evaluation> {
    console.log('EvaluationService create chamado', evaluation);
    return this.http.post<Evaluation>(this.apiUrl, evaluation);
  }

  update(id: string, evaluation: Evaluation): Observable<Evaluation> {
    return this.http.put<Evaluation>(`${this.apiUrl}/${id}`, evaluation);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
