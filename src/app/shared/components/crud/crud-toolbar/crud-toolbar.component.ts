import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { ResponsiveService } from '../../../layout/responsive.service';
import { LayoutMode } from '../../../layout/layout-mode.enum';

@Component({
  selector: 'crud-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './crud-toolbar.component.html',
  styleUrl: './crud-toolbar.component.scss',
})
export class CrudToolbarComponent {
  responsive = inject(ResponsiveService);
  readonly LayoutMode = LayoutMode;

  @Input() searchPlaceholder = 'Buscar...';
  @Input() searchValue = '';
  @Output() searchChange = new EventEmitter<string>();

  @Input() showNewButton = true;
  @Input() newButtonText = 'Novo';
  @Output() newClick = new EventEmitter<void>();
}
