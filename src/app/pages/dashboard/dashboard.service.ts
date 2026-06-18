import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators'; // Import tap operator
import { DashboardData } from './dashboard.model';
import { API_CONFIG } from '../../core/config/api.config';
import { CurrentStudioService } from '../../core/services/current-studio.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = API_CONFIG.baseURL + '/dashboard';

  constructor(
    private http: HttpClient,
    private currentStudioService: CurrentStudioService
  ) {}

  getDashboard(): Observable<DashboardData> {
    const studioId = this.currentStudioService.getStudioId();
    const params = new HttpParams().set('studioId', studioId);
    console.log('[DashboardService] Fetching dashboard data for studioId:', studioId);
    return this.http.get<DashboardData>(this.apiUrl, { params }).pipe(
      tap(response => console.log('Dashboard API response', response)) // Add log for API response
    );
  }
}
