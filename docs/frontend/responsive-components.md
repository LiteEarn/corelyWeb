# Responsive Components - Corely

## Architecture

The responsive component system provides a reusable, standardized UI layer for all CRUD pages in the application. It is built on top of the existing design system (`DsPage*` components) and the responsive detection layer (`ResponsiveService` + `LayoutMode`).

### Layer Stack

```
┌──────────────────────────────────────────────┐
│  Pages (Alunos, Instrutores, Turmas, etc.)   │
├──────────────────────────────────────────────┤
│  Responsive* Components (MOB-006)            │
│  ┌────────────────────────────────────────┐  │
│  │  ResponsiveCrudLayout                   │  │
│  │  ├─ ResponsiveToolbar                   │  │
│  │  ├─ ResponsiveFilterBar                │  │
│  │  ├─ ResponsiveTableContainer            │  │
│  │  ├─ ResponsiveCardList                  │  │
│  │  ├─ ResponsiveActionBar                 │  │
│  │  ├─ ResponsiveEmptyState                │  │
│  │  └─ ResponsiveLoadingState              │  │
│  └────────────────────────────────────────┘  │
├──────────────────────────────────────────────┤
│  Legacy CRUD Components (backward compat)    │
│  crud-*, DsPage*, EmptyState, Loading       │
├──────────────────────────────────────────────┤
│  ResponsiveService (Signals + Breakpoints)   │
│  LayoutMode enum, SCSS mixins               │
├──────────────────────────────────────────────┤
│  Angular CDK BreakpointObserver              │
└──────────────────────────────────────────────┘
```

### Design Principles

1. **No duplication** - All shared responsive logic lives in reusable components
2. **Backward compatibility** - Existing components remain functional
3. **CSS-driven** - Visibility switches via media queries, not JS
4. **Signals-based** - Uses Angular Signals for reactive breakpoint detection
5. **Progressive enhancement** - Desktop first, adapts down to tablet and mobile

## Components

### ResponsivePageContainer

Wraps page content with responsive container, padding, and optional footer.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fluid` | `boolean` | `false` | Removes max-width constraint |
| `showFooter` | `boolean` | `false` | Shows footer slot |

**Usage:**
```html
<responsive-page-container>
  <ds-page-header pageHeader title="Título" subtitle="Subtítulo"></ds-page-header>

  <div>Conteúdo da página</div>
</responsive-page-container>
```

**Behavior:**
- Desktop: max-width 1400px, centered, 32px padding
- Tablet: max-width 1400px, 24px padding
- Mobile: max-width 1400px, 16px padding

---

### ResponsiveCrudLayout

Orchestrator component that manages the CRUD view switching based on breakpoint.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `searchPlaceholder` | `string` | `'Buscar...'` | Search input placeholder |
| `searchValue` | `string` | `''` | Current search value |
| `searchChange` | `EventEmitter` | - | Emits on search input |
| `showNewButton` | `boolean` | `true` | Shows new item button/FAB |
| `newButtonText` | `string` | `'Novo'` | New button label |
| `newClick` | `EventEmitter` | - | Emits on new click |
| `dataSource` | `MatTableDataSource` | - | Table data source |
| `displayedColumns` | `string[]` | `[]` | Full column list |
| `tabletColumns` | `string[]` | `[]` | Simplified tablet columns |
| `isLoading` | `boolean` | `false` | Loading state |
| `items` | `any[]` | `[]` | Items for card list |
| `trackBy` | `function` | `index` | TrackBy function |
| `emptyIcon` | `string` | `'inbox'` | Empty state icon |
| `emptyTitle` | `string` | `'Nenhum...'` | Empty state title |
| `emptyDescription` | `string` | `''` | Empty state description |
| `emptyShowAction` | `boolean` | `false` | Shows empty state CTA |
| `emptyActionText` | `string` | `'Adicionar'` | Empty state CTA label |
| `emptyActionClick` | `EventEmitter` | - | Empty state CTA click |

**Slots:**
- `[crudFilters]` - Filter controls
- `[tableColumns]` - MatColumnDef definitions
- `[cardContent]` - Card template (receives item context)
- `[afterContent]` - Additional content after table/cards

**Usage:**
```html
<responsive-crud-layout
  searchPlaceholder="Buscar aluno..."
  [searchValue]="searchValue"
  (searchChange)="onSearchChange($event)"
  [dataSource]="dataSource"
  [displayedColumns]="displayedColumns"
  [tabletColumns]="tabletColumns"
  [items]="filteredItems"
  emptyIcon="school"
  emptyTitle="Nenhum registro encontrado"
