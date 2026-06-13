import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ds-page-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './page-table.component.html',
  styleUrl: './page-table.component.scss'
})
export class DsPageTableComponent {
  @Input() dataSource: any[] = [];
  @Input() displayedColumns: string[] = [];
}
