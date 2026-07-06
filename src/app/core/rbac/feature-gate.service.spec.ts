import { TestBed } from '@angular/core/testing';
import { FeatureGateService } from './feature-gate.service';
import { PermissionService } from './permission.service';
import { SessionService } from '../session/session.service';
import { CurrentUser } from '../auth/auth.models';

describe('FeatureGateService', () => {
  let service: FeatureGateService;
  let sessionService: SessionService;

  const ownerUser: CurrentUser = {
    id: '0', name: 'Owner', email: 'owner@example.com', role: 'OWNER',
    studio: { id: 's1', name: 'Studio 1' },
    permissions: [
      'DASHBOARD_VIEW', 'STUDENT_READ', 'STUDENT_WRITE',
      'INSTRUCTOR_READ', 'INSTRUCTOR_WRITE',
      'CLASS_GROUP_READ', 'CLASS_GROUP_WRITE',
      'ENROLLMENT_READ', 'ENROLLMENT_WRITE',
      'ATTENDANCE_READ', 'ATTENDANCE_WRITE',
      'SESSION_READ', 'SESSION_WRITE',
      'OBJECTIVE_READ', 'OBJECTIVE_WRITE',
      'EVALUATION_READ', 'EVALUATION_WRITE',
      'EVOLUTION_READ', 'EVOLUTION_WRITE',
      'MAKEUP_REQUEST_READ', 'MAKEUP_REQUEST_WRITE',
      'FINANCIAL_READ', 'FINANCIAL_WRITE',
      'USER_READ', 'USER_WRITE',
      'STUDIO_READ', 'STUDIO_WRITE',
      'REPORT_READ', 'REPORT_WRITE',
      'SETTINGS_READ', 'SETTINGS_WRITE',
    ],
    lastLogin: '2026-01-01T00:00:00'
  };

  const adminUser: CurrentUser = {
    id: '1', name: 'Admin', email: 'admin@example.com', role: 'ADMIN',
    studio: { id: 's1', name: 'Studio 1' },
    permissions: [
      'DASHBOARD_VIEW', 'STUDENT_READ', 'STUDENT_WRITE',
      'INSTRUCTOR_READ', 'INSTRUCTOR_WRITE',
      'CLASS_GROUP_READ', 'CLASS_GROUP_WRITE',
      'ENROLLMENT_READ', 'ENROLLMENT_WRITE',
      'ATTENDANCE_READ', 'ATTENDANCE_WRITE',
      'SESSION_READ', 'SESSION_WRITE',
      'OBJECTIVE_READ', 'OBJECTIVE_WRITE',
      'EVALUATION_READ', 'EVALUATION_WRITE',
      'EVOLUTION_READ', 'EVOLUTION_WRITE',
      'MAKEUP_REQUEST_READ', 'MAKEUP_REQUEST_WRITE',
      'FINANCIAL_READ', 'FINANCIAL_WRITE',
      'USER_READ', 'USER_WRITE',
      'STUDIO_READ', 'STUDIO_WRITE',
      'REPORT_READ', 'REPORT_WRITE',
      'SETTINGS_READ', 'SETTINGS_WRITE',
    ],
    lastLogin: '2026-01-01T00:00:00'
  };

  const receptionistUser: CurrentUser = {
    id: '2', name: 'Receptionist', email: 'rec@example.com', role: 'RECEPTIONIST',
    studio: { id: 's1', name: 'Studio 1' },
    permissions: [
      'DASHBOARD_VIEW', 'STUDENT_READ', 'STUDENT_WRITE',
      'ENROLLMENT_READ', 'ENROLLMENT_WRITE',
      'ATTENDANCE_READ', 'ATTENDANCE_WRITE',
      'SESSION_READ', 'SESSION_WRITE',
      'CLASS_GROUP_READ',
      'MAKEUP_REQUEST_READ', 'MAKEUP_REQUEST_WRITE',
    ],
    lastLogin: '2026-01-01T00:00:00'
  };

  const instructorUser: CurrentUser = {
    id: '3', name: 'Instructor', email: 'inst@example.com', role: 'INSTRUCTOR',
    studio: { id: 's1', name: 'Studio 1' },
    permissions: [
      'DASHBOARD_VIEW',
      'OBJECTIVE_READ', 'OBJECTIVE_WRITE',
      'EVALUATION_READ', 'EVALUATION_WRITE',
      'EVOLUTION_READ', 'EVOLUTION_WRITE',
      'STUDENT_READ',
      'CLASS_GROUP_READ',
      'SESSION_READ', 'SESSION_WRITE',
      'ATTENDANCE_READ', 'ATTENDANCE_WRITE',
    ],
    lastLogin: '2026-01-01T00:00:00'
  };

  const financialUser: CurrentUser = {
    id: '4', name: 'Financial', email: 'fin@example.com', role: 'FINANCIAL',
    studio: { id: 's1', name: 'Studio 1' },
    permissions: [
      'DASHBOARD_VIEW',
      'FINANCIAL_READ', 'FINANCIAL_WRITE',
      'STUDENT_READ',
      'ENROLLMENT_READ',
    ],
    lastLogin: '2026-01-01T00:00:00'
  };

  const studentUser: CurrentUser = {
    id: '5', name: 'Student', email: 'student@example.com', role: 'STUDENT',
    studio: { id: 's1', name: 'Studio 1' },
    permissions: ['OBJECTIVE_READ', 'EVALUATION_READ', 'EVOLUTION_READ'],
    lastLogin: '2026-01-01T00:00:00'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeatureGateService);
    sessionService = TestBed.inject(SessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('canViewDashboard', () => {
    it('should return true for ADMIN', () => {
      sessionService.setUser(adminUser);
      expect(service.canViewDashboard()).toBeTrue();
    });

    it('should return true for RECEPTIONIST', () => {
      sessionService.setUser(receptionistUser);
      expect(service.canViewDashboard()).toBeTrue();
    });

    it('should return true for INSTRUCTOR', () => {
      sessionService.setUser(instructorUser);
      expect(service.canViewDashboard()).toBeTrue();
    });

    it('should return true for FINANCIAL', () => {
      sessionService.setUser(financialUser);
      expect(service.canViewDashboard()).toBeTrue();
    });

    it('should return false when not authenticated', () => {
      expect(service.canViewDashboard()).toBeFalse();
    });
  });

  describe('canLoadStudents', () => {
    it('should allow OWNER', () => {
      sessionService.setUser(ownerUser);
      expect(service.canLoadStudents()).toBeTrue();
    });

    it('should allow ADMIN', () => {
      sessionService.setUser(adminUser);
      expect(service.canLoadStudents()).toBeTrue();
    });

    it('should allow RECEPTIONIST', () => {
      sessionService.setUser(receptionistUser);
      expect(service.canLoadStudents()).toBeTrue();
    });

    it('should deny INSTRUCTOR', () => {
      sessionService.setUser(instructorUser);
      expect(service.canLoadStudents()).toBeFalse();
    });

    it('should deny FINANCIAL', () => {
      sessionService.setUser(financialUser);
      expect(service.canLoadStudents()).toBeFalse();
    });

    it('should deny STUDENT', () => {
      sessionService.setUser(studentUser);
      expect(service.canLoadStudents()).toBeFalse();
    });
  });

  describe('canManageStudents', () => {
    it('should allow ADMIN', () => {
      sessionService.setUser(adminUser);
      expect(service.canManageStudents()).toBeTrue();
    });

    it('should allow RECEPTIONIST', () => {
      sessionService.setUser(receptionistUser);
      expect(service.canManageStudents()).toBeTrue();
    });

    it('should deny INSTRUCTOR', () => {
      sessionService.setUser(instructorUser);
      expect(service.canManageStudents()).toBeFalse();
    });
  });

  describe('canLoadClassGroups', () => {
    it('should allow OWNER', () => {
      sessionService.setUser(ownerUser);
      expect(service.canLoadClassGroups()).toBeTrue();
    });

    it('should allow ADMIN', () => {
      sessionService.setUser(adminUser);
      expect(service.canLoadClassGroups()).toBeTrue();
    });

    it('should deny RECEPTIONIST', () => {
      sessionService.setUser(receptionistUser);
      expect(service.canLoadClassGroups()).toBeFalse();
    });

    it('should deny INSTRUCTOR', () => {
      sessionService.setUser(instructorUser);
      expect(service.canLoadClassGroups()).toBeFalse();
    });
  });

  describe('canManageClassGroups', () => {
    it('should allow ADMIN', () => {
      sessionService.setUser(adminUser);
      expect(service.canManageClassGroups()).toBeTrue();
    });

    it('should deny RECEPTIONIST', () => {
      sessionService.setUser(receptionistUser);
      expect(service.canManageClassGroups()).toBeFalse();
    });

    it('should deny INSTRUCTOR', () => {
      sessionService.setUser(instructorUser);
      expect(service.canManageClassGroups()).toBeFalse();
    });
  });

  describe('canInactivateClassGroup', () => {
    it('should allow ADMIN', () => {
      sessionService.setUser(adminUser);
      expect(service.canInactivateClassGroup()).toBeTrue();
    });

    it('should deny RECEPTIONIST', () => {
      sessionService.setUser(receptionistUser);
      expect(service.canInactivateClassGroup()).toBeFalse();
    });
  });

  describe('canReactivateClassGroup', () => {
    it('should allow ADMIN', () => {
      sessionService.setUser(adminUser);
      expect(service.canReactivateClassGroup()).toBeTrue();
    });

    it('should deny RECEPTIONIST', () => {
      sessionService.setUser(receptionistUser);
      expect(service.canReactivateClassGroup()).toBeFalse();
    });
  });

  describe('canLoadEnrollments', () => {
    it('should allow ADMIN', () => {
      sessionService.setUser(adminUser);
      expect(service.canLoadEnrollments()).toBeTrue();
    });

    it('should allow RECEPTIONIST', () => {
      sessionService.setUser(receptionistUser);
      expect(service.canLoadEnrollments()).toBeTrue();
    });

    it('should deny FINANCIAL', () => {
      sessionService.setUser(financialUser);
      expect(service.canLoadEnrollments()).toBeFalse();
    });

    it('should deny INSTRUCTOR', () => {
      sessionService.setUser(instructorUser);
      expect(service.canLoadEnrollments()).toBeFalse();
    });
  });

  describe('canManageEnrollments', () => {
    it('should allow ADMIN', () => {
      sessionService.setUser(adminUser);
      expect(service.canManageEnrollments()).toBeTrue();
    });

    it('should allow RECEPTIONIST', () => {
      sessionService.setUser(receptionistUser);
      expect(service.canManageEnrollments()).toBeTrue();
    });

    it('should deny INSTRUCTOR', () => {
      sessionService.setUser(instructorUser);
      expect(service.canManageEnrollments()).toBeFalse();
    });
  });

  describe('canLoadAttendance', () => {
    it('should allow ADMIN', () => {
      sessionService.setUser(adminUser);
      expect(service.canLoadAttendance()).toBeTrue();
    });

    it('should allow INSTRUCTOR', () => {
      sessionService.setUser(instructorUser);
      expect(service.canLoadAttendance()).toBeTrue();
    });

    it('should allow RECEPTIONIST', () => {
      sessionService.setUser(receptionistUser);
      expect(service.canLoadAttendance()).toBeTrue();
    });

    it('should deny FINANCIAL', () => {
      sessionService.setUser(financialUser);
      expect(service.canLoadAttendance()).toBeFalse();
    });
  });

  describe('canManageAttendance', () => {
    it('should allow ADMIN', () => {
      sessionService.setUser(adminUser);
      expect(service.canManageAttendance()).toBeTrue();
    });

    it('should allow INSTRUCTOR', () => {
      sessionService.setUser(instructorUser);
      expect(service.canManageAttendance()).toBeTrue();
    });

    it('should allow RECEPTIONIST', () => {
      sessionService.setUser(receptionistUser);
      expect(service.canManageAttendance()).toBeTrue();
    });
  });

  describe('canLoadSessions', () => {
    it('should allow ADMIN', () => {
      sessionService.setUser(adminUser);
      expect(service.canLoadSessions()).toBeTrue();
    });

    it('should allow INSTRUCTOR', () => {
      sessionService.setUser(instructorUser);
      expect(service.canLoadSessions()).toBeTrue();
    });

    it('should allow RECEPTIONIST', () => {
      sessionService.setUser(receptionistUser);
      expect(service.canLoadSessions()).toBeTrue();
    });

    it('should deny FINANCIAL', () => {
      sessionService.setUser(financialUser);
      expect(service.canLoadSessions()).toBeFalse();
    });
  });

  describe('canLoadObjectives', () => {
    it('should allow ADMIN', () => {
      sessionService.setUser(adminUser);
      expect(service.canLoadObjectives()).toBeTrue();
    });

    it('should allow INSTRUCTOR', () => {
      sessionService.setUser(instructorUser);
      expect(service.canLoadObjectives()).toBeTrue();
    });

    it('should deny RECEPTIONIST', () => {
      sessionService.setUser(receptionistUser);
      expect(service.canLoadObjectives()).toBeFalse();
    });

    it('should allow STUDENT', () => {
      sessionService.setUser(studentUser);
      expect(service.canLoadObjectives()).toBeTrue();
    });
  });

  describe('canLoadEvaluations', () => {
    it('should allow ADMIN', () => {
      sessionService.setUser(adminUser);
      expect(service.canLoadEvaluations()).toBeTrue();
    });

    it('should allow INSTRUCTOR', () => {
      sessionService.setUser(instructorUser);
      expect(service.canLoadEvaluations()).toBeTrue();
    });

    it('should allow STUDENT', () => {
      sessionService.setUser(studentUser);
      expect(service.canLoadEvaluations()).toBeTrue();
    });

    it('should deny RECEPTIONIST', () => {
      sessionService.setUser(receptionistUser);
      expect(service.canLoadEvaluations()).toBeFalse();
    });
  });

  describe('canLoadEvolutions', () => {
    it('should allow ADMIN', () => {
      sessionService.setUser(adminUser);
      expect(service.canLoadEvolutions()).toBeTrue();
    });

    it('should allow INSTRUCTOR', () => {
      sessionService.setUser(instructorUser);
      expect(service.canLoadEvolutions()).toBeTrue();
    });

    it('should allow STUDENT', () => {
      sessionService.setUser(studentUser);
      expect(service.canLoadEvolutions()).toBeTrue();
    });

    it('should deny RECEPTIONIST', () => {
      sessionService.setUser(receptionistUser);
      expect(service.canLoadEvolutions()).toBeFalse();
    });
  });

  describe('canManageObjectives', () => {
    it('should allow ADMIN', () => {
      sessionService.setUser(adminUser);
      expect(service.canManageObjectives()).toBeTrue();
    });

    it('should allow INSTRUCTOR', () => {
      sessionService.setUser(instructorUser);
      expect(service.canManageObjectives()).toBeTrue();
    });

    it('should deny RECEPTIONIST', () => {
      sessionService.setUser(receptionistUser);
      expect(service.canManageObjectives()).toBeFalse();
    });

    it('should deny STUDENT', () => {
      sessionService.setUser(studentUser);
      expect(service.canManageObjectives()).toBeFalse();
    });
  });

  describe('canLoadMakeupRequests', () => {
    it('should allow ADMIN', () => {
      sessionService.setUser(adminUser);
      expect(service.canLoadMakeupRequests()).toBeTrue();
    });

    it('should allow RECEPTIONIST', () => {
      sessionService.setUser(receptionistUser);
      expect(service.canLoadMakeupRequests()).toBeTrue();
    });

    it('should deny INSTRUCTOR', () => {
      sessionService.setUser(instructorUser);
      expect(service.canLoadMakeupRequests()).toBeFalse();
    });
  });

  describe('canManageMakeupRequests', () => {
    it('should allow ADMIN', () => {
      sessionService.setUser(adminUser);
      expect(service.canManageMakeupRequests()).toBeTrue();
    });

    it('should allow RECEPTIONIST', () => {
      sessionService.setUser(receptionistUser);
      expect(service.canManageMakeupRequests()).toBeTrue();
    });

    it('should deny INSTRUCTOR', () => {
      sessionService.setUser(instructorUser);
      expect(service.canManageMakeupRequests()).toBeFalse();
    });
  });

  describe('canLoadFinancial', () => {
    it('should allow ADMIN', () => {
      sessionService.setUser(adminUser);
      expect(service.canLoadFinancial()).toBeTrue();
    });

    it('should allow FINANCIAL', () => {
      sessionService.setUser(financialUser);
      expect(service.canLoadFinancial()).toBeTrue();
    });

    it('should deny RECEPTIONIST', () => {
      sessionService.setUser(receptionistUser);
      expect(service.canLoadFinancial()).toBeFalse();
    });
  });

  describe('canManageFinancial', () => {
    it('should allow ADMIN', () => {
      sessionService.setUser(adminUser);
      expect(service.canManageFinancial()).toBeTrue();
    });

    it('should allow FINANCIAL', () => {
      sessionService.setUser(financialUser);
      expect(service.canManageFinancial()).toBeTrue();
    });

    it('should deny RECEPTIONIST', () => {
      sessionService.setUser(receptionistUser);
      expect(service.canManageFinancial()).toBeFalse();
    });
  });

  describe('canLoadInstructorFilters', () => {
    it('should allow OWNER', () => {
      sessionService.setUser(ownerUser);
      expect(service.canLoadInstructorFilters()).toBeTrue();
    });

    it('should allow ADMIN', () => {
      sessionService.setUser(adminUser);
      expect(service.canLoadInstructorFilters()).toBeTrue();
    });

    it('should deny RECEPTIONIST', () => {
      sessionService.setUser(receptionistUser);
      expect(service.canLoadInstructorFilters()).toBeFalse();
    });

    it('should deny INSTRUCTOR', () => {
      sessionService.setUser(instructorUser);
      expect(service.canLoadInstructorFilters()).toBeFalse();
    });
  });

  describe('canLoadStudentDropdown', () => {
    it('should allow ADMIN', () => {
      sessionService.setUser(adminUser);
      expect(service.canLoadStudentDropdown()).toBeTrue();
    });

    it('should allow RECEPTIONIST', () => {
      sessionService.setUser(receptionistUser);
      expect(service.canLoadStudentDropdown()).toBeTrue();
    });

    it('should deny INSTRUCTOR', () => {
      sessionService.setUser(instructorUser);
      expect(service.canLoadStudentDropdown()).toBeFalse();
    });

    it('should deny FINANCIAL', () => {
      sessionService.setUser(financialUser);
      expect(service.canLoadStudentDropdown()).toBeFalse();
    });
  });

  describe('canLoadClassGroupDropdown', () => {
    it('should allow ADMIN', () => {
      sessionService.setUser(adminUser);
      expect(service.canLoadClassGroupDropdown()).toBeTrue();
    });

    it('should deny RECEPTIONIST', () => {
      sessionService.setUser(receptionistUser);
      expect(service.canLoadClassGroupDropdown()).toBeFalse();
    });

    it('should deny INSTRUCTOR', () => {
      sessionService.setUser(instructorUser);
      expect(service.canLoadClassGroupDropdown()).toBeFalse();
    });
  });

  describe('role checks', () => {
    it('isOwner should return true only for OWNER', () => {
      sessionService.setUser(ownerUser);
      expect(service.isOwner()).toBeTrue();
      sessionService.setUser(adminUser);
      expect(service.isOwner()).toBeFalse();
    });

    it('isAdmin should return true only for ADMIN', () => {
      sessionService.setUser(adminUser);
      expect(service.isAdmin()).toBeTrue();
      sessionService.setUser(ownerUser);
      expect(service.isAdmin()).toBeFalse();
    });

    it('isReceptionist should return true only for RECEPTIONIST', () => {
      sessionService.setUser(receptionistUser);
      expect(service.isReceptionist()).toBeTrue();
      sessionService.setUser(adminUser);
      expect(service.isReceptionist()).toBeFalse();
    });

    it('isInstructor should return true only for INSTRUCTOR', () => {
      sessionService.setUser(instructorUser);
      expect(service.isInstructor()).toBeTrue();
      sessionService.setUser(adminUser);
      expect(service.isInstructor()).toBeFalse();
    });

    it('isFinancial should return true only for FINANCIAL', () => {
      sessionService.setUser(financialUser);
      expect(service.isFinancial()).toBeTrue();
      sessionService.setUser(adminUser);
      expect(service.isFinancial()).toBeFalse();
    });

    it('isStudent should return true only for STUDENT', () => {
      sessionService.setUser(studentUser);
      expect(service.isStudent()).toBeTrue();
      sessionService.setUser(adminUser);
      expect(service.isStudent()).toBeFalse();
    });
  });

  describe('canManageSessions', () => {
    it('should allow ADMIN', () => {
      sessionService.setUser(adminUser);
      expect(service.canManageSessions()).toBeTrue();
    });

    it('should allow INSTRUCTOR', () => {
      sessionService.setUser(instructorUser);
      expect(service.canManageSessions()).toBeTrue();
    });

    it('should allow RECEPTIONIST', () => {
      sessionService.setUser(receptionistUser);
      expect(service.canManageSessions()).toBeTrue();
    });

    it('should deny FINANCIAL', () => {
      sessionService.setUser(financialUser);
      expect(service.canManageSessions()).toBeFalse();
    });
  });

  describe('canStartSession / canCompleteSession', () => {
    it('should allow ADMIN to start', () => {
      sessionService.setUser(adminUser);
      expect(service.canStartSession()).toBeTrue();
    });

    it('should allow INSTRUCTOR to complete', () => {
      sessionService.setUser(instructorUser);
      expect(service.canCompleteSession()).toBeTrue();
    });

    it('should deny FINANCIAL to start', () => {
      sessionService.setUser(financialUser);
      expect(service.canStartSession()).toBeFalse();
    });
  });

  describe('canTransferInstructor', () => {
    it('should allow ADMIN', () => {
      sessionService.setUser(adminUser);
      expect(service.canTransferInstructor()).toBeTrue();
    });

    it('should deny RECEPTIONIST', () => {
      sessionService.setUser(receptionistUser);
      expect(service.canTransferInstructor()).toBeFalse();
    });
  });

  describe('canBulkCreateAttendance', () => {
    it('should allow ADMIN', () => {
      sessionService.setUser(adminUser);
      expect(service.canBulkCreateAttendance()).toBeTrue();
    });

    it('should allow INSTRUCTOR', () => {
      sessionService.setUser(instructorUser);
      expect(service.canBulkCreateAttendance()).toBeTrue();
    });

    it('should deny FINANCIAL', () => {
      sessionService.setUser(financialUser);
      expect(service.canBulkCreateAttendance()).toBeFalse();
    });
  });
});
