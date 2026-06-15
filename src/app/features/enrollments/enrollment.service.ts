import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Enrollment, EnrollmentFilters } from './enrollment.model';
import { API_CONFIG } from '../../core/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private apiUrl = API_CONFIG.baseURL + API_CONFIG.endpoints.enrollments;

  constructor(private http: HttpClient) { }

  getAll(filters?: EnrollmentFilters): Observable<Enrollment[]> {
    let params = new HttpParams();
    if (filters?.studentId) {
      params = params.set('studentId', filters.studentId);
    }
    if (filters?.classGroupId) {
      params = params.set('classGroupId', filters.classGroupId);
    }
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    return this.http.get<Enrollment[]>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Enrollment> {
    return this.http.get<Enrollment>(`${this.apiUrl}/${id}`);
  }

  create(enrollment: Enrollment): Observable<Enrollment> {
    return this.http.post<Enrollment>(this.apiUrl, enrollment);
  }

  update(id: string, enrollment: Enrollment): Observable<Enrollment> {
    return this.http.put<Enrollment>(`${this.apiUrl}/${id}`, enrollment);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getByClassGroupId(classGroupId: string): Observable<Enrollment[]> {
    return this.getAll({ classGroupId });
  }
}
