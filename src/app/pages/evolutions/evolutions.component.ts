import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { DsPageHeaderComponent, DsEmptyStateComponent } from '../../shared/design-system';
import { EvolutionService } from '../../features/evolutions/evolution.service';
import { Evolution, EvolutionFilters } from '../../features/evolutions/evolution.model';
import { StudentService } from '../../features/students/student.service';
import { Student } from '../../features/students/student.model';
import { ObjectiveService } from '../../features/objectives/objective.service';
import { Objective } from '../../features/objectives/objective.model';
import { ReactiveFormsModule } from '@angular/forms';
import { PermissionService } from '../../core/rbac/permission.service';
import { Role } from '../../core/rbac/role.enum';

@Component({
  selector: 'app-evolutions',
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
    MatMenuModule,
    ReactiveFormsModule,
    DsPageHeaderComponent,
    DsEmptyStateComponent
  ],
  templateUrl: './evolutions.component.html',
  styleUrl: './evolutions.component.scss'
})
export class EvolutionsComponent implements OnInit {
  evolutions: Evolution[] = [];
  filteredEvolutions: Evolution[] = [];
  students: Student[] = [];
  objectives: Objective[] = [];
  
  studentFilter: string = 'all';
  objectiveFilter: string = 'all';
  startDateFilter: Date | null = null;
  endDateFilter: Date | null = null;
  titleFilter: string = '';
  
  isLoading: boolean = false;

  constructor(
    private evolutionService: EvolutionService,
    private studentService: StudentService,
    private objectiveService: ObjectiveService,
    private permissionService: PermissionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEvolutions();
    if (!this.permissionService.hasRole(Role.INSTRUCTOR)) {
      this.loadStudents();
    }
    this.loadObjectives();
  }

  loadEvolutions(): void {
    this.isLoading = true;
    this.evolutionService.getAll().subscribe({
      next: (data) => {
        console.log('Evolutions API Response', data);
        this.evolutions = data.sort((a, b) => 
          new Date(b.evolutionDate).getTime() - new Date(a.evolutionDate).getTime()
        );
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading evolutions:', error);
        this.isLoading = false;
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

  loadObjectives(): void {
    this.objectiveService.getAll().subscribe({
      next: (data) => {
        this.objectives = data;
      },
      error: (error) => {
        console.error('Error loading objectives:', error);
      }
    });
  }

  applyFilters(): void {
    this.filteredEvolutions = this.evolutions.filter(evolution => {
      const matchesStudent = this.studentFilter === 'all' || evolution.studentId === this.studentFilter;
      const matchesObjective = this.objectiveFilter === 'all' || evolution.objectiveId === this.objectiveFilter;
      
      let matchesStartDate = true;
      if (this.startDateFilter) {
        const evolutionDate = new Date(evolution.evolutionDate);
        matchesStartDate = evolutionDate >= this.startDateFilter;
      }

      let matchesEndDate = true;
      if (this.endDateFilter) {
        const evolutionDate = new Date(evolution.evolutionDate);
        matchesEndDate = evolutionDate <= this.endDateFilter;
      }

      let matchesTitle = true;
      if (this.titleFilter) {
        matchesTitle = evolution.title.toLowerCase().includes(this.titleFilter.toLowerCase());
      }

      return matchesStudent && matchesObjective && matchesStartDate && matchesEndDate && matchesTitle;
    });
  }

  onStudentFilterChange(value: string): void {
    this.studentFilter = value;
    this.applyFilters();
  }

  onObjectiveFilterChange(value: string): void {
    this.objectiveFilter = value;
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

  onTitleFilterChange(value: string): void {
    this.titleFilter = value;
    this.applyFilters();
  }

  getStudentName(studentId: string): string {
    const student = this.students.find(s => s.id === studentId);
    return student ? student.fullName : studentId || 'N/A';
  }

  getObjectiveTitle(objectiveId: string): string {
    const objective = this.objectives.find(o => o.id === objectiveId);
    return objective ? objective.title : '-';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  navigateToNew(): void {
    this.router.navigate(['/evolutions/new']);
  }

  navigateToEdit(id: string): void {
    this.router.navigate(['/evolutions', id, 'edit']);
  }

  onDelete(id: string): void {
    if (confirm('Tem certeza que deseja excluir esta evolução?')) {
      this.evolutionService.delete(id).subscribe({
        next: () => {
          this.loadEvolutions();
        },
        error: (error) => {
          console.error('Error deleting evolution:', error);
        }
      });
    }
  }
}
