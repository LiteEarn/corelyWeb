import { TestBed } from '@angular/core/testing';
import { PermissionService } from './permission.service';
import { SessionService } from '../session/session.service';
import { Role } from './role.enum';
import { CurrentUser } from '../auth/auth.models';

describe('PermissionService', () => {
  let service: PermissionService;
  let sessionService: SessionService;

  const adminUser: CurrentUser = {
    id: '1',
    name: 'Admin',
    email: 'admin@example.com',
    role: 'ADMIN',
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
    id: '2',
    name: 'Receptionist',
    email: 'rec@example.com',
    role: 'RECEPTIONIST',
    studio: { id: 's1', name: 'Studio 1' },
    permissions: [
      'DASHBOARD_VIEW',
      'STUDENT_READ', 'STUDENT_WRITE',
      'ENROLLMENT_READ', 'ENROLLMENT_WRITE',
      'ATTENDANCE_READ', 'ATTENDANCE_WRITE',
      'SESSION_READ', 'SESSION_WRITE',
      'CLASS_GROUP_READ',
      'MAKEUP_REQUEST_READ', 'MAKEUP_REQUEST_WRITE'
    ],
    lastLogin: '2026-01-01T00:00:00'
  };

  const instructorUser: CurrentUser = {
    id: '3',
    name: 'Instructor',
    email: 'inst@example.com',
    role: 'INSTRUCTOR',
    studio: { id: 's1', name: 'Studio 1' },
    permissions: [
      'DASHBOARD_VIEW',
      'OBJECTIVE_READ', 'OBJECTIVE_WRITE',
      'EVALUATION_READ', 'EVALUATION_WRITE',
      'EVOLUTION_READ', 'EVOLUTION_WRITE',
      'STUDENT_READ',
      'CLASS_GROUP_READ',
      'SESSION_READ', 'SESSION_WRITE',
      'ATTENDANCE_READ', 'ATTENDANCE_WRITE'
    ],
    lastLogin: '2026-01-01T00:00:00'
  };

  const financialUser: CurrentUser = {
    id: '4',
    name: 'Financial',
    email: 'fin@example.com',
    role: 'FINANCIAL',
    studio: { id: 's1', name: 'Studio 1' },
    permissions: [
      'DASHBOARD_VIEW',
      'FINANCIAL_READ', 'FINANCIAL_WRITE',
      'STUDENT_READ',
      'ENROLLMENT_READ'
    ],
    lastLogin: '2026-01-01T00:00:00'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PermissionService);
    sessionService = TestBed.inject(SessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('hasRole', () => {
    it('should return true when role matches', () => {
      sessionService.setUser(adminUser);
      expect(service.hasRole(Role.ADMIN)).toBeTrue();
    });

    it('should return false when role does not match', () => {
      sessionService.setUser(adminUser);
      expect(service.hasRole(Role.RECEPTIONIST)).toBeFalse();
    });

    it('should return false when no user is set', () => {
      expect(service.hasRole(Role.ADMIN)).toBeFalse();
    });
  });

  describe('hasAnyRole', () => {
    it('should return true when any role matches', () => {
      sessionService.setUser(adminUser);
      expect(service.hasAnyRole([Role.RECEPTIONIST, Role.ADMIN])).toBeTrue();
    });

    it('should return false when no role matches', () => {
      sessionService.setUser(adminUser);
      expect(service.hasAnyRole([Role.STUDENT, Role.FINANCIAL])).toBeFalse();
    });

    it('should return false for empty array', () => {
      sessionService.setUser(adminUser);
      expect(service.hasAnyRole([])).toBeFalse();
    });
  });

  describe('hasPermission', () => {
    it('should return true when user has the permission', () => {
      sessionService.setUser(adminUser);
      expect(service.hasPermission('DASHBOARD_VIEW')).toBeTrue();
    });

    it('should return false when user lacks the permission', () => {
      sessionService.setUser(receptionistUser);
      expect(service.hasPermission('INSTRUCTOR_WRITE')).toBeFalse();
    });

    it('should return false when no user is set', () => {
      expect(service.hasPermission('DASHBOARD_VIEW')).toBeFalse();
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true when any permission matches', () => {
      sessionService.setUser(receptionistUser);
      expect(service.hasAnyPermission(['INSTRUCTOR_WRITE', 'STUDENT_READ'])).toBeTrue();
    });

    it('should return false when no permission matches', () => {
      sessionService.setUser(receptionistUser);
      expect(service.hasAnyPermission(['INSTRUCTOR_WRITE', 'FINANCIAL_READ'])).toBeFalse();
    });
  });

  describe('getRolePermissions', () => {
    it('should return all permissions for ADMIN', () => {
      const perms = service.getRolePermissions(Role.ADMIN);
      expect(perms).toContain('DASHBOARD_VIEW');
      expect(perms).toContain('STUDENT_WRITE');
      expect(perms).toContain('STUDIO_WRITE');
      expect(perms).toContain('REPORT_READ');
      expect(perms).toContain('SETTINGS_READ');
    });

    it('should return limited permissions for RECEPTIONIST', () => {
      const perms = service.getRolePermissions(Role.RECEPTIONIST);
      expect(perms).toContain('STUDENT_READ');
      expect(perms).not.toContain('INSTRUCTOR_WRITE');
      expect(perms).not.toContain('FINANCIAL_READ');
    });

    it('should return empty array for unknown role', () => {
      const perms = service.getRolePermissions('UNKNOWN' as Role);
      expect(perms).toEqual([]);
    });
  });

  describe('getCurrentUserPermissions', () => {
    it('should return permissions from current user', () => {
      sessionService.setUser(receptionistUser);
      expect(service.getCurrentUserPermissions()).toEqual(receptionistUser.permissions);
    });

    it('should return empty array when no user', () => {
      expect(service.getCurrentUserPermissions()).toEqual([]);
    });
  });

  describe('getMenuItems', () => {
    it('should return all menu items for ADMIN', () => {
      sessionService.setUser(adminUser);
      const items = service.getMenuItems();
      expect(items.length).toBeGreaterThan(10);
    });

    it('should return limited menu items for RECEPTIONIST', () => {
      sessionService.setUser(receptionistUser);
      const items = service.getMenuItems();
      const labels = items.map(i => i.label);
      expect(labels).toContain('Dashboard');
      expect(labels).toContain('Alunos');
      expect(labels).toContain('Matrículas');
      expect(labels).toContain('Presença');
      expect(labels).toContain('Agenda do Dia');
      expect(labels).toContain('Reposições');
      expect(labels).toContain('Turmas');
      expect(labels).not.toContain('Instrutores');
      expect(labels).not.toContain('Financeiro');
    });

    it('should return limited menu items for INSTRUCTOR', () => {
      sessionService.setUser(instructorUser);
      const items = service.getMenuItems();
      const labels = items.map(i => i.label);
      expect(labels).toContain('Dashboard');
      expect(labels).toContain('Objetivos');
      expect(labels).toContain('Avaliações');
      expect(labels).toContain('Evoluções');
      expect(labels).toContain('Agenda do Dia');
      expect(labels).not.toContain('Instrutores');
      expect(labels).not.toContain('Financeiro');
    });

    it('should return limited menu items for FINANCIAL', () => {
      sessionService.setUser(financialUser);
      const items = service.getMenuItems();
      const labels = items.map(i => i.label);
      expect(labels).toContain('Dashboard');
      expect(labels).toContain('Financeiro');
      expect(labels).toContain('Alunos');
      expect(labels).toContain('Matrículas');
      expect(labels).not.toContain('Instrutores');
      expect(labels).not.toContain('Presença');
    });
  });

  describe('canAccessRoute', () => {
    it('should allow ADMIN to access students route', () => {
      sessionService.setUser(adminUser);
      expect(service.canAccessRoute('students')).toBeTrue();
    });

    it('should allow RECEPTIONIST to access students route', () => {
      sessionService.setUser(receptionistUser);
      expect(service.canAccessRoute('students')).toBeTrue();
    });

    it('should deny RECEPTIONIST access to instructors route', () => {
      sessionService.setUser(receptionistUser);
      expect(service.canAccessRoute('instructors')).toBeFalse();
    });

    it('should deny FINANCIAL access to instructors route', () => {
      sessionService.setUser(financialUser);
      expect(service.canAccessRoute('instructors')).toBeFalse();
    });

    it('should allow INSTRUCTOR access to daily-agenda route', () => {
      sessionService.setUser(instructorUser);
      expect(service.canAccessRoute('daily-agenda')).toBeTrue();
    });
  });

  describe('getDefaultRoute', () => {
    it('should return dashboard for ADMIN', () => {
      sessionService.setUser(adminUser);
      expect(service.getDefaultRoute()).toBe('/dashboard');
    });

    it('should return students for RECEPTIONIST', () => {
      sessionService.setUser(receptionistUser);
      expect(service.getDefaultRoute()).toBe('/students');
    });

    it('should return daily-agenda for INSTRUCTOR', () => {
      sessionService.setUser(instructorUser);
      expect(service.getDefaultRoute()).toBe('/daily-agenda');
    });

    it('should return financial for FINANCIAL', () => {
      sessionService.setUser(financialUser);
      expect(service.getDefaultRoute()).toBe('/financial');
    });
  });

  describe('role-based permission mapping', () => {
    it('should give STUDENT only read permissions', () => {
      sessionService.setUser({
        ...adminUser,
        role: 'STUDENT',
        permissions: ['OBJECTIVE_READ', 'EVALUATION_READ', 'EVOLUTION_READ']
      });
      expect(service.hasPermission('OBJECTIVE_READ')).toBeTrue();
      expect(service.hasPermission('STUDENT_WRITE')).toBeFalse();
    });

    it('should give FINANCIAL only finance and student read', () => {
      const perms = service.getRolePermissions(Role.FINANCIAL);
      expect(perms).toContain('FINANCIAL_READ');
      expect(perms).toContain('FINANCIAL_WRITE');
      expect(perms).toContain('STUDENT_READ');
      expect(perms).not.toContain('STUDENT_WRITE');
      expect(perms).not.toContain('INSTRUCTOR_READ');
    });
  });
});
