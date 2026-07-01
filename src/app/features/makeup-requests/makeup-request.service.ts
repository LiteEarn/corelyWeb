import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MakeupRequest, MakeupRequestFilters } from './makeup-request.model';
import { API_CONFIG } from '../../core/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class MakeupRequestService {
  private apiUrl = API_CONFIG.baseURL + '/makeup-requests';

  constructor(private http: HttpClient) { }

  getAll(filters?: MakeupRequestFilters): Observable<MakeupRequest[]> {
    let params = new HttpParams();
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.studentId) {
      params = params.set('studentId', filters.studentId);
    }
    if (filters?.instructorId) {
      params = params.set('instructorId', filters.instructorId);
    }
    if (filters?.absenceDate) {
      params = params.set('absenceDate', filters.absenceDate);
    }
    return this.http.get<MakeupRequest[]>(this.apiUrl, { params });
  }

  approve(id: string, body: { sessionId: string }): Observable<MakeupRequest> {
    return this.http.patch<MakeupRequest>(`${this.apiUrl}/${id}/approve`, body);
  }

  reject(id: string, body: { reason?: string }): Observable<MakeupRequest> {
    return this.http.patch<MakeupRequest>(`${this.apiUrl}/${id}/reject`, body);
  }
}
