import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
<<<<<<< HEAD
import { errorInterceptor } from './core/interceptors/error.interceptor';
=======
>>>>>>> 8d033bff9dd050d48bab71765c257d850e300cf8

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
<<<<<<< HEAD
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))
=======
    provideHttpClient(withInterceptors([authInterceptor]))
>>>>>>> 8d033bff9dd050d48bab71765c257d850e300cf8
  ]
};