>
  <mat-form-field crudFilters>...</mat-form-field>

  <ng-container tableColumns>
    <ng-container matColumnDef="name">...</ng-container>
  </ng-container>

  <ng-template cardContent let-item>
    <mat-card>...</mat-card>
  </ng-template>
</responsive-crud-layout>
```

**Behavior:**
- Desktop (>=960px): Full table, icon buttons, header actions
- Tablet (600-959px): Simplified table, menu grouped actions
- Mobile (<600px): Hidden table, card list, FAB, ⋮ menu

---

### ResponsiveToolbar

Search bar + filter area + new button/FAB.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `searchPlaceholder` | `string` | `'Buscar...'` | Search input placeholder |
| `searchValue` | `string` | `''` | Current search value |
| `searchChange` | `EventEmitter` | - | Emits on search input |
| `showNewButton` | `boolean` | `true` | Shows new button |
| `newButtonText` | `string` | `'Novo'` | New button label |
| `newClick` | `EventEmitter` | - | Emits on new click |

**Slot:** `[filtersContent]` - Filter controls

**Usage:**
```html
<responsive-toolbar
  searchPlaceholder="Buscar..."
  (searchChange)="onSearch($event)"
  (newClick)="navigateToNew()"
>
  <mat-form-field filtersContent>
    <mat-select>...</mat-select>
  </mat-form-field>
</responsive-toolbar>
```

**Behavior:**
- Desktop: Inline row (search + filters + new button)
- Tablet: Stacked layout (search above, filters below)
- Mobile: Stacked layout, FAB replaces new button

---

### ResponsiveFilterBar

Dedicated filter bar with responsive layout.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ariaLabel` | `string` | `'Filtros...'` | ARIA label |
| `showClearButton` | `boolean` | `false` | Shows clear button |
| `hasActiveFilters` | `boolean` | `false` | Enables clear button |
| `clearFilters` | `EventEmitter` | - | Emits on clear |

**Usage:**
```html
<responsive-filter-bar
  [showClearButton]="true"
  [hasActiveFilters]="hasActiveFilters()"
  (clearFilters)="clearAllFilters()"
>
  <mat-form-field>
    <mat-label>Status</mat-label>
    <mat-select>...</mat-select>
  </mat-form-field>
  <mat-form-field>
    <mat-label>Data</mat-label>
    <input matInput [matDatepicker]="picker" />
  </mat-form-field>
</responsive-filter-bar>
```

**Behavior:**
- Desktop: Inline fields, clear button visible
- Tablet: Inline fields, wrap on overflow
- Mobile: Stacked, full-width fields

---

### ResponsiveActionBar

Action buttons for table rows / card items. Adapts layout per breakpoint.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `actions` | `ResponsiveAction[]` | `[]` | Action configurations |
| `item` | `any` | - | Current row/item |
| `visibleActionsCount` | `number` | `3` | Visible icon buttons |
| `actionClick` | `EventEmitter` | - | Emits `{ action, item }` |

**ResponsiveAction:**
```typescript
interface ResponsiveAction {
  label: string;
  icon: string;
  action: string;
  disabled?: boolean;
}
```

**Usage:**
```html
<responsive-action-bar
  [actions]="actions"
  [item]="row"
  (actionClick)="onAction($event)"
></responsive-action-bar>
```

**Behavior:**
- Desktop: Icon buttons + overflow menu (⋮)
- Tablet: Icon buttons + overflow menu
- Mobile: Single ⋮ menu with all actions

---

### ResponsiveTableContainer

