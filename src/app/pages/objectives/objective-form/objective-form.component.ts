import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DsPageFormComponent, DsPageHeaderComponent, DsPageCardComponent } from '../../../shared/design-system';
import { ObjectiveService } from '../../../features/objectives/objective.service';
import { Objective, ObjectiveStatus } from '../../../features/objectives/objective.model';
import { StudentService } from '../../../features/students/student.service';
import { Student } from '../../../features/students/student.model';
import { CurrentStudioService } from '../../../core/services/current-studio.service';

@Component({
  selector: 'app-objective-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    DsPageFormComponent,
    DsPageHeaderComponent,
    DsPageCardComponent
  ],
  templateUrl: './objective-form.component.html',
  styleUrl: './objective-form.component.scss'
})
export class ObjectiveFormComponent implements OnInit {
  objectiveForm: FormGroup;
  isEditMode: boolean = false;
  objectiveId: string | null = null;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  isFormSubmitted: boolean = false;
  students: Student[] = [];

  constructor(
    private fb: FormBuilder,
    private objectiveService: ObjectiveService,
    private studentService: StudentService,
    private route: ActivatedRoute,
    private router: Router,
    private currentStudioService: CurrentStudioService
  ) {
    this.objectiveForm = this.createForm();
  }

  ngOnInit(): void {
    this.objectiveId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.objectiveId;
    this.loadStudents();

    if (this.isEditMode && this.objectiveId) {
      this.loadObjective(this.objectiveId);
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      studentId: ['', Validators.required],
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

  loadStudents(): void {
    this.studentService.getAll().subscribe({
      next: (data) => {
        this.students = data;
      },
      error: (error) => {
        console.error('Error loading students:', error);
      }
    });
  }

  loadObjective(id: string): void {
    this.isLoading = true;
    this.objectiveService.getById(id).subscribe({
      next: (objective) => {
        this.objectiveForm.patchValue({
          studentId: objective.studentId,
          title: objective.title,
          description: objective.description || '',
          status: objective.status,
          startDate: new Date(objective.startDate),
          targetDate: objective.targetDate ? new Date(objective.targetDate) : ''
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading objective:', error);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    console.log('ObjectiveForm onSubmit executado');

    if (this.isSubmitting) {
      console.log('ObjectiveForm submit já em andamento, ignorando');
      return;
    }

    this.isFormSubmitted = true;

    if (this.objectiveForm.invalid) {
      this.objectiveForm.markAllAsTouched();
      return;
    }

    const formValue = this.objectiveForm.value;
    const objective: Objective = {
      ...formValue,
      startDate: this.formatDateForApi(formValue.startDate),
      targetDate: formValue.targetDate ? this.formatDateForApi(formValue.targetDate) : undefined,
      studioId: this.currentStudioService.getStudioId()
    };

    this.isLoading = true;
    this.isSubmitting = true;

    if (this.isEditMode && this.objectiveId) {
      this.objectiveService.update(this.objectiveId, objective).subscribe({
        next: () => {
          this.isLoading = false;
          this.isSubmitting = false;
          this.router.navigate(['/objectives']);
        },
        error: (error) => {
          console.error('Error updating objective:', error);
          this.isLoading = false;
          this.isSubmitting = false;
        }
      });
    } else {
      this.objectiveService.create(objective).subscribe({
        next: () => {
          this.isLoading = false;
          this.isSubmitting = false;
          this.router.navigate(['/objectives']);
        },
        error: (error) => {
          console.error('Error creating objective:', error);
          this.isLoading = false;
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/objectives']);
  }

  formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Editar Objetivo' : 'Novo Objetivo';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Atualizar' : 'Criar';
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
