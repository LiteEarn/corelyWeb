import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { ObjectiveService } from '../../../../features/objectives/objective.service';
import { Objective, ObjectiveStatus } from '../../../../features/objectives/objective.model';

@Component({
  selector: 'app-objective-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule
  ],
  templateUrl: './objective-dialog.component.html',
  styleUrl: './objective-dialog.component.scss'
})
export class ObjectiveDialogComponent implements OnInit {
  objectiveForm: FormGroup;
  isEditMode: boolean = false;
  isLoading: boolean = false;
  isFormSubmitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private objectiveService: ObjectiveService,
    public dialogRef: MatDialogRef<ObjectiveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      studentId: string;
      isEditMode: boolean;
      objective?: Objective;
    }
  ) {
    this.isEditMode = data.isEditMode;
    this.objectiveForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.objective) {
      this.objectiveForm.patchValue({
        title: this.data.objective.title,
        description: this.data.objective.description || '',
        status: this.data.objective.status,
        startDate: new Date(this.data.objective.startDate),
        targetDate: this.data.objective.targetDate ? new Date(this.data.objective.targetDate) : ''
      });
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      status: ['ACTIVE', Validators.required],
      startDate: ['', Validators.required],
      targetDate: ['']
    }, { validators: this.dateRangeValidator });
  }

  dateRangeValidator(group: FormGroup): { [key: string]: any } | null {
    const startDate = group.get('startDate')?.value;
    const targetDate = group.get('targetDate')?.value;

    if (startDate && targetDate && new Date(targetDate) < new Date(startDate)) {
      return { dateRangeInvalid: true };
    }
    return null;
  }

  onSubmit(): void {
    this.isFormSubmitted = true;

    if (this.objectiveForm.invalid) {
      this.objectiveForm.markAllAsTouched();
      return;
    }

    const formValue = this.objectiveForm.value;
    const objective: Objective = {
      ...formValue,
      studentId: this.data.studentId,
      studioId: '11111111-1111-1111-1111-111111111111',
      startDate: this.formatDateForApi(formValue.startDate),
      targetDate: formValue.targetDate ? this.formatDateForApi(formValue.targetDate) : undefined
    };

    this.isLoading = true;

    if (this.isEditMode && this.data.objective?.id) {
      this.objectiveService.update(this.data.objective.id, objective).subscribe({
        next: () => {
          this.isLoading = false;
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error updating objective:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.objectiveService.create(objective).subscribe({
        next: () => {
          this.isLoading = false;
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error creating objective:', error);
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
    const field = this.objectiveForm.get(fieldName);
    return !!(field && field.errors && (field.touched || this.isFormSubmitted));
  }

  getFieldError(fieldName: string): string {
    const field = this.objectiveForm.get(fieldName);
    if (!field || !field.errors || (!field.touched && !this.isFormSubmitted)) {
      return '';
    }

    if (field.errors['required']) {
      return 'Campo obrigatório';
    }
    if (field.errors['minlength']) {
      return `Mínimo de ${field.errors['minlength'].requiredLength} caracteres`;
    }
    if (field.errors['maxlength']) {
      return `Máximo de ${field.errors['maxlength'].requiredLength} caracteres`;
    }
    if (field.errors['dateRangeInvalid']) {
      return 'Data meta deve ser maior ou igual à data início';
    }

    return 'Campo inválido';
  }
}
