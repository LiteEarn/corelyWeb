import { TestBed } from '@angular/core/testing';
import { SessionService } from './session.service';
import { CurrentUser } from '../auth/auth.models';

describe('SessionService', () => {
  let service: SessionService;
  const mockUser: CurrentUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'ADMIN',
    studio: { id: 'studio-1', name: 'Main Studio' },
    permissions: ['DASHBOARD_VIEW', 'STUDENT_READ'],
    lastLogin: '2026-07-04T10:00:00'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no user and not loading', () => {
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.loading()).toBeFalse();
    expect(service.currentRole()).toBe('');
    expect(service.userName()).toBe('');
    expect(service.userEmail()).toBe('');
    expect(service.currentStudio()).toBeNull();
    expect(service.permissions()).toEqual([]);
  });

  it('should set user and update all signals', () => {
    service.setUser(mockUser);
    expect(service.currentUser()).toEqual(mockUser);
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.currentRole()).toBe('ADMIN');
    expect(service.userName()).toBe('John Doe');
    expect(service.userEmail()).toBe('john@example.com');
    expect(service.currentStudio()).toEqual({ id: 'studio-1', name: 'Main Studio' });
    expect(service.permissions()).toEqual(['DASHBOARD_VIEW', 'STUDENT_READ']);
  });

  it('should clear user and reset signals', () => {
    service.setUser(mockUser);
    service.clear();
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.currentRole()).toBe('');
    expect(service.userName()).toBe('');
    expect(service.userEmail()).toBe('');
    expect(service.currentStudio()).toBeNull();
    expect(service.permissions()).toEqual([]);
  });

  it('should set loading state', () => {
    expect(service.loading()).toBeFalse();
    service.setLoading(true);
    expect(service.loading()).toBeTrue();
    service.setLoading(false);
    expect(service.loading()).toBeFalse();
  });

  it('should handle user with empty permissions', () => {
    const noPermsUser: CurrentUser = {
      ...mockUser,
      permissions: []
    };
    service.setUser(noPermsUser);
    expect(service.permissions()).toEqual([]);
  });

  it('should handle user with STUDENT role', () => {
    const studentUser: CurrentUser = {
      ...mockUser,
      role: 'STUDENT',
      studio: { id: 's2', name: 'Studio B' }
    };
    service.setUser(studentUser);
    expect(service.currentRole()).toBe('STUDENT');
    expect(service.currentStudio()?.name).toBe('Studio B');
  });
});
