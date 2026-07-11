import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { DsStatusChipComponent, DsEmptyStateComponent } from '../../../../shared/design-system';
import { PlanService } from '../../../../features/plans/plan.service';
import { Plan, PlanEnrollment, PlanEnrollmentStatus, PlanEnrollmentStatusLabels } from '../../../../features/plans/plan.model';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CurrentStudioService } from '../../../../core/services/current-studio.service';
import { EnrollPlanDialogComponent } from './enroll-plan-dialog.component';

@Component({
  selector: 'app-student-plan-tab',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule,
    DsStatusChipComponent, DsEmptyStateComponent
  ],
  templateUrl: './student-plan-tab.component.html',
  styleUrl: './student-plan-tab.component.scss'
})
export class StudentPlanTabComponent implements OnInit {
  @Input() studentId!: string;

  enrollments: PlanEnrollment[] = [];
  dataSource = new MatTableDataSource<PlanEnrollment>([]);
  activeEnrollment: PlanEnrollment | null = null;
  isLoading = false;

  displayedColumns: string[] = ['planName', 'startDate', 'endDate', 'status'];

  constructor(
    private planService: PlanService,
    private dialog: MatDialog,
    private toastService: ToastService,
    private currentStudioService: CurrentStudioService
  ) {}

  ngOnInit(): void {
    this.loadEnrollments();
  }

  loadEnrollments(): void {
    this.isLoading = true;
    this.planService.getStudentEnrollments(this.studentId).subscribe({
      next: (data) => {
        this.enrollments = data;
        this.dataSource.data = data;
        this.activeEnrollment = data.find(e => e.status === PlanEnrollmentStatus.ACTIVE) || null;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onEnroll(): void {
    const dialogRef = this.dialog.open(EnrollPlanDialogComponent, {
      width: '520px',
      disableClose: true,
      data: { studentId: this.studentId }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.planService.createEnrollment({
          studioId: this.currentStudioService.getStudioId(),
          studentId: this.studentId,
          planId: result.planId,
          startDate: result.startDate,
          status: PlanEnrollmentStatus.ACTIVE
        }).subscribe({
          next: () => {
            this.loadEnrollments();
            this.toastService.success('Matrícula realizada com sucesso');
          },
          error: (err) => this.toastService.error(err.error?.message || 'Erro ao realizar matrícula')
        });
      }
    });
  }

  onCancelEnrollment(): void {
    if (!this.activeEnrollment?.id) return;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Cancelar Matrícula', message: 'Tem certeza que deseja cancelar esta matrícula?', confirmText: 'Cancelar', cancelText: 'Fechar' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.planService.cancelEnrollment(this.activeEnrollment!.id!).subscribe({
          next: () => { this.loadEnrollments(); this.toastService.success('Matrícula cancelada com sucesso'); },
          error: (err) => this.toastService.error(err.error?.message || 'Erro ao cancelar matrícula')
        });
      }
    });
  }

  getStatusLabel(status: PlanEnrollmentStatus): string {
    return PlanEnrollmentStatusLabels[status] || status;
  }

  getStatusChipStatus(status: PlanEnrollmentStatus): 'active' | 'inactive' | 'completed' {
    switch (status) {
      case PlanEnrollmentStatus.ACTIVE: return 'active';
      case PlanEnrollmentStatus.CANCELLED: return 'inactive';
      case PlanEnrollmentStatus.COMPLETED: return 'completed';
    }
  }

  formatCurrency(value: number | undefined): string {
    if (!value) return '-';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  }
}
