import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { SessionService } from '../session/session.service';
import { Role } from './role.enum';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  if (!sessionService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const requiredRoles = route.data['roles'] as Role[] | undefined;
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const userRole = sessionService.currentRole();
  const hasAccess = requiredRoles.includes(userRole as Role);

  if (!hasAccess) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
