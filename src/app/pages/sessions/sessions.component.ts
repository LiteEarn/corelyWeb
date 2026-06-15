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
import { SessionService } from '../../features/sessions/session.service';
import { Session } from '../../features/sessions/session.model';
import { InstructorService } from '../../features/instructors/instructor.service';
import { Instructor } from '../../features/instructors/instructor.model';
import {ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-sessions',
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
  templateUrl: './sessions.component.html',
  styleUrl: './sessions.component.scss'
})
export class SessionsComponent implements OnInit {
  displayedColumns: string[] = ['title', 'scheduledDate', 'time', 'instructor', 'maxStudents', 'status', 'actions'];
  sessions: Session[] = [];
  filteredSessions: Session[] = [];
  dataSource = new MatTableDataSource<Session>([]);
  instructors: Instructor[] = [];
  searchValue: string = '';
  statusFilter: string = 'all';
  instructorFilter: string = 'all';

  constructor(
    private sessionService: SessionService,
    private instructorService: InstructorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSessions();
    this.loadInstructors();
  }

  loadSessions(): void {
    this.sessionService.getAll().subscribe({
      next: (data) => {
        console.log('Sessions API Response', data);
        this.sessions = data;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading sessions:', error);
      }
    });
  }

  loadInstructors(): void {
    this.instructorService.getAll({ active: true }).subscribe({
      next: (data) => {
        this.instructors = data;
      },
      error: (error) => {
        console.error('Error loading instructors:', error);
      }
    });
  }

  applyFilters(): void {
    this.filteredSessions = this.sessions.filter(session => {
      const matchesSearch = !this.searchValue ||
        session.title.toLowerCase().includes(this.searchValue.toLowerCase());

      const matchesStatus = this.statusFilter === 'all' ||
        session.status === this.statusFilter;

      const matchesInstructor = this.instructorFilter === 'all' ||
        session.instructorId === this.instructorFilter;

      return matchesSearch && matchesStatus && matchesInstructor;
    });
    this.dataSource.data = this.filteredSessions;
  }

  onSearchChange(value: string): void {
    this.searchValue = value;
    this.applyFilters();
  }

  onStatusFilterChange(value: string): void {
    this.statusFilter = value;
    this.applyFilters();
  }

  onInstructorFilterChange(value: string): void {
    this.instructorFilter = value;
    this.applyFilters();
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'scheduled': 'Agendada',
      'completed': 'Concluída',
      'cancelled': 'Cancelada',
      'in_progress': 'Em Andamento'
    };
    return statusMap[status] || status;
  }

  getInstructorName(instructorId: string): string {
    const instructor = this.instructors.find(i => i.id === instructorId);
    return instructor ? instructor.fullName : 'Não encontrado';
  }

  formatTime(startTime: string, endTime: string): string {
    return `${startTime} - ${endTime}`;
  }

  formatDate(date: string): string {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  }

  navigateToNew(): void {
    this.router.navigate(['/sessions/new']);
  }
}
