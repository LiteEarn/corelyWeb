import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { SidebarComponent } from './sidebar.component';
import { NavigationService } from '../../shared/navigation/navigation.service';
import { ResponsiveService } from '../../shared/layout/responsive.service';
import { PermissionService } from '../../core/rbac/permission.service';
import { LayoutMode } from '../../shared/layout/layout-mode.enum';
import type { MenuItemDef } from '../../core/rbac/permission-matrix';

const MOCK_MENU_ITEMS: MenuItemDef[] = [
  { icon: 'dashboard', label: 'Dashboard', route: '/dashboard', permissions: ['DASHBOARD_VIEW'] },
  { icon: 'school', label: 'Alunos', route: '/students', permissions: ['STUDENT_READ'] },
  { icon: 'person', label: 'Instrutores', route: '/instructors', permissions: ['INSTRUCTOR_READ'] },
];

class MockPermissionService {
  getMenuItems(): MenuItemDef[] {
    return MOCK_MENU_ITEMS;
  }
}

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

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
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
      imports: [SidebarComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        NavigationService,
        { provide: ResponsiveService, useValue: mockResponsive },
        { provide: PermissionService, useClass: MockPermissionService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    navigationService = TestBed.inject(NavigationService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render menu items', () => {
    const navItems = fixture.nativeElement.querySelectorAll('.nav-item');
    expect(navItems.length).toBe(MOCK_MENU_ITEMS.length);
  });

  it('should have navigation role', () => {
    const nav = fixture.nativeElement.querySelector('nav');
    expect(nav.getAttribute('role')).toBe('navigation');
    expect(nav.getAttribute('aria-label')).toBe('Navegação principal');
  });

  it('should have aria-label on each nav item', () => {
    const navItems = fixture.nativeElement.querySelectorAll('.nav-item');
    navItems.forEach((item: HTMLElement) => {
      expect(item.getAttribute('aria-label')).toBeTruthy();
    });
  });

  describe('Collapsed state', () => {
    it('should not have sidebar-closed class on desktop by default', () => {
      setLayoutMode(LayoutMode.DESKTOP);
      fixture.detectChanges();
      const sidebar = fixture.nativeElement.querySelector('.sidebar');
      expect(sidebar.classList.contains('sidebar-closed')).toBeFalse();
    });

    it('should add sidebar-closed class when collapsed', () => {
      setLayoutMode(LayoutMode.DESKTOP);
      navigationService.toggle();
      fixture.detectChanges();
      const sidebar = fixture.nativeElement.querySelector('.sidebar');
      expect(sidebar.classList.contains('sidebar-closed')).toBeTrue();
    });

    it('should hide nav labels when collapsed', () => {
      setLayoutMode(LayoutMode.DESKTOP);
      navigationService.toggle();
      fixture.detectChanges();
      const navLabel = fixture.nativeElement.querySelector('.nav-label');
      expect(navLabel).toBeFalsy();
    });
  });
});
