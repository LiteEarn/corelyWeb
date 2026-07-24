import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../core/config/api.config';
import {
  ComercialBooking, ComercialBookingAgendaFilters, ComercialCancelBookingRequest,
  ComercialConflictResponse, ComercialAvailabilityResponse, ComercialBookingDashboard,
  ComercialTimeBlock, Page
} from './comercial-booking.model';

@Injectable({ providedIn: 'root' })
export class ComercialBookingService {
  private apiUrl = API_CONFIG.baseURL + '/comercial/bookings';
  private timeBlocksUrl = API_CONFIG.baseURL + '/comercial/time-blocks';

  constructor(private http: HttpClient) {}

  create(classSessionId: string, studentId: string): Observable<ComercialBooking> {
    return this.http.post<ComercialBooking>(this.apiUrl, { classSessionId, studentId });
  }

  getById(id: string): Observable<ComercialBooking> {
    return this.http.get<ComercialBooking>(`${this.apiUrl}/${id}`);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAgenda(filters: ComercialBookingAgendaFilters): Observable<Page<ComercialBooking>> {
    let params = new HttpParams()
      .set('startDate', filters.startDate)
      .set('endDate', filters.endDate);
    if (filters.instructorId) params = params.set('instructorId', filters.instructorId);
    if (filters.roomId !== undefined) params = params.set('roomId', filters.roomId.toString());
    if (filters.studentId) params = params.set('studentId', filters.studentId);
    return this.http.get<Page<ComercialBooking>>(`${this.apiUrl}/agenda`, { params });
  }

  getConflicts(id: string): Observable<ComercialConflictResponse[]> {
    return this.http.get<ComercialConflictResponse[]>(`${this.apiUrl}/${id}/conflicts`);
  }

  getAvailability(date: string, instructorId?: string, roomId?: number): Observable<ComercialAvailabilityResponse[]> {
    let params = new HttpParams().set('date', date);
    if (instructorId) params = params.set('instructorId', instructorId);
    if (roomId !== undefined) params = params.set('roomId', roomId.toString());
    return this.http.get<ComercialAvailabilityResponse[]>(`${this.apiUrl}/availability`, { params });
  }

  confirm(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/confirm`, {});
  }

  cancel(id: string, request: ComercialCancelBookingRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/cancel`, request);
  }

  reschedule(id: string, newClassSessionId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/reschedule`, { newClassSessionId });
  }

  markNoShow(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/no-show`, {});
  }

  markCompleted(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/complete`, {});
  }

  getDashboardMetrics(date?: string): Observable<ComercialBookingDashboard> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<ComercialBookingDashboard>(`${this.apiUrl}/dashboard`, { params });
  }

  getTimeBlocks(instructorId?: string, roomId?: number): Observable<Page<ComercialTimeBlock>> {
    let params = new HttpParams();
    if (instructorId) params = params.set('instructorId', instructorId);
    if (roomId !== undefined) params = params.set('roomId', roomId.toString());
    return this.http.get<Page<ComercialTimeBlock>>(this.timeBlocksUrl, { params });
  }

  createTimeBlock(block: ComercialTimeBlock): Observable<ComercialTimeBlock> {
    return this.http.post<ComercialTimeBlock>(this.timeBlocksUrl, block);
  }

  deleteTimeBlock(id: string): Observable<void> {
    return this.http.delete<void>(`${this.timeBlocksUrl}/${id}`);
  }
}
