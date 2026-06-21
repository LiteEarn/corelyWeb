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
import { ToastService } from '../../core/services/toast.service';

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
    private currentStudioService: CurrentStudioService,
    private toastService: ToastService
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
        // Defensive: only keep active students even if the backend returns inactive ones
        this.students = data.filter(student => student.active !== false);
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

    if (!this.isEditMode && !this.isSelectedStudentActive()) {
      this.toastService.error('Não é possível matricular um aluno inativo.');
      return;
    }

    const formValue = this.enrollmentForm.getRawValue();
    const payload = {
      ...formValue,
      enrollmentDate: formValue.enrollmentDate ? this.formatDateForApi(formValue.enrollmentDate) : '',
      studioId: this.currentStudioService.getStudioId()
    };

    this.isLoading = true;

    if (this.isEditMode && this.enrollmentId) {
      this.enrollmentService.update(this.enrollmentId, payload).subscribe({
        next: () => {
          this.toastService.success('Matrícula atualizada com sucesso.');
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
          this.toastService.success('Matrícula criada com sucesso.');
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

  // Defensive guard: the selected student must be present in the active students list
  private isSelectedStudentActive(): boolean {
    const studentId = this.enrollmentForm.get('studentId')?.value;
    const student = this.students.find(s => s.id === studentId);
    return !!student && student.active !== false;
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

  formatDateForApi(date: Date): string {
    // Use local timezone methods to avoid UTC conversion
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
