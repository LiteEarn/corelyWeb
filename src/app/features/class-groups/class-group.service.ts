import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ClassGroup, ClassGroupFilters } from './class-group.model';
import { API_CONFIG } from '../../core/config/api.config';

export interface InactivateResponse {
  confirmationRequired?: boolean;
  activeEnrollments?: number;
  message?: string;
}

export interface InactivateRequest {
  cascadeEnrollments: boolean;
  enrollmentIds?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ClassGroupService {
  private apiUrl = API_CONFIG.baseURL + API_CONFIG.endpoints.classGroups;

  constructor(private http: HttpClient) { }

  getAll(filters?: ClassGroupFilters): Observable<ClassGroup[]> {
    let params = new HttpParams();
    if (filters?.search) {
      params = params.set('search', filters.search);
    }
    if (filters?.instructorId) {
      params = params.set('instructorId', filters.instructorId);
    }
    if (filters?.active !== undefined) {
      params = params.set('active', filters.active.toString());
    }
    return this.http.get<ClassGroup[]>(this.apiUrl, { params });
  }

  getById(id: string): Observable<ClassGroup> {
    return this.http.get<ClassGroup>(`${this.apiUrl}/${id}`);
  }

  create(classGroup: ClassGroup): Observable<ClassGroup> {
    console.log('create chamado', classGroup);
    return this.http.post<ClassGroup>(this.apiUrl, classGroup);
  }

  update(id: string, classGroup: ClassGroup): Observable<ClassGroup> {
    return this.http.put<ClassGroup>(`${this.apiUrl}/${id}`, classGroup);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  inactivate(id: string, request: InactivateRequest): Observable<InactivateResponse | void> {
    console.log('[CG-002] Service - inactivate called with id:', id, 'request:', request);
    return this.http.post<void | InactivateResponse>(`${this.apiUrl}/${id}/inactivate`, request);
  }
}
