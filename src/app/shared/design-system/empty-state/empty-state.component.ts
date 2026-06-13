import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DsButtonComponent } from '../button/button.component';

@Component({
  selector: 'ds-empty-state',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, DsButtonComponent],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss'
})
export class DsEmptyStateComponent {
  @Input() icon: string = 'inbox';
  @Input() title: string = 'Nenhum dado encontrado';
  @Input() description: string = '';
  @Input() showAction: boolean = false;
  @Input() actionText: string = 'Adicionar';
  @Input() actionIcon: string = 'add';
  @Output() actionClick = new EventEmitter<void>();
}