Wraps `<table mat-table>` with responsive visibility.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dataSource` | `MatTableDataSource` | - | Table data source |
| `displayedColumns` | `string[]` | `[]` | Full column list |
| `tabletColumns` | `string[]` | `[]` | Simplified columns for tablet |
| `isLoading` | `boolean` | `false` | Shows loading state |

**Usage:**
```html
<responsive-table-container
  [dataSource]="dataSource"
  [displayedColumns]="columns"
  [tabletColumns]="tabletColumns"
>
  <ng-container matColumnDef="name">...</ng-container>
</responsive-table-container>
```

**Behavior:**
- Desktop: Full table with all columns
- Tablet: Uses `tabletColumns` if provided
- Mobile: Hidden (CSS `display: none`)

---

### ResponsiveCardList

Card list for mobile viewports.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cardTemplate` | `TemplateRef` | - | Card template (receives `$implicit` item) |
| `items` | `any[]` | `[]` | Items to render |
| `trackBy` | `function` | `index` | TrackBy function |

**Usage:**
```html
<responsive-card-list
  [items]="items"
  [cardTemplate]="myCard"
></responsive-card-list>

<ng-template #myCard let-item>
  <mat-card>
    <h3>{{ item.name }}</h3>
  </mat-card>
</ng-template>
```

**Behavior:**
- Desktop/Tablet: Hidden (CSS `display: none`)
- Mobile: Visible as stacked card list

---

### ResponsiveEmptyState

Unified empty state with configurable size and action.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `string` | `'inbox'` | Material icon name |
| `title` | `string` | `'Nenhum...'` | Title text |
| `description` | `string` | `''` | Description text |
| `showAction` | `boolean` | `false` | Shows CTA button |
| `actionText` | `string` | `'Adicionar'` | CTA button label |
| `actionIcon` | `string` | `'add'` | CTA button icon |
| `size` | `'small'\|'medium'\|'large'` | `'medium'` | Visual size |
| `actionClick` | `EventEmitter` | - | Emits on CTA click |

**Usage:**
```html
<responsive-empty-state
  icon="search_off"
  title="Nenhum resultado"
  description="Tente alterar os filtros."
  size="large"
></responsive-empty-state>
```

---

### ResponsiveLoadingState

Loading state with spinner or skeleton.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `inline` | `boolean` | `false` | Compact padding |
| `overlay` | `boolean` | `false` | Absolute overlay |
| `skeleton` | `boolean\|'card'` | `false` | Shows skeleton instead of spinner |
| `skeletonRows` | `number` | `3` | Number of skeleton rows |
| `size` | `'small'\|'medium'\|'large'` | `'medium'` | Spinner size |
| `message` | `string` | `''` | Optional loading text |

**Usage:**
```html
<responsive-loading-state
  [skeleton]="true"
  skeletonRows="4"
  message="Carregando alunos..."
></responsive-loading-state>

<responsive-loading-state *ngIf="loading"></responsive-loading-state>
```

---

## When to Use Each Component

| Scenario | Component |
|----------|-----------|
| CRUD list page | `ResponsiveCrudLayout` (composes all below) |
| Standalone search + filters + new button | `ResponsiveToolbar` |
| Filter-only section (inline or stacked) | `ResponsiveFilterBar` |
| Table with responsive columns | `ResponsiveTableContainer` |
| Mobile card list | `ResponsiveCardList` |
| Row/item action buttons | `ResponsiveActionBar` |
| Empty/no-data state | `ResponsiveEmptyState` |
| Loading/spinner/skeleton | `ResponsiveLoadingState` |
| Page wrapper with responsive padding | `ResponsivePageContainer` |

---

## Migration Guide

### From legacy to responsive components

| Legacy | Responsive (MOB-006) |
|--------|---------------------|
| `ResponsiveCrudComponent` (crud) | `ResponsiveCrudLayout` |
| `CrudToolbarComponent` | `ResponsiveToolbar` |
| `CrudActionsComponent` | `ResponsiveActionBar` |
| `CrudTableComponent` | `ResponsiveTableContainer` |
| `CrudCardComponent` | `ResponsiveCardList` |
| `CrudEmptyStateComponent` | `ResponsiveEmptyState` |
| `EmptyStateComponent` | `ResponsiveEmptyState` |
| `LoadingComponent` | `ResponsiveLoadingState` |
| N/A | `ResponsivePageContainer` |
| N/A | `ResponsiveFilterBar` |

