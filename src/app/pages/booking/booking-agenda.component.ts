import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DsPageHeaderComponent, DsStatusChipComponent, DsEmptyStateComponent } from '../../shared/design-system';
import { BookingService } from '../../features/booking/booking.service';
import { Booking, BookingStatus, AvailabilityResponse } from '../../features/booking/booking.model';
import { SessionService } from '../../core/session/session.service';
import { FeatureGateService } from '../../core/rbac/feature-gate.service';

@Component({
  selector: 'app-booking-agenda',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatButtonModule, MatIconModule, MatCardModule, MatTabsModule,
    MatSelectModule, MatFormFieldModule, MatInputModule,
    MatDatepickerModule, MatNativeDateModule, MatDialogModule, MatProgressSpinnerModule, MatTooltipModule,
    DsPageHeaderComponent, DsStatusChipComponent, DsEmptyStateComponent
  ],
  templateUrl: './booking-agenda.component.html',
  styleUrl: './booking-agenda.component.scss'
})
export class BookingAgendaComponent implements OnInit {
  private bookingService = inject(BookingService);
  private sessionService = inject(SessionService);
  private featureGateService = inject(FeatureGateService);
  private dialog = inject(MatDialog);

  viewMode: 'day' | 'week' | 'month' = 'day';
  currentDate: Date = new Date();
  bookings: Booking[] = [];
  timeSlots: number[] = [];
  loading = false;
  weekDays: Date[] = [];
  calendarDays: Date[] = [];

  weekDayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  constructor() {
    for (let i = 6; i <= 22; i++) {
      this.timeSlots.push(i);
    }
  }

  ngOnInit() {
    if (this.featureGateService.canLoadStudents()) {
      this.buildWeek();
      this.buildCalendar();
      this.loadBookings();
    }
  }

  get studioId(): string {
    return this.sessionService.currentStudio()?.id ?? '';
  }

  loadBookings() {
    this.loading = true;
    const { start, end } = this.getDateRange();
    this.bookingService.getAgenda({
      studioId: this.studioId,
      startDate: start,
      endDate: end
    }).subscribe({
      next: (data) => {
        this.bookings = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  private getDateRange(): { start: string; end: string } {
    switch (this.viewMode) {
      case 'day':
        return {
          start: this.toLocalDateTimeStr(this.currentDate, 0, 0, 0),
          end: this.toLocalDateTimeStr(this.currentDate, 23, 59, 59)
        };
      case 'week': {
        const weekStart = this.weekDays[0];
        const weekEnd = this.weekDays[6];
        return {
          start: this.toLocalDateTimeStr(weekStart, 0, 0, 0),
          end: this.toLocalDateTimeStr(weekEnd, 23, 59, 59)
        };
      }
      case 'month': {
        const first = this.calendarDays[0];
        const last = this.calendarDays[this.calendarDays.length - 1];
        return {
          start: this.toLocalDateTimeStr(first, 0, 0, 0),
          end: this.toLocalDateTimeStr(last, 23, 59, 59)
        };
      }
    }
  }

  private toLocalDateTimeStr(date: Date, hour: number, min: number, sec: number): string {
    const d = new Date(date);
    d.setHours(hour, min, sec, 0);
    return d.toISOString().slice(0, 19);
  }

  navigate(delta: number) {
    switch (this.viewMode) {
      case 'day':
        this.currentDate = this.addDays(this.currentDate, delta);
        break;
      case 'week':
        this.currentDate = this.addDays(this.currentDate, delta * 7);
        this.buildWeek();
        break;
      case 'month':
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + delta, 1);
        this.buildCalendar();
        break;
    }
    this.loadBookings();
  }

  goToday() {
    this.currentDate = new Date();
    this.buildWeek();
    this.buildCalendar();
    this.loadBookings();
  }

  onViewChange(mode: 'day' | 'week' | 'month') {
    this.viewMode = mode;
    this.buildWeek();
    this.buildCalendar();
    this.loadBookings();
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  buildWeek() {
    this.weekDays = [];
    const start = new Date(this.currentDate);
    start.setDate(start.getDate() - start.getDay() + (start.getDay() === 0 ? -6 : 1));
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      this.weekDays.push(day);
    }
  }

  buildCalendar() {
    this.calendarDays = [];
    const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);

    for (let i = firstDay.getDay(); i > 0; i--) {
      const d = new Date(firstDay);
      d.setDate(d.getDate() - i);
      this.calendarDays.push(d);
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      this.calendarDays.push(new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), d));
    }
    const remaining = 42 - this.calendarDays.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(lastDay);
      d.setDate(lastDay.getDate() + i);
      this.calendarDays.push(d);
    }
  }

  getBookingsForHour(hour: number): Booking[] {
    return this.bookings.filter(b => new Date(b.startDateTime).getHours() === hour);
  }

  getBookingsForDay(day: Date): Booking[] {
    const dateStr = this.formatDate(day);
    return this.bookings.filter(b => this.formatDate(new Date(b.startDateTime)) === dateStr);
  }

  isToday(day: Date): boolean {
    return this.formatDate(day) === this.formatDate(new Date());
  }

  isCurrentMonth(day: Date): boolean {
    return day.getMonth() === this.currentDate.getMonth();
  }

  formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  formatTime(dateStr: string): string {
    return dateStr.slice(11, 16);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      SCHEDULED: 'status-scheduled',
      CONFIRMED: 'status-confirmed',
      COMPLETED: 'status-completed',
      CANCELLED: 'status-cancelled',
      NO_SHOW: 'status-no-show'
    };
    return map[status] || '';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      SCHEDULED: 'Agendada',
      CONFIRMED: 'Confirmada',
      COMPLETED: 'Concluída',
      CANCELLED: 'Cancelada',
      NO_SHOW: 'Falta'
    };
    return map[status] || status;
  }

  confirmBooking(booking: Booking) {
    if (!booking.id) return;
    this.bookingService.confirm(booking.id).subscribe(() => this.loadBookings());
  }

  cancelBooking(booking: Booking) {
    if (!booking.id) return;
    const reason = prompt('Motivo do cancelamento (STUDENT, STUDIO, INSTRUCTOR, WEATHER, OTHER):');
    if (reason) {
      this.bookingService.cancel(booking.id, reason).subscribe(() => this.loadBookings());
    }
  }

  completeBooking(booking: Booking) {
    if (!booking.id) return;
    this.bookingService.markCompleted(booking.id).subscribe(() => this.loadBookings());
  }

  noShowBooking(booking: Booking) {
    if (!booking.id) return;
    this.bookingService.markNoShow(booking.id).subscribe(() => this.loadBookings());
  }
}
