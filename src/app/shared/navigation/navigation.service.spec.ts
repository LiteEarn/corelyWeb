import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { NavigationService } from './navigation.service';
import { ResponsiveService } from '../layout/responsive.service';
import { LayoutMode } from '../layout/layout-mode.enum';

class MockResponsiveService {
  isMobile = signal(false);
  isTablet = signal(false);
  isDesktop = signal(true);
  isDesktopXL = signal(false);
  isNotebook = signal(false);
  isHandset = signal(false);
  isPortrait = signal(false);
  isHandsetPortrait = signal(false);
  screenSize = signal('desktop');
  layoutMode = signal(LayoutMode.DESKTOP);
}

describe('NavigationService', () => {
  let service: NavigationService;
  let mockResponsive: MockResponsiveService;

  function setLayoutMode(mode: LayoutMode): void {
    mockResponsive.isMobile.set(mode === LayoutMode.MOBILE);
    mockResponsive.isTablet.set(mode === LayoutMode.TABLET);
    mockResponsive.isDesktop.set(mode === LayoutMode.DESKTOP);
    mockResponsive.layoutMode.set(mode);
  }

  beforeEach(() => {
    mockResponsive = new MockResponsiveService();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        NavigationService,
        { provide: ResponsiveService, useValue: mockResponsive }
      ]
    });
    service = TestBed.inject(NavigationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Desktop mode', () => {
    beforeEach(() => {
      setLayoutMode(LayoutMode.DESKTOP);
    });

    it('should have sidenav always opened', () => {
      expect(service.sidenavOpened()).toBeTrue();
    });

    it('should have side mode', () => {
      expect(service.sidenavMode()).toBe('side');
    });

    it('should not be drawer open', () => {
      expect(service.isDrawerOpen()).toBeFalse();
    });

    it('should toggle collapse state', () => {
      expect(service.isCollapsed()).toBeFalse();
      service.toggle();
      expect(service.isCollapsed()).toBeTrue();
      service.toggle();
      expect(service.isCollapsed()).toBeFalse();
    });

    it('should not close drawer (no-op)', () => {
      service.close();
      expect(service.isDrawerOpen()).toBeFalse();
    });

    it('should not have bottom sheet open', () => {
      expect(service.isMoreSheetOpen()).toBeFalse();
    });
  });

  describe('Tablet mode', () => {
    beforeEach(() => {
      setLayoutMode(LayoutMode.TABLET);
    });

    it('should have sidenav always opened', () => {
      expect(service.sidenavOpened()).toBeTrue();
    });

    it('should have side mode', () => {
      expect(service.sidenavMode()).toBe('side');
    });

    it('should toggle collapse state', () => {
      expect(service.isCollapsed()).toBeFalse();
      service.toggle();
      expect(service.isCollapsed()).toBeTrue();
    });
  });

  describe('Mobile mode', () => {
    beforeEach(() => {
      setLayoutMode(LayoutMode.MOBILE);
    });

    it('should have drawer closed by default', () => {
      expect(service.isDrawerOpen()).toBeFalse();
    });

    it('should have over mode', () => {
      expect(service.sidenavMode()).toBe('over');
    });

    it('should not be collapsed', () => {
      expect(service.isCollapsed()).toBeFalse();
    });

    it('should toggle drawer', () => {
      service.toggle();
      expect(service.isDrawerOpen()).toBeTrue();
      service.toggle();
      expect(service.isDrawerOpen()).toBeFalse();
    });

    it('should open drawer', () => {
      service.open();
      expect(service.isDrawerOpen()).toBeTrue();
    });

    it('should close drawer', () => {
      service.open();
      expect(service.isDrawerOpen()).toBeTrue();
      service.close();
      expect(service.isDrawerOpen()).toBeFalse();
    });

    it('should close drawer via closeDrawer', () => {
      service.open();
      service.closeDrawer();
      expect(service.isDrawerOpen()).toBeFalse();
    });

    it('should be mobile', () => {
      expect(service.isMobile()).toBeTrue();
    });

    it('should have bottom nav items', () => {
      const items = service.bottomNavItems();
      expect(items.length).toBe(5);
      expect(items[0].label).toBe('Dashboard');
      expect(items[4].action).toBe('more');
    });

    describe('bottom sheet', () => {
      it('should be closed by default', () => {
        expect(service.isMoreSheetOpen()).toBeFalse();
      });

      it('should toggle more sheet', () => {
        service.toggleMoreSheet();
        expect(service.isMoreSheetOpen()).toBeTrue();
        service.toggleMoreSheet();
        expect(service.isMoreSheetOpen()).toBeFalse();
      });

      it('should open and close more sheet', () => {
        service.openMoreSheet();
        expect(service.isMoreSheetOpen()).toBeTrue();
        service.closeMoreSheet();
        expect(service.isMoreSheetOpen()).toBeFalse();
      });
    });
  });
});
