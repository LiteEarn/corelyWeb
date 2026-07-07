import { Breakpoints as CdkBreakpoints } from '@angular/cdk/layout';

export const Breakpoints = {
  Mobile: CdkBreakpoints.XSmall,
  Tablet: CdkBreakpoints.Small,
  Notebook: CdkBreakpoints.Medium,
  Desktop: CdkBreakpoints.Large,
  DesktopXL: CdkBreakpoints.XLarge,
} as const;

export const BreakpointQueries = {
  Mobile: `(max-width: 599.98px)`,
  Tablet: `(min-width: 600px) and (max-width: 959.98px)`,
  Notebook: `(min-width: 960px) and (max-width: 1279.98px)`,
  Desktop: `(min-width: 1280px) and (max-width: 1919.98px)`,
  DesktopXL: `(min-width: 1920px)`,
  Handset: `(max-width: 959.98px) and (orientation: portrait)`,
  TabletLandscape: `(min-width: 960px) and (orientation: landscape)`,
} as const;
