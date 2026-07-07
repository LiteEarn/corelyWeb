import { Injectable, computed, inject, Signal, signal } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, shareReplay } from 'rxjs';
import { Breakpoints, BreakpointQueries } from './breakpoints';
import { LayoutMode } from './layout-mode.enum';

@Injectable({ providedIn: 'root' })
export class ResponsiveService {
  private breakpointObserver = inject(BreakpointObserver);

  private isMobile$ = this.breakpointObserver.observe(Breakpoints.Mobile).pipe(
    map((state: BreakpointState) => state.matches),
    shareReplay(1)
  );

  private isTablet$ = this.breakpointObserver.observe(Breakpoints.Tablet).pipe(
    map((state: BreakpointState) => state.matches),
    shareReplay(1)
  );

  private isDesktop$ = this.breakpointObserver.observe(Breakpoints.Desktop).pipe(
    map((state: BreakpointState) => state.matches),
    shareReplay(1)
  );

  private isDesktopXL$ = this.breakpointObserver.observe(Breakpoints.DesktopXL).pipe(
    map((state: BreakpointState) => state.matches),
    shareReplay(1)
  );

  private isNotebook$ = this.breakpointObserver.observe(Breakpoints.Notebook).pipe(
    map((state: BreakpointState) => state.matches),
    shareReplay(1)
  );

  private isHandset$ = this.breakpointObserver.observe(BreakpointQueries.Handset).pipe(
    map((state: BreakpointState) => state.matches),
    shareReplay(1)
  );

  private orientationPortrait$ = this.breakpointObserver.observe('(orientation: portrait)').pipe(
    map((state: BreakpointState) => state.matches),
    shareReplay(1)
  );

  readonly isMobile: Signal<boolean> = toSignal(this.isMobile$, { initialValue: false });
  readonly isTablet: Signal<boolean> = toSignal(this.isTablet$, { initialValue: false });
  readonly isDesktop: Signal<boolean> = toSignal(this.isDesktop$, { initialValue: false });
  readonly isDesktopXL: Signal<boolean> = toSignal(this.isDesktopXL$, { initialValue: false });
  readonly isNotebook: Signal<boolean> = toSignal(this.isNotebook$, { initialValue: false });
  readonly isHandset: Signal<boolean> = toSignal(this.isHandset$, { initialValue: false });
  readonly isPortrait: Signal<boolean> = toSignal(this.orientationPortrait$, { initialValue: false });

  readonly screenSize: Signal<string> = computed(() => {
    if (this.isMobile()) return 'mobile';
    if (this.isTablet()) return 'tablet';
    if (this.isNotebook()) return 'notebook';
    if (this.isDesktop()) return 'desktop';
    if (this.isDesktopXL()) return 'desktop-xl';
    return 'unknown';
  });

  readonly layoutMode: Signal<LayoutMode> = computed(() => {
    if (this.isMobile()) return LayoutMode.MOBILE;
    if (this.isTablet()) return LayoutMode.TABLET;
    return LayoutMode.DESKTOP;
  });

  readonly isHandsetPortrait: Signal<boolean> = computed(() => this.isHandset() && this.isPortrait());
}
