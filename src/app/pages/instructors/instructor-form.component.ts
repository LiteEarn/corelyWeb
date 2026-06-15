import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { Instructor } from '../../features/instructors/instructor.model';
import { InstructorService } from '../../features/instructors/instructor.service';
import { PhoneMaskUtil, CustomValidators } from '../../shared/utils';
import { CurrentStudioService } from '../../core/services/current-studio.service';

@Component({
  selector: 'app-instructor-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    PageHeaderComponent
  ],
  templateUrl: './instructor-form.component.html',
  styleUrl: './instructor-form.component.scss'
})
export class InstructorFormComponent implements OnInit {
  instructorForm: FormGroup;
  isEditMode = false;
  instructorId: string | null = null;
  loading = false;
  saving = false;
  isSubmitting = false;
  isFormSubmitted = false;

  specialties = [
    'Educação Física',
    'Natação',
    'Musculação',
    'Pilates',
    'Yoga',
    'Dança',
    'Artes Marciais',
    'Fisioterapia',
    'Nutrição',
    'Personal Trainer'
  ];

  constructor(
    private fb: FormBuilder,
    private instructorService: InstructorService,
    private router: Router,
    private route: ActivatedRoute,
    private currentStudioService: CurrentStudioService
  ) {
    this.instructorForm = this.createForm();
  }

  ngOnInit(): void {
    this.instructorId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.instructorId;

    if (this.isEditMode && this.instructorId) {
      this.loadInstructor(this.instructorId);
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      fullName: ['', [CustomValidators.required('Nome'), Validators.minLength(2)]],
      phone: ['', [CustomValidators.required('Telefone'), CustomValidators.phone()]],
      email: ['', [CustomValidators.required('Email'), CustomValidators.email()]],
      specialty: ['', CustomValidators.required('Especialidade')],
      active: [true]
    });
  }

  loadInstructor(id: string): void {
    this.loading = true;
    this.instructorService.getById(id).subscribe({
      next: (instructor) => {
        this.instructorForm.patchValue({
          ...instructor,
          phone: PhoneMaskUtil.applyMask(instructor.phone)
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading instructor:', error);
        this.loading = false;
        this.router.navigate(['/instructors']);
      }
    });
  }

  onSubmit(): void {
    console.log('InstructorForm onSubmit executado');
    
    // Proteção contra múltiplos submits
    if (this.isSubmitting) {
      console.log('InstructorForm submit já em andamento, ignorando');
      return;
    }

    this.isFormSubmitted = true;

    if (this.instructorForm.valid) {
      this.saving = true;
      this.isSubmitting = true;
      const formValue = this.instructorForm.value;
      const instructorData: Instructor = {
        ...formValue,
        phone: PhoneMaskUtil.removeMask(formValue.phone),
        // Implementação temporária para MVP. Futuramente o Studio será obtido do usuário autenticado.
        studioId: this.currentStudioService.getStudioId()
      };

      const operation = this.isEditMode
        ? this.instructorService.update(this.instructorId!, instructorData)
        : this.instructorService.create(instructorData);

      operation.subscribe({
        next: () => {
          this.saving = false;
          this.isSubmitting = false;
          this.router.navigate(['/instructors']);
        },
        error: (error) => {
          console.error('Error saving instructor:', error);
          this.saving = false;
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/instructors']);
  }

  // Método para aplicar máscara de telefone
  onPhoneInput(event: any): void {
    const input = event.target;
    const value = input.value;
    const maskedValue = PhoneMaskUtil.applyMask(value);

    // Atualiza o valor do input com a máscara
    input.value = maskedValue;

    // Atualiza o form control com apenas números
    const numbersOnly = PhoneMaskUtil.removeMask(maskedValue);
    this.instructorForm.get('phone')?.setValue(numbersOnly, { emitEvent: false });
  }

  // Método para verificar se deve mostrar erro
  shouldShowError(fieldName: string): boolean {
    const field = this.instructorForm.get(fieldName);
    return !!(field && field.errors && (field.touched || this.isFormSubmitted));
  }

  getFieldError(fieldName: string): string {
    const field = this.instructorForm.get(fieldName);
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
    if (field.errors['email']) {
      return field.errors['email'].message || 'Email inválido';
    }
    if (field.errors['minlength']) {
      return `Nome deve ter no mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    }

    return 'Campo inválido';
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Editar Instrutor' : 'Novo Instrutor';
  }

  get pageSubtitle(): string {
    return this.isEditMode ? 'Atualize as informações do instrutor' : 'Adicione um novo instrutor à instituição';
  }
}
