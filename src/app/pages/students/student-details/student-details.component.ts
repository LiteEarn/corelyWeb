import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { DsPageHeaderComponent, DsPageCardComponent, DsStatusChipComponent, DsEmptyStateComponent } from '../../../shared/design-system';
import { StudentService } from '../../../features/students/student.service';
import { Student } from '../../../features/students/student.model';
import { StudentObjectivesTabComponent } from './student-objectives-tab/student-objectives-tab.component';
import { StudentEvaluationsTabComponent } from './student-evaluations-tab/student-evaluations-tab.component';

@Component({
  selector: 'app-student-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    DsPageHeaderComponent,
    DsPageCardComponent,
    DsStatusChipComponent,
    DsEmptyStateComponent,
    StudentObjectivesTabComponent,
    StudentEvaluationsTabComponent
  ],
  templateUrl: './student-details.component.html',
  styleUrl: './student-details.component.scss'
})
export class StudentDetailsComponent implements OnInit {
  student: Student | null = null;
  isLoading: boolean = true;
  selectedTab: number = 0;

  constructor(
    private studentService: StudentService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadStudent(id);
    }
  }

  loadStudent(id: string): void {
    this.studentService.getById(id).subscribe({
      next: (data) => {
        this.student = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading student:', error);
        this.isLoading = false;
      }
    });
  }

  onEdit(): void {
    if (this.student?.id) {
      this.router.navigate(['/students', this.student.id, 'edit']);
    }
  }

  onBack(): void {
    this.router.navigate(['/students']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  getActiveStatus(active: boolean): string {
    return active ? 'Ativo' : 'Inativo';
  }
}
