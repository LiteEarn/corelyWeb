import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ResponsiveService } from '../../layout/responsive.service';
import { LayoutMode } from '../../layout/layout-mode.enum';

@Component({
  selector: 'responsive-filter-bar',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div
      class="responsive-filter-bar"
      [class.filter-bar--inline]="responsive.layoutMode() !== LayoutMode.MOBILE"
      [class.filter-bar--stacked]="responsive.layoutMode() === LayoutMode.MOBILE"
      role="search"
      [attr.aria-label]="ariaLabel"
    >
      <div class="filter-bar-fields">
        <ng-content></ng-content>
      </div>

      <div class="filter-bar-actions" *ngIf="showClearButton">
        <button
          mat-stroked-button
          class="filter-clear-btn"
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
    .responsive-filter-bar {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      width: 100%;
    }
    .filter-bar--inline {
      flex-direction: row;
      flex-wrap: wrap;
    }
    .filter-bar--stacked {
      flex-direction: column;
    }
    .filter-bar-fields {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      flex: 1;
    }
    .filter-bar--stacked .filter-bar-fields {
      flex-direction: column;
      width: 100%;
    }
    .filter-bar--stacked .filter-bar-fields ::ng-deep > * {
      width: 100%;
    }
    .filter-bar-actions {
      display: flex;
      align-items: center;
    }
    .filter-clear-btn {
      height: 48px;
      white-space: nowrap;
    }
    @media (max-width: 959px) {
      .filter-bar-fields {
        width: 100%;
      }
    }
  `]
})
export class ResponsiveFilterBarComponent {
  responsive = inject(ResponsiveService);
  readonly LayoutMode = LayoutMode;

  @Input() ariaLabel = 'Filtros de busca';
  @Input() showClearButton = false;
  @Input() hasActiveFilters = false;
  @Output() clearFilters = new EventEmitter<void>();
}
