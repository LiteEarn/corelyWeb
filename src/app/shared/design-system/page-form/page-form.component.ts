import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DsButtonComponent } from '../button/button.component';
import { ResponsiveService } from '../../layout/responsive.service';
import { LayoutMode } from '../../layout/layout-mode.enum';

@Component({
  selector: 'ds-page-form',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, DsButtonComponent],
  templateUrl: './page-form.component.html',
  styleUrl: './page-form.component.scss'
})
export class DsPageFormComponent {
  private responsive = inject(ResponsiveService);

  @Input() cancelText: string = 'Cancelar';
  @Input() submitText: string = 'Salvar';
  @Input() loading: boolean = false;
  @Input() disabled: boolean = false;
  @Input() submitVariant: 'primary' | 'danger' = 'primary';
  @Output() cancel = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();

  get isMobile(): boolean {
    return this.responsive.layoutMode() === LayoutMode.MOBILE;
  }

  onFormSubmit(): void {
    this.scrollToFirstError();
    this.submit.emit();
  }

  private scrollToFirstError(): void {
    setTimeout(() => {
      const firstError = document.querySelector('.mat-mdc-form-field.ng-invalid');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = firstError.querySelector('input, select, textarea, [matInput]');
        if (input instanceof HTMLElement) {
          input.focus();
        }
      }
    }, 100);
  }
}
