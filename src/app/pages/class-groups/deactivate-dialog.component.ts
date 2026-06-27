import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpErrorResponse } from '@angular/common/http';
import { ClassGroupService } from '../../features/class-groups/class-group.service';
import { ToastService } from '../../core/services/toast.service';

export interface DeactivateDialogData {
  activeEnrollments: number;
  classGroupId: string;
}

@Component({
  selector: 'app-deactivate-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>Deactivate Class Group</h2>
    <mat-dialog-content>
      <p>
        This class group has <strong>{{ data.activeEnrollments }}</strong> active
        enrollment{{ data.activeEnrollments === 1 ? '' : 's' }}.
      </p>
      <p>If you continue:</p>
      <ul>
        <li>The class group will be deactivated.</li>
        <li>All active enrollments will also be deactivated.</li>
        <li>Students will NOT be removed.</li>
        <li>Attendance history will be preserved.</li>
      </ul>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button
        mat-stroked-button
        (click)="onCancel()"
        [disabled]="deactivating">
        Cancel
      </button>
      <button
        mat-raised-button
        color="primary"
        (click)="onConfirm()"
        [disabled]="deactivating">
        <span *ngIf="!deactivating">Deactivate Class Group</span>
        <span *ngIf="deactivating" class="button-with-spinner">
          Deactivating
          <mat-spinner diameter="16" class="button-spinner"></mat-spinner>
        </span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    ul {
      margin: 8px 0;
      padding-left: 20px;
    }
    li {
      margin-bottom: 4px;
    }
    .button-with-spinner {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .button-spinner {
      display: inline-block;
    }
  `]
})
export class DeactivateDialogComponent {
  deactivating = false;

  constructor(
    public dialogRef: MatDialogRef<DeactivateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeactivateDialogData,
    private classGroupService: ClassGroupService,
    private toastService: ToastService
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.deactivating = true;

    this.classGroupService.inactivate(this.data.classGroupId, { cascadeEnrollments: true }).subscribe({
      next: () => {
        this.dialogRef.close({ success: true });
      },
      error: (error: HttpErrorResponse) => {
        this.deactivating = false;
        this.toastService.error(error.error?.message || 'Erro ao desativar turma. Tente novamente.');
      }
    });
  }
}