### Import path

```typescript
// New responsive components
import {
  ResponsivePageContainerComponent,
  ResponsiveCrudLayoutComponent,
  ResponsiveToolbarComponent,
  ResponsiveFilterBarComponent,
  ResponsiveActionBarComponent,
  ResponsiveTableContainerComponent,
  ResponsiveCardListComponent,
  ResponsiveEmptyStateComponent,
  ResponsiveLoadingStateComponent,
  ResponsiveAction,
} from '../../shared/components';
```

---

## Examples

### CRUD List Page (Students)

```typescript
@Component({
  imports: [
    DsPageHeaderComponent,
    ResponsiveCrudLayoutComponent,
    ResponsiveActionBarComponent,
    ResponsiveAction,
  ]
})
export class StudentsComponent {
  displayedColumns = ['fullName', 'phone', 'email', 'active', 'actions'];
  tabletColumns = ['fullName', 'active', 'actions'];
  dataSource = new MatTableDataSource<Student>([]);
  filteredStudents: Student[] = [];
  searchValue = '';

  readonly actions: ResponsiveAction[] = [
    { label: 'Visualizar', icon: 'visibility', action: 'view' },
    { label: 'Editar', icon: 'edit', action: 'edit' },
  ];
}
```

```html
<responsive-page-container>
  <ds-page-header pageHeader title="Alunos" subtitle="Gerencie os alunos"></ds-page-header>

  <responsive-crud-layout
    searchPlaceholder="Buscar aluno..."
    [searchValue]="searchValue"
    (searchChange)="onSearch($event)"
    [dataSource]="dataSource"
    [displayedColumns]="displayedColumns"
    [tabletColumns]="tabletColumns"
    [items]="filteredStudents"
    emptyIcon="school"
    emptyTitle="Nenhum aluno encontrado"
  >
    <mat-form-field crudFilters>
      <mat-label>Status</mat-label>
      <mat-select>...</mat-select>
    </mat-form-field>

    <ng-container tableColumns>
      <ng-container matColumnDef="fullName">...</ng-container>
      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef>Ações</th>
        <td mat-cell *matCellDef="let student">
          <responsive-action-bar
            [actions]="actions"
            [item]="student"
            (actionClick)="onAction($event)"
          ></responsive-action-bar>
        </td>
      </ng-container>
    </ng-container>

    <ng-template cardContent let-student>
      <mat-card>...</mat-card>
    </ng-template>
  </responsive-crud-layout>
</responsive-page-container>
```

### Standalone Filter Bar

```html
<responsive-filter-bar
  [showClearButton]="true"
  [hasActiveFilters]="hasFilters"
  (clearFilters)="clear()"
>
  <mat-form-field appearance="outline">
    <mat-label>Status</mat-label>
    <mat-select [(ngModel)]="statusFilter">
      <mat-option value="all">Todos</mat-option>
      <mat-option value="active">Ativos</mat-option>
    </mat-select>
  </mat-form-field>
</responsive-filter-bar>
```

### Loading State with Skeleton

```html
<responsive-loading-state
  *ngIf="loading"
  [skeleton]="true"
  skeletonRows="5"
  message="Carregando dados..."
></responsive-loading-state>
```

---

## Breakpoints Reference

| Mode | Width | Table | Cards | Toolbar | Actions |
|------|-------|-------|-------|---------|---------|
| Mobile | <600px | Hidden | Visible | Stacked + FAB | ⋮ Menu |
| Tablet | 600-959px | Simplified | Hidden | Stacked | Icons + Menu |
| Desktop | 960px+ | Full | Hidden | Inline | Icons + Menu |

## Backward Compatibility

All previously existing components (`ResponsiveCrudComponent`, `CrudToolbarComponent`, `CrudTableComponent`, `CrudCardComponent`, `CrudActionsComponent`, `CrudEmptyStateComponent`, `EmptyStateComponent`, `LoadingComponent`) remain fully functional. No existing behavior has been modified.
