import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DailyScheduleResponse, DailyScheduleFilters } from './daily-schedule.model';
import { API_CONFIG } from '../../core/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class DailyScheduleService {
  private apiUrl = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.sessions}/daily`;

  constructor(private http: HttpClient) {}

  getDailySchedule(filters?: DailyScheduleFilters): Observable<DailyScheduleResponse> {
    let params = new HttpParams();
    if (filters?.studioId) {
      params = params.set('studioId', filters.studioId);
    }
    if (filters?.date) {
      params = params.set('date', filters.date);
    }
    if (filters?.instructorId) {
      params = params.set('instructorId', filters.instructorId);
    }
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.classGroupId) {
      params = params.set('classGroupId', filters.classGroupId);
    }
    return this.http.get<DailyScheduleResponse>(this.apiUrl, { params });
  }
}
