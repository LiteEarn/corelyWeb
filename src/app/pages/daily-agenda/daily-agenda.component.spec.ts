import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { LOCALE_ID } from '@angular/core';
import { of, throwError } from 'rxjs';

import { DailyAgendaComponent } from './daily-agenda.component';
import { SessionService } from '../../features/sessions/session.service';
import { InstructorService } from '../../features/instructors/instructor.service';
import { ClassGroupService } from '../../features/class-groups/class-group.service';
import { EnrollmentService } from '../../features/enrollments/enrollment.service';
import { ToastService } from '../../core/services/toast.service';
import { AttendanceService } from '../../features/attendance/attendance.service';
import { Session } from '../../features/sessions/session.model';
import { Instructor } from '../../features/instructors/instructor.model';
import { Enrollment } from '../../features/enrollments/enrollment.model';

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
    scheduledDate: '2026-06-29',
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
    sessionService = jasmine.createSpyObj('SessionService', ['getAll']);
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

    await TestBed.configureTestingModule({
      imports: [DailyAgendaComponent],
      providers: [
        provideNoopAnimations(),
        { provide: LOCALE_ID, useValue: 'pt-BR' },
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
});
