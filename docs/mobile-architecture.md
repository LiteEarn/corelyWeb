# Mobile Architecture - Corely

## Architecture

The responsive system is built on four layers:

```
┌──────────────────────────────────────┐
│  NavigationService                   │
│  (state management: drawer, sidebar) │
├──────────────────────────────────────┤
│  Shell / Sidebar / Topbar            │
│  (layout components)                 │
├──────────────────────────────────────┤
│  ResponsiveService                   │
│  (Signals + BreakpointObserver)      │
├──────────────────────────────────────┤
│  Breakpoints (constants)             │
│  LayoutMode (enum)                   │
├──────────────────────────────────────┤
│  Angular CDK Breakpoints             │
└──────────────────────────────────────┘
```

## Breakpoints

| Name       | CDK Constant       | Query                         |
|------------|--------------------|-------------------------------|
| Mobile     | XSmall             | max-width: 599.98px           |
| Tablet     | Small              | 600px - 959.98px              |
| Notebook   | Medium             | 960px - 1279.98px             |
| Desktop    | Large              | 1280px - 1919.98px            |
| Desktop XL | XLarge             | min-width: 1920px             |

## Navigation Flow

### Desktop (>= 1024px / LayoutMode.DESKTOP)

```
┌──────────────┬──────────────────────────────────────┐
│   Sidebar    │           Content Area                │
│   (fixed)    │                                      │
│              │                                      │
│ 260px / 72px │                                      │
└──────────────┴──────────────────────────────────────┘
```

- Sidebar fixa, sempre visível
- Botão hamburger recolhe/mostra sidebar (260px → 72px com ícones)
- `MatSidenav` com `mode="side"`, sempre `opened`
- `NavigationService.isCollapsed` controla largura

### Tablet (768px - 1023px / LayoutMode.TABLET)

```
┌──────────────┬──────────────────────────────────────┐
│   Sidebar    │           Content Area                │
│  (recolhível)│                                      │
│              │                                      │
│ 260px / 72px │                                      │
└──────────────┴──────────────────────────────────────┘
```

- Sidebar visível, sem drawer
- Estados: Expandida (260px) → Recolhida (72px, ícones)
- Mesmo comportamento do Desktop, sem overlay

### Mobile (< 768px / LayoutMode.MOBILE)

```
┌──────────────────────────────────────┐
│           Content Area                │
│                                      │
│  ┌──────────────┐                    │
│  │   Drawer     │  (overlay)         │
│  │  (260px)     │                    │
│  └──────────────┘                    │
└──────────────────────────────────────┘
```

- Sidebar fixa removida completamente
- `MatSidenav` com `mode="over"` atua como Drawer
- Fechado por padrão
- Abre ao tocar no menu hambúrguer
- Fecha ao selecionar um item (navegação)
- Fecha ao tocar fora (backdrop do MatSidenav)
- Fecha ao navegar (`NavigationService` escuta `NavigationEnd`)
- Fecha ao rotacionar (muda para tablet/desktop, `sidenavOpened` vira `true`)
- Fecha no logout (redireciona para `/login`, `NavigationEnd` é disparado)

## NavigationService

Serviço central de estado de navegação.

```typescript
class NavigationService {
  // Signals
  layoutMode: Signal<LayoutMode>
  isCollapsed: Signal<boolean>       // sidebar recolhida (desktop/tablet)
  isDrawerOpen: Signal<boolean>      // drawer aberto (mobile)
  sidenavOpened: Signal<boolean>     // MatSidenav opened binding
  sidenavMode: Signal<'over' | 'side'>

  // Methods
  toggle()     // alterna estado (collapse no desktop/tablet, drawer no mobile)
  open()       // abre drawer (mobile)
  close()      // fecha drawer (mobile)
  closeDrawer() // força fechamento do drawer
}
```

### Comportamento automático

- **Ao navegar**: `Router.events` (NavigationEnd) → `close()` → fecha drawer se mobile
- **Ao fazer logout**: `AuthService.logout()` → `router.navigate(['/login'])` → NavigationEnd → drawer fecha
- **Ao perder autenticação**: Interceptor redireciona → NavigationEnd → drawer fecha
- **Ao rotacionar**: LayoutMode muda → computed signals recalculam → drawer se torna irrelevante

## Componentes

### ShellComponent

- Container principal com `MatSidenavContainer`
- Injeta `NavigationService` para controle do sidenav/drawer
- Escuta evento `toggleSidebar` do `TopbarComponent`

### SidebarComponent

- Renderiza menu de navegação
- Usa `NavigationService.isCollapsed` para estado recolhido
- Itens de menu com `routerLink`, `routerLinkActive`
- `aria-label` em cada link de navegação

### TopbarComponent

- Header fixo com botão hamburger e informações do usuário
- Desktop: ☰ Corely | Nome, Perfil, Studio
- Mobile: ☰ Corely | Avatar
- Menu do usuário com perfil, senha e logout

## Acessibilidade

- `aria-label` no botão hamburger
- `aria-label` em cada item de navegação
- `aria-haspopup` e `aria-expanded` no menu do usuário
- `role="navigation"` na nav do sidebar
- Focus trap automático no drawer (MatSidenav)
- ESC fecha drawer (MatSidenav + handler manual)
- Tab navigation preservada

## Performance

- `ResponsiveService` utiliza `BreakpointObserver` do Angular CDK
- `NavigationService` utiliza Signals para reatividade eficiente
- Sem `window.innerWidth`, `HostListener`, ou `matchMedia` direto
- Animações via CSS transitions (250ms) e Angular Material

## Animações

- Sidebar collapse: `width` transition 250ms ease
- Drawer open/close: MatSidenav default animation (~225ms)
- Nav items hover: background transition 200ms ease

## Como usar

### Injetar NavigationService:

```typescript
import { NavigationService } from '../../shared/navigation/navigation.service';

@Component({ ... })
export class MyComponent {
  navigation = inject(NavigationService);
}
```

### No template:

```html
<button (click)="navigation.toggle()" aria-label="Abrir menu">
  <mat-icon>menu</mat-icon>
</button>
```

### Em SCSS:

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
- Use `NavigationService` for drawer/sidebar state
- Use SCSS mixins for media queries instead of hardcoded breakpoints
