import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ds-primary-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './primary-button.component.html',
  styleUrl: './primary-button.component.scss'
})
export class DsPrimaryButtonComponent {
  @Input() label: string = '';
  @Input() icon: string = '';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Output() click = new EventEmitter<void>();
}
