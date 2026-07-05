import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { roleGuard } from './role.guard';
import { SessionService } from '../session/session.service';
import { Role } from './role.enum';
import { CurrentUser } from '../auth/auth.models';

describe('roleGuard', () => {
  let sessionService: SessionService;
  let router: jasmine.SpyObj<Router>;

  const adminUser: CurrentUser = {
    id: '1',
    name: 'Admin',
    email: 'admin@test.com',
    role: 'ADMIN',
    studio: { id: 's1', name: 'Studio' },
    permissions: ['DASHBOARD_VIEW']
  };

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router }
      ]
    });

    sessionService = TestBed.inject(SessionService);
  });

  const executeGuard = (roles?: Role[]) => {
    const route = { data: roles ? { roles } : {} } as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    return TestBed.runInInjectionContext(() => roleGuard(route, state));
  };

  it('should be created', () => {
    expect(roleGuard).toBeTruthy();
  });

  it('should redirect to login if not authenticated', () => {
    const result = executeGuard([Role.ADMIN]);
    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should allow access if authenticated and no roles required', () => {
    sessionService.setUser(adminUser);
    const result = executeGuard();
    expect(result).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should allow access if authenticated and roles required match', () => {
    sessionService.setUser(adminUser);
    const result = executeGuard([Role.ADMIN]);
    expect(result).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should allow access if authenticated and user has one of the required roles', () => {
    sessionService.setUser(adminUser);
    const result = executeGuard([Role.RECEPTIONIST, Role.ADMIN]);
    expect(result).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should deny and redirect to dashboard if role does not match', () => {
    sessionService.setUser(adminUser);
    const result = executeGuard([Role.RECEPTIONIST]);
    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should deny and redirect to dashboard if user has STUDENT role but ADMIN is required', () => {
    sessionService.setUser({ ...adminUser, role: 'STUDENT' });
    const result = executeGuard([Role.ADMIN]);
    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should handle empty roles array as no restriction', () => {
    sessionService.setUser(adminUser);
    const route = { data: { roles: [] } } as unknown as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    const result = TestBed.runInInjectionContext(() => roleGuard(route, state));
    expect(result).toBeTrue();
  });
});
