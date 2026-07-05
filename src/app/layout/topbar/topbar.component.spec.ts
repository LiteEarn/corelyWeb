import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopbarComponent } from './topbar.component';
import { SessionService } from '../../core/session/session.service';
import { CurrentUser } from '../../core/auth/auth.models';

describe('TopbarComponent', () => {
  let component: TopbarComponent;
  let fixture: ComponentFixture<TopbarComponent>;
  let sessionService: SessionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopbarComponent]
    })
    .compileComponents();

    sessionService = TestBed.inject(SessionService);
    fixture = TestBed.createComponent(TopbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display user name and role from session', () => {
    const user: CurrentUser = {
      id: '1',
      name: 'Maria Silva',
      email: 'maria@test.com',
      role: 'ADMIN',
      studio: { id: 's1', name: 'Studio' },
      permissions: [],
      lastLogin: '2026-01-01T00:00:00'
    };

    sessionService.setUser(user);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Maria Silva');
    expect(compiled.textContent).toContain('ADMIN');
  });
});
