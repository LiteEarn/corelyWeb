import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DsButtonComponent } from '../../../design-system/button/button.component';

@Component({
  selector: 'crud-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, DsButtonComponent],
  templateUrl: './crud-empty-state.component.html',
  styleUrl: './crud-empty-state.component.scss',
})
export class CrudEmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Nenhum registro encontrado';
  @Input() description = '';
  @Input() showAction = false;
  @Input() actionText = 'Adicionar';
  @Output() actionClick = new EventEmitter<void>();
}
