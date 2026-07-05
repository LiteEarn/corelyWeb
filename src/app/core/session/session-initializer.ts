import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { TokenService } from '../auth/token.service';
import { SessionService } from './session.service';

export function initializeSession() {
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);
  const sessionService = inject(SessionService);
  const router = inject(Router);

  return () => {
    if (!tokenService.hasAccessToken()) {
      sessionService.setLoading(false);
      return Promise.resolve();
    }

    return authService.me().pipe(
      tap(user => sessionService.setUser(user)),
      catchError(() => {
        if (tokenService.getRefreshToken()) {
          return authService.refresh().pipe(
            switchMap(() => authService.me()),
            tap(user => sessionService.setUser(user)),
            catchError(() => {
              tokenService.removeTokens();
              sessionService.clear();
              router.navigate(['/login']);
              return of(null);
            })
          );
        }
        tokenService.removeTokens();
        sessionService.clear();
        router.navigate(['/login']);
        return of(null);
      })
    ).toPromise().then(() => {
      sessionService.setLoading(false);
    });
  };
}
