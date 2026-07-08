import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { ResponsiveService } from '../../../layout/responsive.service';
import { LayoutMode } from '../../../layout/layout-mode.enum';

@Component({
  selector: 'crud-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule],
  templateUrl: './crud-table.component.html',
  styleUrl: './crud-table.component.scss',
})
export class CrudTableComponent {
  responsive = inject(ResponsiveService);
  readonly LayoutMode = LayoutMode;

  @Input() dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  @Input() displayedColumns: string[] = [];
  @Input() isLoading = false;
}
