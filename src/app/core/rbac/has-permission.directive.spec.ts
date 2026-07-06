import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HasPermissionDirective } from './has-permission.directive';
import { PermissionService } from './permission.service';
import { SessionService } from '../session/session.service';
import { CurrentUser } from '../auth/auth.models';

@Component({
  template: `
    <div *hasPermission="'DASHBOARD_VIEW'" id="single">Single</div>
    <div *hasPermission="['STUDENT_READ', 'STUDENT_WRITE']" id="multi">Multi</div>
    <div *hasPermission="'NONEXISTENT'" id="nonexistent">No Access</div>
    <div *hasPermission="[]" id="empty">Empty</div>
  `,
  imports: [HasPermissionDirective],
  standalone: true
})
class TestHostComponent {}

describe('HasPermissionDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let sessionService: SessionService;

  const adminUser: CurrentUser = {
    id: '1',
    name: 'Admin',
    email: 'admin@test.com',
    role: 'ADMIN',
    studio: { id: 's1', name: 'Studio' },
    permissions: ['DASHBOARD_VIEW', 'STUDENT_READ', 'STUDENT_WRITE'],
    lastLogin: '2026-01-01T00:00:00'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent]
    });
    sessionService = TestBed.inject(SessionService);
  });

  it('should show element when user has the single permission', () => {
    sessionService.setUser(adminUser);
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.css('#single'));
    expect(el).toBeTruthy();
    expect(el.nativeElement.textContent).toContain('Single');
  });

  it('should show element when user has all required permissions (multi, any)', () => {
    sessionService.setUser(adminUser);
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.css('#multi'));
    expect(el).toBeTruthy();
    expect(el.nativeElement.textContent).toContain('Multi');
  });

  it('should hide element when user lacks the permission', () => {
    sessionService.setUser(adminUser);
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.css('#nonexistent'));
    expect(el).toBeNull();
  });

  it('should show element when empty array is passed (no restriction)', () => {
    sessionService.setUser(adminUser);
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.css('#empty'));
    expect(el).toBeTruthy();
  });

  it('should hide all elements when not authenticated', () => {
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('#single'))).toBeNull();
    expect(fixture.debugElement.query(By.css('#multi'))).toBeNull();
    expect(fixture.debugElement.query(By.css('#nonexistent'))).toBeNull();
  });
});
