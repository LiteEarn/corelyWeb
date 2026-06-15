import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Attendance, AttendanceFilters } from './attendance.model';
import { AttendanceBulkRequest } from './attendance-bulk-request.model';
import { API_CONFIG } from '../../core/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = API_CONFIG.baseURL + API_CONFIG.endpoints.attendance;

  constructor(private http: HttpClient) { }

  getAll(filters?: AttendanceFilters): Observable<Attendance[]> {
    let params = new HttpParams();
    if (filters?.classGroupId) {
      params = params.set('classGroupId', filters.classGroupId);
    }
    if (filters?.attendanceDate) {
      params = params.set('attendanceDate', filters.attendanceDate);
    }
    return this.http.get<Attendance[]>(this.apiUrl, { params });
  }

  getByClassGroupId(classGroupId: string): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.apiUrl}/class-group/${classGroupId}`);
  }

  getByClassGroupIdAndDate(classGroupId: string, attendanceDate: string): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.apiUrl}/class-group/${classGroupId}/date/${attendanceDate}`);
  }

  bulkCreate(bulkRequest: AttendanceBulkRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/bulk`, bulkRequest);
  }
}
