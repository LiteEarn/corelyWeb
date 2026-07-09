import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ResponsiveService } from '../../layout/responsive.service';
import { LayoutMode } from '../../layout/layout-mode.enum';

@Component({
  selector: 'responsive-filters',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div
      class="responsive-filters"
      [class.filters--inline]="responsive.layoutMode() !== LayoutMode.MOBILE"
      [class.filters--stacked]="responsive.layoutMode() === LayoutMode.MOBILE"
      role="search"
      [attr.aria-label]="ariaLabel"
    >
      <div class="filters-fields">
        <ng-content></ng-content>
      </div>

      <div class="filters-actions" *ngIf="showClearButton">
        <button
          mat-stroked-button
          class="filters-clear-btn"
          (click)="clearFilters.emit()"
          [disabled]="!hasActiveFilters"
          aria-label="Limpar filtros"
        >
          <mat-icon>clear</mat-icon>
          <span class="clear-label" *ngIf="responsive.layoutMode() !== LayoutMode.MOBILE">Limpar</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .responsive-filters {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      width: 100%;
    }
    .filters--inline { flex-direction: row; flex-wrap: wrap; }
    .filters--stacked { flex-direction: column; }
    .filters-fields {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      flex: 1;
    }
    .filters--stacked .filters-fields { flex-direction: column; width: 100%; }
    .filters--stacked .filters-fields ::ng-deep > * { width: 100%; }
    .filters-actions { display: flex; align-items: center; }
    .filters-clear-btn { height: 48px; white-space: nowrap; }
    @media (max-width: 959px) { .filters-fields { width: 100%; } }
  `]
})
export class ResponsiveFiltersComponent {
  responsive = inject(ResponsiveService);
  readonly LayoutMode = LayoutMode;

  @Input() ariaLabel = 'Filtros de busca';
  @Input() showClearButton = false;
  @Input() hasActiveFilters = false;
  @Output() clearFilters = new EventEmitter<void>();
}
