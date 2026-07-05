import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { TokenService } from '../auth/token.service';
import { SessionService } from './session.service';

export function initializeSession(): () => Promise<void> {
  return () => {
    const sessionService = inject(SessionService);
    const authService = inject(AuthService);
    const tokenService = inject(TokenService);

    sessionService.setLoading(true);

    if (!tokenService.hasAccessToken()) {
      sessionService.setLoading(false);
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      authService.me().subscribe({
        next: (user) => {
          sessionService.setUser(user);
          sessionService.setLoading(false);
          resolve();
        },
        error: () => {
          if (tokenService.getRefreshToken()) {
            authService.refresh().subscribe({
              next: () => {
                authService.me().subscribe({
                  next: (user) => {
                    sessionService.setUser(user);
                    sessionService.setLoading(false);
                    resolve();
                  },
                  error: () => {
                    tokenService.removeTokens();
                    sessionService.clear();
                    sessionService.setLoading(false);
                    resolve();
                  }
                });
              },
              error: () => {
                tokenService.removeTokens();
                sessionService.clear();
                sessionService.setLoading(false);
                resolve();
              }
            });
          } else {
            tokenService.removeTokens();
            sessionService.clear();
            sessionService.setLoading(false);
            resolve();
          }
        }
      });
    });
  };
}
