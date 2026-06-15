import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClassGroup, ClassGroupFilters } from './class-group.model';
import { API_CONFIG } from '../../core/config/api.config';

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
}
