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
import { SessionService } from '../../features/sessions/session.service';
import { Session } from '../../features/sessions/session.model';
import { InstructorService } from '../../features/instructors/instructor.service';
import { Instructor } from '../../features/instructors/instructor.model';
import { CustomValidators } from '../../shared/utils';
import { CurrentStudioService } from '../../core/services/current-studio.service';

@Component({
  selector: 'app-session-form',
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
  templateUrl: './session-form.component.html',
  styleUrl: './session-form.component.scss'
})
export class SessionFormComponent implements OnInit {
  sessionForm: FormGroup;
  isEditMode: boolean = false;
  sessionId: string | null = null;
  isLoading: boolean = false;
  isFormSubmitted: boolean = false;
  instructors: Instructor[] = [];

  constructor(
    private fb: FormBuilder,
    private sessionService: SessionService,
    private instructorService: InstructorService,
    private route: ActivatedRoute,
    private router: Router,
    private currentStudioService: CurrentStudioService
  ) {
    this.sessionForm = this.createForm();
  }

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.sessionId;
    this.loadInstructors();

    if (this.isEditMode && this.sessionId) {
      this.loadSession(this.sessionId);
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', [CustomValidators.required('Título'), Validators.minLength(3)]],
      instructorId: ['', [CustomValidators.required('Instrutor')]],
      scheduledDate: ['', [CustomValidators.required('Data')]],
      startTime: ['', [CustomValidators.required('Hora início')]],
      endTime: ['', [CustomValidators.required('Hora fim')]],
      maxStudents: ['', [CustomValidators.required('Máximo de alunos'), Validators.min(1)]],
      status: ['scheduled']
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

  loadSession(id: string): void {
    this.isLoading = true;
    this.sessionService.getById(id).subscribe({
      next: (session) => {
        this.sessionForm.patchValue({
          title: session.title,
          instructorId: session.instructorId,
          scheduledDate: session.scheduledDate,
          startTime: session.startTime,
          endTime: session.endTime,
          maxStudents: session.maxStudents,
          status: session.status
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading session:', error);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    this.isFormSubmitted = true;

    if (this.sessionForm.invalid) {
      this.sessionForm.markAllAsTouched();
      return;
    }

    const formValue = this.sessionForm.value;
    const session: Session = {
      ...formValue,
      scheduledDate: formValue.scheduledDate ? this.formatDateForApi(formValue.scheduledDate) : '',
      // Implementação temporária para MVP. Futuramente o Studio será obtido do usuário autenticado.
      studioId: this.currentStudioService.getStudioId()
    };

    this.isLoading = true;

    if (this.isEditMode && this.sessionId) {
      this.sessionService.update(this.sessionId, session).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/sessions']);
        },
        error: (error) => {
          console.error('Error updating session:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.sessionService.create(session).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/sessions']);
        },
        error: (error) => {
          console.error('Error creating session:', error);
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/sessions']);
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Editar Aula' : 'Nova Aula';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Atualizar' : 'Criar';
  }

  // Método para verificar se deve mostrar erro
  shouldShowError(fieldName: string): boolean {
    const field = this.sessionForm.get(fieldName);
    return !!(field && field.errors && (field.touched || this.isFormSubmitted));
  }

  // Método para obter mensagem de erro
  getFieldError(fieldName: string): string {
    const field = this.sessionForm.get(fieldName);
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

  formatDateForApi(date: Date): string {
    // Use local timezone methods to avoid UTC conversion
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
