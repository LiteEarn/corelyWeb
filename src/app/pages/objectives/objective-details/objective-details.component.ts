import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DsPageHeaderComponent, DsPageCardComponent, DsStatusChipComponent } from '../../../shared/design-system';
import { ObjectiveService } from '../../../features/objectives/objective.service';
import { Objective, ObjectiveStatus } from '../../../features/objectives/objective.model';
import { StudentService } from '../../../features/students/student.service';
import { Student } from '../../../features/students/student.model';

@Component({
  selector: 'app-objective-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    DsPageHeaderComponent,
    DsPageCardComponent,
    DsStatusChipComponent
  ],
  templateUrl: './objective-details.component.html',
  styleUrl: './objective-details.component.scss'
})
export class ObjectiveDetailsComponent implements OnInit {
  objective: Objective | null = null;
  student: Student | null = null;
  isLoading: boolean = true;

  constructor(
    private objectiveService: ObjectiveService,
    private studentService: StudentService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadObjective(id);
    }
  }

  loadObjective(id: string): void {
    this.objectiveService.getById(id).subscribe({
      next: (data) => {
        this.objective = data;
        this.loadStudent(data.studentId);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading objective:', error);
        this.isLoading = false;
      }
    });
  }

  loadStudent(studentId: string): void {
    this.studentService.getById(studentId).subscribe({
      next: (data) => {
        this.student = data;
      },
      error: (error) => {
        console.error('Error loading student:', error);
      }
    });
  }

  onEdit(): void {
    if (this.objective?.id) {
      this.router.navigate(['/objectives', this.objective.id, 'edit']);
    }
  }

  onBack(): void {
    this.router.navigate(['/objectives']);
  }

  onDelete(): void {
    if (this.objective?.id && confirm('Tem certeza que deseja excluir este objetivo?')) {
      this.objectiveService.delete(this.objective.id).subscribe({
        next: () => {
          this.router.navigate(['/objectives']);
        },
        error: (error) => {
          console.error('Error deleting objective:', error);
        }
      });
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
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
}
