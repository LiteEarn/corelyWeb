import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DsPageHeaderComponent, DsStatusChipComponent, DsEmptyStateComponent, DsPageTableComponent } from '../../shared/design-system';
import { StudentService } from '../../features/students/student.service';
import { Student } from '../../features/students/student.model';
import {ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-students',
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
    DsEmptyStateComponent,
    DsPageTableComponent
  ],
  templateUrl: './students.component.html',
  styleUrl: './students.component.scss'
})
export class StudentsComponent implements OnInit {
  displayedColumns: string[] = ['fullName', 'phone', 'email', 'active', 'actions'];
  students: Student[] = [];
  filteredStudents: Student[] = [];
  searchValue: string = '';
  statusFilter: string = 'all';

  constructor(private studentService: StudentService, private router: Router) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.studentService.getAll().subscribe({
      next: (data) => {
        this.students = data;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading students:', error);
      }
    });
  }

  applyFilters(): void {
    this.filteredStudents = this.students.filter(student => {
      const matchesSearch = !this.searchValue ||
        student.fullName.toLowerCase().includes(this.searchValue.toLowerCase()) ||
        student.email.toLowerCase().includes(this.searchValue.toLowerCase());

      const matchesStatus = this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && student.active) ||
        (this.statusFilter === 'inactive' && !student.active);

      return matchesSearch && matchesStatus;
    });
  }

  onSearchChange(value: string): void {
    this.searchValue = value;
    this.applyFilters();
  }

  onStatusFilterChange(value: string): void {
    this.statusFilter = value;
    this.applyFilters();
  }

  getActiveStatus(active: boolean): string {
    return active ? 'Ativo' : 'Inativo';
  }

  navigateToNew(): void {
    this.router.navigate(['/students/new']);
  }
}
