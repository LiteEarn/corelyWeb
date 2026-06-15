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
import { DsPageFormComponent, DsPageHeaderComponent, DsPageCardComponent } from '../../shared/design-system';
import { EnrollmentService } from '../../features/enrollments/enrollment.service';
import { Enrollment } from '../../features/enrollments/enrollment.model';
import { StudentService } from '../../features/students/student.service';
import { Student } from '../../features/students/student.model';
import { ClassGroupService } from '../../features/class-groups/class-group.service';
import { ClassGroup } from '../../features/class-groups/class-group.model';
import { CustomValidators } from '../../shared/utils';
import { CurrentStudioService } from '../../core/services/current-studio.service';

@Component({
  selector: 'app-enrollment-form',
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
  templateUrl: './enrollment-form.component.html',
  styleUrl: './enrollment-form.component.scss'
})
export class EnrollmentFormComponent implements OnInit {
  enrollmentForm: FormGroup;
  isEditMode: boolean = false;
  enrollmentId: string | null = null;
  isLoading: boolean = false;
  isFormSubmitted: boolean = false;
  students: Student[] = [];
  classGroups: ClassGroup[] = [];

  constructor(
    private fb: FormBuilder,
    private enrollmentService: EnrollmentService,
    private studentService: StudentService,
    private classGroupService: ClassGroupService,
    private route: ActivatedRoute,
    private router: Router,
    private currentStudioService: CurrentStudioService
  ) {
    this.enrollmentForm = this.createForm();
  }

  ngOnInit(): void {
    this.enrollmentId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.enrollmentId;
    this.loadStudents();
    this.loadClassGroups();

    if (this.isEditMode && this.enrollmentId) {
      this.loadEnrollment(this.enrollmentId);
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      studentId: ['', [CustomValidators.required('Aluno')]],
      classGroupId: ['', [CustomValidators.required('Turma')]],
      enrollmentDate: ['', [CustomValidators.required('Data da Matrícula')]],
      status: ['active']
    });
  }

  loadStudents(): void {
    this.studentService.getAll({ active: true }).subscribe({
      next: (data) => {
        this.students = data;
      },
      error: (error) => {
        console.error('Error loading students:', error);
      }
    });
  }

  loadClassGroups(): void {
    this.classGroupService.getAll({ active: true }).subscribe({
      next: (data) => {
        this.classGroups = data;
      },
      error: (error) => {
        console.error('Error loading class groups:', error);
      }
    });
  }

  loadEnrollment(id: string): void {
    this.isLoading = true;
    this.enrollmentService.getById(id).subscribe({
      next: (enrollment) => {
        this.enrollmentForm.patchValue({
          studentId: enrollment.studentId,
          classGroupId: enrollment.classGroupId,
          enrollmentDate: enrollment.enrollmentDate,
          status: enrollment.status
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading enrollment:', error);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    this.isFormSubmitted = true;

    if (this.enrollmentForm.invalid) {
      this.enrollmentForm.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.enrollmentForm.getRawValue(),
      studioId: this.currentStudioService.getStudioId()
    };

    this.isLoading = true;

    if (this.isEditMode && this.enrollmentId) {
      this.enrollmentService.update(this.enrollmentId, payload).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/enrollments']);
        },
        error: (error) => {
          console.error('Error updating enrollment:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.enrollmentService.create(payload).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/enrollments']);
        },
        error: (error) => {
          console.error('Error creating enrollment:', error);
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/enrollments']);
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Editar Matrícula' : 'Nova Matrícula';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Atualizar' : 'Criar';
  }

  // Método para verificar se deve mostrar erro
  shouldShowError(fieldName: string): boolean {
    const field = this.enrollmentForm.get(fieldName);
    return !!(field && field.errors && (field.touched || this.isFormSubmitted));
  }

  // Método para obter mensagem de erro
  getFieldError(fieldName: string): string {
    const field = this.enrollmentForm.get(fieldName);
    if (!field || !field.errors || (!field.touched && !this.isFormSubmitted)) {
      return '';
    }

    // Verifica erros customizados primeiro
    if (field.errors['required']) {
      return field.errors['required'].message || `${fieldName} é obrigatório`;
    }

    return 'Campo inválido';
  }
}
