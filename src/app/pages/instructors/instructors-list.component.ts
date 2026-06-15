import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
<<<<<<< HEAD
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
=======
import { MatTableModule } from '@angular/material/table';
>>>>>>> 8d033bff9dd050d48bab71765c257d850e300cf8
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
<<<<<<< HEAD
import { DsPageHeaderComponent, DsStatusChipComponent, DsEmptyStateComponent } from '../../shared/design-system';
=======
import { DsPageHeaderComponent, DsStatusChipComponent, DsEmptyStateComponent, DsPageTableComponent } from '../../shared/design-system';
>>>>>>> 8d033bff9dd050d48bab71765c257d850e300cf8
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
<<<<<<< HEAD
    DsEmptyStateComponent
=======
    DsEmptyStateComponent,
    DsPageTableComponent
>>>>>>> 8d033bff9dd050d48bab71765c257d850e300cf8
  ],
  templateUrl: './instructors-list.component.html',
  styleUrl: './instructors-list.component.scss'
})
export class InstructorsListComponent implements OnInit {
  displayedColumns: string[] = ['fullName', 'specialty', 'phone', 'active', 'actions'];
  instructors: Instructor[] = [];
  filteredInstructors: Instructor[] = [];
<<<<<<< HEAD
  dataSource = new MatTableDataSource<Instructor>([]);
=======
>>>>>>> 8d033bff9dd050d48bab71765c257d850e300cf8
  searchValue: string = '';
  statusFilter: string = 'all';

  constructor(private instructorService: InstructorService, private router: Router) {}

  ngOnInit(): void {
    this.loadInstructors();
  }

  loadInstructors(): void {
    this.instructorService.getAll().subscribe({
      next: (data) => {
<<<<<<< HEAD
        console.log('Instructors API Response', data);
=======
>>>>>>> 8d033bff9dd050d48bab71765c257d850e300cf8
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
<<<<<<< HEAD
    this.dataSource.data = this.filteredInstructors;
=======
>>>>>>> 8d033bff9dd050d48bab71765c257d850e300cf8
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
