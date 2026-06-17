import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly TOKEN_KEY = 'auth_token';

  constructor() { }

  /**
   * Armazena o token no localStorage
   */
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    console.log('[TokenService] Token armazenado no localStorage');
  }

  /**
   * Recupera o token do localStorage
   */
  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    console.log('[TokenService] Token recuperado:', !!token);
    return token;
  }

  /**
   * Verifica se existe um token
   */
  hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * Remove o token do localStorage
   */
  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    console.log('[TokenService] Token removido do localStorage');
  }

  /**
   * Retorna o token no formato 'Bearer <token>'
   */
  getAuthorizationHeader(): string | null {
    const token = this.getToken();
    return token ? `Bearer ${token}` : null;
  }
}
