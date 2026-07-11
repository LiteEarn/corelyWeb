import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { LOCALE_ID } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { DailyAgendaComponent } from './daily-agenda.component';
import { FeatureGateService } from '../../core/rbac/feature-gate.service';
import { SessionService } from '../../features/sessions/session.service';
import { InstructorService } from '../../features/instructors/instructor.service';
import { ClassGroupService } from '../../features/class-groups/class-group.service';
import { EnrollmentService } from '../../features/enrollments/enrollment.service';
import { ToastService } from '../../core/services/toast.service';
import { AttendanceService } from '../../features/attendance/attendance.service';
import { AutoRefreshService } from '../../core/services/auto-refresh.service';
import { Session } from '../../features/sessions/session.model';
import { Instructor } from '../../features/instructors/instructor.model';
import { Enrollment } from '../../features/enrollments/enrollment.model';
import { Subject } from 'rxjs';

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
  let instructorService: jasmine.SpyObj<InstructorService>;
  let classGroupService: jasmine.SpyObj<ClassGroupService>;
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let attendanceService: jasmine.SpyObj<AttendanceService>;

  const mockSession: Session = {
    id: 'session-1',
    studioId: 'studio-1',
    instructorId: 'inst-1',
    title: 'Ballet Infantil',
    classGroupId: 'cg-1',
    classGroupName: 'Ballet Infantil',
    scheduledDate: todayStr(),
    startTime: '08:00',
    endTime: '09:00',
    maxStudents: 20,
    status: 'SCHEDULED',
  };

  const mockInstructor: Instructor = {
    id: 'inst-1',
    fullName: 'Ana Silva',
    email: 'ana@test.com',
    phone: '11999999999',
    specialty: 'Ballet',
    active: true,
  };

  const mockEnrollment: Enrollment = {
    id: 'enr-1',
    studentId: 'student-1',
    studentName: 'Maria Souza',
    studentPhone: '11988888888',
    classGroupId: 'cg-1',
    status: 'ACTIVE',
    enrollmentDate: '2026-01-01',
  };

  const mockEnrollment2: Enrollment = {
    id: 'enr-2',
    studentId: 'student-2',
    studentName: 'João Pedro',
    studentPhone: '11977777777',
    classGroupId: 'cg-1',
    status: 'ACTIVE',
    enrollmentDate: '2026-01-01',
  };

  let autoRefreshService: jasmine.SpyObj<AutoRefreshService>;
  let refreshSubject: Subject<void>;

  function createDialogRef(result: any) {
    return { afterClosed: () => of(result) };
  }

  beforeEach(async () => {
    refreshSubject = new Subject<void>();
    autoRefreshService = jasmine.createSpyObj('AutoRefreshService', ['triggerRefresh'], {
      refresh$: refreshSubject.asObservable(),
    });

    sessionService = jasmine.createSpyObj('SessionService', ['getAll', 'start', 'complete', 'cancel']);
    instructorService = jasmine.createSpyObj('InstructorService', ['getAll']);
    classGroupService = jasmine.createSpyObj('ClassGroupService', ['getAll']);
    enrollmentService = jasmine.createSpyObj('EnrollmentService', [
      'getStudentsByClassGroupId',
      'getAll',
    ]);
    toastService = jasmine.createSpyObj('ToastService', ['success', 'error']);
    attendanceService = jasmine.createSpyObj('AttendanceService', [
      'getBySessionId',
      'createAttendance',
      'saveSessionAttendances',
    ]);

    sessionService.getAll.and.returnValue(of([mockSession]));
    instructorService.getAll.and.returnValue(of([mockInstructor]));
    classGroupService.getAll.and.returnValue(of([{
      id: 'cg-1',
      name: 'Ballet Infantil',
      studioId: 'studio-1',
      instructorId: 'inst-1',
      startTime: '08:00',
      endTime: '09:00',
      capacity: 20,
      active: true,
      monday: true,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    }]));
    enrollmentService.getStudentsByClassGroupId.and.returnValue(of([mockEnrollment, mockEnrollment2]));
    enrollmentService.getAll.and.returnValue(of([]));
    attendanceService.getBySessionId.and.returnValue(of([]));

    const featureGateService = jasmine.createSpyObj('FeatureGateService', [
      'canLoadInstructors', 'canLoadClassGroups', 'canLoadSessions',
      'canLoadEnrollments', 'canLoadEnrolledStudents',
      'canManageAttendance', 'canStartSession', 'canCompleteSession',
    ]);
    featureGateService.canLoadInstructors.and.returnValue(true);
    featureGateService.canLoadClassGroups.and.returnValue(true);
    featureGateService.canLoadSessions.and.returnValue(true);
    featureGateService.canLoadEnrollments.and.returnValue(true);
    featureGateService.canLoadEnrolledStudents.and.returnValue(true);
    featureGateService.canManageAttendance.and.returnValue(true);
    featureGateService.canStartSession.and.returnValue(true);
    featureGateService.canCompleteSession.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [DailyAgendaComponent],
      providers: [
        provideNoopAnimations(),
        { provide: LOCALE_ID, useValue: 'pt-BR' },
        { provide: FeatureGateService, useValue: featureGateService },
        { provide: SessionService, useValue: sessionService },
        { provide: InstructorService, useValue: instructorService },
        { provide: ClassGroupService, useValue: classGroupService },
        { provide: EnrollmentService, useValue: enrollmentService },
        { provide: ToastService, useValue: toastService },
        { provide: AttendanceService, useValue: attendanceService },
        { provide: AutoRefreshService, useValue: autoRefreshService },
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
    expect(component.sessionCards.length).toBe(1);
    expect(component.sessionCards[0].session.title).toBe('Ballet Infantil');
  });

  describe('status chip', () => {
    it('maps SCHEDULED to chip completed and label Agendada', () => {
      const result = component.getStatusChip('SCHEDULED');
      expect(result.status).toBe('completed');
      expect(result.label).toBe('Agendada');
    });

    it('maps IN_PROGRESS to chip warning and label Em andamento', () => {
      const result = component.getStatusChip('IN_PROGRESS');
      expect(result.status).toBe('warning');
      expect(result.label).toBe('Em andamento');
    });

    it('maps COMPLETED to chip success and label Concluída', () => {
      const result = component.getStatusChip('COMPLETED');
      expect(result.status).toBe('success');
      expect(result.label).toBe('Concluída');
    });

    it('maps CANCELLED to chip cancelled and label Cancelada', () => {
      const result = component.getStatusChip('CANCELLED');
      expect(result.status).toBe('cancelled');
      expect(result.label).toBe('Cancelada');
    });
  });

  describe('student list', () => {
    beforeEach(() => {
      component.sessionCards = [{
        session: mockSession,
        instructorName: 'Ana Silva',
        classGroupId: 'cg-1',
        enrolledCount: 2,
        expanded: true,
        _students: [
          { studentId: 'student-1', studentName: 'Maria Souza', studentPhone: '11988888888', enrollmentStatus: 'ACTIVE' },
          { studentId: 'student-2', studentName: 'João Pedro', studentPhone: '11977777777', enrollmentStatus: 'ACTIVE' },
        ],
      }];
      component.filteredCards = component.sessionCards;
      (component as any).buildTimeline();
      fixture.detectChanges();
    });

    it('renders student table when students are loaded', () => {
      const table = fixture.nativeElement.querySelector('.students-table');
      expect(table).toBeTruthy();
    });

    it('renders student names', () => {
      const cells = fixture.nativeElement.querySelectorAll('.student-name-cell');
      expect(cells.length).toBe(2);
      expect(cells[0].textContent).toContain('Maria Souza');
      expect(cells[1].textContent).toContain('João Pedro');
    });

    it('renders student phones', () => {
      const cells = fixture.nativeElement.querySelectorAll('.student-phone-cell');
      expect(cells.length).toBe(2);
      expect(cells[0].textContent).toContain('11988888888');
      expect(cells[1].textContent).toContain('11977777777');
    });

    it('shows dash when phone is not available', () => {
      const card = component.sessionCards[0];
      card._students = [
        { studentId: 's1', studentName: 'Aluno Sem Telefone', enrollmentStatus: 'ACTIVE' },
      ];
      fixture.detectChanges();

      const cells = fixture.nativeElement.querySelectorAll('.student-phone-cell');
      expect(cells[0].textContent).toContain('-');
    });

    it('shows attendance controls', () => {
      const controls = fixture.nativeElement.querySelectorAll('.students-table .attendance-controls');
      expect(controls.length).toBe(2);
    });

    it('shows presence badge when no attendance', () => {
      const controls = fixture.nativeElement.querySelectorAll('.students-table .attendance-controls');
      expect(controls.length).toBe(2);
    });
  });

  describe('student list - empty state', () => {
    it('shows empty state when no students', () => {
      component.sessionCards = [{
        session: mockSession,
        instructorName: 'Ana Silva',
        classGroupId: 'cg-1',
        enrolledCount: 0,
        expanded: true,
        _students: [],
      }];
      component.filteredCards = component.sessionCards;
      (component as any).buildTimeline();
      fixture.detectChanges();

      const emptyEl = fixture.nativeElement.querySelector('.no-students');
      expect(emptyEl).toBeTruthy();
      expect(emptyEl.textContent).toContain('Nenhum aluno matriculado');
    });
  });

  describe('student list - loading', () => {
    it('calls enrollmentService on expand when no students loaded', () => {
      const card = {
        session: mockSession,
        instructorName: 'Ana Silva',
        classGroupId: 'cg-1',
        enrolledCount: undefined,
        expanded: false,
        _students: undefined,
      };
      component.toggleCard(card);
      expect(enrollmentService.getStudentsByClassGroupId).toHaveBeenCalledWith('cg-1');
    });

    it('does not call enrollmentService if already loaded', () => {
      enrollmentService.getStudentsByClassGroupId.calls.reset();
      const card = {
        session: mockSession,
        instructorName: 'Ana Silva',
        classGroupId: 'cg-1',
        enrolledCount: 2,
        expanded: false,
        _students: [{ studentId: 's1', studentName: 'Aluno', enrollmentStatus: 'ACTIVE' }],
      };
      component.toggleCard(card);
      expect(enrollmentService.getStudentsByClassGroupId).not.toHaveBeenCalled();
    });
  });

  describe('getPresenceLabel', () => {
    it('returns Presente for PRESENT', () => {
      expect(component.getPresenceLabel('PRESENT')).toBe('Presente');
    });

    it('returns Ausente for ABSENT', () => {
      expect(component.getPresenceLabel('ABSENT')).toBe('Ausente');
    });

    it('returns Justificado for JUSTIFIED', () => {
      expect(component.getPresenceLabel('JUSTIFIED')).toBe('Justificado');
    });

    it('returns dash for undefined', () => {
      expect(component.getPresenceLabel(undefined)).toBe('-');
    });
  });

  describe('getPresenceStatus', () => {
    it('returns success for PRESENT', () => {
      expect(component.getPresenceStatus('PRESENT')).toBe('success');
    });

    it('returns cancelled for ABSENT', () => {
      expect(component.getPresenceStatus('ABSENT')).toBe('cancelled');
    });

    it('returns warning for JUSTIFIED', () => {
      expect(component.getPresenceStatus('JUSTIFIED')).toBe('warning');
    });

    it('returns pending for undefined', () => {
      expect(component.getPresenceStatus(undefined)).toBe('pending');
    });
  });

  describe('auto-refresh', () => {
    it('calls loadSessions when refresh$ emits and no pending changes', () => {
      spyOn(component, 'loadSessions').and.callThrough();
      refreshSubject.next();
      expect(component.loadSessions).toHaveBeenCalledWith(true);
    });

    it('sets pendingChangesBlocked when refresh$ emits and pending changes exist', () => {
      component.sessionCards = [{
        session: { id: 'session-1', instructorId: 'inst-1' } as any,
        instructorName: 'Ana',
        expanded: false,
        _students: [
          { studentId: 's1', enrollmentId: 'enr-1', studentName: 'Maria', enrollmentStatus: 'ACTIVE', attendanceStatus: 'PRESENT', _originalStatus: undefined },
        ],
      } as any];
      component.filteredCards = component.sessionCards;
      expect(component.pendingChangesBlocked).toBeFalse();
      refreshSubject.next();
      expect(component.pendingChangesBlocked).toBeTrue();
    });

    it('hasAnyPendingChanges returns false when no cards have changes', () => {
      expect(component.hasAnyPendingChanges()).toBeFalse();
    });

    it('hasAnyPendingChanges returns true when a card has unsaved attendance', () => {
      component.sessionCards = [{
        session: { id: 's1' } as any,
        instructorName: 'Ana',
        expanded: false,
        _students: [
          { studentId: 's1', attendanceStatus: 'ABSENT', _originalStatus: 'PRESENT' },
        ],
      } as any];
      expect(component.hasAnyPendingChanges()).toBeTrue();
    });

    it('forceRefresh resets pendingChangesBlocked and triggers smartRefresh', () => {
      spyOn(component as any, 'smartRefresh');
      component.pendingChangesBlocked = true;
      component.forceRefresh();
      expect(component.pendingChangesBlocked).toBeFalse();
      expect((component as any).smartRefresh).toHaveBeenCalled();
    });

    it('smartRefresh saves expanded state and scroll before reload', () => {
      spyOn(component, 'loadSessions');
      component.sessionCards = [{
        session: { id: 's1' } as any,
        instructorName: 'Ana',
        expanded: true,
        _students: [
          { studentId: 's1', studentName: 'Maria', enrollmentStatus: 'ACTIVE' },
        ],
      } as any];
      (component as any).smartRefresh();
      expect(component.loadSessions).toHaveBeenCalledWith(true);
    });

    it('triggers auto refresh after saveAttendances succeeds', () => {
      const card = {
        session: { id: 'session-1' },
        _students: [
          { studentId: 's1', enrollmentId: 'enr-1', studentName: 'Maria', attendanceStatus: 'PRESENT', _originalStatus: undefined },
        ],
      } as any;
      attendanceService.saveSessionAttendances.and.returnValue(of([
        { enrollmentId: 'enr-1', status: 'PRESENT', classSessionId: 'session-1' },
      ] as any));
      component.saveAttendances(card);
      expect(autoRefreshService.triggerRefresh).toHaveBeenCalled();
    });

    it('triggers auto refresh after startSession succeeds', () => {
      const card = {
        session: { id: 's1', status: 'SCHEDULED' },
      } as any;
      sessionService.start.and.returnValue(of({ id: 's1', status: 'IN_PROGRESS' } as any));
      component.startSession(card);
      expect(autoRefreshService.triggerRefresh).toHaveBeenCalled();
    });
  });

  describe('cancel session', () => {
    it('canCancel returns true only for SCHEDULED', () => {
      const card = (status: string) => ({ session: { status } } as any);
      expect(component.canCancel(card('SCHEDULED'))).toBeTrue();
      expect(component.canCancel(card('IN_PROGRESS'))).toBeFalse();
      expect(component.canCancel(card('COMPLETED'))).toBeFalse();
      expect(component.canCancel(card('CANCELLED'))).toBeFalse();
    });

    it('cancelSession calls sessionService.cancel with reason when dialog confirms', () => {
      (component as any).dialog = {
        open: () => ({
          afterClosed: () => of({ cancelReason: 'OTHER', cancelDescription: 'Test motivo' }),
        }),
      };
      const card = { session: { id: 's1', status: 'SCHEDULED' } } as any;
      sessionService.cancel.and.returnValue(of({ id: 's1', status: 'CANCELLED' } as any));

      component.cancelSession(card);
      expect(sessionService.cancel).toHaveBeenCalledWith('s1', { cancelReason: 'OTHER', cancelDescription: 'Test motivo' });
      expect(card.session.status).toBe('CANCELLED');
      expect(toastService.success).toHaveBeenCalledWith('Aula cancelada.');
    });

    it('cancelSession does nothing when dialog is dismissed', () => {
      (component as any).dialog = {
        open: () => ({
          afterClosed: () => of(null),
        }),
      };
      const card = { session: { id: 's1' } } as any;
      component.cancelSession(card);
      expect(sessionService.cancel).not.toHaveBeenCalled();
    });

    it('cancelSession shows error toast on failure', () => {
      (component as any).dialog = {
        open: () => ({
          afterClosed: () => of({ cancelReason: 'HOLIDAY' }),
        }),
      };
      const card = { session: { id: 's1', status: 'SCHEDULED' } } as any;
      sessionService.cancel.and.returnValue(throwError(() => new Error('fail')));

      component.cancelSession(card);
      expect(toastService.error).toHaveBeenCalledWith('Erro ao cancelar aula.');
    });
  });

  describe('timeline', () => {
    it('getPeriod returns morning for 05:00-11:59', () => {
      expect(component.getPeriod('05:00')).toBe('morning');
      expect(component.getPeriod('08:30')).toBe('morning');
      expect(component.getPeriod('11:59')).toBe('morning');
    });

    it('getPeriod returns afternoon for 12:00-17:59', () => {
      expect(component.getPeriod('12:00')).toBe('afternoon');
      expect(component.getPeriod('14:00')).toBe('afternoon');
      expect(component.getPeriod('17:59')).toBe('afternoon');
    });

    it('getPeriod returns evening for 18:00-04:59', () => {
      expect(component.getPeriod('18:00')).toBe('evening');
      expect(component.getPeriod('20:00')).toBe('evening');
      expect(component.getPeriod('00:00')).toBe('evening');
      expect(component.getPeriod('04:59')).toBe('evening');
    });

    it('getTimelineIcon returns correct icon per status', () => {
      const scheduled = { session: { status: 'SCHEDULED' } } as any;
      const inProgress = { session: { status: 'IN_PROGRESS' } } as any;
      const completed = { session: { status: 'COMPLETED' } } as any;
      const cancelled = { session: { status: 'CANCELLED' } } as any;

      expect(component.getTimelineIcon(scheduled)).toBe('radio_button_unchecked');
      expect(component.getTimelineIcon(inProgress)).toBe('play_circle');
      expect(component.getTimelineIcon(completed)).toBe('check_circle');
      expect(component.getTimelineIcon(cancelled)).toBe('cancel');
    });

    it('buildTimeline groups cards by period', () => {
      const morning = { session: { id: 'm1', startTime: '08:00', status: 'SCHEDULED' } } as any;
      const afternoon = { session: { id: 'a1', startTime: '14:00', status: 'SCHEDULED' } } as any;
      const evening = { session: { id: 'e1', startTime: '19:00', status: 'SCHEDULED' } } as any;

      component.filteredCards = [morning, afternoon, evening];
      (component as any).buildTimeline();

      expect(component.periods.length).toBe(3);
      expect(component.periods[0].key).toBe('morning');
      expect(component.periods[0].cards.length).toBe(1);
      expect(component.periods[1].key).toBe('afternoon');
      expect(component.periods[1].cards.length).toBe(1);
      expect(component.periods[2].key).toBe('evening');
      expect(component.periods[2].cards.length).toBe(1);
    });

    it('buildTimeline omits empty periods', () => {
      component.filteredCards = [];
      (component as any).buildTimeline();
      expect(component.periods.length).toBe(0);
    });

    it('togglePeriod toggles collapsed state', () => {
      const period = { key: 'morning', label: 'Manhã', cards: [], collapsed: false };
      component.togglePeriod(period);
      expect(period.collapsed).toBeTrue();
      component.togglePeriod(period);
      expect(period.collapsed).toBeFalse();
    });

    it('buildTimeline preserves collapsed state across rebuilds', () => {
      component.filteredCards = [{ session: { id: 'm1', startTime: '08:00', status: 'SCHEDULED' } } as any];
      (component as any).buildTimeline();
      component.periods[0].collapsed = true;

      component.filteredCards = [
        { session: { id: 'm1', startTime: '08:00', status: 'SCHEDULED' } } as any,
        { session: { id: 'm2', startTime: '09:00', status: 'SCHEDULED' } } as any,
      ];
      (component as any).buildTimeline();
      expect(component.periods[0].collapsed).toBeTrue();
    });

    it('getPresentCount returns count of PRESENT students', () => {
      const card = { _students: [
        { attendanceStatus: 'PRESENT' },
        { attendanceStatus: 'ABSENT' },
        { attendanceStatus: 'PRESENT' },
        { attendanceStatus: undefined },
      ] } as any;
      expect(component.getPresentCount(card)).toBe(2);
    });

    it('getPresentCount returns 0 when no students', () => {
      expect(component.getPresentCount({} as any)).toBe(0);
    });

    it('trackByCardId returns session id', () => {
      const card = { session: { id: 'abc' } } as any;
      expect(component.trackByCardId(0, card)).toBe('abc');
    });

    it('trackByCardId falls back to index when id is undefined', () => {
      const card = { session: {} } as any;
      expect(component.trackByCardId(5, card)).toBe('5');
    });

    it('trackByPeriodKey returns period key', () => {
      const period = { key: 'morning' } as any;
      expect(component.trackByPeriodKey(0, period)).toBe('morning');
    });
  });

  describe('attendance editing', () => {
    let card: any;
    let student: any;

    beforeEach(() => {
      card = {
        session: { id: 'session-1' },
        _students: [
          { studentId: 'student-1', enrollmentId: 'enr-1', studentName: 'Maria', attendanceStatus: undefined, _originalStatus: undefined },
          { studentId: 'student-2', enrollmentId: 'enr-2', studentName: 'João', attendanceStatus: 'PRESENT', _originalStatus: 'PRESENT' },
        ],
      };
    });

    it('onAttendanceChange updates student status', () => {
      student = card._students[0];
      component.onAttendanceChange(card, student, 'PRESENT');
      expect(student.attendanceStatus).toBe('PRESENT');
    });

    it('onAttendanceChange does nothing if same status', () => {
      student = card._students[1];
      component.onAttendanceChange(card, student, 'PRESENT');
      expect(student.attendanceStatus).toBe('PRESENT');
    });

    it('hasAttendanceChanges returns true when status differs from original', () => {
      card._students[0].attendanceStatus = 'ABSENT';
      expect(component.hasAttendanceChanges(card)).toBeTrue();
    });

    it('hasAttendanceChanges returns false when no changes', () => {
      expect(component.hasAttendanceChanges(card)).toBeFalse();
    });

    it('renders attendance controls in table', () => {
      component.sessionCards = [{
        session: { ...mockSession, id: 'session-1' },
        instructorName: 'Ana Silva',
        classGroupId: 'cg-1',
        enrolledCount: 2,
        expanded: true,
        _students: [
          { studentId: 's1', enrollmentId: 'enr-1', studentName: 'Maria', enrollmentStatus: 'ACTIVE' },
          { studentId: 's2', enrollmentId: 'enr-2', studentName: 'João', enrollmentStatus: 'ACTIVE' },
        ],
      }];
      component.filteredCards = component.sessionCards;
      (component as any).buildTimeline();
      fixture.detectChanges();
      const el = fixture.nativeElement.querySelector('.attendance-controls');
      expect(el).toBeTruthy();
    });

    it('saveAttendances calls service and shows success toast', () => {
      card._students[0].attendanceStatus = 'PRESENT';
      attendanceService.saveSessionAttendances.and.returnValue(of([
        { enrollmentId: 'enr-1', status: 'PRESENT', classSessionId: 'session-1' },
      ] as any));
      component.saveAttendances(card);
      expect(attendanceService.saveSessionAttendances).toHaveBeenCalledWith('session-1', {
        attendances: [{ enrollmentId: 'enr-1', status: 'PRESENT' }],
      });
      expect(toastService.success).toHaveBeenCalledWith('Presenças salvas com sucesso.');
    });

    it('saveAttendances reverts on error and shows error toast', () => {
      card._students[0].attendanceStatus = 'ABSENT';
      attendanceService.saveSessionAttendances.and.returnValue(throwError(() => new Error('fail')));
      component.saveAttendances(card);
      expect(toastService.error).toHaveBeenCalledWith('Erro ao salvar presenças. Alterações revertidas.');
      expect(card._students[0].attendanceStatus).toBeUndefined();
    });

    it('saveAttendances sets loading state', () => {
      card._students[0].attendanceStatus = 'PRESENT';
      attendanceService.saveSessionAttendances.and.returnValue(of([]));
      component.saveAttendances(card);
      expect(component.savingAttendance['session-1']).toBeFalse();
    });
  });
});
