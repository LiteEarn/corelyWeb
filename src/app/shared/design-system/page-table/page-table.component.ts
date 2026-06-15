import { Component, Input, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatColumnDef } from '@angular/material/table';

@Component({
  selector: 'ds-page-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './page-table.component.html',
  styleUrl: './page-table.component.scss'
})
export class DsPageTableComponent implements AfterContentInit {
  @Input() dataSource: any[] = [];
  @Input() displayedColumns: string[] = [];

  @ContentChildren(MatColumnDef) columnDefs!: QueryList<MatColumnDef>;

  ngAfterContentInit(): void {
    // Column definitions are automatically registered by Angular Material
    // when they are projected via ng-content
  }
}
