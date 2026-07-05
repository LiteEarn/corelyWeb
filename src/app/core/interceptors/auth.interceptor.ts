import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { TokenService } from '../auth/token.service';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);
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
          switchMap(() => {
            isRefreshing = false;
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
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
