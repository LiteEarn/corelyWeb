import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DsPageHeaderComponent, DsStatusChipComponent } from '../../shared/design-system';
import { ResponsiveCrudComponent, CrudActionsComponent, CrudAction } from '../../shared/components/crud';
import { EvaluationService } from '../../features/evaluations/evaluation.service';
import { Evaluation } from '../../features/evaluations/evaluation.model';
import { StudentService } from '../../features/students/student.service';
import { Student } from '../../features/students/student.model';
import { ReactiveFormsModule } from '@angular/forms';
import { FeatureGateService } from '../../core/rbac/feature-gate.service';

@Component({
  selector: 'app-evaluations',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
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
    ResponsiveCrudComponent,
    CrudActionsComponent,
  ],
  templateUrl: './evaluations.component.html',
  styleUrl: './evaluations.component.scss'
})
export class EvaluationsComponent implements OnInit {
  private evaluationService = inject(EvaluationService);
  private studentService = inject(StudentService);
  private router = inject(Router);
  private featureGateService = inject(FeatureGateService);

  displayedColumns: string[] = ['student', 'evaluationDate', 'weight', 'height', 'imc', 'actions'];
  evaluations: Evaluation[] = [];
  filteredEvaluations: Evaluation[] = [];
  dataSource = new MatTableDataSource<Evaluation>([]);
  students: Student[] = [];
  studentFilter = 'all';
  startDateFilter: Date | null = null;
  endDateFilter: Date | null = null;

  readonly crudActions: CrudAction[] = [
    { label: 'Editar', icon: 'edit', action: 'edit' },
    { label: 'Excluir', icon: 'delete', action: 'delete' },
  ];

  ngOnInit(): void {
    if (this.featureGateService.canLoadEvaluations()) {
      this.loadEvaluations();
    }
    if (this.featureGateService.canLoadStudentDropdown()) {
      this.loadStudents();
    }
  }

  loadEvaluations(): void {
    this.evaluationService.getAll().subscribe({
      next: (data) => {
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

  onAction(event: { action: string; item: Evaluation }): void {
    switch (event.action) {
      case 'edit':
        if (event.item.id) this.router.navigate(['/evaluations', event.item.id, 'edit']);
        break;
      case 'delete':
        if (event.item.id) this.onDelete(event.item.id);
        break;
    }
  }

  onDelete(id: string): void {
    if (!this.featureGateService.canManageEvaluations()) return;
    if (confirm('Tem certeza que deseja excluir esta avaliação?')) {
      this.evaluationService.delete(id).subscribe({
        next: () => { this.loadEvaluations(); },
        error: (error) => { console.error('Error deleting evaluation:', error); }
      });
    }
  }
}
