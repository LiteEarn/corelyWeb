import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../session/session.service';

import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
      TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  let sessionService: SessionService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    sessionService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow access when authenticated', () => {
    sessionService.setUser({
      id: '123',
      name: 'Test',
      email: 'test@test.com',
      role: 'ADMIN',
      studio: { id: 's1', name: 'Studio' },
      permissions: [],
      lastLogin: '2026-01-01T00:00:00'
    });

    const result = executeGuard({} as any, { url: '/dashboard' } as any);

    expect(result).toBeTrue();
  });

  it('should redirect to login when not authenticated', () => {
    const navigateSpy = spyOn(router, 'navigate');

    sessionService.clear();

    const result = executeGuard({} as any, { url: '/dashboard' } as any);

    expect(result).toBeFalse();
    expect(navigateSpy).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/dashboard' } });
  });
});
