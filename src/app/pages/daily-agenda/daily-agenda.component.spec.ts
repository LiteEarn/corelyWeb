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
import { By } from '@angular/platform-browser';

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
    classGroupId: 'cg-1',
    status: 'ACTIVE',
    enrollmentDate: '2026-01-01',
  };

  const mockEnrollment2: Enrollment = {
    id: 'enr-2',
    studentId: 'student-2',
    studentName: 'João Pedro',
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

  describe('action buttons', () => {
    it('shows Iniciar Aula button when SCHEDULED', () => {
      component.sessionCards = [{
        session: { ...mockSession, status: 'SCHEDULED' },
        instructorName: 'Ana Silva',
        classGroupId: 'cg-1',
        enrolledCount: 2,
        expanded: true,
      }];
      component.filteredCards = component.sessionCards;
      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('.card-actions ds-button'));
      expect(btn).toBeTruthy();
      expect(btn.componentInstance.label).toBe('Iniciar Aula');
    });

    it('shows Finalizar Aula button when IN_PROGRESS', () => {
      component.sessionCards = [{
        session: { ...mockSession, status: 'IN_PROGRESS' },
        instructorName: 'Ana Silva',
        classGroupId: 'cg-1',
        enrolledCount: 2,
        expanded: true,
      }];
      component.filteredCards = component.sessionCards;
      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('.card-actions ds-button'));
      expect(btn).toBeTruthy();
      expect(btn.componentInstance.label).toBe('Finalizar Aula');
    });

    it('hides action button when COMPLETED', () => {
      component.sessionCards = [{
        session: { ...mockSession, status: 'COMPLETED' },
        instructorName: 'Ana Silva',
        classGroupId: 'cg-1',
        enrolledCount: 2,
        expanded: true,
      }];
      component.filteredCards = component.sessionCards;
      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('.card-actions'));
      expect(btn).toBeFalsy();
    });

    it('hides action button when CANCELLED', () => {
      component.sessionCards = [{
        session: { ...mockSession, status: 'CANCELLED' },
        instructorName: 'Ana Silva',
        classGroupId: 'cg-1',
        enrolledCount: 2,
        expanded: true,
      }];
      component.filteredCards = component.sessionCards;
      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('.card-actions'));
      expect(btn).toBeFalsy();
    });
  });

  describe('startSession', () => {
    it('calls start and updates status on success', () => {
      const updatedSession = { ...mockSession, status: 'IN_PROGRESS' };
      sessionService.start.and.returnValue(of(updatedSession));

      const card = {
        session: { ...mockSession },
        instructorName: 'Ana Silva',
        expanded: false,
      };
      component.startSession(card);

      expect(sessionService.start).toHaveBeenCalledWith('session-1');
      expect(card.session.status).toBe('IN_PROGRESS');
      expect(toastService.success).toHaveBeenCalledWith('Aula iniciada.');
    });

    it('calls start and shows error toast on failure', () => {
      sessionService.start.and.returnValue(throwError(() => new Error('Erro')));

      const card = {
        session: { ...mockSession },
        instructorName: 'Ana Silva',
        expanded: false,
      };
      component.startSession(card);

      expect(sessionService.start).toHaveBeenCalledWith('session-1');
      expect(card.session.status).not.toBe('IN_PROGRESS');
      expect(toastService.error).toHaveBeenCalledWith('Não foi possível iniciar a aula.');
    });

    it('does not call start if already loading', () => {
      const card = {
        session: { ...mockSession },
        instructorName: 'Ana Silva',
        expanded: false,
      };
      component.sessionActionLoading['session-1'] = 'start';
      component.startSession(card);

      expect(sessionService.start).not.toHaveBeenCalled();
    });

    it('sets loading state before API call', () => {
      sessionService.start.and.returnValue(of({ ...mockSession, status: 'IN_PROGRESS' }));

      const card = {
        session: { ...mockSession },
        instructorName: 'Ana Silva',
        expanded: false,
      };
      component.startSession(card);

      expect(component.sessionActionLoading['session-1']).toBeNull();
    });
  });

  describe('completeSession', () => {
    it('calls complete and updates status on success', () => {
      const updatedSession = { ...mockSession, status: 'COMPLETED' };
      sessionService.complete.and.returnValue(of(updatedSession));

      const card = {
        session: { ...mockSession, status: 'IN_PROGRESS' },
        instructorName: 'Ana Silva',
        expanded: false,
      };
      component.completeSession(card);

      expect(sessionService.complete).toHaveBeenCalledWith('session-1');
      expect(card.session.status).toBe('COMPLETED');
      expect(toastService.success).toHaveBeenCalledWith('Aula finalizada.');
    });

    it('calls complete and shows error toast on failure', () => {
      sessionService.complete.and.returnValue(throwError(() => new Error('Erro')));

      const card = {
        session: { ...mockSession, status: 'IN_PROGRESS' },
        instructorName: 'Ana Silva',
        expanded: false,
      };
      component.completeSession(card);

      expect(sessionService.complete).toHaveBeenCalledWith('session-1');
      expect(toastService.error).toHaveBeenCalledWith('Não foi possível finalizar a aula.');
    });

    it('does not call complete if already loading', () => {
      const card = {
        session: { ...mockSession, status: 'IN_PROGRESS' },
        instructorName: 'Ana Silva',
        expanded: false,
      };
      component.sessionActionLoading['session-1'] = 'complete';
      component.completeSession(card);

      expect(sessionService.complete).not.toHaveBeenCalled();
    });

    it('clears loading state after API call', () => {
      sessionService.complete.and.returnValue(of({ ...mockSession, status: 'COMPLETED' }));

      const card = {
        session: { ...mockSession, status: 'IN_PROGRESS' },
        instructorName: 'Ana Silva',
        expanded: false,
      };
      component.completeSession(card);

      expect(component.sessionActionLoading['session-1']).toBeNull();
    });
  });

  describe('attendance registration', () => {
    beforeEach(() => {
      component.sessionCards = [{
        session: mockSession,
        instructorName: 'Ana Silva',
        classGroupId: 'cg-1',
        enrolledCount: 2,
        expanded: true,
        _students: [
          { studentId: 'student-1', studentName: 'Maria Souza', enrollmentStatus: 'ACTIVE' },
          { studentId: 'student-2', studentName: 'João Pedro', enrollmentStatus: 'ACTIVE' },
        ],
      }];
      component.filteredCards = component.sessionCards;
    });

    it('registers PRESENT attendance', () => {
      attendanceService.createAttendance.and.returnValue(of({} as any));

      const student = component.sessionCards[0]._students![0];
      component.setAttendance(student, 'PRESENT', component.sessionCards[0]);

      expect(attendanceService.createAttendance).toHaveBeenCalledWith('session-1', {
        studentId: 'student-1',
        status: 'PRESENT',
      });
      expect(student.attendanceStatus).toBe('PRESENT');
      expect(student.saving).toBeFalse();
      expect(toastService.success).toHaveBeenCalledWith('Presença registrada.');
    });

    it('registers ABSENT attendance', () => {
      attendanceService.createAttendance.and.returnValue(of({} as any));

      const student = component.sessionCards[0]._students![0];
      component.setAttendance(student, 'ABSENT', component.sessionCards[0]);

      expect(attendanceService.createAttendance).toHaveBeenCalledWith('session-1', {
        studentId: 'student-1',
        status: 'ABSENT',
      });
      expect(student.attendanceStatus).toBe('ABSENT');
      expect(toastService.success).toHaveBeenCalledWith('Presença registrada.');
    });

    it('registers JUSTIFIED attendance', () => {
      attendanceService.createAttendance.and.returnValue(of({} as any));

      const student = component.sessionCards[0]._students![0];
      component.setAttendance(student, 'JUSTIFIED', component.sessionCards[0]);

      expect(attendanceService.createAttendance).toHaveBeenCalledWith('session-1', {
        studentId: 'student-1',
        status: 'JUSTIFIED',
      });
      expect(student.attendanceStatus).toBe('JUSTIFIED');
      expect(toastService.success).toHaveBeenCalledWith('Presença registrada.');
    });

    it('updates existing attendance status', () => {
      attendanceService.createAttendance.and.returnValue(of({} as any));

      const student = component.sessionCards[0]._students![0];
      component.setAttendance(student, 'PRESENT', component.sessionCards[0]);
      expect(student.attendanceStatus).toBe('PRESENT');
      expect(attendanceService.createAttendance).toHaveBeenCalledTimes(1);

      component.setAttendance(student, 'ABSENT', component.sessionCards[0]);
      expect(student.attendanceStatus).toBe('ABSENT');
      expect(attendanceService.createAttendance).toHaveBeenCalledTimes(2);
    });

    it('shows loading per student while saving', () => {
      attendanceService.createAttendance.and.returnValue(of({} as any));

      const student = component.sessionCards[0]._students![0];
      component.setAttendance(student, 'PRESENT', component.sessionCards[0]);

      expect(student.saving).toBeFalse();
    });

    it('does not save when already saving', () => {
      const student = component.sessionCards[0]._students![0];
      student.saving = true;

      component.setAttendance(student, 'PRESENT', component.sessionCards[0]);

      expect(attendanceService.createAttendance).not.toHaveBeenCalled();
    });

    it('handles error and shows toast', () => {
      attendanceService.createAttendance.and.returnValue(throwError(() => new Error('Erro')));

      const student = component.sessionCards[0]._students![0];
      component.setAttendance(student, 'PRESENT', component.sessionCards[0]);

      expect(student.saving).toBeFalse();
      expect(student.attendanceStatus).toBeUndefined();
      expect(toastService.error).toHaveBeenCalledWith('Não foi possível registrar a presença.');
    });

    it('does not save if session has no id', () => {
      const cardWithoutId = {
        ...component.sessionCards[0],
        session: { ...mockSession, id: undefined },
      };
      const student = cardWithoutId._students![0];

      component.setAttendance(student, 'PRESENT', cardWithoutId);

      expect(attendanceService.createAttendance).not.toHaveBeenCalled();
    });

    it('shows success toast on successful registration', () => {
      attendanceService.createAttendance.and.returnValue(of({} as any));

      const student = component.sessionCards[0]._students![0];
      component.setAttendance(student, 'PRESENT', component.sessionCards[0]);

      expect(toastService.success).toHaveBeenCalledWith('Presença registrada.');
    });

    it('shows error toast on failed registration', () => {
      attendanceService.createAttendance.and.returnValue(throwError(() => new Error('Erro')));

      const student = component.sessionCards[0]._students![0];
      component.setAttendance(student, 'PRESENT', component.sessionCards[0]);

      expect(toastService.error).toHaveBeenCalledWith('Não foi possível registrar a presença.');
    });
  });

  describe('presence toggles disabled state', () => {
    it('enables toggles when status is IN_PROGRESS', () => {
      const card = {
        session: { ...mockSession, status: 'IN_PROGRESS' },
        expanded: true,
        _students: [
          { studentId: 's1', studentName: 'Aluno', enrollmentStatus: 'ACTIVE' },
        ],
      };

      const togglesDisabled = card.session.status !== 'IN_PROGRESS';
      expect(togglesDisabled).toBeFalse();
    });

    it('disables toggles when status is SCHEDULED', () => {
      const card = {
        session: { ...mockSession, status: 'SCHEDULED' },
        expanded: true,
        _students: [
          { studentId: 's1', studentName: 'Aluno', enrollmentStatus: 'ACTIVE' },
        ],
      };

      const togglesDisabled = card.session.status !== 'IN_PROGRESS';
      expect(togglesDisabled).toBeTrue();
    });

    it('disables toggles when status is COMPLETED', () => {
      const card = {
        session: { ...mockSession, status: 'COMPLETED' },
        expanded: true,
        _students: [
          { studentId: 's1', studentName: 'Aluno', enrollmentStatus: 'ACTIVE' },
        ],
      };

      const togglesDisabled = card.session.status !== 'IN_PROGRESS';
      expect(togglesDisabled).toBeTrue();
    });

    it('disables toggles when status is CANCELLED', () => {
      const card = {
        session: { ...mockSession, status: 'CANCELLED' },
        expanded: true,
        _students: [
          { studentId: 's1', studentName: 'Aluno', enrollmentStatus: 'ACTIVE' },
        ],
      };

      const togglesDisabled = card.session.status !== 'IN_PROGRESS';
      expect(togglesDisabled).toBeTrue();
    });
  });
});
