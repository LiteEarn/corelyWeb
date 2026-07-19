import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../core/config/api.config';
import {
  Booking,
  BookingFilters,
  TimeBlock,
  AvailabilityResponse,
  ConflictResponse,
  DashboardBookingMetrics
} from './booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private apiUrl = API_CONFIG.baseURL + '/bookings';

  constructor(private http: HttpClient) {}

  create(booking: Booking): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, booking);
  }

  getById(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAgenda(filters: BookingFilters): Observable<Booking[]> {
    let params = new HttpParams()
      .set('studioId', filters.studioId!)
      .set('startDate', filters.startDate!)
      .set('endDate', filters.endDate!);
    return this.http.get<Booking[]>(`${this.apiUrl}/agenda`, { params });
  }

  getConflicts(id: string): Observable<ConflictResponse[]> {
    return this.http.get<ConflictResponse[]>(`${this.apiUrl}/${id}/conflicts`);
  }

  getAvailability(studioId: string, instructorId: string, date: string, roomId?: number): Observable<AvailabilityResponse[]> {
    let params = new HttpParams()
      .set('studioId', studioId)
      .set('instructorId', instructorId)
      .set('date', date);
    if (roomId !== undefined && roomId !== null) {
      params = params.set('roomId', roomId.toString());
    }
    return this.http.get<AvailabilityResponse[]>(`${this.apiUrl}/availability`, { params });
  }

  confirm(id: string): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${id}/confirm`, {});
  }

  cancel(id: string, reason: string, notes?: string): Observable<Booking> {
    let params = new HttpParams().set('reason', reason);
    if (notes) { params = params.set('notes', notes); }
    return this.http.put<Booking>(`${this.apiUrl}/${id}/cancel`, {}, { params });
  }

  reschedule(id: string, startDateTime: string, endDateTime: string): Observable<Booking> {
    let params = new HttpParams()
      .set('startDateTime', startDateTime)
      .set('endDateTime', endDateTime);
    return this.http.put<Booking>(`${this.apiUrl}/${id}/reschedule`, {}, { params });
  }

  markNoShow(id: string): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${id}/no-show`, {});
  }

  markCompleted(id: string): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/${id}/complete`, {});
  }

  getDashboardMetrics(studioId: string): Observable<DashboardBookingMetrics> {
    let params = new HttpParams().set('studioId', studioId);
    return this.http.get<DashboardBookingMetrics>(`${this.apiUrl}/dashboard`, { params });
  }

  getTimeBlocks(studioId: string, startDate: string, endDate: string): Observable<TimeBlock[]> {
    let params = new HttpParams()
      .set('studioId', studioId)
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<TimeBlock[]>(`${this.apiUrl}/time-blocks`, { params });
  }

  createTimeBlock(block: TimeBlock): Observable<TimeBlock> {
    return this.http.post<TimeBlock>(`${this.apiUrl}/time-blocks`, block);
  }

  deleteTimeBlock(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/time-blocks/${id}`);
  }
}
