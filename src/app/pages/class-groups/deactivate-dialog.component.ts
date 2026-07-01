import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpErrorResponse } from '@angular/common/http';
import { ClassGroupService } from '../../features/class-groups/class-group.service';
import { ToastService } from '../../core/services/toast.service';

export interface DeactivateDialogData {
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
    <h2 mat-dialog-title>Desativar Turma</h2>
    <mat-dialog-content>
      <p>
        Ao inativar esta turma todas as aulas futuras ainda não realizadas
        serão canceladas automaticamente.
      </p>
      <p>O histórico das aulas concluídas será preservado.</p>
      <p><strong>Deseja continuar?</strong></p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button
        mat-stroked-button
        (click)="onCancel()"
        [disabled]="deactivating">
        Cancelar
      </button>
      <button
        mat-raised-button
        color="primary"
        (click)="onConfirm()"
        [disabled]="deactivating">
        <span *ngIf="!deactivating">Desativar Turma</span>
        <span *ngIf="deactivating" class="button-with-spinner">
          Desativando
          <mat-spinner diameter="16" class="button-spinner"></mat-spinner>
        </span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    p {
      margin-bottom: 12px;
      line-height: 1.5;
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
    console.log('[CG-002] Dialog - onConfirm clicked, classGroupId:', this.data.classGroupId);
    this.deactivating = true;

    console.log('[CG-002] Second API call - inactivate with cascadeEnrollments: true');
    this.classGroupService.inactivate(this.data.classGroupId, { cascadeEnrollments: true }).subscribe({
      next: () => {
        console.log('[CG-002] Second API call - success');
        this.dialogRef.close({ success: true });
      },
      error: (error: HttpErrorResponse) => {
        console.log('[CG-002] Second API call - error:', error);
        this.deactivating = false;
        this.toastService.error(error.error?.message || 'Erro ao desativar turma. Tente novamente.');
      }
    });
  }
}
