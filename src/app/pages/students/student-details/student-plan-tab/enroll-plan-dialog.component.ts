import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { provideNativeDateAdapter } from '@angular/material/core';
import { DsEmptyStateComponent } from '../../../../shared/design-system';
import { PlanService } from '../../../../features/plans/plan.service';
import { Plan } from '../../../../features/plans/plan.model';

export interface EnrollPlanDialogData {
  studentId: string;
}

export interface EnrollPlanDialogResult {
  planId: string;
  startDate: string;
}

@Component({
  selector: 'app-enroll-plan-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatSelectModule, MatInputModule, MatButtonModule, MatDatepickerModule,
    MatProgressSpinnerModule, DsEmptyStateComponent
  ],
  providers: [provideNativeDateAdapter()],
  template: `
    <h2 mat-dialog-title>Nova Matrícula</h2>

    <mat-dialog-content>
      <div *ngIf="loading" class="loading-state">
        <mat-spinner diameter="32"></mat-spinner>
        <p>Carregando planos...</p>
      </div>

      <div *ngIf="!loading && plans.length === 0" class="empty-state">
        <ds-empty-state
          icon="card_membership"
          title="Nenhum plano disponível"
          description="Não existem planos ativos no momento. Cadastre um plano antes de realizar a matrícula.">
        </ds-empty-state>
      </div>

      <form *ngIf="!loading && plans.length > 0" [formGroup]="form" class="enroll-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Plano</mat-label>
          <mat-select formControlName="planId">
            <mat-option *ngFor="let plan of plans" [value]="plan.id">
              {{ plan.name }} - {{ formatCurrency(plan.value) }}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('planId')?.invalid && form.get('planId')?.touched">
            Selecione um plano
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Data de início</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="startDate">
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          <mat-error *ngIf="form.get('startDate')?.invalid && form.get('startDate')?.touched">
            Selecione a data de início
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Observações</mat-label>
          <textarea matInput formControlName="notes" rows="2" placeholder="Observações opcionais"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" *ngIf="!loading && plans.length > 0">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="onConfirm()">Matricular</button>
    </mat-dialog-actions>

    <mat-dialog-actions align="end" *ngIf="!loading && plans.length === 0">
      <button mat-button mat-dialog-close>Fechar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; }
    .enroll-form { display: flex; flex-direction: column; gap: 16px; padding-top: 8px; }
    .loading-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 32px 0; }
    .empty-state { padding: 16px 0; }
  `]
})
export class EnrollPlanDialogComponent implements OnInit {
  form: FormGroup;
  plans: Plan[] = [];
  loading = true;

  constructor(
    private fb: FormBuilder,
    private planService: PlanService,
    public dialogRef: MatDialogRef<EnrollPlanDialogComponent, EnrollPlanDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: EnrollPlanDialogData
  ) {
    this.form = this.fb.group({
      planId: ['', Validators.required],
      startDate: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadPlans();
  }

  private loadPlans(): void {
    this.loading = true;
    this.planService.getPlans(true).subscribe({
      next: (data) => {
        this.plans = data;
        this.loading = false;
      },
      error: () => {
        this.plans = [];
        this.loading = false;
      }
    });
  }

  onConfirm(): void {
    if (this.form.valid) {
      const raw = this.form.value;
      const date: Date = raw.startDate;
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      this.dialogRef.close({
        planId: raw.planId,
        startDate: `${year}-${month}-${day}`
      });
    }
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
