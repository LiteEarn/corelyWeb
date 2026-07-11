import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { ShellComponent } from './shell.component';
import { NavigationService } from '../../shared/navigation/navigation.service';
import { ResponsiveService } from '../../shared/layout/responsive.service';
import { LayoutMode } from '../../shared/layout/layout-mode.enum';

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

describe('ShellComponent', () => {
  let component: ShellComponent;
  let fixture: ComponentFixture<ShellComponent>;
  let navigationService: NavigationService;
  let mockResponsive: MockResponsiveService;

  function setLayoutMode(mode: LayoutMode): void {
    mockResponsive.isMobile.set(mode === LayoutMode.MOBILE);
    mockResponsive.isTablet.set(mode === LayoutMode.TABLET);
    mockResponsive.isDesktop.set(mode === LayoutMode.DESKTOP);
    mockResponsive.layoutMode.set(mode);
  }

  beforeEach(async () => {
    mockResponsive = new MockResponsiveService();

    await TestBed.configureTestingModule({
      imports: [ShellComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        NavigationService,
        { provide: ResponsiveService, useValue: mockResponsive }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ShellComponent);
    component = fixture.componentInstance;
    navigationService = TestBed.inject(NavigationService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Desktop', () => {
    beforeEach(() => {
      setLayoutMode(LayoutMode.DESKTOP);
      fixture.detectChanges();
    });

    it('should have sidenav in side mode', () => {
      const sidenav = fixture.nativeElement.querySelector('.app-sidenav');
      expect(sidenav).toBeTruthy();
    });

    it('should render topbar', () => {
      const topbar = fixture.nativeElement.querySelector('app-topbar');
      expect(topbar).toBeTruthy();
    });

    it('should render sidebar', () => {
      const sidebar = fixture.nativeElement.querySelector('app-sidebar');
      expect(sidebar).toBeTruthy();
    });

    it('should have content-expanded class by default', () => {
      const content = fixture.nativeElement.querySelector('mat-sidenav-content');
      expect(content.classList.contains('content-expanded')).toBeTrue();
    });

    it('should remove content-expanded class after toggling sidebar', () => {
      component.onToggleMenu();
      fixture.detectChanges();
      const content = fixture.nativeElement.querySelector('mat-sidenav-content');
      expect(content.classList.contains('content-expanded')).toBeFalse();
    });
  });

  describe('Mobile', () => {
    beforeEach(() => {
      setLayoutMode(LayoutMode.MOBILE);
      fixture.detectChanges();
    });

    it('should toggle drawer via navigation service', () => {
      expect(navigationService.isDrawerOpen()).toBeFalse();
      component.onToggleMenu();
      expect(navigationService.isDrawerOpen()).toBeTrue();
    });

    it('should close drawer via navigation service', () => {
      component.onToggleMenu();
      expect(navigationService.isDrawerOpen()).toBeTrue();
      component.onDrawerClose();
      expect(navigationService.isDrawerOpen()).toBeFalse();
    });

    it('should have content-expanded class (isCollapsed always false on mobile)', () => {
      const content = fixture.nativeElement.querySelector('mat-sidenav-content');
      expect(content.classList.contains('content-expanded')).toBeTrue();
    });
  });

  it('should call navigation.toggle on onToggleMenu', () => {
    spyOn(navigationService, 'toggle');
    component.onToggleMenu();
    expect(navigationService.toggle).toHaveBeenCalled();
  });

  it('should call navigation.closeDrawer on onDrawerClose', () => {
    spyOn(navigationService, 'closeDrawer');
    component.onDrawerClose();
    expect(navigationService.closeDrawer).toHaveBeenCalled();
  });

  it('should close drawer on backdrop click', () => {
    spyOn(navigationService, 'closeDrawer');
    component.onBackdropClick();
    expect(navigationService.closeDrawer).toHaveBeenCalled();
  });

  describe('mobile bottom sheet', () => {
    beforeEach(() => {
      setLayoutMode(LayoutMode.MOBILE);
      fixture.detectChanges();
    });

    it('should close more sheet on ESC', () => {
      navigationService.openMoreSheet();
      expect(navigationService.isMoreSheetOpen()).toBeTrue();
      component.onKeydownEscape();
      expect(navigationService.isMoreSheetOpen()).toBeFalse();
    });
  });
});
