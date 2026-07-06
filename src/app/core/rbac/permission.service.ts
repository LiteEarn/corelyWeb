import { Injectable, inject, computed } from '@angular/core';
import { SessionService } from '../session/session.service';
import { Role } from './role.enum';
import { MENU_PERMISSIONS, ROUTE_PERMISSIONS, ROLE_DEFAULT_ROUTES } from './permission-matrix';
import type { MenuItemDef } from './permission-matrix';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private sessionService = inject(SessionService);

  private rolePermissions: Record<Role, string[]> = {
    [Role.OWNER]: [
      'DASHBOARD_VIEW',
      'STUDENT_READ', 'STUDENT_WRITE',
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
    [Role.ADMIN]: [
      'DASHBOARD_VIEW',
      'STUDENT_READ', 'STUDENT_WRITE',
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
    [Role.RECEPTIONIST]: [
      'DASHBOARD_VIEW',
      'STUDENT_READ', 'STUDENT_WRITE',
      'ENROLLMENT_READ', 'ENROLLMENT_WRITE',
      'ATTENDANCE_READ', 'ATTENDANCE_WRITE',
      'SESSION_READ', 'SESSION_WRITE',
      'CLASS_GROUP_READ',
      'MAKEUP_REQUEST_READ', 'MAKEUP_REQUEST_WRITE',
    ],
    [Role.INSTRUCTOR]: [
      'DASHBOARD_VIEW',
      'OBJECTIVE_READ', 'OBJECTIVE_WRITE',
      'EVALUATION_READ', 'EVALUATION_WRITE',
      'EVOLUTION_READ', 'EVOLUTION_WRITE',
      'STUDENT_READ',
      'CLASS_GROUP_READ',
      'SESSION_READ', 'SESSION_WRITE',
      'ATTENDANCE_READ', 'ATTENDANCE_WRITE',
    ],
    [Role.FINANCIAL]: [
      'DASHBOARD_VIEW',
      'FINANCIAL_READ', 'FINANCIAL_WRITE',
      'STUDENT_READ',
      'ENROLLMENT_READ',
    ],
    [Role.STUDENT]: [
      'OBJECTIVE_READ',
      'EVALUATION_READ',
      'EVOLUTION_READ',
    ],
  };

  hasRole(role: Role): boolean {
    return this.sessionService.currentRole() === role;
  }

  hasAnyRole(roles: Role[]): boolean {
    return roles.length > 0 && roles.some(r => this.hasRole(r));
  }

  hasPermission(permission: string): boolean {
    return this.sessionService.permissions().includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    if (permissions.length === 0) return false;
    return permissions.some(p => this.hasPermission(p));
  }

  getRolePermissions(role: Role): string[] {
    return this.rolePermissions[role] || [];
  }

  getCurrentUserPermissions(): string[] {
    return this.sessionService.permissions();
  }

  getMenuItems(): MenuItemDef[] {
    return MENU_PERMISSIONS.filter(item =>
      this.hasAnyPermission(item.permissions)
    );
  }

  canAccessRoute(routePath: string): boolean {
    const routeDef = ROUTE_PERMISSIONS.find(r => {
      const pattern = r.path
        .replace(/:\w+/g, '[^/]+')
        .replace(/\//g, '\\/');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(routePath);
    });
    if (!routeDef) return false;
    return this.hasAnyRole(routeDef.roles);
  }

  getDefaultRoute(): string {
    const role = this.sessionService.currentRole();
    return ROLE_DEFAULT_ROUTES[role] || '/dashboard';
  }
}
