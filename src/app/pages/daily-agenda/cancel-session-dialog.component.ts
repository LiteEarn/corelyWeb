import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { CancelReason } from '../../features/sessions/session.model';

interface CancelOption {
  value: CancelReason;
  label: string;
}

@Component({
  selector: 'app-cancel-session-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>Cancelar Aula</h2>
    <mat-dialog-content>
      <p class="cancel-message">Tem certeza que deseja cancelar esta aula?</p>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Motivo do cancelamento</mat-label>
        <mat-select [(ngModel)]="selectedReason" required>
          <mat-option *ngFor="let opt of reasons" [value]="opt.value">
            {{ opt.label }}
          </mat-option>
        </mat-select>
        <mat-icon matSuffix>info</mat-icon>
      </mat-form-field>

      <mat-form-field *ngIf="selectedReason === 'OTHER'" appearance="outline" class="full-width">
        <mat-label>Descreva o motivo</mat-label>
        <textarea
          matInput
          [(ngModel)]="description"
          maxlength="500"
          rows="3"
          placeholder="Descreva o motivo do cancelamento..."
        ></textarea>
        <mat-hint align="end">{{ description.length }}/500</mat-hint>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Voltar</button>
      <button
        mat-raised-button
        color="warn"
        (click)="onConfirm()"
        [disabled]="!selectedReason"
      >
        <mat-icon>cancel</mat-icon>
        Cancelar Aula
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
    .full-width {
      width: 100%;
      margin-top: 8px;
    }
    .cancel-message {
      margin-bottom: 16px;
      color: var(--ds-textSecondary, #666);
    }
  `,
  ],
})
export class CancelSessionDialogComponent {
  reasons: CancelOption[] = [
    { value: 'HOLIDAY', label: 'Feriado' },
    { value: 'MAINTENANCE', label: 'Manutenção' },
    { value: 'INSTRUCTOR_ABSENT', label: 'Instrutor Ausente' },
    { value: 'LOW_OCCUPANCY', label: 'Baixa Ocupação' },
    { value: 'EVENT', label: 'Evento' },
    { value: 'OTHER', label: 'Outro' },
  ];

  selectedReason: CancelReason | null = null;
  description = '';

  constructor(
    public dialogRef: MatDialogRef<CancelSessionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string }
  ) {}

  onConfirm(): void {
    if (!this.selectedReason) return;
    this.dialogRef.close({
      cancelReason: this.selectedReason,
      cancelDescription: this.selectedReason === 'OTHER' ? this.description : undefined,
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
