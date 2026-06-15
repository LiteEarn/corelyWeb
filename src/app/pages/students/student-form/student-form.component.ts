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
import { StudentService } from '../../../features/students/student.service';
import { Student } from '../../../features/students/student.model';
<<<<<<< HEAD
import { PhoneMaskUtil, DateMaskUtil, CustomValidators } from '../../../shared/utils';
import { CurrentStudioService } from '../../../core/services/current-studio.service';
=======
>>>>>>> 8d033bff9dd050d48bab71765c257d850e300cf8

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
    DsPageCardComponent
  ],
  templateUrl: './student-form.component.html',
  styleUrl: './student-form.component.scss'
})
export class StudentFormComponent implements OnInit {
  studentForm: FormGroup;
  isEditMode: boolean = false;
  studentId: string | null = null;
  isLoading: boolean = false;
<<<<<<< HEAD
  isSubmitting: boolean = false;
  isFormSubmitted: boolean = false;
=======
>>>>>>> 8d033bff9dd050d48bab71765c257d850e300cf8

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private route: ActivatedRoute,
<<<<<<< HEAD
    private router: Router,
    private currentStudioService: CurrentStudioService
=======
    private router: Router
>>>>>>> 8d033bff9dd050d48bab71765c257d850e300cf8
  ) {
    this.studentForm = this.createForm();
  }

  ngOnInit(): void {
    this.studentId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.studentId;

    if (this.isEditMode && this.studentId) {
      this.loadStudent(this.studentId);
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
<<<<<<< HEAD
      fullName: ['', [CustomValidators.required('Nome'), Validators.minLength(3)]],
      phone: ['', [CustomValidators.required('Telefone'), CustomValidators.phone()]],
      email: ['', [CustomValidators.required('Email'), CustomValidators.email()]],
      birthDate: ['', [CustomValidators.required('Data de nascimento'), CustomValidators.birthDate()]],
=======
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      birthDate: ['', [Validators.required]],
>>>>>>> 8d033bff9dd050d48bab71765c257d850e300cf8
      active: [true]
    });
  }

  loadStudent(id: string): void {
    this.isLoading = true;
    this.studentService.getById(id).subscribe({
      next: (student) => {
        this.studentForm.patchValue({
          fullName: student.fullName,
<<<<<<< HEAD
          phone: PhoneMaskUtil.applyMask(student.phone),
          email: student.email,
          birthDate: DateMaskUtil.formatDate(new Date(student.birthDate)),
=======
          phone: student.phone,
          email: student.email,
          birthDate: new Date(student.birthDate),
>>>>>>> 8d033bff9dd050d48bab71765c257d850e300cf8
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
<<<<<<< HEAD
    console.log('StudentForm onSubmit executado');
    
    // Proteção contra múltiplos submits
    if (this.isSubmitting) {
      console.log('StudentForm submit já em andamento, ignorando');
      return;
    }

    this.isFormSubmitted = true;

=======
>>>>>>> 8d033bff9dd050d48bab71765c257d850e300cf8
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    const formValue = this.studentForm.value;
<<<<<<< HEAD
    const birthDate = DateMaskUtil.parseDate(formValue.birthDate);
    const student: Student = {
      ...formValue,
      phone: PhoneMaskUtil.removeMask(formValue.phone),
      birthDate: birthDate ? birthDate.toISOString().split('T')[0] : '',
      // Implementação temporária para MVP. Futuramente o Studio será obtido do usuário autenticado.
      studioId: this.currentStudioService.getStudioId()
    };

    this.isLoading = true;
    this.isSubmitting = true;
=======
    const student: Student = {
      ...formValue,
      birthDate: formValue.birthDate.toISOString().split('T')[0]
    };

    this.isLoading = true;
>>>>>>> 8d033bff9dd050d48bab71765c257d850e300cf8

    if (this.isEditMode && this.studentId) {
      this.studentService.update(this.studentId, student).subscribe({
        next: () => {
          this.isLoading = false;
<<<<<<< HEAD
          this.isSubmitting = false;
=======
>>>>>>> 8d033bff9dd050d48bab71765c257d850e300cf8
          this.router.navigate(['/students']);
        },
        error: (error) => {
          console.error('Error updating student:', error);
          this.isLoading = false;
<<<<<<< HEAD
          this.isSubmitting = false;
=======
>>>>>>> 8d033bff9dd050d48bab71765c257d850e300cf8
        }
      });
    } else {
      this.studentService.create(student).subscribe({
        next: () => {
          this.isLoading = false;
<<<<<<< HEAD
          this.isSubmitting = false;
=======
>>>>>>> 8d033bff9dd050d48bab71765c257d850e300cf8
          this.router.navigate(['/students']);
        },
        error: (error) => {
          console.error('Error creating student:', error);
          this.isLoading = false;
<<<<<<< HEAD
          this.isSubmitting = false;
=======
>>>>>>> 8d033bff9dd050d48bab71765c257d850e300cf8
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/students']);
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Editar Aluno' : 'Novo Aluno';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Atualizar' : 'Criar';
  }
<<<<<<< HEAD

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
=======
>>>>>>> 8d033bff9dd050d48bab71765c257d850e300cf8
}
