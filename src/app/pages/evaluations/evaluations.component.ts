import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DsPageHeaderComponent, DsStatusChipComponent, DsEmptyStateComponent } from '../../shared/design-system';
import { EvaluationService } from '../../features/evaluations/evaluation.service';
import { Evaluation, EvaluationFilters } from '../../features/evaluations/evaluation.model';
import { StudentService } from '../../features/students/student.service';
import { Student } from '../../features/students/student.model';
import { ReactiveFormsModule } from '@angular/forms';
import { PermissionService } from '../../core/rbac/permission.service';
import { Role } from '../../core/rbac/role.enum';

@Component({
  selector: 'app-evaluations',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    DsPageHeaderComponent,
    DsStatusChipComponent,
    DsEmptyStateComponent
  ],
  templateUrl: './evaluations.component.html',
  styleUrl: './evaluations.component.scss'
})
export class EvaluationsComponent implements OnInit {
  displayedColumns: string[] = ['student', 'evaluationDate', 'weight', 'height', 'imc', 'actions'];
  evaluations: Evaluation[] = [];
  filteredEvaluations: Evaluation[] = [];
  dataSource = new MatTableDataSource<Evaluation>([]);
  students: Student[] = [];
  studentFilter: string = 'all';
  startDateFilter: Date | null = null;
  endDateFilter: Date | null = null;

  constructor(
    private evaluationService: EvaluationService,
    private studentService: StudentService,
    private permissionService: PermissionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEvaluations();
    if (!this.permissionService.hasRole(Role.INSTRUCTOR)) {
      this.loadStudents();
    }
  }

  loadEvaluations(): void {
    this.evaluationService.getAll().subscribe({
      next: (data) => {
        console.log('Evaluations API Response', data);
        this.evaluations = data;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading evaluations:', error);
      }
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

  applyFilters(): void {
    this.filteredEvaluations = this.evaluations.filter(evaluation => {
      const matchesStudent = this.studentFilter === 'all' || evaluation.studentId === this.studentFilter;

      let matchesStartDate = true;
      if (this.startDateFilter) {
        const evaluationDate = new Date(evaluation.evaluationDate);
        matchesStartDate = evaluationDate >= this.startDateFilter;
      }

      let matchesEndDate = true;
      if (this.endDateFilter) {
        const evaluationDate = new Date(evaluation.evaluationDate);
        matchesEndDate = evaluationDate <= this.endDateFilter;
      }

      return matchesStudent && matchesStartDate && matchesEndDate;
    });
    this.dataSource.data = this.filteredEvaluations;
  }

  onStudentFilterChange(value: string): void {
    this.studentFilter = value;
    this.applyFilters();
  }

  onStartDateChange(value: Date | null): void {
    this.startDateFilter = value;
    this.applyFilters();
  }

  onEndDateChange(value: Date | null): void {
    this.endDateFilter = value;
    this.applyFilters();
  }

  getStudentName(studentId: string): string {
    const student = this.students.find(s => s.id === studentId);
    return student ? student.fullName : studentId || 'N/A';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  calculateIMC(weight: number, height: number): number {
    if (!weight || !height || height === 0) return 0;
    return weight / (height * height);
  }

  navigateToNew(): void {
    this.router.navigate(['/evaluations/new']);
  }

  navigateToEdit(id: string): void {
    this.router.navigate(['/evaluations', id, 'edit']);
  }

  onDelete(id: string): void {
    if (confirm('Tem certeza que deseja excluir esta avaliação?')) {
      this.evaluationService.delete(id).subscribe({
        next: () => {
          this.loadEvaluations();
        },
        error: (error) => {
          console.error('Error deleting evaluation:', error);
        }
      });
    }
  }
}
