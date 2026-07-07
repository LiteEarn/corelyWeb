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
import { ResponsiveFormGridComponent, ResponsiveFormSectionComponent } from '../../../shared/components';
import { FeatureGateService } from '../../../core/rbac/feature-gate.service';
import { StudentService } from '../../../features/students/student.service';
import { Student } from '../../../features/students/student.model';
import { PhoneMaskUtil, DateMaskUtil, CustomValidators } from '../../../shared/utils';
import { CurrentStudioService } from '../../../core/services/current-studio.service';

@Component({
  selector: 'app-student-form',
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
    DsPageCardComponent,
    ResponsiveFormGridComponent,
    ResponsiveFormSectionComponent
  ],
  templateUrl: './student-form.component.html',
  styleUrl: './student-form.component.scss'
})
export class StudentFormComponent implements OnInit {
  studentForm: FormGroup;
  isEditMode: boolean = false;
  studentId: string | null = null;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  isFormSubmitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private route: ActivatedRoute,
    private router: Router,
    private currentStudioService: CurrentStudioService,
    private featureGateService: FeatureGateService,
  ) {
    this.studentForm = this.createForm();
  }

  ngOnInit(): void {
    this.studentId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.studentId;

    if (this.isEditMode && this.studentId && this.featureGateService.canManageStudents()) {
      this.loadStudent(this.studentId);
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      fullName: ['', [CustomValidators.required('Nome'), Validators.minLength(3)]],
      phone: ['', [CustomValidators.required('Telefone'), CustomValidators.phone()]],
      email: ['', [CustomValidators.required('Email'), CustomValidators.email()]],
      birthDate: ['', [CustomValidators.required('Data de nascimento'), CustomValidators.birthDate()]],
      active: [true]
    });
  }

  loadStudent(id: string): void {
    this.isLoading = true;
    this.studentService.getById(id).subscribe({
      next: (student) => {
        this.studentForm.patchValue({
          fullName: student.fullName,
          phone: PhoneMaskUtil.applyMask(student.phone),
          email: student.email,
          birthDate: DateMaskUtil.formatDate(new Date(student.birthDate)),
          active: student.active
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading student:', error);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (!this.featureGateService.canManageStudents()) return;

    if (this.isSubmitting) return;

    this.isFormSubmitted = true;

    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    const formValue = this.studentForm.value;
    const birthDate = DateMaskUtil.parseDate(formValue.birthDate);
    const student: Student = {
      ...formValue,
      phone: PhoneMaskUtil.removeMask(formValue.phone),
      birthDate: birthDate ? this.formatDateForApi(birthDate) : '',
      // Implementação temporária para MVP. Futuramente o Studio será obtido do usuário autenticado.
      studioId: this.currentStudioService.getStudioId()
    };

    this.isLoading = true;
    this.isSubmitting = true;

    if (this.isEditMode && this.studentId) {
      this.studentService.update(this.studentId, student).subscribe({
        next: () => {
          this.isLoading = false;
          this.isSubmitting = false;
          this.router.navigate(['/students']);
        },
        error: (error) => {
          console.error('Error updating student:', error);
          this.isLoading = false;
          this.isSubmitting = false;
        }
      });
    } else {
      this.studentService.create(student).subscribe({
        next: () => {
          this.isLoading = false;
          this.isSubmitting = false;
          this.router.navigate(['/students']);
        },
        error: (error) => {
          console.error('Error creating student:', error);
          this.isLoading = false;
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/students']);
  }

  formatDateForApi(date: Date): string {
    // Use local timezone methods to avoid UTC conversion
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Editar Aluno' : 'Novo Aluno';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Atualizar' : 'Criar';
  }

  // Métodos para máscaras
  onPhoneInput(event: any): void {
    const input = event.target;
    const value = input.value;
    const maskedValue = PhoneMaskUtil.applyMask(value);

    // Atualiza o valor do input com a máscara
    input.value = maskedValue;

    // Atualiza o form control com apenas números
    const numbersOnly = PhoneMaskUtil.removeMask(maskedValue);
    this.studentForm.get('phone')?.setValue(numbersOnly, { emitEvent: false });
  }

  onDateInput(event: any): void {
    const input = event.target;
    const value = input.value;
    const maskedValue = DateMaskUtil.applyMask(value);

    // Atualiza o valor do input com a máscara
    input.value = maskedValue;

    // Atualiza o form control
    this.studentForm.get('birthDate')?.setValue(maskedValue, { emitEvent: false });
  }

  // Método para verificar se deve mostrar erro
  shouldShowError(fieldName: string): boolean {
    const field = this.studentForm.get(fieldName);
    return !!(field && field.errors && (field.touched || this.isFormSubmitted));
  }

  // Método para obter mensagem de erro
  getFieldError(fieldName: string): string {
    const field = this.studentForm.get(fieldName);
    if (!field || !field.errors || (!field.touched && !this.isFormSubmitted)) {
      return '';
    }

    // Verifica erros customizados primeiro
    if (field.errors['required']) {
      return field.errors['required'].message || `${fieldName} é obrigatório`;
    }
    if (field.errors['phone']) {
      return field.errors['phone'].message || 'Telefone inválido';
    }
    if (field.errors['birthDate']) {
      return field.errors['birthDate'].message || 'Data inválida';
    }
    if (field.errors['email']) {
      return field.errors['email'].message || 'Email inválido';
    }
    if (field.errors['minlength']) {
      return `Nome deve ter no mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    }

    return 'Campo inválido';
  }
}
