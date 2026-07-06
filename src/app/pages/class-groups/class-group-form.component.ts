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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { DsPageFormComponent, DsPageHeaderComponent, DsPageCardComponent, DsStatusChipComponent } from '../../shared/design-system';
import { ClassGroupService } from '../../features/class-groups/class-group.service';
import { ClassGroup } from '../../features/class-groups/class-group.model';
import { InstructorService } from '../../features/instructors/instructor.service';
import { Instructor } from '../../features/instructors/instructor.model';
import { EnrollmentService } from '../../features/enrollments/enrollment.service';
import { Enrollment } from '../../features/enrollments/enrollment.model';
import { CustomValidators } from '../../shared/utils';
import { CurrentStudioService } from '../../core/services/current-studio.service';
import { ToastService } from '../../core/services/toast.service';
import { FeatureGateService } from '../../core/rbac/feature-gate.service';

@Component({
  selector: 'app-class-group-form',
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
    MatCheckboxModule,
    MatTabsModule,
    MatTableModule,
    DsPageFormComponent,
    DsPageHeaderComponent,
    DsPageCardComponent,
    DsStatusChipComponent
  ],
  templateUrl: './class-group-form.component.html',
  styleUrl: './class-group-form.component.scss'
})
export class ClassGroupFormComponent implements OnInit {
  classGroupForm: FormGroup;
  isEditMode: boolean = false;
  classGroupId: string | null = null;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  isFormSubmitted: boolean = false;
  instructors: Instructor[] = [];
  enrolledStudents: Enrollment[] = [];
  displayedColumns: string[] = ['studentName', 'studentPhone', 'studentEmail', 'status', 'actions'];
  dataSource = new MatTableDataSource<Enrollment>([]);

  constructor(
    private fb: FormBuilder,
    private classGroupService: ClassGroupService,
    private instructorService: InstructorService,
    private enrollmentService: EnrollmentService,
    private route: ActivatedRoute,
    private router: Router,
    private currentStudioService: CurrentStudioService,
    private toastService: ToastService,
    private featureGateService: FeatureGateService
  ) {
    this.classGroupForm = this.createForm();
  }

