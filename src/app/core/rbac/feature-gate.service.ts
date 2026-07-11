import { Injectable, inject } from '@angular/core';
import { SessionService } from '../session/session.service';
import { PermissionService } from './permission.service';
import { Role } from './role.enum';

@Injectable({ providedIn: 'root' })
export class FeatureGateService {
  private sessionService = inject(SessionService);
  private permissionService = inject(PermissionService);

  canViewDashboard(): boolean {
    return this.permissionService.hasPermission('DASHBOARD_VIEW');
  }

  canLoadStudents(): boolean {
    return this.permissionService.hasRole(Role.OWNER)
      || this.permissionService.hasRole(Role.ADMIN)
      || this.permissionService.hasRole(Role.RECEPTIONIST);
  }

  canManageStudents(): boolean {
    return this.permissionService.hasPermission('STUDENT_WRITE');
  }

  canLoadInstructors(): boolean {
    return this.permissionService.hasPermission('INSTRUCTOR_READ');
  }

  canManageInstructors(): boolean {
    return this.permissionService.hasPermission('INSTRUCTOR_WRITE');
  }

  canTransferInstructor(): boolean {
    return this.permissionService.hasPermission('INSTRUCTOR_WRITE');
  }

  canLoadClassGroups(): boolean {
    return this.permissionService.hasRole(Role.OWNER)
      || this.permissionService.hasRole(Role.ADMIN);
  }

  canManageClassGroups(): boolean {
    return this.permissionService.hasPermission('CLASS_GROUP_WRITE');
  }

  canInactivateClassGroup(): boolean {
    return this.permissionService.hasPermission('CLASS_GROUP_WRITE');
  }

  canReactivateClassGroup(): boolean {
    return this.permissionService.hasPermission('CLASS_GROUP_WRITE');
  }

  canLoadEnrollments(): boolean {
    return this.permissionService.hasRole(Role.OWNER)
      || this.permissionService.hasRole(Role.ADMIN)
      || this.permissionService.hasRole(Role.RECEPTIONIST);
  }

  canManageEnrollments(): boolean {
    return this.permissionService.hasPermission('ENROLLMENT_WRITE');
  }

  canLoadAttendance(): boolean {
    return this.permissionService.hasPermission('ATTENDANCE_READ');
  }

  canManageAttendance(): boolean {
    return this.permissionService.hasPermission('ATTENDANCE_WRITE');
  }

  canBulkCreateAttendance(): boolean {
    return this.permissionService.hasPermission('ATTENDANCE_WRITE');
  }

  canLoadSessions(): boolean {
    return this.permissionService.hasPermission('SESSION_READ');
  }

  canManageSessions(): boolean {
    return this.permissionService.hasPermission('SESSION_WRITE');
  }

  canStartSession(): boolean {
    return this.permissionService.hasPermission('SESSION_WRITE');
  }

  canCompleteSession(): boolean {
    return this.permissionService.hasPermission('SESSION_WRITE');
  }

  canLoadObjectives(): boolean {
    return this.permissionService.hasPermission('OBJECTIVE_READ');
  }

  canManageObjectives(): boolean {
    return this.permissionService.hasPermission('OBJECTIVE_WRITE');
  }

  canLoadEvaluations(): boolean {
    return this.permissionService.hasPermission('EVALUATION_READ');
  }

  canManageEvaluations(): boolean {
    return this.permissionService.hasPermission('EVALUATION_WRITE');
  }

  canLoadEvolutions(): boolean {
    return this.permissionService.hasPermission('EVOLUTION_READ');
  }

  canManageEvolutions(): boolean {
    return this.permissionService.hasPermission('EVOLUTION_WRITE');
  }

  canLoadMakeupRequests(): boolean {
    return this.permissionService.hasPermission('MAKEUP_REQUEST_READ');
  }

  canManageMakeupRequests(): boolean {
    return this.permissionService.hasPermission('MAKEUP_REQUEST_WRITE');
  }

  canLoadFinancial(): boolean {
    return this.permissionService.hasPermission('FINANCIAL_READ');
  }

  canManageFinancial(): boolean {
    return this.permissionService.hasPermission('FINANCIAL_WRITE');
  }

  canLoadUsers(): boolean {
    return this.permissionService.hasPermission('USER_READ');
  }

  canManageUsers(): boolean {
    return this.permissionService.hasPermission('USER_WRITE');
  }

  canLoadReports(): boolean {
    return this.permissionService.hasPermission('REPORT_READ');
  }

  canLoadSettings(): boolean {
    return this.permissionService.hasPermission('SETTINGS_READ');
  }

  canLoadPlans(): boolean {
    return this.permissionService.hasPermission('PLAN_READ');
  }

  canManagePlans(): boolean {
    return this.permissionService.hasPermission('PLAN_WRITE');
  }

  canManagePlanEnrollments(): boolean {
    return this.permissionService.hasPermission('PLAN_WRITE');
  }

  canLoadInstructorFilters(): boolean {
    return this.permissionService.hasRole(Role.OWNER)
      || this.permissionService.hasRole(Role.ADMIN);
  }

  canLoadStudentDropdown(): boolean {
    return this.permissionService.hasRole(Role.OWNER)
      || this.permissionService.hasRole(Role.ADMIN)
      || this.permissionService.hasRole(Role.RECEPTIONIST);
  }

  canLoadClassGroupDropdown(): boolean {
    return this.permissionService.hasRole(Role.OWNER)
      || this.permissionService.hasRole(Role.ADMIN);
  }

  canLoadEnrolledStudents(): boolean {
    return this.permissionService.hasRole(Role.OWNER)
      || this.permissionService.hasRole(Role.ADMIN)
      || this.permissionService.hasRole(Role.RECEPTIONIST);
  }

  isOwner(): boolean {
    return this.permissionService.hasRole(Role.OWNER);
  }

  isAdmin(): boolean {
    return this.permissionService.hasRole(Role.ADMIN);
  }

  isReceptionist(): boolean {
    return this.permissionService.hasRole(Role.RECEPTIONIST);
  }

  isInstructor(): boolean {
    return this.permissionService.hasRole(Role.INSTRUCTOR);
  }

  isFinancial(): boolean {
    return this.permissionService.hasRole(Role.FINANCIAL);
  }

  isStudent(): boolean {
    return this.permissionService.hasRole(Role.STUDENT);
  }
}
