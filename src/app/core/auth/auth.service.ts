import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { TokenService } from './token.service';
import { API_CONFIG } from '../config/api.config';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = API_CONFIG.baseURL + '/auth';

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {
    // Se houver um token no localStorage na inicialização, carrega-o
    if (this.tokenService.hasToken()) {
      console.log('[AuthService] Token encontrado no localStorage durante inicialização');
    }
  }

  /**
   * Realiza login e armazena o token
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        console.log('[AuthService] Login bem-sucedido, armazenando token');
        this.tokenService.setToken(response.token);
      })
    );
  }

  /**
   * Simula um token para testes/desenvolvimento
   * USE APENAS PARA TESTES
   */
  setMockToken(token: string): void {
    console.warn('[AuthService] ⚠️ Simulando token para testes - não use em produção!');
    this.tokenService.setToken(token);
  }

  /**
   * Realiza logout removendo o token
   */
  logout(): void {
    console.log('[AuthService] Logout realizado, removendo token');
    this.tokenService.removeToken();
  }

  /**
   * Retorna o token atual (para debug)
   */
  getCurrentToken(): string | null {
    return this.tokenService.getToken();
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    return this.tokenService.hasToken();
  }
}
