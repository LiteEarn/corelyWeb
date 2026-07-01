import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DashboardService } from './dashboard.service';
import { SessionService } from '../../features/sessions/session.service';
import { MakeupRequestService } from '../../features/makeup-requests/makeup-request.service';
import { ClassGroupService } from '../../features/class-groups/class-group.service';
import { EnrollmentService } from '../../features/enrollments/enrollment.service';
import { InstructorService } from '../../features/instructors/instructor.service';
import { AttendanceService } from '../../features/attendance/attendance.service';
import { Session } from '../../features/sessions/session.model';
import { MakeupRequest } from '../../features/makeup-requests/makeup-request.model';
import { ClassGroup } from '../../features/class-groups/class-group.model';
import { Enrollment } from '../../features/enrollments/enrollment.model';
import { Instructor } from '../../features/instructors/instructor.model';
import { Attendance } from '../../features/attendance/attendance.model';

function todayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

describe('DashboardService', () => {
  let service: DashboardService;
  let sessionService: jasmine.SpyObj<SessionService>;
  let makeupRequestService: jasmine.SpyObj<MakeupRequestService>;
  let classGroupService: jasmine.SpyObj<ClassGroupService>;
  let enrollmentService: jasmine.SpyObj<EnrollmentService>;
  let instructorService: jasmine.SpyObj<InstructorService>;
  let attendanceService: jasmine.SpyObj<AttendanceService>;

  const today = todayStr();

  const mockSessions: Session[] = [
    {
      id: 's1',
      studioId: 'studio-1',
      instructorId: 'inst-1',
      title: 'Pilates',
      scheduledDate: today,
      startTime: '08:00',
      endTime: '09:00',
      maxStudents: 10,
      status: 'SCHEDULED',
    },
    {
      id: 's2',
      studioId: 'studio-1',
      instructorId: 'inst-2',
      title: 'Yoga',
      scheduledDate: today,
      startTime: '09:00',
      endTime: '10:00',
      maxStudents: 8,
      status: 'IN_PROGRESS',
    },
  ];

  const mockMakeups: MakeupRequest[] = [
    {
      id: 'm1',
      studentId: 'stu-1',
      studentName: 'Maria',
      classGroupId: 'cg-1',
      className: 'Pilates',
      absenceDate: '2026-06-20',
      reason: 'Saúde',
      status: 'REQUESTED',
    },
  ];

  const mockClassGroups: ClassGroup[] = [
    {
      id: 'cg-1',
      studioId: 'studio-1',
      instructorId: 'inst-1',
      name: 'Pilates',
      capacity: 10,
      active: true,
      monday: true,
      tuesday: false,
      wednesday: true,
      thursday: false,
      friday: true,
      saturday: false,
      sunday: false,
      startTime: '08:00',
      endTime: '09:00',
    },
    {
      id: 'cg-2',
      studioId: 'studio-1',
      instructorId: 'inst-2',
      name: 'Yoga',
      capacity: 8,
      active: true,
      monday: true,
      tuesday: false,
      wednesday: true,
      thursday: false,
      friday: true,
      saturday: false,
      sunday: false,
      startTime: '09:00',
      endTime: '10:00',
    },
  ];

  const mockEnrollments: Enrollment[] = [
    {
      id: 'e1',
      studentId: 'stu-1',
      studentName: 'Maria',
      classGroupId: 'cg-1',
      enrollmentDate: '2026-01-01',
      status: 'ACTIVE',
      active: true,
    },
    {
      id: 'e2',
      studentId: 'stu-2',
      studentName: 'João',
      classGroupId: 'cg-1',
      enrollmentDate: '2026-01-01',
      status: 'ACTIVE',
      active: true,
    },
    {
      id: 'e3',
      studentId: 'stu-3',
      studentName: 'Ana',
      classGroupId: 'cg-2',
      enrollmentDate: '2026-01-01',
      status: 'ACTIVE',
      active: true,
    },
    {
      id: 'e4',
      studentId: 'stu-4',
      studentName: 'Pedro',
      classGroupId: 'cg-2',
      enrollmentDate: '2026-01-01',
      status: 'ACTIVE',
      active: true,
    },
    {
      id: 'e5',
      studentId: 'stu-5',
      studentName: 'Lucas',
      classGroupId: 'cg-2',
      enrollmentDate: '2026-01-01',
      status: 'ACTIVE',
      active: true,
    },
    {
      id: 'e6',
      studentId: 'stu-6',
      studentName: 'Carla',
      classGroupId: 'cg-2',
      enrollmentDate: '2026-01-01',
      status: 'ACTIVE',
      active: true,
    },
    {
      id: 'e7',
      studentId: 'stu-7',
      studentName: 'Beatriz',
      classGroupId: 'cg-2',
      enrollmentDate: '2026-01-01',
      status: 'ACTIVE',
      active: true,
    },
    {
      id: 'e8',
      studentId: 'stu-8',
      studentName: 'Rafael',
      classGroupId: 'cg-2',
      enrollmentDate: '2026-01-01',
      status: 'ACTIVE',
      active: true,
    },
    {
      id: 'e9',
      studentId: 'stu-9',
      studentName: 'Marina',
      classGroupId: 'cg-2',
      enrollmentDate: '2026-01-01',
      status: 'ACTIVE',
      active: true,
    },
    {
      id: 'e10',
      studentId: 'stu-10',
      studentName: 'Thiago',
      classGroupId: 'cg-2',
      enrollmentDate: '2026-01-01',
      status: 'ACTIVE',
      active: true,
    },
  ];

  const mockInstructors: Instructor[] = [
    {
      id: 'inst-1',
      fullName: 'Ana Silva',
      phone: '11999999999',
      email: 'ana@test.com',
      specialty: 'Pilates',
      active: true,
    },
    {
      id: 'inst-2',
      fullName: 'Carlos Souza',
      phone: '11999999998',
      email: 'carlos@test.com',
      specialty: 'Yoga',
      active: true,
    },
  ];

  const mockAttendance: Attendance[] = [
    {
      id: 'a1',
      studioId: 'studio-1',
      classGroupId: 'cg-1',
      studentId: 'stu-1',
      studentName: 'Maria',
      attendanceDate: today,
      present: true,
    },
    {
      id: 'a2',
      studioId: 'studio-1',
      classGroupId: 'cg-2',
      studentId: 'stu-3',
      studentName: 'Ana',
      attendanceDate: today,
      present: true,
    },
  ];

  beforeEach(() => {
    sessionService = jasmine.createSpyObj('SessionService', ['getAll']);
    makeupRequestService = jasmine.createSpyObj('MakeupRequestService', ['getAll']);
    classGroupService = jasmine.createSpyObj('ClassGroupService', ['getAll']);
    enrollmentService = jasmine.createSpyObj('EnrollmentService', ['getAll']);
    instructorService = jasmine.createSpyObj('InstructorService', ['getAll']);
    attendanceService = jasmine.createSpyObj('AttendanceService', ['getAll']);

    TestBed.configureTestingModule({
      providers: [
        DashboardService,
        { provide: SessionService, useValue: sessionService },
        { provide: MakeupRequestService, useValue: makeupRequestService },
        { provide: ClassGroupService, useValue: classGroupService },
        { provide: EnrollmentService, useValue: enrollmentService },
        { provide: InstructorService, useValue: instructorService },
        { provide: AttendanceService, useValue: attendanceService },
      ],
    });

    service = TestBed.inject(DashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getOperationalDashboard', () => {
    beforeEach(() => {
      sessionService.getAll.and.returnValue(of(mockSessions));
      makeupRequestService.getAll.and.returnValue(of(mockMakeups));
      classGroupService.getAll.and.returnValue(of(mockClassGroups));
      enrollmentService.getAll.and.returnValue(of(mockEnrollments));
      instructorService.getAll.and.returnValue(of(mockInstructors));
      attendanceService.getAll.and.returnValue(of(mockAttendance));
    });

    it('calls all services with correct params', (done) => {
      service.getOperationalDashboard().subscribe(() => {
        expect(sessionService.getAll).toHaveBeenCalledWith({ sessionDate: today });
        expect(makeupRequestService.getAll).toHaveBeenCalledWith({ status: 'REQUESTED' });
        expect(classGroupService.getAll).toHaveBeenCalledWith({ active: true });
        expect(enrollmentService.getAll).toHaveBeenCalledWith({ active: true });
        expect(instructorService.getAll).toHaveBeenCalledWith({ active: true });
        expect(attendanceService.getAll).toHaveBeenCalledWith({ attendanceDate: today });
        done();
      });
    });

    it('returns correct card counts', (done) => {
      service.getOperationalDashboard().subscribe((data) => {
        expect(data.todayClasses).toBe(2);
        expect(data.ongoingClasses).toBe(1);
        expect(data.presentStudents).toBe(2);
        expect(data.pendingMakeups).toBe(1);
        done();
      });
    });

    it('returns upcoming sessions sorted by time', (done) => {
      service.getOperationalDashboard().subscribe((data) => {
        expect(data.upcomingSessions.length).toBe(2);
        expect(data.upcomingSessions[0].startTime).toBe('08:00');
        expect(data.upcomingSessions[1].startTime).toBe('09:00');
        done();
      });
    });

    it('maps instructor names to sessions', (done) => {
      service.getOperationalDashboard().subscribe((data) => {
        expect(data.upcomingSessions[0].instructorName).toBe('Ana Silva');
        expect(data.upcomingSessions[1].instructorName).toBe('Carlos Souza');
        done();
      });
    });

    it('returns pending makeup requests', (done) => {
      service.getOperationalDashboard().subscribe((data) => {
        expect(data.pendingMakeupRequests.length).toBe(1);
        expect(data.pendingMakeupRequests[0].studentName).toBe('Maria');
        done();
      });
    });

    it('returns class occupancy', (done) => {
      service.getOperationalDashboard().subscribe((data) => {
        expect(data.classOccupancy.length).toBe(2);
        const pilates = data.classOccupancy.find((c) => c.className === 'Pilates');
        expect(pilates?.enrolledCount).toBe(2);
        expect(pilates?.capacity).toBe(10);
        done();
      });
    });

    it('returns alerts for full classes', (done) => {
      service.getOperationalDashboard().subscribe((data) => {
        const fullClassAlert = data.alerts.find((a) => a.type === 'full_class');
        expect(fullClassAlert).toBeTruthy();
        done();
      });
    });

    it('returns alerts for pending makeups and ongoing classes', (done) => {
      service.getOperationalDashboard().subscribe((data) => {
        expect(data.alerts.some((a) => a.type === 'pending_makeup')).toBeTrue();
        expect(data.alerts.some((a) => a.type === 'ongoing_class')).toBeTrue();
        done();
      });
    });
  });

  describe('partial failures', () => {
    it('handles session service failure gracefully', (done) => {
      sessionService.getAll.and.returnValue(of([]));
      makeupRequestService.getAll.and.returnValue(of(mockMakeups));
      classGroupService.getAll.and.returnValue(of(mockClassGroups));
      enrollmentService.getAll.and.returnValue(of(mockEnrollments));
      instructorService.getAll.and.returnValue(of(mockInstructors));
      attendanceService.getAll.and.returnValue(of(mockAttendance));

      service.getOperationalDashboard().subscribe((data) => {
        expect(data.todayClasses).toBe(0);
        expect(data.pendingMakeups).toBe(1);
        done();
      });
    });

    it('handles all services returning empty arrays', (done) => {
      sessionService.getAll.and.returnValue(of([]));
      makeupRequestService.getAll.and.returnValue(of([]));
      classGroupService.getAll.and.returnValue(of([]));
      enrollmentService.getAll.and.returnValue(of([]));
      instructorService.getAll.and.returnValue(of([]));
      attendanceService.getAll.and.returnValue(of([]));

      service.getOperationalDashboard().subscribe((data) => {
        expect(data.todayClasses).toBe(0);
        expect(data.upcomingSessions.length).toBe(0);
        expect(data.pendingMakeupRequests.length).toBe(0);
        expect(data.classOccupancy.length).toBe(0);
        expect(data.alerts.length).toBe(0);
        done();
      });
    });
  });
});
