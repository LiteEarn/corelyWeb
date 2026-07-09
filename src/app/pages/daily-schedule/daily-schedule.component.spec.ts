import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { DailyScheduleComponent } from './daily-schedule.component';
import { DailyScheduleService } from './daily-schedule.service';
import { InstructorService } from '../../features/instructors/instructor.service';
import { ClassGroupService } from '../../features/class-groups/class-group.service';
import { SessionService } from '../../features/sessions/session.service';
import { ToastService } from '../../core/services/toast.service';
import { DailyScheduleResponse, DailySessionItem } from './daily-schedule.model';
import { Instructor } from '../../features/instructors/instructor.model';

function todayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const mockSession: DailySessionItem = {
  id: 'session-1',
  classGroupId: 'cg-1',
  classGroupName: 'Ballet Infantil',
  instructorId: 'inst-1',
  instructorName: 'Ana Silva',
  sessionDate: todayStr(),
  startTime: '08:00',
  endTime: '09:00',
  status: 'SCHEDULED',
  capacity: 20,
  enrolledCount: 5,
  presentCount: 0,
};

const mockSessionInProgress: DailySessionItem = {
  ...mockSession,
  id: 'session-2',
  status: 'IN_PROGRESS',
  startTime: '09:00',
  endTime: '10:00',
};

const mockSessionCompleted: DailySessionItem = {
  ...mockSession,
  id: 'session-3',
  status: 'COMPLETED',
  startTime: '10:00',
  endTime: '11:00',
};

const mockSessionCancelled: DailySessionItem = {
  ...mockSession,
  id: 'session-4',
  status: 'CANCELLED',
  startTime: '11:00',
  endTime: '12:00',
};

const mockResponse: DailyScheduleResponse = {
  kpis: { totalToday: 4, inProgress: 1, completed: 1, cancelled: 1 },
  sessions: [mockSession, mockSessionInProgress, mockSessionCompleted, mockSessionCancelled],
};

const mockInstructor: Instructor = {
  id: 'inst-1',
  fullName: 'Ana Silva',
  email: 'ana@test.com',
  phone: '11999999999',
  specialty: 'Ballet',
  active: true,
};

