import { Component, inject, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatTableDataSource, MatColumnDef } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DsPageHeaderComponent, DsStatusChipComponent } from '../../shared/design-system';
import { ResponsiveCrudComponent, CrudActionsComponent, CrudAction } from '../../shared/components/crud';
import { FeatureGateService } from '../../core/rbac/feature-gate.service';
import { StudentService } from '../../features/students/student.service';
import { Student } from '../../features/students/student.model';
import { ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: 'app-students',
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
    ReactiveFormsModule,
    DsPageHeaderComponent,
    DsStatusChipComponent,
    ResponsiveCrudComponent,
    CrudActionsComponent,
  ],
  templateUrl: './students.component.html',
  styleUrl: './students.component.scss'
})
export class StudentsComponent implements OnInit {
  private studentService = inject(StudentService);
  private router = inject(Router);
  private featureGateService = inject(FeatureGateService);

  displayedColumns: string[] = ['fullName', 'phone', 'email', 'active', 'actions'];
  tabletColumns: string[] = ['fullName', 'active', 'actions'];
  students: Student[] = [];
  filteredStudents: Student[] = [];
  dataSource = new MatTableDataSource<Student>([]);
  searchValue = '';
  statusFilter = 'all';

  readonly crudActions: CrudAction[] = [
    { label: 'Visualizar', icon: 'visibility', action: 'view' },
    { label: 'Editar', icon: 'edit', action: 'edit' },
  ];

  ngOnInit(): void {
    if (this.featureGateService.canLoadStudents()) {
      this.loadStudents();
    }
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
    this.dataSource.data = this.filteredStudents;
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

  onAction(event: { action: string; item: Student }): void {
    switch (event.action) {
      case 'view':
        if (event.item.id) this.router.navigate(['/students', event.item.id]);
        break;
      case 'edit':
        if (event.item.id) this.router.navigate(['/students', event.item.id, 'edit']);
        break;
    }
  }
}
