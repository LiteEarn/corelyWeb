import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ResponsiveService } from '../../layout/responsive.service';
import { LayoutMode } from '../../layout/layout-mode.enum';

@Component({
  selector: 'responsive-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <div class="responsive-toolbar" role="toolbar" aria-label="Ferramentas de listagem">
      <div class="toolbar-search">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>{{ searchPlaceholder }}</mat-label>
          <input
            matInput
            [value]="searchValue"
            (input)="searchChange.emit($any($event.target).value)"
            [placeholder]="searchPlaceholder"
            [attr.aria-label]="searchPlaceholder"
          />
          <mat-icon matPrefix class="search-icon">search</mat-icon>
          <button
            *ngIf="searchValue"
            matSuffix
            mat-icon-button
            aria-label="Limpar busca"
            (click)="searchChange.emit('')"
            type="button"
          >
            <mat-icon>close</mat-icon>
          </button>
        </mat-form-field>
      </div>

      <div class="toolbar-filters" [class.toolbar-filters--stacked]="responsive.layoutMode() === LayoutMode.TABLET || responsive.layoutMode() === LayoutMode.MOBILE">
        <ng-content select="[filtersContent]"></ng-content>
      </div>

      <div class="toolbar-actions">
        <button
          *ngIf="responsive.layoutMode() !== LayoutMode.MOBILE && showNewButton"
          mat-raised-button
          color="primary"
          class="new-button"
          (click)="newClick.emit()"
          [attr.aria-label]="newButtonText"
        >
          <mat-icon>add</mat-icon>
          <span class="new-button-label">{{ newButtonText }}</span>
        </button>
      </div>

      <button
        *ngIf="responsive.layoutMode() === LayoutMode.MOBILE && showNewButton"
        mat-fab
        color="primary"
        class="crud-fab"
        (click)="newClick.emit()"
        [attr.aria-label]="newButtonText"
      >
        <mat-icon>add</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .responsive-toolbar {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      flex-wrap: wrap;
      position: relative;
    }
    @media (max-width: 959px) {
      .responsive-toolbar {
        flex-direction: column;
        gap: 12px;
      }
    }
    .toolbar-search {
      flex: 1;
      min-width: 240px;
    }
    @media (max-width: 959px) {
      .toolbar-search {
        width: 100%;
        min-width: unset;
      }
    }
    .search-field {
      width: 100%;
    }
    .search-field ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }
    .search-field ::ng-deep .mat-mdc-text-field-wrapper {
      padding: 0;
    }
    .search-field ::ng-deep .mat-mdc-form-field-infix {
      padding: 12px 16px;
      min-height: 48px;
    }
    .search-icon {
      color: #94A3B8;
      font-size: 20px;
    }
    .toolbar-filters {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }
    .toolbar-filters--stacked {
      width: 100%;
      flex-direction: column;
      align-items: stretch;
    }
    .toolbar-actions {
      display: flex;
      align-items: center;
    }
    @media (max-width: 959px) {
      .toolbar-actions {
        display: none;
      }
    }
    .new-button {
      white-space: nowrap;
      height: 48px;
    }
    .crud-fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1030;
    }
    @media (min-width: 960px) {
      .crud-fab {
        display: none !important;
      }
    }
  `]
})
export class ResponsiveToolbarComponent {
  responsive = inject(ResponsiveService);
  readonly LayoutMode = LayoutMode;

  @Input() searchPlaceholder = 'Buscar...';
  @Input() searchValue = '';
  @Output() searchChange = new EventEmitter<string>();

  @Input() showNewButton = true;
  @Input() newButtonText = 'Novo';
  @Output() newClick = new EventEmitter<void>();
}
