import { Component, Input, ContentChildren, QueryList, AfterContentInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatColumnDef, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ResponsiveService } from '../../layout/responsive.service';
import { LayoutMode } from '../../layout/layout-mode.enum';

@Component({
  selector: 'responsive-table-container',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  template: `
    <div
      class="responsive-table-wrapper"
      [class.responsive-table-wrapper--hidden]="responsive.layoutMode() === LayoutMode.MOBILE"
    >
      <div *ngIf="isLoading" class="responsive-table-loading">
        <mat-icon class="spinner">refresh</mat-icon>
        <span>Carregando...</span>
      </div>

      <table
        *ngIf="!isLoading"
        mat-table
        [dataSource]="dataSource"
        class="responsive-table"
        [class.responsive-table--tablet]="responsive.layoutMode() === LayoutMode.TABLET"
        role="table"
        aria-label="Tabela de registros"
      >
        <ng-content></ng-content>

        <tr mat-header-row *matHeaderRowDef="effectiveColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: effectiveColumns;"></tr>
      </table>
    </div>
  `,
  styles: [`
    .responsive-table-wrapper {
      width: 100%;
      overflow-x: auto;
    }
    .responsive-table-wrapper--hidden {
      display: none;
    }
    .responsive-table-loading {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 48px 16px;
      justify-content: center;
      color: #64748B;
    }
    .responsive-table-loading .spinner {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .responsive-table {
      width: 100%;
    }
    .responsive-table--tablet ::ng-deep .mat-column-actions {
      width: 48px;
      min-width: 48px;
    }
  `]
})
export class ResponsiveTableContainerComponent implements AfterContentInit {
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
  }
}
