import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, finalize } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DsButtonComponent } from '../../../shared/design-system/button/button.component';
import { AuthService } from '../../../core/auth/auth.service';
import { SessionService } from '../../../core/session/session.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    DsButtonComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;

  private destroy$ = new Subject<void>();

  private sessionService = inject(SessionService);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
  ) {
    this.loginForm = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false],
    });
  }

  ngOnInit(): void {
    if (this.sessionService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }

    const rememberedEmail = localStorage.getItem('remembered_email');
    if (rememberedEmail) {
      this.loginForm.patchValue({ email: rememberedEmail, rememberMe: true });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.loading) return;

    this.loading = true;
    const { email, password, rememberMe } = this.loginForm.getRawValue();

    if (rememberMe) {
      localStorage.setItem('remembered_email', email);
    } else {
      localStorage.removeItem('remembered_email');
    }

    this.authService.login({ email, password })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (response) => {
          this.sessionService.setUser(response.user);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          if (error.status === 401) {
            this.toastService.error('Email ou senha inválidos.');
          } else if (error.status === 403) {
            this.toastService.error('Usuário sem acesso.');
          } else {
            this.toastService.error('Erro inesperado. Tente novamente.');
          }
          this.cdr.markForCheck();
        },
      });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}