describe('DailyScheduleComponent', () => {
  let component: DailyScheduleComponent;
  let fixture: ComponentFixture<DailyScheduleComponent>;
  let dailyScheduleService: jasmine.SpyObj<DailyScheduleService>;
  let instructorService: jasmine.SpyObj<InstructorService>;
  let classGroupService: jasmine.SpyObj<ClassGroupService>;
  let sessionService: jasmine.SpyObj<SessionService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let httpClient: jasmine.SpyObj<HttpClient>;

  beforeEach(async () => {
    dailyScheduleService = jasmine.createSpyObj('DailyScheduleService', ['getDailySchedule']);
    instructorService = jasmine.createSpyObj('InstructorService', ['getAll']);
    classGroupService = jasmine.createSpyObj('ClassGroupService', ['getAll']);
    sessionService = jasmine.createSpyObj('SessionService', ['start', 'complete']);
    toastService = jasmine.createSpyObj('ToastService', ['success', 'error']);
    httpClient = jasmine.createSpyObj('HttpClient', ['patch']);

    dailyScheduleService.getDailySchedule.and.returnValue(of(mockResponse));
    instructorService.getAll.and.returnValue(of([mockInstructor]));
    classGroupService.getAll.and.returnValue(of([{ id: 'cg-1', name: 'Ballet Infantil', studioId: 's-1', instructorId: 'inst-1', startTime: '08:00', endTime: '09:00', capacity: 20, active: true, monday: true, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false }]));
    sessionService.start.and.returnValue(of({ ...mockSession, status: 'IN_PROGRESS' } as any));
    sessionService.complete.and.returnValue(of({ ...mockSession, status: 'COMPLETED' } as any));

    await TestBed.configureTestingModule({
      imports: [DailyScheduleComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        { provide: DailyScheduleService, useValue: dailyScheduleService },
        { provide: InstructorService, useValue: instructorService },
        { provide: ClassGroupService, useValue: classGroupService },
        { provide: SessionService, useValue: sessionService },
        { provide: ToastService, useValue: toastService },
        { provide: HttpClient, useValue: httpClient },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DailyScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads daily schedule on init', () => {
    expect(dailyScheduleService.getDailySchedule).toHaveBeenCalled();
    expect(component.data).toEqual(mockResponse);
    expect(component.loading).toBeFalse();
  });

  it('loads instructors and class groups on init', () => {
    expect(instructorService.getAll).toHaveBeenCalled();
    expect(classGroupService.getAll).toHaveBeenCalled();
    expect(component.instructors.length).toBe(1);
    expect(component.classGroups.length).toBe(1);
  });

  describe('KPIs', () => {
    it('shows correct KPI values', () => {
      expect(component.getKpiValue('totalToday')).toBe(4);
      expect(component.getKpiValue('inProgress')).toBe(1);
      expect(component.getKpiValue('completed')).toBe(1);
      expect(component.getKpiValue('cancelled')).toBe(1);
    });
  });

  describe('filters', () => {
    it('applies date filter and reloads', () => {
      spyOn(component, 'loadSchedule');
      const newDate = new Date(2026, 6, 10);
      component.onDateChange(newDate);
      expect(component.filters.date).toEqual(newDate);
      expect(component.loadSchedule).toHaveBeenCalled();
    });

    it('applies instructor filter and reloads', () => {
      spyOn(component, 'loadSchedule');
      component.filters.instructorId = 'inst-1';
      component.onFilterChange();
      expect(component.loadSchedule).toHaveBeenCalled();
    });

    it('clears filters and reloads', () => {
      spyOn(component, 'loadSchedule');
      component.filters.instructorId = 'inst-1';
      component.filters.status = 'COMPLETED';
      component.clearFilters();
      expect(component.filters.instructorId).toBe('all');
      expect(component.filters.status).toBe('all');
      expect(component.loadSchedule).toHaveBeenCalled();
    });

    it('goToToday resets date to today', () => {
      spyOn(component, 'loadSchedule');
      component.filters.date = new Date(2026, 5, 1);
      component.goToToday();
      const today = new Date();
      expect(component.filters.date.getFullYear()).toBe(today.getFullYear());
      expect(component.filters.date.getMonth()).toBe(today.getMonth());
      expect(component.filters.date.getDate()).toBe(today.getDate());
      expect(component.loadSchedule).toHaveBeenCalled();
    });
  });

  describe('status chip', () => {
    it('maps statuses correctly', () => {
      expect(component.getStatusChip('SCHEDULED').status).toBe('completed');
      expect(component.getStatusChip('SCHEDULED').label).toBe('Agendada');
      expect(component.getStatusChip('IN_PROGRESS').status).toBe('warning');
      expect(component.getStatusChip('IN_PROGRESS').label).toBe('Em andamento');
      expect(component.getStatusChip('COMPLETED').status).toBe('success');
      expect(component.getStatusChip('COMPLETED').label).toBe('Concluída');
      expect(component.getStatusChip('CANCELLED').status).toBe('cancelled');
      expect(component.getStatusChip('CANCELLED').label).toBe('Cancelada');
    });
  });

  describe('startSession', () => {
    it('calls start and updates status on success', () => {
      const session = { ...mockSession };
      component.startSession(session);
      expect(sessionService.start).toHaveBeenCalledWith('session-1');
      expect(session.status).toBe('IN_PROGRESS');
      expect(toastService.success).toHaveBeenCalledWith('Aula iniciada.');
    });

    it('shows error toast on failure', () => {
      sessionService.start.and.returnValue(throwError(() => new Error('Erro')));
      const session = { ...mockSession };
      component.startSession(session);
      expect(toastService.error).toHaveBeenCalledWith('Não foi possível iniciar a aula.');
    });

    it('does not call start if already loading', () => {
      const session = { ...mockSession };
      component.sessionActionLoading['session-1'] = 'start';
      component.startSession(session);
      expect(sessionService.start).not.toHaveBeenCalled();
    });
  });

  describe('completeSession', () => {
    it('calls complete and updates status on success', () => {
      const session = { ...mockSessionInProgress };
      component.completeSession(session);
      expect(sessionService.complete).toHaveBeenCalledWith('session-2');
      expect(session.status).toBe('COMPLETED');
      expect(toastService.success).toHaveBeenCalledWith('Aula finalizada.');
    });

    it('shows error toast on failure', () => {
      sessionService.complete.and.returnValue(throwError(() => new Error('Erro')));
      const session = { ...mockSessionInProgress };
      component.completeSession(session);
      expect(toastService.error).toHaveBeenCalledWith('Não foi possível finalizar a aula.');
    });
  });

  describe('cancelSession', () => {
    it('calls cancel PATCH and updates status on success', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      httpClient.patch.and.returnValue(of({}));
      const session = { ...mockSession };
      component.cancelSession(session);
      expect(httpClient.patch).toHaveBeenCalled();
      expect(session.status).toBe('CANCELLED');
      expect(toastService.success).toHaveBeenCalledWith('Aula cancelada.');
    });

    it('does not call cancel if user denies confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      const session = { ...mockSession };
      component.cancelSession(session);
      expect(httpClient.patch).not.toHaveBeenCalled();
    });
  });

  describe('loading and error states', () => {
    it('shows loading state', () => {
      component.loading = true;
      component.error = null;
      component.data = null;
      fixture.detectChanges();
      expect(component.loading).toBeTrue();
    });

    it('shows error state', () => {
      component.loading = false;
      component.error = 'Erro ao carregar';
      component.data = null;
      fixture.detectChanges();
      expect(component.error).toBe('Erro ao carregar');
    });

    it('shows empty state', () => {
      component.loading = false;
      component.error = null;
      component.data = { kpis: { totalToday: 0, inProgress: 0, completed: 0, cancelled: 0 }, sessions: [] };
      fixture.detectChanges();
      expect(component.data.sessions.length).toBe(0);
    });

    it('handles load error', () => {
      dailyScheduleService.getDailySchedule.and.returnValue(throwError(() => new Error('Erro')));
      component.loadSchedule();
      expect(component.loading).toBeFalse();
      expect(component.error).toBeTruthy();
      expect(toastService.error).toHaveBeenCalledWith('Erro ao carregar a agenda do dia.');
    });
  });

  describe('utility methods', () => {
    it('formats date correctly', () => {
      const date = new Date(2026, 6, 9);
      expect(component.formatDate(date)).toBe('2026-07-09');
    });

    it('formats time correctly', () => {
      expect(component.formatTime('08:00')).toBe('08:00');
      expect(component.formatTime('08:00:00')).toBe('08:00');
      expect(component.formatTime('')).toBe('');
    });

    it('checks isToday', () => {
      expect(component.isToday()).toBeTrue();
      component.filters.date = new Date(2026, 5, 1);
      expect(component.isToday()).toBeFalse();
    });

    it('returns instructor name or fallback', () => {
      expect(component.getInstructorName(mockSession)).toBe('Ana Silva');
      const sessionWithoutName = { ...mockSession, instructorName: '' };
      expect(component.getInstructorName(sessionWithoutName)).toBe('Não encontrado');
    });
  });
});
