import { Injectable, inject, signal, computed, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { ResponsiveService } from '../layout/responsive.service';
import { LayoutMode } from '../layout/layout-mode.enum';
import { AuthService } from '../../core/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private responsive = inject(ResponsiveService);
  private router = inject(Router);
  private authService = inject(AuthService);

  private drawerOpened = signal(false);
  private sidebarCollapsed = signal(false);

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

  readonly sidenavOpened: Signal<boolean> = computed(() => {
    if (this.layoutMode() === LayoutMode.MOBILE) {
      return this.drawerOpened();
    }
    return true;
  });

  readonly sidenavMode: Signal<'over' | 'side'> = computed(() => {
    return this.layoutMode() === LayoutMode.MOBILE ? 'over' : 'side';
  });

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.close();
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
}
