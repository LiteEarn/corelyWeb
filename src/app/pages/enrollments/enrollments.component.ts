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
import { EnrollmentService } from '../../features/enrollments/enrollment.service';
import { Enrollment } from '../../features/enrollments/enrollment.model';
import { StudentService } from '../../features/students/student.service';
import { Student } from '../../features/students/student.model';
import { ClassGroupService } from '../../features/class-groups/class-group.service';
import { ClassGroup } from '../../features/class-groups/class-group.model';
import { ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: 'app-enrollments',
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
  templateUrl: './enrollments.component.html',
  styleUrl: './enrollments.component.scss'
})
export class EnrollmentsComponent implements OnInit {
  displayedColumns: string[] = ['studentName', 'classGroupName', 'enrollmentDate', 'status', 'actions'];
  enrollments: Enrollment[] = [];
  filteredEnrollments: Enrollment[] = [];
  dataSource = new MatTableDataSource<Enrollment>([]);
  students: Student[] = [];
  classGroups: ClassGroup[] = [];
  studentFilter: string = 'all';
  classGroupFilter: string = 'all';
  statusFilter: string = 'all';

  constructor(
    private enrollmentService: EnrollmentService,
    private studentService: StudentService,
    private classGroupService: ClassGroupService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadEnrollments();
    this.loadStudents();
    this.loadClassGroups();
  }

  loadEnrollments(): void {
    this.enrollmentService.getAll().subscribe({
      next: (data) => {
        console.log('Enrollments API Response', data);
        this.enrollments = data;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading enrollments:', error);
      }
    });
  }

  loadStudents(): void {
    this.studentService.getAll({ active: true }).subscribe({
      next: (data) => {
        this.students = data;
      },
      error: (error) => {
        console.error('Error loading students:', error);
      }
    });
  }

  loadClassGroups(): void {
    this.classGroupService.getAll({ active: true }).subscribe({
      next: (data) => {
        this.classGroups = data;
      },
      error: (error) => {
        console.error('Error loading class groups:', error);
      }
    });
  }

  applyFilters(): void {
    this.filteredEnrollments = this.enrollments.filter(enrollment => {
      const matchesStudent = this.studentFilter === 'all' ||
        enrollment.studentId === this.studentFilter;

      const matchesClassGroup = this.classGroupFilter === 'all' ||
        enrollment.classGroupId === this.classGroupFilter;

      const matchesStatus = this.statusFilter === 'all' ||
        enrollment.status === this.statusFilter;

      return matchesStudent && matchesClassGroup && matchesStatus;
    });
    this.dataSource.data = this.filteredEnrollments;
  }

  onStudentFilterChange(value: string): void {
    this.studentFilter = value;
    this.applyFilters();
  }

  onClassGroupFilterChange(value: string): void {
    this.classGroupFilter = value;
    this.applyFilters();
  }

  onStatusFilterChange(value: string): void {
    this.statusFilter = value;
    this.applyFilters();
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'Ativa',
      'inactive': 'Inativa',
      'cancelled': 'Cancelada',
      'completed': 'Concluída'
    };
    return statusMap[status] || status;
  }

  formatDate(date: string): string {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  }

  navigateToNew(): void {
    this.router.navigate(['/enrollments/new']);
  }
}
