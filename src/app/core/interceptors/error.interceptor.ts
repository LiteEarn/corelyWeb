import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    // Handle errors
    // @ts-ignore - RxJS pipe typing issue
    catchError((error: HttpErrorResponse) => {
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        console.error('Client error:', error.error.message);
        toastService.error('Ocorreu um erro no cliente. Por favor, tente novamente.');
      } else {
        // Server-side error
        console.error('Server error:', error);

        // Check if it's a business rule error
        if (error.status === 400 && error.error?.code === 'BUSINESS_RULE') {
          // Display the business rule message from the API
          const message = error.error.message || 'Erro de regra de negócio.';
          // Use longer duration for business rule errors with detailed information
          toastService.error(message, 10000);
        } else if (error.status === 409) {
          // Conflict error (e.g., duplicate, constraint violation)
          // If confirmationRequired is true, the component will handle the dialog
          if (error.error?.confirmationRequired) {
            // Skip toast, component will show confirmation dialog
            console.log('Confirmation required, skipping toast');
          } else {
            const message = error.error?.message || 'Conflito de dados. Por favor, verifique as informações.';
            toastService.error(message);
          }
        } else if (error.status === 404) {
          // Not found error
          toastService.error('Recurso não encontrado.');
        } else if (error.status === 403) {
          // Forbidden error
          toastService.error('Você não tem permissão para realizar esta ação.');
        } else if (error.status === 401) {
          // Unauthorized error - don't show toast, let auth interceptor handle
          console.error('Unauthorized error');
        } else if (error.status >= 500) {
          // Server error
          toastService.error('Ocorreu um erro no servidor. Por favor, tente novamente mais tarde.');
        } else {
          // Other errors
          const message = error.error?.message || 'Ocorreu um erro inesperado. Por favor, tente novamente.';
          toastService.error(message);
        }
      }

      // Re-throw the error for the component to handle if needed
      throw error;
    })
  );
};

import { catchError } from 'rxjs/operators';
