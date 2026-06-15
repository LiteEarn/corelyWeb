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
import { InstructorService } from '../../features/instructors/instructor.service';
import { Instructor } from '../../features/instructors/instructor.model';
import {ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-instructors-list',
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
  templateUrl: './instructors-list.component.html',
  styleUrl: './instructors-list.component.scss'
})
export class InstructorsListComponent implements OnInit {
  displayedColumns: string[] = ['fullName', 'specialty', 'phone', 'active', 'actions'];
  instructors: Instructor[] = [];
  filteredInstructors: Instructor[] = [];
  dataSource = new MatTableDataSource<Instructor>([]);
  searchValue: string = '';
  statusFilter: string = 'all';

  constructor(private instructorService: InstructorService, private router: Router) {}

  ngOnInit(): void {
    this.loadInstructors();
  }

  loadInstructors(): void {
    this.instructorService.getAll().subscribe({
      next: (data) => {
        console.log('Instructors API Response', data);
        this.instructors = data;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading instructors:', error);
      }
    });
  }

  applyFilters(): void {
    this.filteredInstructors = this.instructors.filter(instructor => {
      const matchesSearch = !this.searchValue ||
        instructor.fullName.toLowerCase().includes(this.searchValue.toLowerCase()) ||
        instructor.email.toLowerCase().includes(this.searchValue.toLowerCase());

      const matchesStatus = this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && instructor.active) ||
        (this.statusFilter === 'inactive' && !instructor.active);

      return matchesSearch && matchesStatus;
    });
    this.dataSource.data = this.filteredInstructors;
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
    this.router.navigate(['/instructors/new']);
  }
}
