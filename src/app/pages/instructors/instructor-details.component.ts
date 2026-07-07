import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { Instructor } from '../../features/instructors/instructor.model';
import { InstructorService } from '../../features/instructors/instructor.service';
import { FeatureGateService } from '../../core/rbac/feature-gate.service';

@Component({
  selector: 'app-instructor-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    PageHeaderComponent
  ],
  templateUrl: './instructor-details.component.html',
  styleUrl: './instructor-details.component.scss'
})
export class InstructorDetailsComponent implements OnInit {
  instructor: Instructor | null = null;
  instructorId: string | null = null;
  loading = false;

  constructor(
    private instructorService: InstructorService,
    private featureGateService: FeatureGateService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.instructorId = this.route.snapshot.paramMap.get('id');
    if (this.instructorId) {
      if (this.featureGateService.canLoadInstructors()) {
        this.loadInstructor(this.instructorId);
      }
    } else {
      this.router.navigate(['/instructors']);
    }
  }

  loadInstructor(id: string): void {
    this.loading = true;
    this.instructorService.getById(id).subscribe({
      next: (instructor) => {
        this.instructor = instructor;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading instructor:', error);
        this.loading = false;
        this.router.navigate(['/instructors']);
      }
    });
  }

  onEdit(): void {
    if (this.instructorId) {
      this.router.navigate(['/instructors', this.instructorId, 'edit']);
    }
  }

  onDelete(): void {
    if (!this.featureGateService.canManageInstructors()) return;
    if (this.instructor && confirm(`Tem certeza que deseja excluir o instrutor ${this.instructor.fullName}?`)) {
      this.instructorService.delete(this.instructor.id!).subscribe({
        next: () => {
          this.router.navigate(['/instructors']);
        },
        error: (error) => {
          console.error('Error deleting instructor:', error);
        }
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/instructors']);
  }

  get pageTitle(): string {
    return this.instructor?.fullName || 'Detalhes do Instrutor';
  }

  get pageSubtitle(): string {
    return 'Informações detalhadas do instrutor';
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  }
}
