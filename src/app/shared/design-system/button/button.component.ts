import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ButtonVariant, ButtonSize } from './button.types';

@Component({
  selector: 'ds-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class DsButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() label: string = '';
  @Input() icon: string = '';
  @Input() iconPosition: 'start' | 'end' = 'start';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() fullWidth: boolean = false;
  @Output() click = new EventEmitter<void>();

  get buttonClass(): string {
    return `ds-button ds-button-${this.variant} ds-button-${this.size}`;
  }

  get showIcon(): boolean {
    return !!this.icon && !this.loading;
  }

  get showSpinner(): boolean {
    return this.loading;
  }

  handleClick(event: Event): void {
    if (!this.disabled && !this.loading) {
      this.click.emit();
    }
  }
}
