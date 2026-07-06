import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TextFieldModule } from '@angular/cdk/text-field';
import { EvolutionService } from '../../../../features/evolutions/evolution.service';
import { Evolution } from '../../../../features/evolutions/evolution.model';
import { StudentService } from '../../../../features/students/student.service';
import { Student } from '../../../../features/students/student.model';
import { ObjectiveService } from '../../../../features/objectives/objective.service';
import { Objective } from '../../../../features/objectives/objective.model';
import { CurrentStudioService } from '../../../../core/services/current-studio.service';
import { PermissionService } from '../../../../core/rbac/permission.service';

export interface EvolutionDialogData {
  studentId: string;
  isEditMode: boolean;
  evolution?: Evolution;
}

@Component({
  selector: 'app-evolution-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    TextFieldModule
  ],
  templateUrl: './evolution-dialog.component.html',
  styleUrl: './evolution-dialog.component.scss'
})
export class EvolutionDialogComponent {
  evolutionForm: FormGroup;
  isSubmitting: boolean = false;
  isFormSubmitted: boolean = false;
  students: Student[] = [];
  objectives: Objective[] = [];
  descriptionMaxLength: number = 2000;

  constructor(
    private fb: FormBuilder,
    private evolutionService: EvolutionService,
    private studentService: StudentService,
    private objectiveService: ObjectiveService,
    private currentStudioService: CurrentStudioService,
    private permissionService: PermissionService,
    public dialogRef: MatDialogRef<EvolutionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EvolutionDialogData
  ) {
    this.evolutionForm = this.createForm();
    if (this.permissionService.hasPermission('EVOLUTION_WRITE')) {
      this.initializeForm();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      studentId: ['', Validators.required],
      objectiveId: [''],
      evaluationId: [''],
      evolutionDate: [new Date(), Validators.required],
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(this.descriptionMaxLength)]]
    });
  }

  initializeForm(): void {
    this.loadStudents();
    this.loadObjectives();

    if (this.data.studentId) {
      this.evolutionForm.patchValue({ studentId: this.data.studentId });
    }

    if (this.data.isEditMode && this.data.evolution) {
      this.evolutionForm.patchValue({
        studentId: this.data.evolution.studentId,
        objectiveId: this.data.evolution.objectiveId || '',
        evaluationId: this.data.evolution.evaluationId || '',
        evolutionDate: new Date(this.data.evolution.evolutionDate),
        title: this.data.evolution.title,
        description: this.data.evolution.description
      });
    }
  }

  loadStudents(): void {
    if (!this.permissionService.hasPermission('STUDENT_READ')) return;
    this.studentService.getAll().subscribe({
      next: (data) => {
        this.students = data;
      },
      error: (error) => {
        console.error('Error loading students:', error);
      }
    });
  }

  loadObjectives(): void {
    if (!this.permissionService.hasPermission('OBJECTIVE_READ')) return;
    this.objectiveService.getAll({ studentId: this.data.studentId }).subscribe({
      next: (data) => {
        this.objectives = data;
      },
      error: (error) => {
        console.error('Error loading objectives:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }

    this.isFormSubmitted = true;

    if (this.evolutionForm.invalid) {
      this.evolutionForm.markAllAsTouched();
      return;
    }

    const formValue = this.evolutionForm.value;
    const evolution: Evolution = {
      ...formValue,
      evolutionDate: this.formatDateForApi(formValue.evolutionDate),
      studioId: this.currentStudioService.getStudioId()
    };

    console.log('Evolution dialog payload:', evolution);

    this.isSubmitting = true;

    if (this.data.isEditMode && this.data.evolution?.id) {
      this.evolutionService.update(this.data.evolution.id, evolution).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error updating evolution:', error);
          this.isSubmitting = false;
        }
      });
    } else {
      this.evolutionService.create(evolution).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error creating evolution:', error);
          this.isSubmitting = false;
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
    const field = this.evolutionForm.get(fieldName);
    return !!(field && field.errors && (field.touched || this.isFormSubmitted));
  }

  getFieldError(fieldName: string): string {
    const field = this.evolutionForm.get(fieldName);
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

    return 'Campo inválido';
  }

  getDescriptionRemainingChars(): number {
    const description = this.evolutionForm.get('description')?.value || '';
    return this.descriptionMaxLength - description.length;
  }
}
