import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { DailyAgendaComponent } from './daily-agenda.component';
import { SessionService } from '../../features/sessions/session.service';
import { Session } from '../../features/sessions/session.model';

function todayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

describe('DailyAgendaComponent', () => {
  let component: DailyAgendaComponent;
  let fixture: ComponentFixture<DailyAgendaComponent>;
  let sessionService: jasmine.SpyObj<SessionService>;

  const mockSessions: Session[] = [
    {
      id: 'session-1',
      studioId: 'studio-1',
      instructorId: 'inst-1',
      title: 'Ballet Infantil',
      scheduledDate: todayStr(),
      startTime: '08:00',
      endTime: '09:00',
      maxStudents: 20,
      status: 'SCHEDULED',
    },
    {
      id: 'session-2',
      studioId: 'studio-1',
      instructorId: 'inst-2',
      title: 'Pilates Avançado',
      scheduledDate: todayStr(),
      startTime: '09:00',
      endTime: '10:00',
      maxStudents: 15,
      status: 'IN_PROGRESS',
    },
    {
      id: 'session-3',
      studioId: 'studio-1',
      instructorId: 'inst-1',
      title: 'Alongamento',
      scheduledDate: todayStr(),
      startTime: '10:00',
      endTime: '11:00',
      maxStudents: 10,
      status: 'COMPLETED',
    },
    {
      id: 'session-4',
      studioId: 'studio-1',
      instructorId: 'inst-3',
      title: 'Gestantes',
      scheduledDate: todayStr(),
      startTime: '14:00',
      endTime: '15:00',
      maxStudents: 6,
      status: 'CANCELLED',
    },
  ];

  beforeEach(async () => {
    sessionService = jasmine.createSpyObj('SessionService', ['getAll']);
    sessionService.getAll.and.returnValue(of(mockSessions));

    await TestBed.configureTestingModule({
      imports: [DailyAgendaComponent],
      providers: [
        provideNoopAnimations(),
        { provide: SessionService, useValue: sessionService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DailyAgendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads sessions on init', () => {
    expect(sessionService.getAll).toHaveBeenCalled();
    expect(component.sessions.length).toBe(4);
  });

  it('renders session cards for each session', () => {
    const cards = fixture.nativeElement.querySelectorAll('.session-card');
    expect(cards.length).toBe(4);
  });

  it('shows session count', () => {
    const countEl = fixture.nativeElement.querySelector('.session-count');
    expect(countEl).toBeTruthy();
    expect(countEl.textContent).toContain('4');
    expect(countEl.textContent).toContain('sessões');
  });

  it('shows singular for 1 session', () => {
    sessionService.getAll.and.returnValue(of([mockSessions[0]]));
    component.loadSessions();
    fixture.detectChanges();

    const countEl = fixture.nativeElement.querySelector('.session-count');
    expect(countEl.textContent).toContain('1');
    expect(countEl.textContent).toContain('sessão');
  });

  it('shows loading state', () => {
    component.loading = true;
    component.error = null;
    fixture.detectChanges();

    const loading = fixture.nativeElement.querySelector('app-loading');
    expect(loading).toBeTruthy();
    const cards = fixture.nativeElement.querySelectorAll('.session-card');
    expect(cards.length).toBe(0);
  });

  it('shows error state', () => {
    component.loading = false;
    component.error = 'Erro ao carregar a agenda.';
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('ds-empty-state');
    expect(emptyState).toBeTruthy();
    expect(emptyState.textContent).toContain('Erro ao carregar');
  });

  it('shows empty state when no sessions', () => {
    sessionService.getAll.and.returnValue(of([]));
    component.loadSessions();
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('ds-empty-state');
    expect(emptyState).toBeTruthy();
    expect(emptyState.textContent).toContain('Nenhuma sessão encontrada');
  });

  it('handles error from API', () => {
    sessionService.getAll.and.returnValue(throwError(() => new Error('API error')));
    component.loadSessions();
    fixture.detectChanges();

    expect(component.error).toBe('Erro ao carregar a agenda. Tente novamente.');
    expect(component.loading).toBeFalse();
  });

  it('renders page header', () => {
    const header = fixture.nativeElement.querySelector('ds-page-header');
    expect(header).toBeTruthy();
  });

  it('shows today badge when date is today', () => {
    component.selectedDate = new Date();
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.today-badge');
    expect(badge).toBeTruthy();
  });

  it('hides today badge when date is not today', () => {
    component.selectedDate = new Date('2025-01-01');
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.today-badge');
    expect(badge).toBeFalsy();
  });

  it('retries loading on error action click', () => {
    sessionService.getAll.and.returnValue(throwError(() => new Error('API error')));
    component.loadSessions();
    fixture.detectChanges();

    expect(component.error).toBeTruthy();

    sessionService.getAll.and.returnValue(of(mockSessions));
    component.loadSessions();
    fixture.detectChanges();

    expect(component.error).toBeNull();
    expect(component.sessions.length).toBe(4);
  });

  describe('getStatusChip', () => {
    it('maps SCHEDULED to completed/Agendada', () => {
      const result = component.getStatusChip('SCHEDULED');
      expect(result.status).toBe('completed');
      expect(result.label).toBe('Agendada');
    });

    it('maps IN_PROGRESS to warning/Em andamento', () => {
      const result = component.getStatusChip('IN_PROGRESS');
      expect(result.status).toBe('warning');
      expect(result.label).toBe('Em andamento');
    });

    it('maps COMPLETED to success/Concluída', () => {
      const result = component.getStatusChip('COMPLETED');
      expect(result.status).toBe('success');
      expect(result.label).toBe('Concluída');
    });

    it('maps CANCELLED to cancelled/Cancelada', () => {
      const result = component.getStatusChip('CANCELLED');
      expect(result.status).toBe('cancelled');
      expect(result.label).toBe('Cancelada');
    });
  });

  describe('formatDate', () => {
    it('formats date as YYYY-MM-DD', () => {
      const date = new Date(2026, 6, 9);
      expect(component.formatDate(date)).toBe('2026-07-09');
    });
  });

  describe('formatTime', () => {
    it('formats time range', () => {
      expect(component.formatTime('08:00', '09:00')).toBe('08:00 - 09:00');
    });
  });

  describe('isToday', () => {
    it('returns true for today', () => {
      component.selectedDate = new Date();
      expect(component.isToday()).toBeTrue();
    });

    it('returns false for another date', () => {
      component.selectedDate = new Date('2025-01-01');
      expect(component.isToday()).toBeFalse();
    });
  });

  describe('isPast', () => {
    it('returns true for past date', () => {
      component.selectedDate = new Date('2020-01-01');
      expect(component.isPast()).toBeTrue();
    });

    it('returns false for today', () => {
      component.selectedDate = new Date();
      expect(component.isPast()).toBeFalse();
    });
  });
});
