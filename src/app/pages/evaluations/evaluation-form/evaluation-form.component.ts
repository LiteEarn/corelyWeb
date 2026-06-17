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
import { EvaluationService } from '../../../features/evaluations/evaluation.service';
import { Evaluation } from '../../../features/evaluations/evaluation.model';
import { StudentService } from '../../../features/students/student.service';
import { Student } from '../../../features/students/student.model';
import { CurrentStudioService } from '../../../core/services/current-studio.service';

@Component({
  selector: 'app-evaluation-form',
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
  templateUrl: './evaluation-form.component.html',
  styleUrl: './evaluation-form.component.scss'
})
export class EvaluationFormComponent implements OnInit {
  evaluationForm: FormGroup;
  isEditMode: boolean = false;
  evaluationId: string | null = null;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  isFormSubmitted: boolean = false;
  students: Student[] = [];
  calculatedIMC: number = 0;

  constructor(
    private fb: FormBuilder,
    private evaluationService: EvaluationService,
    private studentService: StudentService,
    private route: ActivatedRoute,
    private router: Router,
    private currentStudioService: CurrentStudioService
  ) {
    this.evaluationForm = this.createForm();
  }

  ngOnInit(): void {
    this.evaluationId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.evaluationId;
    this.loadStudents();

    // Check if studentId is passed in query params (for creating from student details)
    const studentId = this.route.snapshot.queryParamMap.get('studentId');
    if (studentId) {
      this.evaluationForm.patchValue({ studentId });
    }

    if (this.isEditMode && this.evaluationId) {
      this.loadEvaluation(this.evaluationId);
    }

    // Subscribe to weight and height changes to calculate IMC in real-time
    this.evaluationForm.get('weight')?.valueChanges.subscribe(() => this.calculateIMCValue());
    this.evaluationForm.get('height')?.valueChanges.subscribe(() => this.calculateIMCValue());
  }

  createForm(): FormGroup {
    return this.fb.group({
      studentId: ['', Validators.required],
      evaluationDate: [new Date(), Validators.required],
      weight: ['', [Validators.required, Validators.min(0.1), Validators.max(500)]],
      height: ['', [Validators.required, Validators.min(0.1), Validators.max(3)]],
      observations: ['', Validators.maxLength(1000)]
    });
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

  loadEvaluation(id: string): void {
    this.isLoading = true;
    this.evaluationService.getById(id).subscribe({
      next: (evaluation) => {
        this.evaluationForm.patchValue({
          studentId: evaluation.studentId,
          evaluationDate: new Date(evaluation.evaluationDate),
          weight: evaluation.weight,
          height: evaluation.height,
          observations: evaluation.observations || ''
        });
        this.calculateIMCValue();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading evaluation:', error);
        this.isLoading = false;
      }
    });
  }

  calculateIMCValue(): void {
    const weight = this.evaluationForm.get('weight')?.value;
    const height = this.evaluationForm.get('height')?.value;

    if (weight && height && height > 0) {
      this.calculatedIMC = weight / (height * height);
    } else {
      this.calculatedIMC = 0;
    }
  }

  onSubmit(): void {
    console.log('EvaluationForm onSubmit executado');

    if (this.isSubmitting) {
      console.log('EvaluationForm submit já em andamento, ignorando');
      return;
    }

    this.isFormSubmitted = true;

    if (this.evaluationForm.invalid) {
      this.evaluationForm.markAllAsTouched();
      return;
    }

    const formValue = this.evaluationForm.value;
    const evaluation: Evaluation = {
      ...formValue,
      evaluationDate: this.formatDateForApi(formValue.evaluationDate),
      studioId: this.currentStudioService.getStudioId()
    };

    console.log('Evaluation payload:', evaluation);

    this.isLoading = true;
    this.isSubmitting = true;

    if (this.isEditMode && this.evaluationId) {
      this.evaluationService.update(this.evaluationId, evaluation).subscribe({
        next: () => {
          this.isLoading = false;
          this.isSubmitting = false;
          this.router.navigate(['/evaluations']);
        },
        error: (error) => {
          console.error('Error updating evaluation:', error);
          this.isLoading = false;
          this.isSubmitting = false;
        }
      });
    } else {
      this.evaluationService.create(evaluation).subscribe({
        next: () => {
          this.isLoading = false;
          this.isSubmitting = false;
          this.router.navigate(['/evaluations']);
        },
        error: (error) => {
          console.error('Error creating evaluation:', error);
          this.isLoading = false;
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel(): void {
    // Check if we came from student details
    const studentId = this.route.snapshot.queryParamMap.get('studentId');
    if (studentId) {
      this.router.navigate(['/students', studentId]);
    } else {
      this.router.navigate(['/evaluations']);
    }
  }

  formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Editar Avaliação' : 'Nova Avaliação';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Atualizar' : 'Criar';
  }

  shouldShowError(fieldName: string): boolean {
    const field = this.evaluationForm.get(fieldName);
    return !!(field && field.errors && (field.touched || this.isFormSubmitted));
  }

  getFieldError(fieldName: string): string {
    const field = this.evaluationForm.get(fieldName);
    if (!field || !field.errors || (!field.touched && !this.isFormSubmitted)) {
      return '';
    }

    if (field.errors['required']) {
      return 'Campo obrigatório';
    }
    if (field.errors['min']) {
      return `Valor mínimo: ${field.errors['min'].min}`;
    }
    if (field.errors['max']) {
      return `Valor máximo: ${field.errors['max'].max}`;
    }
    if (field.errors['maxlength']) {
      return `Máximo de ${field.errors['maxlength'].requiredLength} caracteres`;
    }

    return 'Campo inválido';
  }
}
