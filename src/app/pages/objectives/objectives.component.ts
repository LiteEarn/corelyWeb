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
import { DsPageHeaderComponent, DsStatusChipComponent, DsEmptyStateComponent } from '../../shared/design-system';
import { ObjectiveService } from '../../features/objectives/objective.service';
import { Objective, ObjectiveFilters, ObjectiveStatus } from '../../features/objectives/objective.model';
import { StudentService } from '../../features/students/student.service';
import { Student } from '../../features/students/student.model';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-objectives',
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
    ReactiveFormsModule,
    DsPageHeaderComponent,
    DsStatusChipComponent,
    DsEmptyStateComponent
  ],
  templateUrl: './objectives.component.html',
  styleUrl: './objectives.component.scss'
})
export class ObjectivesComponent implements OnInit {
  displayedColumns: string[] = ['title', 'student', 'status', 'startDate', 'targetDate', 'actions'];
  objectives: Objective[] = [];
  filteredObjectives: Objective[] = [];
  dataSource = new MatTableDataSource<Objective>([]);
  students: Student[] = [];
  searchValue: string = '';
  statusFilter: ObjectiveStatus | 'all' = 'all';
  studentFilter: string = 'all';

  constructor(
    private objectiveService: ObjectiveService,
    private studentService: StudentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadObjectives();
    this.loadStudents();
  }

  loadObjectives(): void {
    this.objectiveService.getAll().subscribe({
      next: (data) => {
        console.log('Objectives API Response', data);
        this.objectives = data;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading objectives:', error);
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
    this.filteredObjectives = this.objectives.filter(objective => {
      const matchesSearch = !this.searchValue ||
        objective.title.toLowerCase().includes(this.searchValue.toLowerCase()) ||
        (objective.description && objective.description.toLowerCase().includes(this.searchValue.toLowerCase()));

      const matchesStatus = this.statusFilter === 'all' || objective.status === this.statusFilter;

      const matchesStudent = this.studentFilter === 'all' || objective.studentId === this.studentFilter;

      return matchesSearch && matchesStatus && matchesStudent;
    });
    this.dataSource.data = this.filteredObjectives;
  }

  onSearchChange(value: string): void {
    this.searchValue = value;
    this.applyFilters();
  }

  onStatusFilterChange(value: ObjectiveStatus | 'all'): void {
    this.statusFilter = value;
    this.applyFilters();
  }

  onStudentFilterChange(value: string): void {
    this.studentFilter = value;
    this.applyFilters();
  }

  getStatusLabel(status: ObjectiveStatus): string {
    const statusLabels: Record<ObjectiveStatus, string> = {
      ACTIVE: 'Ativo',
      COMPLETED: 'Concluído',
      CANCELLED: 'Cancelado'
    };
    return statusLabels[status] || status;
  }

  getStatusChipStatus(status: ObjectiveStatus): 'active' | 'completed' | 'cancelled' {
    const statusMap: Record<ObjectiveStatus, 'active' | 'completed' | 'cancelled'> = {
      ACTIVE: 'active',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled'
    };
    return statusMap[status] || 'active';
  }

  getStudentName(studentId: string): string {
    const student = this.students.find(s => s.id === studentId);
    return student ? student.fullName : 'N/A';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  navigateToNew(): void {
    this.router.navigate(['/objectives/new']);
  }

  navigateToDetails(id: string): void {
    this.router.navigate(['/objectives', id]);
  }

  navigateToEdit(id: string): void {
    this.router.navigate(['/objectives', id, 'edit']);
  }

  onDelete(id: string): void {
    if (confirm('Tem certeza que deseja excluir este objetivo?')) {
      this.objectiveService.delete(id).subscribe({
        next: () => {
          this.loadObjectives();
        },
        error: (error) => {
          console.error('Error deleting objective:', error);
        }
      });
    }
  }
}
