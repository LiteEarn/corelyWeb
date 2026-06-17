import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../auth/token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);

  console.log('[AuthInterceptor] Interceptando requisição:', req.url);

  const token = tokenService.getToken();
  console.log('[AuthInterceptor] Token encontrado:', !!token);

  // Se houver token, adiciona o header Authorization
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('[AuthInterceptor] Authorization header adicionado para:', req.url);
    return next(authReq);
  }

  console.log('[AuthInterceptor] Nenhum token disponível, enviando requisição sem autenticação');
  return next(req);
};