  ngOnInit(): void {
    this.classGroupId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.classGroupId;

    if (this.featureGateService.canLoadInstructors()) {
      this.loadInstructors();
    }

    if (this.isEditMode && this.classGroupId) {
      if (this.featureGateService.canLoadClassGroups()) {
        this.loadClassGroup(this.classGroupId);
      }
      if (this.featureGateService.canLoadEnrollments()) {
        this.loadEnrolledStudents(this.classGroupId);
      }
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [CustomValidators.required('Nome'), Validators.minLength(3)]],
      description: [''],
      instructorId: ['', [CustomValidators.required('Instrutor')]],
      startTime: ['', [CustomValidators.required('Hora início')]],
      endTime: ['', [CustomValidators.required('Hora fim')]],
      capacity: ['', [CustomValidators.required('Capacidade'), Validators.min(1)]],
      monday: [false],
      tuesday: [false],
      wednesday: [false],
      thursday: [false],
      friday: [false],
      saturday: [false],
      sunday: [false],
      active: [true]
    }, {
      validators: [CustomValidators.timeRangeLessThan('startTime', 'endTime')]
    });
  }

  loadInstructors(): void {
    this.instructorService.getAll({ active: true }).subscribe({
      next: (data) => {
        this.instructors = data;
      },
      error: (error) => {
        console.error('Error loading instructors:', error);
      }
    });
  }

  loadClassGroup(id: string): void {
    this.isLoading = true;
    this.classGroupService.getById(id).subscribe({
      next: (classGroup) => {
        this.classGroupForm.patchValue({
          name: classGroup.name,
          description: classGroup.description,
          instructorId: classGroup.instructorId,
          startTime: classGroup.startTime,
          endTime: classGroup.endTime,
          capacity: classGroup.capacity,
          monday: classGroup.monday,
          tuesday: classGroup.tuesday,
          wednesday: classGroup.wednesday,
          thursday: classGroup.thursday,
          friday: classGroup.friday,
          saturday: classGroup.saturday,
          sunday: classGroup.sunday,
          active: classGroup.active
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading class group:', error);
        this.isLoading = false;
      }
    });
  }

  loadEnrolledStudents(classGroupId: string): void {
    this.enrollmentService.getByClassGroupId(classGroupId).subscribe({
      next: (data) => {
        this.enrolledStudents = data;
        this.dataSource.data = this.enrolledStudents;
      },
      error: (error) => {
        console.error('Error loading enrolled students:', error);
      }
    });
  }

  addEnrollment(): void {
    this.router.navigate(['/enrollments/new'], { queryParams: { classGroupId: this.classGroupId } });
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'Ativa',
      'inactive': 'Inativa',
      'cancelled': 'Cancelada',
      'completed': 'Concluída'
    };
    return statusMap[status] || status;
  }

  onSubmit(): void {
    if (!this.featureGateService.canManageClassGroups()) return;
    
    if (this.isSubmitting) return;

    this.isFormSubmitted = true;

    if (this.classGroupForm.invalid) {
      this.classGroupForm.markAllAsTouched();
      return;
    }

    const formValue = this.classGroupForm.value;
    const classGroup: ClassGroup = {
      ...formValue,
      // Implementação temporária para MVP. Futuramente o Studio será obtido do usuário autenticado.
      studioId: this.currentStudioService.getStudioId()
    };

    this.isLoading = true;
    this.isSubmitting = true;

    if (this.isEditMode && this.classGroupId) {
      this.classGroupService.update(this.classGroupId, classGroup).subscribe({
        next: () => {
          this.toastService.success('As aulas futuras foram atualizadas automaticamente.');
          this.isLoading = false;
          this.isSubmitting = false;
          this.router.navigate(['/class-groups']);
        },
        error: (error) => {
          console.error('Error updating class group:', error);
          this.isLoading = false;
          this.isSubmitting = false;
        }
      });
    } else {
      this.classGroupService.create(classGroup).subscribe({
        next: () => {
          this.toastService.success('Turma criada com sucesso.\nAs aulas dos próximos 60 dias foram geradas automaticamente.');
          this.isLoading = false;
          this.isSubmitting = false;
          this.router.navigate(['/class-groups']);
        },
        error: (error) => {
          console.error('Error creating class group:', error);
          this.isLoading = false;
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/class-groups']);
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Editar Turma' : 'Nova Turma';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Atualizar' : 'Criar';
  }

  // Método para verificar se deve mostrar erro
  shouldShowError(fieldName: string): boolean {
    const field = this.classGroupForm.get(fieldName);
    return !!(field && field.errors && (field.touched || this.isFormSubmitted));
  }

  // Método para obter mensagem de erro
  getFieldError(fieldName: string): string {
    const field = this.classGroupForm.get(fieldName);
    if (!field || !field.errors || (!field.touched && !this.isFormSubmitted)) {
      return '';
    }

    // Verifica erros customizados primeiro
    if (field.errors['required']) {
      return field.errors['required'].message || `${fieldName} é obrigatório`;
    }
    if (field.errors['min']) {
      return `Valor deve ser maior que 0`;
    }
    if (field.errors['minlength']) {
      return `Campo deve ter no mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    }

    return 'Campo inválido';
  }

  // Método para verificar se há erro de nível de formulário (timeRange)
  hasFormError(): boolean {
    return !!(this.classGroupForm.errors && this.isFormSubmitted);
  }

  // Método para obter mensagem de erro de nível de formulário
  getFormError(): string {
    if (!this.classGroupForm.errors) {
      return '';
    }

    if (this.classGroupForm.errors['timeRange']) {
      return this.classGroupForm.errors['timeRange'].message;
    }

    return '';
  }

  // Método para verificar se deve mostrar erro em campo específico para timeRange
  shouldShowTimeRangeError(fieldName: string): boolean {
    if (!this.hasFormError()) {
      return false;
    }
    return fieldName === 'startTime' || fieldName === 'endTime';
  }

  hasNoInstructor(): boolean {
    const instructorId = this.classGroupForm.get('instructorId')?.value;
    return !instructorId || instructorId.trim() === '';
  }
}
