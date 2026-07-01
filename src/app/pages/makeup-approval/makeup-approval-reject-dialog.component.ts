import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DsButtonComponent } from '../../shared/design-system/button/button.component';

@Component({
  selector: 'app-makeup-approval-reject-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    DsButtonComponent,
  ],
  template: `
    <h2 mat-dialog-title>Rejeitar Reposição</h2>
    <mat-dialog-content>
      <p class="dialog-description">Informe o motivo da rejeição (opcional).</p>

      <mat-form-field appearance="outline" class="reason-field">
        <mat-label>Motivo da rejeição</mat-label>
        <textarea
          matInput
          [(ngModel)]="reason"
          rows="3"
          placeholder="Descreva o motivo..."
        ></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <ds-button
        label="Rejeitar"
        variant="danger"
        (click)="onConfirm()"
      ></ds-button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-description {
      font-size: 14px;
      color: #64748b;
      margin: 0 0 16px;
    }
    .reason-field {
      width: 100%;
    }
  `],
})
export class MakeupApprovalRejectDialogComponent {
  reason: string = '';

  constructor(
    public dialogRef: MatDialogRef<MakeupApprovalRejectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { makeupRequestId: string },
  ) {}

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onConfirm(): void {
    this.dialogRef.close({ reason: this.reason });
  }
}
