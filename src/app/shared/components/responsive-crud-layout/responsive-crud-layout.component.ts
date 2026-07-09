import { Component, Input, Output, EventEmitter, TemplateRef, ContentChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ResponsiveService } from '../../layout/responsive.service';
import { LayoutMode } from '../../layout/layout-mode.enum';
import { CrudToolbarComponent } from '../crud/crud-toolbar/crud-toolbar.component';
import { CrudCardComponent } from '../crud/crud-card/crud-card.component';
import { CrudEmptyStateComponent } from '../crud/crud-empty-state/crud-empty-state.component';
import { ResponsiveToolbarComponent } from '../responsive-toolbar/responsive-toolbar.component';
import { ResponsiveCardListComponent } from '../responsive-card-list/responsive-card-list.component';
import { ResponsiveEmptyStateComponent } from '../responsive-empty-state/responsive-empty-state.component';

@Component({
  selector: 'responsive-crud-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    CrudToolbarComponent,
    CrudCardComponent,
    CrudEmptyStateComponent,
    ResponsiveToolbarComponent,
    ResponsiveCardListComponent,
    ResponsiveEmptyStateComponent,
  ],
  template: `
    <div class="responsive-crud-layout">
      <responsive-toolbar
        [searchPlaceholder]="searchPlaceholder"
        [searchValue]="searchValue"
        (searchChange)="searchChange.emit($event)"
        [showNewButton]="showNewButton"
        [newButtonText]="newButtonText"
        (newClick)="newClick.emit()"
      >
        <ng-content select="[crudFilters]"></ng-content>
      </responsive-toolbar>

      <div class="responsive-crud-layout-content">
        <div
          *ngIf="!isEmpty && responsive.layoutMode() !== LayoutMode.MOBILE"
          class="crud-table-wrapper"
        >
          <ng-content select="[crudTable]"></ng-content>
        </div>

        <div *ngIf="isLoading && !isEmpty" class="crud-table-loading">
          <mat-icon class="spinner">refresh</mat-icon>
          <span>Carregando...</span>
        </div>

        <responsive-card-list
          *ngIf="!isEmpty && responsive.layoutMode() === LayoutMode.MOBILE"
          [items]="items"
          [trackBy]="trackBy"
          [cardTemplate]="cardTemplate"
        ></responsive-card-list>

        <responsive-empty-state
          *ngIf="isEmpty"
          [icon]="emptyIcon"
          [title]="emptyTitle"
          [description]="emptyDescription"
          [showAction]="emptyShowAction"
          [actionText]="emptyActionText"
          (actionClick)="emptyActionClick.emit()"
        ></responsive-empty-state>

        <ng-content select="[afterContent]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .responsive-crud-layout {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0;
      width: 100%;
      box-sizing: border-box;
    }
    .responsive-crud-layout-content {
      margin-top: 24px;
    }
    .crud-table-wrapper {
      width: 100%;
      overflow-x: auto;
    }
    .crud-table-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 32px;
      color: #64748B;
    }
    .crud-table-loading .spinner {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @media (max-width: 959px) {
      .responsive-crud-layout-content { margin-top: 20px; }
    }
    @media (max-width: 599px) {
      .responsive-crud-layout-content { margin-top: 16px; }
    }
  `]
})
export class ResponsiveCrudLayoutComponent {
  responsive = inject(ResponsiveService);
  LayoutMode = LayoutMode;

  @Input() title = '';
  @Input() subtitle = '';
  @Input() searchPlaceholder = 'Buscar...';
  @Input() searchValue = '';
  @Output() searchChange = new EventEmitter<string>();

  @Input() showNewButton = true;
  @Input() newButtonText = 'Novo';
  @Output() newClick = new EventEmitter<void>();

  @Input() isLoading = false;
  @Input() items: any[] = [];
  @Input() trackBy: (index: number, item: any) => any = (index: number) => index;
  @Input() cardTemplate!: TemplateRef<any>;

  get isEmpty(): boolean {
    return !this.isLoading && this.items.length === 0;
  }

  @Input() emptyIcon = 'inbox';
  @Input() emptyTitle = 'Nenhum registro encontrado';
  @Input() emptyDescription = '';
  @Input() emptyShowAction = false;
  @Input() emptyActionText = 'Adicionar';
  @Output() emptyActionClick = new EventEmitter<void>();
}
