# Mobile Architecture - Corely

## Architecture

The responsive system is built on four layers:

```
┌────────────────────────────────────┐
│         Directives (*showDesktop,  │
│          *showTablet, *showMobile) │
├────────────────────────────────────┤
│       ResponsiveService            │
│   (Signals + BreakpointObserver)   │
├────────────────────────────────────┤
│   Breakpoints (constants)          │
│   LayoutMode (enum)                │
├────────────────────────────────────┤
│   Angular CDK Breakpoints          │
└────────────────────────────────────┘
```

## Breakpoints

| Name       | CDK Constant       | Query                         |
|------------|--------------------|-------------------------------|
| Mobile     | XSmall             | max-width: 599.98px           |
| Tablet     | Small              | 600px - 959.98px              |
| Notebook   | Medium             | 960px - 1279.98px             |
| Desktop    | Large              | 1280px - 1919.98px            |
| Desktop XL | XLarge             | min-width: 1920px             |

## Flow

1. `BreakpointObserver` observes viewport changes
2. `ResponsiveService` converts to Signals (`isMobile`, `isTablet`, `isDesktop`, `layoutMode`)
3. Components inject `ResponsiveService` and read Signals
4. Directives use `layoutMode` signal to show/hide content

## How to use

### In a component:
```typescript
private responsive = inject(ResponsiveService);
isMobile = this.responsive.isMobile;
layoutMode = this.responsive.layoutMode;
```

### In templates:
```html
<div *ngIf="isMobile()">Mobile only</div>
<div *ngIf="layoutMode() === 'DESKTOP'">Desktop only</div>

<!-- Or use directives -->
<div *showDesktop>Desktop content</div>
<div *showTablet>Tablet content</div>
<div *showMobile>Mobile content</div>
```

### In SCSS:
```scss
@import 'shared/layout/responsive';

.my-element {
  @include respond-below(tablet) {
    // mobile styles
  }
  @include respond-above(notebook) {
    // desktop styles
  }
}
```

## Best practices

- Never use `BreakpointObserver` directly in components
- Never use `HostListener('window:resize')`
- Always inject `ResponsiveService` for viewport queries
- Use directives to avoid structural `*ngIf` scattered across templates
- Use SCSS mixins for media queries instead of hardcoded breakpoints
