import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
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
export class EnrollmentFormComponent implements OnInit, OnDestroy {
  enrollmentForm: FormGroup;
  isEditMode: boolean = false;
  enrollmentId: string | null = null;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  isFormSubmitted: boolean = false;
  students: Student[] = [];
  classGroups: ClassGroup[] = [];

  private destroy$ = new Subject<void>();

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    this.studentService.getAll({ active: true }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.students = data.filter(student => student.active !== false);
      },
      error: (error: HttpErrorResponse) => {
        this.handleHttpError(error, 'Erro ao carregar alunos');
      }
    });
  }

  loadClassGroups(): void {
    // In edit mode, load all class groups so the currently assigned one appears even if inactive
    const filter = this.isEditMode ? undefined : { active: true };
    this.classGroupService.getAll(filter).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.classGroups = data;
      },
      error: (error: HttpErrorResponse) => {
        this.handleHttpError(error, 'Erro ao carregar turmas');
      }
    });
  }

  loadEnrollment(id: string): void {
    this.isLoading = true;
    this.enrollmentService.getById(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (enrollment) => {
        this.enrollmentForm.patchValue({
          studentId: enrollment.studentId,
          classGroupId: enrollment.classGroupId,
          enrollmentDate: enrollment.enrollmentDate,
          status: enrollment.status
        });
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.handleHttpError(error, 'Erro ao carregar matrícula');
      }
    });
  }

  onSubmit(): void {
    if (this.isSubmitting) return;

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
    this.isSubmitting = true;

    if (this.isEditMode && this.enrollmentId) {
      this.enrollmentService.update(this.enrollmentId, payload).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.toastService.success('Matrícula atualizada com sucesso.');
          this.isLoading = false;
          this.isSubmitting = false;
          this.router.navigate(['/enrollments']);
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          this.isSubmitting = false;
          this.handleHttpError(error, 'Erro ao atualizar matrícula');
        }
      });
    } else {
      this.enrollmentService.create(payload).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.toastService.success('Matrícula criada com sucesso.');
          this.isLoading = false;
          this.isSubmitting = false;
          this.router.navigate(['/enrollments']);
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          this.isSubmitting = false;
          this.handleHttpError(error, 'Erro ao criar matrícula');
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/enrollments']);
  }

  private isSelectedStudentActive(): boolean {
    const studentId = this.enrollmentForm.get('studentId')?.value;
    const student = this.students.find(s => s.id === studentId);
    return !!student && student.active !== false;
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Editar Matrícula' : 'Nova Matrícula';
  }

  get subtitle(): string {
    return this.isEditMode
      ? 'Altere as informações da matrícula do aluno.'
      : 'Cadastre uma nova matrícula para vincular alunos às turmas.';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Atualizar' : 'Criar';
  }

  shouldShowError(fieldName: string): boolean {
    const field = this.enrollmentForm.get(fieldName);
    return !!(field && field.errors && (field.touched || this.isFormSubmitted));
  }

  getFieldError(fieldName: string): string {
    const field = this.enrollmentForm.get(fieldName);
    if (!field || !field.errors || (!field.touched && !this.isFormSubmitted)) {
      return '';
    }

    if (field.errors['required']) {
      return field.errors['required'].message || `${fieldName} é obrigatório`;
    }

    return 'Campo inválido';
  }

  formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  hasNoInstructor(): boolean {
    const classGroupId = this.enrollmentForm.get('classGroupId')?.value;
    if (!classGroupId) return false;
    const classGroup = this.classGroups.find(cg => cg.id === classGroupId);
    return !classGroup || !classGroup.instructorId || classGroup.instructorId.trim() === '';
  }

  isClassGroupInactive(classGroupId: string): boolean {
    const classGroup = this.classGroups.find(cg => cg.id === classGroupId);
    return !classGroup?.active;
  }

  getClassGroupLabel(classGroup: ClassGroup): string {
    return classGroup.active ? classGroup.name : `${classGroup.name} (Inativa)`;
  }

  private handleHttpError(error: HttpErrorResponse, defaultMessage: string): void {
    let message = defaultMessage;

    if (error.status === 400) {
      message = error.error?.message || 'Requisição inválida. Verifique os dados e tente novamente.';
    } else if (error.status === 404) {
      message = error.error?.message || 'Recurso não encontrado.';
    } else if (error.status === 409) {
      message = error.error?.message || 'Conflito de dados. O registro já existe ou está em uso.';
    } else if (error.status === 500) {
      message = error.error?.message || 'Erro interno do servidor. Tente novamente mais tarde.';
    }

    this.toastService.error(message);
  }
}
