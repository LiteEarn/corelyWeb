import { Component, Input, ContentChildren, QueryList, AfterContentInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatColumnDef, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ResponsiveService } from '../../../layout/responsive.service';
import { LayoutMode } from '../../../layout/layout-mode.enum';

@Component({
  selector: 'crud-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './crud-table.component.html',
  styleUrl: './crud-table.component.scss',
})
export class CrudTableComponent implements AfterContentInit {
  responsive = inject(ResponsiveService);
  readonly LayoutMode = LayoutMode;

  @Input() dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  @Input() displayedColumns: string[] = [];
  @Input() tabletColumns: string[] = [];
  @Input() isLoading = false;

  @ContentChildren(MatColumnDef) columnDefs!: QueryList<MatColumnDef>;

  get effectiveColumns(): string[] {
    const mode = this.responsive.layoutMode();
    if (mode === LayoutMode.TABLET && this.tabletColumns.length > 0) {
      return this.tabletColumns;
    }
    return this.displayedColumns;
  }

  ngAfterContentInit(): void {
    this.columnDefs.changes.subscribe(() => {
      // Column defs are auto-registered by Angular Material
    });
  }
}
