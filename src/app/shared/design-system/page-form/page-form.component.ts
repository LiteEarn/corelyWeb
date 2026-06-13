import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DsButtonComponent } from '../button/button.component';

@Component({
  selector: 'ds-page-form',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, DsButtonComponent],
  templateUrl: './page-form.component.html',
  styleUrl: './page-form.component.scss'
})
export class DsPageFormComponent {
  @Input() cancelText: string = 'Cancelar';
  @Input() submitText: string = 'Salvar';
  @Input() loading: boolean = false;
  @Input() disabled: boolean = false;
  @Input() submitVariant: 'primary' | 'danger' = 'primary';
  @Output() cancel = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();
}
