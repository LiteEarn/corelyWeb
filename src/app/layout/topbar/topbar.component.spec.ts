import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { TopbarComponent } from './topbar.component';
import { SessionService } from '../../core/session/session.service';
import { AuthService } from '../../core/auth/auth.service';
import { CurrentUser } from '../../core/auth/auth.models';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { of } from 'rxjs';

describe('TopbarComponent', () => {
  let component: TopbarComponent;
  let fixture: ComponentFixture<TopbarComponent>;
  let sessionService: SessionService;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let dialog: jasmine.SpyObj<MatDialog>;

  const mockUser: CurrentUser = {
    id: '1',
    name: 'Maria Silva',
    email: 'maria@test.com',
    role: 'ADMIN',
    studio: { id: 's1', name: 'Studio Pilates' },
    permissions: ['DASHBOARD_VIEW', 'STUDENT_READ'],
    lastLogin: '2026-01-01T00:00:00'
  };

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['logout']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [TopbarComponent, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    })
    .compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    sessionService = TestBed.inject(SessionService);

    fixture = TestBed.createComponent(TopbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display user name and role from session', () => {
    sessionService.setUser(mockUser);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Maria Silva');
    expect(compiled.textContent).toContain('ADMIN');
  });

  it('should have user-info element with menu trigger', () => {
    sessionService.setUser(mockUser);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const userInfo = compiled.querySelector('.user-info');
    expect(userInfo).toBeTruthy();
    expect(userInfo?.getAttribute('aria-haspopup')).toBe('menu');
  });

  it('should open confirm dialog on onLogout and logout on confirm', () => {
    const dialogRefSpy = jasmine.createSpyObj({ afterClosed: of(true) });
    dialog.open.and.returnValue(dialogRefSpy);

    component.onLogout();

    expect(dialog.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Sair',
        message: 'Deseja realmente sair?',
        confirmText: 'Sair',
        cancelText: 'Cancelar'
      }
    });
    expect(authService.logout).toHaveBeenCalled();
  });

  it('should not logout when dialog is cancelled', () => {
    const dialogRefSpy = jasmine.createSpyObj({ afterClosed: of(false) });
    dialog.open.and.returnValue(dialogRefSpy);

    component.onLogout();

    expect(dialog.open).toHaveBeenCalled();
    expect(authService.logout).not.toHaveBeenCalled();
  });
});
