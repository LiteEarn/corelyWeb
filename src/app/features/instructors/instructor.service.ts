import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Instructor, InstructorFilters } from './instructor.model';
import { API_CONFIG } from '../../core/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class InstructorService {
  private apiUrl = API_CONFIG.baseURL + API_CONFIG.endpoints.instructors;

  constructor(private http: HttpClient) { }

  getAll(filters?: InstructorFilters): Observable<Instructor[]> {
    let params = new HttpParams();
    if (filters?.search) {
      params = params.set('search', filters.search);
    }
    if (filters?.active !== undefined) {
      params = params.set('active', filters.active.toString());
    }
    if (filters?.specialty) {
      params = params.set('specialty', filters.specialty);
    }
    return this.http.get<Instructor[]>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Instructor> {
    return this.http.get<Instructor>(`${this.apiUrl}/${id}`);
  }

  create(instructor: Instructor): Observable<Instructor> {
    console.log('InstructorService create chamado', instructor);
    return this.http.post<Instructor>(this.apiUrl, instructor);
  }

  update(id: string, instructor: Instructor): Observable<Instructor> {
    return this.http.put<Instructor>(`${this.apiUrl}/${id}`, instructor);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
