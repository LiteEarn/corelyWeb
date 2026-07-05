import { TestBed } from '@angular/core/testing';
import { SessionService } from './session.service';
import { CurrentUser } from '../auth/auth.models';

describe('SessionService', () => {
  let service: SessionService;

  const mockUser: CurrentUser = {
    id: '123',
    name: 'John Doe',
    email: 'john@test.com',
    role: 'ADMIN',
    studio: { id: 'studio-1', name: 'Test Studio' },
    permissions: ['read', 'write'],
    lastLogin: '2026-07-04T10:00:00'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with null user', () => {
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.currentStudio()).toBeNull();
    expect(service.currentRole()).toBeNull();
    expect(service.permissions()).toEqual([]);
  });

  it('should set user and expose signals', () => {
    service.setUser(mockUser);

    expect(service.currentUser()).toEqual(mockUser);
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.currentStudio()).toEqual(mockUser.studio);
    expect(service.currentRole()).toBe('ADMIN');
    expect(service.permissions()).toEqual(['read', 'write']);
  });

  it('should clear user on clear', () => {
    service.setUser(mockUser);
    expect(service.isAuthenticated()).toBeTrue();

    service.clear();

    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.currentStudio()).toBeNull();
    expect(service.currentRole()).toBeNull();
    expect(service.permissions()).toEqual([]);
  });

  it('should manage loading state', () => {
    expect(service.loading()).toBeTrue();

    service.setLoading(false);

    expect(service.loading()).toBeFalse();
  });

  it('should replace user on subsequent setUser calls', () => {
    service.setUser(mockUser);

    const updatedUser: CurrentUser = {
      ...mockUser,
      name: 'Jane Doe',
      role: 'RECEPTIONIST'
    };

    service.setUser(updatedUser);

    expect(service.currentUser()?.name).toBe('Jane Doe');
    expect(service.currentRole()).toBe('RECEPTIONIST');
  });
});
