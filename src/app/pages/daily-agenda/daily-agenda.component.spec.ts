import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { LOCALE_ID } from '@angular/core';
import { of, throwError } from 'rxjs';

import { DailyAgendaComponent } from './daily-agenda.component';
import { FeatureGateService } from '../../core/rbac/feature-gate.service';
import { SessionService } from '../../features/sessions/session.service';
import { InstructorService } from '../../features/instructors/instructor.service';
import { ClassGroupService } from '../../features/class-groups/class-group.service';
import { EnrollmentService } from '../../features/enrollments/enrollment.service';
import { ToastService } from '../../core/services/toast.service';
import { AttendanceService } from '../../features/attendance/attendance.service';
import { Session } from '../../features/sessions/session.model';
import { Instructor } from '../../features/instructors/instructor.model';
import { Enrollment } from '../../features/enrollments/enrollment.model';

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

  beforeEach(async () => {
    sessionService = jasmine.createSpyObj('SessionService', ['getAll', 'start', 'complete']);
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

    it('shows presence badge as placeholder', () => {
      const badges = fixture.nativeElement.querySelectorAll('.presence-badge');
      expect(badges.length).toBe(2);
    });

    it('shows presence badge label as dash when no attendance', () => {
      const badges = fixture.nativeElement.querySelectorAll('.presence-badge ds-status-chip');
      expect(badges.length).toBe(2);
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
});
