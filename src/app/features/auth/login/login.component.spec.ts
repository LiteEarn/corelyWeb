import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router, ActivatedRoute } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of, throwError, delay } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/auth/auth.service';
import { SessionService } from '../../../core/session/session.service';
import { ToastService } from '../../../core/services/toast.service';
import { CurrentUser, LoginResponse } from '../../../core/auth/auth.models';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let sessionService: SessionService;
  let toastService: jasmine.SpyObj<ToastService>;
  let router: jasmine.SpyObj<Router>;

  const mockCurrentUser: CurrentUser = {
    id: '1', name: 'Admin', email: 'admin@corely.com',
    role: 'OWNER', studio: { id: 'studio-1', name: 'Corely Studio' },
    permissions: [], lastLogin: '2026-01-01T00:00:00'
  };

  const mockLoginResponse: LoginResponse = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 900000,
    user: mockCurrentUser,
    studioId: 'studio-1',
    studioName: 'Corely Studio',
    role: 'OWNER',
    permissions: [],
  };

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['login', 'me']);
    toastService = jasmine.createSpyObj('ToastService', ['error']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    authService.login.and.returnValue(of(mockLoginResponse));
    authService.me.and.returnValue(of(mockCurrentUser));
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideNoopAnimations(),
        { provide: ActivatedRoute, useValue: { snapshot: {} } },
        { provide: AuthService, useValue: authService },
        { provide: ToastService, useValue: toastService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    sessionService = TestBed.inject(SessionService);

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('form validation', () => {
    it('starts with invalid form', () => {
      expect(component.loginForm.valid).toBeFalse();
    });

    it('requires email field', () => {
      const email = component.loginForm.get('email');
      expect(email?.hasError('required')).toBeTrue();
    });

    it('validates email format', () => {
      const email = component.loginForm.get('email');
      email?.setValue('invalid-email');
      expect(email?.hasError('email')).toBeTrue();
    });

    it('accepts valid email', () => {
      const email = component.loginForm.get('email');
      email?.setValue('user@corely.com');
      expect(email?.valid).toBeTrue();
    });

    it('requires password field', () => {
      const password = component.loginForm.get('password');
      expect(password?.hasError('required')).toBeTrue();
    });

    it('accepts valid password', () => {
      const password = component.loginForm.get('password');
      password?.setValue('123456');
      expect(password?.valid).toBeTrue();
    });

    it('becomes valid when email and password are filled', () => {
      component.loginForm.patchValue({
        email: 'user@corely.com',
        password: '123456',
      });
      expect(component.loginForm.valid).toBeTrue();
    });
  });

  describe('submit button', () => {
    it('is disabled when form is invalid', () => {
      const button = fixture.debugElement.query(By.css('ds-button'));
      expect(button.componentInstance.disabled).toBeTrue();
    });

    it('is enabled when form is valid', () => {
      component.loginForm.patchValue({ email: 'user@corely.com', password: '123456' });
      fixture.detectChanges();
      const button = fixture.debugElement.query(By.css('ds-button'));
      expect(button.componentInstance.disabled).toBeFalse();
    });

    it('shows loading state during authentication', () => {
      component.loginForm.patchValue({ email: 'user@corely.com', password: '123456' });
      authService.login.and.returnValue(of(mockLoginResponse).pipe(delay(100)));
      component.onSubmit();
      expect(component.loading).toBeTrue();
    });
  });

  describe('authentication', () => {
    it('calls AuthService.login with credentials on submit', () => {
      component.loginForm.patchValue({ email: 'user@corely.com', password: '123456' });
      authService.login.and.returnValue(of(mockLoginResponse));
      component.onSubmit();
      expect(authService.login).toHaveBeenCalledWith({ email: 'user@corely.com', password: '123456' });
    });

    it('navigates to dashboard on success', () => {
      component.loginForm.patchValue({ email: 'user@corely.com', password: '123456' });
      authService.login.and.returnValue(of(mockLoginResponse));
      component.onSubmit();
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('sets loading to false after success', () => {
      component.loginForm.patchValue({ email: 'user@corely.com', password: '123456' });
      authService.login.and.returnValue(of(mockLoginResponse));
      component.onSubmit();
      expect(component.loading).toBeFalse();
    });

    it('does not submit when form is invalid', () => {
      authService.login.and.returnValue(of(mockLoginResponse));
      component.onSubmit();
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('does not submit when already loading', () => {
      component.loginForm.patchValue({ email: 'user@corely.com', password: '123456' });
      authService.login.and.returnValue(of(mockLoginResponse));
      component.loading = true;
      component.onSubmit();
      expect(authService.login).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('shows toast for 401 error', () => {
      component.loginForm.patchValue({ email: 'user@corely.com', password: '123456' });
      authService.login.and.returnValue(throwError(() => ({ status: 401 })));
      component.onSubmit();
      expect(toastService.error).toHaveBeenCalledWith('Email ou senha inválidos.');
    });

    it('shows toast for 403 error', () => {
      component.loginForm.patchValue({ email: 'user@corely.com', password: '123456' });
      authService.login.and.returnValue(throwError(() => ({ status: 403 })));
      component.onSubmit();
      expect(toastService.error).toHaveBeenCalledWith('Usuário sem acesso.');
    });

    it('shows toast for 500 error', () => {
      component.loginForm.patchValue({ email: 'user@corely.com', password: '123456' });
      authService.login.and.returnValue(throwError(() => ({ status: 500 })));
      component.onSubmit();
      expect(toastService.error).toHaveBeenCalledWith('Erro inesperado. Tente novamente.');
    });

    it('sets loading to false after error', () => {
      component.loginForm.patchValue({ email: 'user@corely.com', password: '123456' });
      authService.login.and.returnValue(throwError(() => ({ status: 401 })));
      component.onSubmit();
      expect(component.loading).toBeFalse();
    });
  });

  describe('password visibility', () => {
    it('starts with password hidden', () => {
      expect(component.hidePassword).toBeTrue();
    });

    it('toggles password visibility', () => {
      component.togglePasswordVisibility();
      expect(component.hidePassword).toBeFalse();
      component.togglePasswordVisibility();
      expect(component.hidePassword).toBeTrue();
    });

    it('toggles input type method correctly', () => {
      component.hidePassword = false;
      expect(component.hidePassword).toBeFalse();
    });

    it('renders password input with matInput directive', () => {
      const input = fixture.debugElement.query(By.css('input[formControlName="password"]'));
      expect(input).toBeTruthy();
    });
  });

  describe('remember me', () => {
    it('saves email to localStorage when checked and submitted', () => {
      component.loginForm.patchValue({ email: 'user@corely.com', password: '123456', rememberMe: true });
      authService.login.and.returnValue(of(mockLoginResponse));
      component.onSubmit();
      expect(localStorage.getItem('remembered_email')).toBe('user@corely.com');
    });

    it('removes email from localStorage when unchecked and submitted', () => {
      localStorage.setItem('remembered_email', 'existing@corely.com');
      component.loginForm.patchValue({ email: 'user@corely.com', password: '123456', rememberMe: false });
      authService.login.and.returnValue(of(mockLoginResponse));
      component.onSubmit();
      expect(localStorage.getItem('remembered_email')).toBeNull();
    });
  });

  describe('already authenticated', () => {
    it('redirects to dashboard on init if already authenticated', async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [LoginComponent],
        providers: [
          provideNoopAnimations(),
          { provide: ActivatedRoute, useValue: { snapshot: {} } },
          { provide: AuthService, useValue: authService },
          { provide: ToastService, useValue: toastService },
          { provide: Router, useValue: router },
        ],
      }).compileComponents();

      const sessionService = TestBed.inject(SessionService);
      sessionService.setUser(mockLoginResponse.user);

      fixture = TestBed.createComponent(LoginComponent);
      component = fixture.componentInstance;
      component.ngOnInit();
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  });

  describe('togglePasswordVisibility', () => {
    it('is a public method that toggles hidePassword', () => {
      component.hidePassword = true;
      component.togglePasswordVisibility();
      expect(component.hidePassword).toBeFalse();

      component.togglePasswordVisibility();
      expect(component.hidePassword).toBeTrue();
    });
  });
});
