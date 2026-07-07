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
import { TextFieldModule } from '@angular/cdk/text-field';
import { DsPageFormComponent, DsPageHeaderComponent, DsPageCardComponent } from '../../../shared/design-system';
import { ResponsiveFormGridComponent, ResponsiveFormSectionComponent } from '../../../shared/components';
import { EvolutionService } from '../../../features/evolutions/evolution.service';
import { Evolution } from '../../../features/evolutions/evolution.model';
import { StudentService } from '../../../features/students/student.service';
import { Student } from '../../../features/students/student.model';
import { ObjectiveService } from '../../../features/objectives/objective.service';
import { Objective } from '../../../features/objectives/objective.model';
import { CurrentStudioService } from '../../../core/services/current-studio.service';
import { PermissionService } from '../../../core/rbac/permission.service';

@Component({
  selector: 'app-evolution-form',
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
    TextFieldModule,
    DsPageFormComponent,
    DsPageHeaderComponent,
    DsPageCardComponent,
    ResponsiveFormGridComponent,
    ResponsiveFormSectionComponent
  ],
  templateUrl: './evolution-form.component.html',
  styleUrl: './evolution-form.component.scss'
})
export class EvolutionFormComponent implements OnInit {
  evolutionForm: FormGroup;
  isEditMode: boolean = false;
  evolutionId: string | null = null;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  isFormSubmitted: boolean = false;
  students: Student[] = [];
  objectives: Objective[] = [];
  descriptionMaxLength: number = 2000;

  constructor(
    private fb: FormBuilder,
    private evolutionService: EvolutionService,
    private studentService: StudentService,
    private objectiveService: ObjectiveService,
    private permissionService: PermissionService,
    private route: ActivatedRoute,
    private router: Router,
    private currentStudioService: CurrentStudioService
  ) {
    this.evolutionForm = this.createForm();
  }

  ngOnInit(): void {
    this.evolutionId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.evolutionId;
    if (this.permissionService.hasPermission('STUDENT_READ')) {
      this.loadStudents();
    }
    this.loadObjectives();

    const studentId = this.route.snapshot.queryParamMap.get('studentId');
    if (studentId) {
      this.evolutionForm.patchValue({ studentId });
    }

    if (this.isEditMode && this.evolutionId) {
      this.loadEvolution(this.evolutionId);
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      studentId: ['', Validators.required],
      objectiveId: [''],
      evaluationId: [''],
      evolutionDate: [new Date(), Validators.required],
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(this.descriptionMaxLength)]]
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

  loadObjectives(): void {
    this.objectiveService.getAll().subscribe({
      next: (data) => {
        this.objectives = data;
      },
      error: (error) => {
        console.error('Error loading objectives:', error);
      }
    });
  }

  loadEvolution(id: string): void {
    this.isLoading = true;
    this.evolutionService.getById(id).subscribe({
      next: (evolution) => {
        this.evolutionForm.patchValue({
          studentId: evolution.studentId,
          objectiveId: evolution.objectiveId || '',
          evaluationId: evolution.evaluationId || '',
          evolutionDate: new Date(evolution.evolutionDate),
          title: evolution.title,
          description: evolution.description
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading evolution:', error);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.isSubmitting) return;

    this.isFormSubmitted = true;

    if (this.evolutionForm.invalid) {
      this.evolutionForm.markAllAsTouched();
      return;
    }

    const formValue = this.evolutionForm.value;
    const evolution: Evolution = {
      ...formValue,
      evolutionDate: this.formatDateForApi(formValue.evolutionDate),
      studioId: this.currentStudioService.getStudioId()
    };

    this.isLoading = true;
    this.isSubmitting = true;

    if (this.isEditMode && this.evolutionId) {
      this.evolutionService.update(this.evolutionId, evolution).subscribe({
        next: () => {
          this.isLoading = false;
          this.isSubmitting = false;
          this.router.navigate(['/evolutions']);
        },
        error: (error) => {
          console.error('Error updating evolution:', error);
          this.isLoading = false;
          this.isSubmitting = false;
        }
      });
    } else {
      this.evolutionService.create(evolution).subscribe({
        next: () => {
          this.isLoading = false;
          this.isSubmitting = false;
          this.router.navigate(['/evolutions']);
        },
        error: (error) => {
          console.error('Error creating evolution:', error);
          this.isLoading = false;
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel(): void {
    const studentId = this.route.snapshot.queryParamMap.get('studentId');
    if (studentId) {
      this.router.navigate(['/students', studentId]);
    } else {
      this.router.navigate(['/evolutions']);
    }
  }

  formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Editar Evolução' : 'Nova Evolução';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Atualizar' : 'Criar';
  }

  shouldShowError(fieldName: string): boolean {
    const field = this.evolutionForm.get(fieldName);
    return !!(field && field.errors && (field.touched || this.isFormSubmitted));
  }

  getFieldError(fieldName: string): string {
    const field = this.evolutionForm.get(fieldName);
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

    return 'Campo inválido';
  }

  getDescriptionRemainingChars(): number {
    const description = this.evolutionForm.get('description')?.value || '';
    return this.descriptionMaxLength - description.length;
  }
}
