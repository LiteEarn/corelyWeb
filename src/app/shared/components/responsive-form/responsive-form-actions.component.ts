import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-responsive-form-actions',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="responsive-form-actions">
      <button
        mat-button
        type="button"
        [disabled]="saving"
        (click)="cancel.emit()"
        class="action-btn">
        {{ cancelText }}
      </button>
      <button
        mat-raised-button
        [color]="submitColor"
        type="submit"
        [disabled]="disabled || saving"
        class="action-btn">
        <mat-icon *ngIf="saving" class="spinner">refresh</mat-icon>
        <span *ngIf="!saving">{{ submitText }}</span>
        <span *ngIf="saving">Salvando...</span>
      </button>
    </div>
  `,
  styles: [`
    .responsive-form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 32px;
      padding: 24px;
      background-color: #F8FAFC;
      border-radius: 12px;
      border: 1px solid #E2E8F0;
    }

    .action-btn {
      min-height: 44px;
      min-width: 120px;
    }

    .spinner {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .responsive-form-actions {
        flex-direction: column-reverse;
        padding: 16px;
        margin-top: 24px;
      }

      .action-btn {
        width: 100%;
        min-width: unset;
      }
    }
  `]
})
export class ResponsiveFormActionsComponent {
  @Input() cancelText: string = 'Cancelar';
  @Input() submitText: string = 'Salvar';
  @Input() saving: boolean = false;
  @Input() disabled: boolean = false;
  @Input() submitColor: 'primary' | 'warn' = 'primary';
  @Output() cancel = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();
}
