import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { TokenService } from './token.service';
import { SessionService } from '../session/session.service';
import { API_CONFIG } from '../config/api.config';
import { CurrentUser, LoginRequest, LoginResponse, RefreshTokenResponse } from './auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = API_CONFIG.baseURL + '/auth';

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private sessionService: SessionService
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.tokenService.setAccessToken(response.accessToken);
        this.tokenService.setRefreshToken(response.refreshToken);
        this.sessionService.setUser(response.user);
      })
    );
  }

  refresh(): Observable<RefreshTokenResponse> {
    const refreshToken = this.tokenService.getRefreshToken();
    return this.http.post<RefreshTokenResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap(response => {
        this.tokenService.setAccessToken(response.accessToken);
        this.tokenService.setRefreshToken(response.refreshToken);
      })
    );
  }

  me(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(`${this.apiUrl}/me`);
  }

  logout(): void {
    const refreshToken = this.tokenService.getRefreshToken();
    if (refreshToken) {
      this.http.post(`${this.apiUrl}/logout`, { refreshToken }).subscribe({
        error: () => {}
      });
    }
    this.tokenService.removeTokens();
    this.sessionService.clear();
  }

  isAuthenticated(): boolean {
    return this.tokenService.hasAccessToken();
  }

  getAccessToken(): string | null {
    return this.tokenService.getAccessToken();
  }

  getRefreshToken(): string | null {
    return this.tokenService.getRefreshToken();
  }
}
