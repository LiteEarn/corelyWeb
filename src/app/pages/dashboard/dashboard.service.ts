import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../core/config/api.config';
import { DashboardOperationalResponse } from './dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.dashboard}/operational`;

  constructor(private http: HttpClient) {}

  getOperationalDashboard(): Observable<DashboardOperationalResponse> {
    return this.http.get<DashboardOperationalResponse>(this.apiUrl);
  }
}
