import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { SessionService } from '../session/session.service';
import { API_CONFIG } from '../config/api.config';

describe('AuthService', () => {
  let service: AuthService;
  let tokenService: TokenService;
  let sessionService: SessionService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(AuthService);
    tokenService = TestBed.inject(TokenService);
    sessionService = TestBed.inject(SessionService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('logout', () => {
    it('should remove tokens, clear session and navigate to login', () => {
      const navigateSpy = spyOn(router, 'navigate');
      tokenService.setAccessToken('test-access');
      tokenService.setRefreshToken('test-refresh');
      sessionService.setUser({
        id: '1', name: 'Test', email: 'test@test.com',
        role: 'ADMIN', studio: { id: 's1', name: 'Studio' },
        permissions: [], lastLogin: '2026-01-01T00:00:00'
      });

      service.logout();

      const req = httpMock.expectOne(`${API_CONFIG.baseURL}/auth/logout`);
      expect(req.request.method).toBe('POST');
      req.flush({});

      expect(tokenService.getAccessToken()).toBeNull();
      expect(tokenService.getRefreshToken()).toBeNull();
      expect(sessionService.isAuthenticated()).toBeFalse();
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });

    it('should handle logout when no refresh token exists', () => {
      const navigateSpy = spyOn(router, 'navigate');
      tokenService.removeTokens();
      sessionService.setUser({
        id: '1', name: 'Test', email: 'test@test.com',
        role: 'ADMIN', studio: { id: 's1', name: 'Studio' },
        permissions: [], lastLogin: '2026-01-01T00:00:00'
      });

      service.logout();

      httpMock.expectNone(`${API_CONFIG.baseURL}/auth/logout`);

      expect(tokenService.getAccessToken()).toBeNull();
      expect(sessionService.isAuthenticated()).toBeFalse();
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });

    it('should handle server error on logout gracefully', () => {
      const navigateSpy = spyOn(router, 'navigate');
      tokenService.setRefreshToken('test-refresh');
      sessionService.setUser({
        id: '1', name: 'Test', email: 'test@test.com',
        role: 'ADMIN', studio: { id: 's1', name: 'Studio' },
        permissions: [], lastLogin: '2026-01-01T00:00:00'
      });

      service.logout();

      const req = httpMock.expectOne(`${API_CONFIG.baseURL}/auth/logout`);
      req.error(new ProgressEvent('network error'));

      expect(tokenService.getAccessToken()).toBeNull();
      expect(sessionService.isAuthenticated()).toBeFalse();
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });
  });
});
