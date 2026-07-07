import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { ResponsiveService } from '../../../layout/responsive.service';
import { LayoutMode } from '../../../layout/layout-mode.enum';
import { CrudToolbarComponent } from '../crud-toolbar/crud-toolbar.component';
import { CrudTableComponent } from '../crud-table/crud-table.component';
import { CrudCardComponent } from '../crud-card/crud-card.component';
import { CrudEmptyStateComponent } from '../crud-empty-state/crud-empty-state.component';

@Component({
  selector: 'responsive-crud',
  standalone: true,
  imports: [
    CommonModule,
    CrudToolbarComponent,
    CrudTableComponent,
    CrudCardComponent,
    CrudEmptyStateComponent,
  ],
  templateUrl: './responsive-crud.component.html',
  styleUrl: './responsive-crud.component.scss',
})
export class ResponsiveCrudComponent {
  responsive = inject(ResponsiveService);
  readonly LayoutMode = LayoutMode;

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
