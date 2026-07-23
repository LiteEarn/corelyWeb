import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BookingAgendaComponent } from './booking-agenda.component';
import { SessionService } from '../../core/session/session.service';
import { FeatureGateService } from '../../core/rbac/feature-gate.service';
import { ComercialBookingService } from '../../features/comercial-booking/comercial-booking.service';
import { of } from 'rxjs';

describe('BookingAgendaComponent', () => {
  let component: BookingAgendaComponent;
  let fixture: ComponentFixture<BookingAgendaComponent>;
  let mockBookingService: jasmine.SpyObj<ComercialBookingService>;
  let mockFeatureGateService: jasmine.SpyObj<FeatureGateService>;

  beforeEach(async () => {
    mockBookingService = jasmine.createSpyObj('ComercialBookingService', [
      'getAgenda', 'confirm', 'cancel', 'markCompleted', 'markNoShow'
    ]);
    mockBookingService.getAgenda.and.returnValue(of({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 }));

    mockFeatureGateService = jasmine.createSpyObj('FeatureGateService', ['canLoadStudents']);
    mockFeatureGateService.canLoadStudents.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, NoopAnimationsModule, BookingAgendaComponent],
      providers: [
        SessionService,
        { provide: ComercialBookingService, useValue: mockBookingService },
        { provide: FeatureGateService, useValue: mockFeatureGateService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingAgendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have time slots from 6 to 22', () => {
    expect(component.timeSlots.length).toBe(17);
    expect(component.timeSlots[0]).toBe(6);
    expect(component.timeSlots[16]).toBe(22);
  });

  it('should build week with 7 days', () => {
    component.buildWeek();
    expect(component.weekDays.length).toBe(7);
  });

  it('should build calendar with multiple days', () => {
    component.buildCalendar();
    expect(component.calendarDays.length).toBeGreaterThanOrEqual(28);
  });

  it('should return correct status CSS class', () => {
    expect(component.getStatusClass('SCHEDULED')).toBe('status-scheduled');
    expect(component.getStatusClass('CONFIRMED')).toBe('status-confirmed');
    expect(component.getStatusClass('COMPLETED')).toBe('status-completed');
    expect(component.getStatusClass('CANCELLED')).toBe('status-cancelled');
    expect(component.getStatusClass('NO_SHOW')).toBe('status-no-show');
  });

  it('should return correct status label', () => {
    expect(component.getStatusLabel('SCHEDULED')).toBe('Agendada');
    expect(component.getStatusLabel('CONFIRMED')).toBe('Confirmada');
    expect(component.getStatusLabel('COMPLETED')).toBe('Concluída');
    expect(component.getStatusLabel('CANCELLED')).toBe('Cancelada');
    expect(component.getStatusLabel('NO_SHOW')).toBe('Falta');
  });

  it('should format date correctly', () => {
    const date = new Date(2024, 0, 15);
    expect(component.formatDate(date)).toBe('2024-01-15');
  });

  it('should load bookings on init', () => {
    expect(mockBookingService.getAgenda).toHaveBeenCalled();
  });

  it('should call confirm on service and reload', () => {
    mockBookingService.confirm.and.returnValue(of(void 0));
    component.confirmBooking({ id: '123' } as any);
    expect(mockBookingService.confirm).toHaveBeenCalledWith('123');
  });

  it('should call cancel on service with ComercialCancelBookingRequest', () => {
    spyOn(window, 'prompt').and.returnValue('Test reason');
    mockBookingService.cancel.and.returnValue(of(void 0));
    component.cancelBooking({ id: '456' } as any);
    expect(mockBookingService.cancel).toHaveBeenCalledWith('456', { reason: 'OTHER', description: 'Test reason' });
  });

  it('should call markCompleted on service and reload', () => {
    mockBookingService.markCompleted.and.returnValue(of(void 0));
    component.completeBooking({ id: '789' } as any);
    expect(mockBookingService.markCompleted).toHaveBeenCalledWith('789');
  });

  it('should call markNoShow on service and reload', () => {
    mockBookingService.markNoShow.and.returnValue(of(void 0));
    component.noShowBooking({ id: '101' } as any);
    expect(mockBookingService.markNoShow).toHaveBeenCalledWith('101');
  });

  it('should format time correctly from classSessionStartTime', () => {
    expect(component.formatTime('09:30:00')).toBe('09:30');
  });

  it('should combine classSessionDate and classSessionStartTime for datetime', () => {
    const booking = {
      classSessionDate: '2024-06-15',
      classSessionStartTime: '10:00:00'
    } as any;
    const dt = (component as any).getBookingDateTime(booking);
    expect(dt).toBe('2024-06-15T10:00:00');
  });
});
