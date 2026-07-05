import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { TokenService } from '../auth/token.service';
import { AuthService } from '../auth/auth.service';
import { SessionService } from '../session/session.service';
import { of } from 'rxjs';

import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => authInterceptor(req, next));

  let tokenService: jasmine.SpyObj<TokenService>;
  let sessionService: SessionService;

  beforeEach(() => {
    const tokenSpy = jasmine.createSpyObj('TokenService', ['getAccessToken', 'getRefreshToken', 'removeTokens']);
    const authSpy = jasmine.createSpyObj('AuthService', ['refresh', 'me']);

    TestBed.configureTestingModule({
      providers: [
        { provide: TokenService, useValue: tokenSpy },
        { provide: AuthService, useValue: authSpy },
      ]
    });

    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
    sessionService = TestBed.inject(SessionService);
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should add Authorization header when token exists', (done) => {
    tokenService.getAccessToken.and.returnValue('test-token');

    const req = new HttpRequest('GET', '/test');
    const next: HttpHandlerFn = (handlerReq) => {
      expect(handlerReq.headers.get('Authorization')).toBe('Bearer test-token');
      done();
      return of({} as any);
    };

    interceptor(req, next).subscribe();
  });

  it('should not add Authorization header when no token', (done) => {
    tokenService.getAccessToken.and.returnValue(null);

    const req = new HttpRequest('GET', '/test');
    const next: HttpHandlerFn = (handlerReq) => {
      expect(handlerReq.headers.has('Authorization')).toBeFalse();
      done();
      return of({} as any);
    };

    interceptor(req, next).subscribe();
  });
});
