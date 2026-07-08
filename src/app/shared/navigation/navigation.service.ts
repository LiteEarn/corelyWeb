import { Injectable, inject, signal, computed, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { ResponsiveService } from '../layout/responsive.service';
import { LayoutMode } from '../layout/layout-mode.enum';
import { AuthService } from '../../core/auth/auth.service';
import { PermissionService } from '../../core/rbac/permission.service';
import type { MenuItemDef } from '../../core/rbac/permission-matrix';

export interface BottomNavItem {
  icon: string;
  label: string;
  route?: string;
  action?: 'more';
}

const BOTTOM_PRIMARY_ITEMS: BottomNavItem[] = [
  { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
  { icon: 'event', label: 'Agenda', route: '/daily-agenda' },
  { icon: 'fact_check', label: 'Presença', route: '/attendance' },
  { icon: 'school', label: 'Alunos', route: '/students' },
  { icon: 'more_horiz', label: 'Mais', action: 'more' },
];

const MORE_EXCLUDED_ROUTES = new Set([
  '/dashboard',
  '/daily-agenda',
  '/attendance',
  '/students',
]);

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private responsive = inject(ResponsiveService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private permissionService = inject(PermissionService);

  private drawerOpened = signal(false);
  private sidebarCollapsed = signal(false);
  private moreSheetOpen = signal(false);

  readonly layoutMode: Signal<LayoutMode> = this.responsive.layoutMode;

  readonly isCollapsed: Signal<boolean> = computed(() => {
    const mode = this.layoutMode();
    if (mode === LayoutMode.MOBILE) return false;
    return this.sidebarCollapsed();
  });

  readonly isDrawerOpen: Signal<boolean> = computed(() => {
    if (this.layoutMode() !== LayoutMode.MOBILE) return false;
    return this.drawerOpened();
  });

  readonly isMoreSheetOpen: Signal<boolean> = computed(() => {
    if (this.layoutMode() !== LayoutMode.MOBILE) return false;
    return this.moreSheetOpen();
  });

  readonly sidenavOpened: Signal<boolean> = computed(() => {
    if (this.layoutMode() === LayoutMode.MOBILE) {
      return this.drawerOpened();
    }
    return true;
  });

  readonly sidenavMode: Signal<'over' | 'side'> = computed(() => {
    return this.layoutMode() === LayoutMode.MOBILE ? 'over' : 'side';
  });

  readonly isMobile: Signal<boolean> = computed(() => this.layoutMode() === LayoutMode.MOBILE);

  readonly bottomNavItems: Signal<BottomNavItem[]> = computed(() => {
    return BOTTOM_PRIMARY_ITEMS;
  });

  readonly moreMenuItems: Signal<MenuItemDef[]> = computed(() => {
    const allItems = this.permissionService.getMenuItems();
    return allItems.filter(item => !MORE_EXCLUDED_ROUTES.has(item.route));
  });

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.close();
      this.closeMoreSheet();
    });
  }

  toggle(): void {
    if (this.layoutMode() === LayoutMode.MOBILE) {
      this.drawerOpened.update(v => !v);
    } else {
      this.sidebarCollapsed.update(v => !v);
    }
  }

  open(): void {
    if (this.layoutMode() === LayoutMode.MOBILE) {
      this.drawerOpened.set(true);
    }
  }

  close(): void {
    if (this.layoutMode() === LayoutMode.MOBILE) {
      this.drawerOpened.set(false);
    }
  }

  closeDrawer(): void {
    this.drawerOpened.set(false);
  }

  toggleMoreSheet(): void {
    this.moreSheetOpen.update(v => !v);
  }

  openMoreSheet(): void {
    this.moreSheetOpen.set(true);
  }

  closeMoreSheet(): void {
    this.moreSheetOpen.set(false);
  }
}
