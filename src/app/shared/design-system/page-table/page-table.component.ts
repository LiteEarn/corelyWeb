<<<<<<< HEAD
import { Component, Input, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
=======
import { Component, Input } from '@angular/core';
>>>>>>> 8d033bff9dd050d48bab71765c257d850e300cf8
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
<<<<<<< HEAD
import { MatColumnDef } from '@angular/material/table';
=======
>>>>>>> 8d033bff9dd050d48bab71765c257d850e300cf8

@Component({
  selector: 'ds-page-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './page-table.component.html',
  styleUrl: './page-table.component.scss'
})
<<<<<<< HEAD
export class DsPageTableComponent implements AfterContentInit {
  @Input() dataSource: any[] = [];
  @Input() displayedColumns: string[] = [];

  @ContentChildren(MatColumnDef) columnDefs!: QueryList<MatColumnDef>;

  ngAfterContentInit(): void {
    // Column definitions are automatically registered by Angular Material
    // when they are projected via ng-content
  }
=======
export class DsPageTableComponent {
  @Input() dataSource: any[] = [];
  @Input() displayedColumns: string[] = [];
>>>>>>> 8d033bff9dd050d48bab71765c257d850e300cf8
}
