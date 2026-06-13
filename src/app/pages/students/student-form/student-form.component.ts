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

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private route: ActivatedRoute,
    private router: Router
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
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      birthDate: ['', [Validators.required]],
      active: [true]
    });
  }

  loadStudent(id: string): void {
    this.isLoading = true;
    this.studentService.getById(id).subscribe({
      next: (student) => {
        this.studentForm.patchValue({
          fullName: student.fullName,
          phone: student.phone,
          email: student.email,
          birthDate: new Date(student.birthDate),
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
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    const formValue = this.studentForm.value;
    const student: Student = {
      ...formValue,
      birthDate: formValue.birthDate.toISOString().split('T')[0]
    };

    this.isLoading = true;

    if (this.isEditMode && this.studentId) {
      this.studentService.update(this.studentId, student).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/students']);
        },
        error: (error) => {
          console.error('Error updating student:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.studentService.create(student).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/students']);
        },
        error: (error) => {
          console.error('Error creating student:', error);
          this.isLoading = false;
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
}
