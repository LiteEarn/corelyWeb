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
    private route: ActivatedRoute
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
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]],
      email: ['', [Validators.required, Validators.email]],
      specialty: ['', Validators.required],
      active: [true]
    });
  }

  loadInstructor(id: string): void {
    this.loading = true;
    this.instructorService.getById(id).subscribe({
      next: (instructor) => {
        this.instructorForm.patchValue(instructor);
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
    if (this.instructorForm.valid) {
      this.saving = true;
      const instructorData: Instructor = this.instructorForm.value;

      const operation = this.isEditMode
        ? this.instructorService.update(this.instructorId!, instructorData)
        : this.instructorService.create(instructorData);

      operation.subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/instructors']);
        },
        error: (error) => {
          console.error('Error saving instructor:', error);
          this.saving = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/instructors']);
  }

  getFieldError(fieldName: string): string {
    const field = this.instructorForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'Este campo é obrigatório';
      }
      if (field.errors['email']) {
        return 'Email inválido';
      }
      if (field.errors['minlength']) {
        return `Mínimo de ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['pattern']) {
        return 'Formato inválido. Use: (XX) XXXXX-XXXX';
      }
    }
    return '';
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Editar Instrutor' : 'Novo Instrutor';
  }

  get pageSubtitle(): string {
    return this.isEditMode ? 'Atualize as informações do instrutor' : 'Adicione um novo instrutor à instituição';
  }
}
