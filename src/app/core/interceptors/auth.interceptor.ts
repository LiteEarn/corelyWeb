import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, tap, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { SessionService } from '../session/session.service';
import { TokenService } from '../auth/token.service';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);
  const sessionService = inject(SessionService);
  const router = inject(Router);

  const token = tokenService.getAccessToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isRefreshing && tokenService.getRefreshToken()) {
        isRefreshing = true;
        return authService.refresh().pipe(
          switchMap(() => authService.me()),
          tap(user => {
            isRefreshing = false;
            sessionService.setUser(user);
          }),
          switchMap(() => {
            const newToken = tokenService.getAccessToken();
            if (newToken) {
              const newReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              return next(newReq);
            }
            return throwError(() => error);
          }),
          catchError((refreshError) => {
            isRefreshing = false;
            tokenService.removeTokens();
            sessionService.clear();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
