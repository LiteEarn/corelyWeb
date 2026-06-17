import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { EvaluationService } from '../../../../features/evaluations/evaluation.service';
import { Evaluation } from '../../../../features/evaluations/evaluation.model';
import { CurrentStudioService } from '../../../../core/services/current-studio.service';

@Component({
  selector: 'app-evaluation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule
  ],
  templateUrl: './evaluation-dialog.component.html',
  styleUrl: './evaluation-dialog.component.scss'
})
export class EvaluationDialogComponent implements OnInit {
  evaluationForm: FormGroup;
  isEditMode: boolean = false;
  isLoading: boolean = false;
  isFormSubmitted: boolean = false;
  calculatedIMC: number = 0;

  constructor(
    private fb: FormBuilder,
    private evaluationService: EvaluationService,
    private currentStudioService: CurrentStudioService,
    public dialogRef: MatDialogRef<EvaluationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      studentId: string;
      isEditMode: boolean;
      evaluation?: Evaluation;
    }
  ) {
    this.isEditMode = data.isEditMode;
    this.evaluationForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.evaluation) {
      this.evaluationForm.patchValue({
        evaluationDate: new Date(this.data.evaluation.evaluationDate),
        weight: this.data.evaluation.weight,
        height: this.data.evaluation.height,
        observations: this.data.evaluation.observations || ''
      });
      this.calculateIMCValue();
    }

    // Subscribe to weight and height changes to calculate IMC in real-time
    this.evaluationForm.get('weight')?.valueChanges.subscribe(() => this.calculateIMCValue());
    this.evaluationForm.get('height')?.valueChanges.subscribe(() => this.calculateIMCValue());
  }

  createForm(): FormGroup {
    return this.fb.group({
      evaluationDate: [new Date(), Validators.required],
      weight: ['', [Validators.required, Validators.min(0.1), Validators.max(500)]],
      height: ['', [Validators.required, Validators.min(0.1), Validators.max(3)]],
      observations: ['', Validators.maxLength(1000)]
    });
  }

  calculateIMCValue(): void {
    const weight = this.evaluationForm.get('weight')?.value;
    const height = this.evaluationForm.get('height')?.value;

    if (weight && height && height > 0) {
      this.calculatedIMC = weight / (height * height);
    } else {
      this.calculatedIMC = 0;
    }
  }

  onSubmit(): void {
    this.isFormSubmitted = true;

    if (this.evaluationForm.invalid) {
      this.evaluationForm.markAllAsTouched();
      return;
    }

    const formValue = this.evaluationForm.value;
    const evaluation: Evaluation = {
      ...formValue,
      studentId: this.data.studentId,
      evaluationDate: this.formatDateForApi(formValue.evaluationDate),
      studioId: this.currentStudioService.getStudioId()
    };

    console.log('Evaluation payload:', evaluation);

    this.isLoading = true;

    if (this.isEditMode && this.data.evaluation?.id) {
      this.evaluationService.update(this.data.evaluation.id, evaluation).subscribe({
        next: () => {
          this.isLoading = false;
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error updating evaluation:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.evaluationService.create(evaluation).subscribe({
        next: () => {
          this.isLoading = false;
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error creating evaluation:', error);
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  shouldShowError(fieldName: string): boolean {
    const field = this.evaluationForm.get(fieldName);
    return !!(field && field.errors && (field.touched || this.isFormSubmitted));
  }

  getFieldError(fieldName: string): string {
    const field = this.evaluationForm.get(fieldName);
    if (!field || !field.errors || (!field.touched && !this.isFormSubmitted)) {
      return '';
    }

    if (field.errors['required']) {
      return 'Campo obrigatório';
    }
    if (field.errors['min']) {
      return `Valor mínimo: ${field.errors['min'].min}`;
    }
    if (field.errors['max']) {
      return `Valor máximo: ${field.errors['max'].max}`;
    }
    if (field.errors['maxlength']) {
      return `Máximo de ${field.errors['maxlength'].requiredLength} caracteres`;
    }

    return 'Campo inválido';
  }
}
