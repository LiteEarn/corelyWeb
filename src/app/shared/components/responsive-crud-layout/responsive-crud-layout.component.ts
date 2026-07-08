import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef, inject, AfterContentInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { ResponsiveService } from '../../layout/responsive.service';
import { LayoutMode } from '../../layout/layout-mode.enum';
import { ResponsiveToolbarComponent } from '../responsive-toolbar/responsive-toolbar.component';
import { ResponsiveTableContainerComponent } from '../responsive-table-container/responsive-table-container.component';
import { ResponsiveCardListComponent } from '../responsive-card-list/responsive-card-list.component';
import { ResponsiveEmptyStateComponent } from '../responsive-empty-state/responsive-empty-state.component';

@Component({
  selector: 'responsive-crud-layout',
  standalone: true,
  imports: [
    CommonModule,
    ResponsiveToolbarComponent,
    ResponsiveTableContainerComponent,
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
        <div filtersContent>
          <ng-content select="[crudFilters]"></ng-content>
        </div>
      </responsive-toolbar>

      <div class="responsive-crud-content">
        <responsive-table-container
          *ngIf="!isEmpty"
          [dataSource]="dataSource"
          [displayedColumns]="displayedColumns"
          [tabletColumns]="tabletColumns"
          [isLoading]="isLoading"
        >
          <ng-content select="[tableColumns]"></ng-content>
        </responsive-table-container>

        <responsive-card-list
          *ngIf="!isEmpty && cardTemplate"
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
          size="large"
        ></responsive-empty-state>

        <ng-content select="[afterContent]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .responsive-crud-layout {
      max-width: 1400px;
      margin: 0 auto;
      padding: 32px 16px;
    }
    .responsive-crud-content {
      margin-top: 24px;
    }
    @media (max-width: 959px) {
      .responsive-crud-layout {
        padding: 24px 16px;
      }
      .responsive-crud-content {
        margin-top: 20px;
      }
    }
    @media (max-width: 599px) {
      .responsive-crud-layout {
        padding: 16px 12px;
      }
      .responsive-crud-content {
        margin-top: 16px;
      }
    }
  `]
})
export class ResponsiveCrudLayoutComponent implements AfterContentInit {
  responsive = inject(ResponsiveService);

  @Input() title = '';
  @Input() subtitle = '';
  @Input() searchPlaceholder = 'Buscar...';
  @Input() searchValue = '';
  @Output() searchChange = new EventEmitter<string>();

  @Input() showNewButton = true;
  @Input() newButtonText = 'Novo';
  @Output() newClick = new EventEmitter<void>();

  @Input() dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  @Input() displayedColumns: string[] = [];
  @Input() tabletColumns: string[] = [];
  @Input() isLoading = false;

  @Input() items: any[] = [];
  @Input() trackBy: (index: number, item: any) => any = (index: number) => index;

  @ContentChild('cardContent') cardTemplate!: TemplateRef<any>;

  get isEmpty(): boolean {
    return !this.isLoading && this.items.length === 0;
  }

  @Input() emptyIcon = 'inbox';
  @Input() emptyTitle = 'Nenhum registro encontrado';
  @Input() emptyDescription = '';
  @Input() emptyShowAction = false;
  @Input() emptyActionText = 'Adicionar';
  @Output() emptyActionClick = new EventEmitter<void>();

  ngAfterContentInit(): void {
  }
}
