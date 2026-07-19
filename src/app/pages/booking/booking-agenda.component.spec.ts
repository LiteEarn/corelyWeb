import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BookingAgendaComponent } from './booking-agenda.component';
import { SessionService } from '../../core/session/session.service';

describe('BookingAgendaComponent', () => {
  let component: BookingAgendaComponent;
  let fixture: ComponentFixture<BookingAgendaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, NoopAnimationsModule, BookingAgendaComponent],
      providers: [SessionService]
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
});
