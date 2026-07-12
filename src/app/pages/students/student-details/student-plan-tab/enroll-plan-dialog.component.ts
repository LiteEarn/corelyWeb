import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Plan } from '../../../../features/plans/plan.model';

export interface EnrollPlanDialogData {
  studentId: string;
  plans: Plan[];
}

export interface EnrollPlanDialogResult {
  planId: string;
  startDate: string;
}

@Component({
  selector: 'app-enroll-plan-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatDatepickerModule],
  providers: [provideNativeDateAdapter()],
  template: `
    <h2 mat-dialog-title>Nova Matrícula</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Plano</mat-label>
        <mat-select [(ngModel)]="selectedPlanId">
          <mat-option *ngFor="let plan of data.plans" [value]="plan.id">
            {{ plan.name }} - {{ formatCurrency(plan.value) }}
          </mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Data de Início</mat-label>
        <input matInput [matDatepicker]="picker" [(ngModel)]="startDate">
        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="!selectedPlanId || !startDate" (click)="onConfirm()">Matricular</button>
    </mat-dialog-actions>
  `,
  styles: [`.full-width { width: 100%; margin-bottom: 16px; }`]
})
export class EnrollPlanDialogComponent {
  selectedPlanId: string = '';
  startDate: Date | null = null;

  constructor(
    public dialogRef: MatDialogRef<EnrollPlanDialogComponent, EnrollPlanDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: EnrollPlanDialogData
  ) {}

  onConfirm(): void {
    if (this.selectedPlanId && this.startDate) {
      const day = String(this.startDate.getDate()).padStart(2, '0');
      const month = String(this.startDate.getMonth() + 1).padStart(2, '0');
      const year = this.startDate.getFullYear();
      this.dialogRef.close({ planId: this.selectedPlanId, startDate: `${year}-${month}-${day}` });
    }
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
