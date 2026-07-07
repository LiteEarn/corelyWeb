import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { DsPageHeaderComponent, DsStatusChipComponent, DsEmptyStateComponent } from '../../../../shared/design-system';
import { EvaluationService } from '../../../../features/evaluations/evaluation.service';
import { Evaluation } from '../../../../features/evaluations/evaluation.model';
import { EvaluationDialogComponent } from './evaluation-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../../core/services/toast.service';
import { PermissionService } from '../../../../core/rbac/permission.service';

@Component({
  selector: 'app-student-evaluations-tab',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    DsPageHeaderComponent,
    DsStatusChipComponent,
    DsEmptyStateComponent
  ],
  templateUrl: './student-evaluations-tab.component.html',
  styleUrl: './student-evaluations-tab.component.scss'
})
export class StudentEvaluationsTabComponent implements OnInit {
  @Input() studentId!: string;

  displayedColumns: string[] = ['evaluationDate', 'weight', 'height', 'imc', 'actions'];
  evaluations: Evaluation[] = [];
  dataSource = new MatTableDataSource<Evaluation>([]);
  isLoading: boolean = false;

  constructor(
    private evaluationService: EvaluationService,
    private dialog: MatDialog,
    private toastService: ToastService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    if (this.permissionService.hasPermission('EVALUATION_READ')) {
      this.loadEvaluations();
    }
  }

  loadEvaluations(): void {
    this.isLoading = true;
    this.evaluationService.getAll({ studentId: this.studentId }).subscribe({
      next: (data) => {
        this.evaluations = data;
        this.dataSource.data = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading evaluations:', error);
        this.isLoading = false;
      }
    });
  }

  onCreate(): void {
    const dialogRef = this.dialog.open(EvaluationDialogComponent, {
      width: '600px',
      data: {
        studentId: this.studentId,
        isEditMode: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEvaluations();
        this.toastService.success('Avaliação criada com sucesso');
      }
    });
  }

  onEdit(evaluation: Evaluation): void {
    const dialogRef = this.dialog.open(EvaluationDialogComponent, {
      width: '600px',
      data: {
        studentId: this.studentId,
        isEditMode: true,
        evaluation: evaluation
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEvaluations();
        this.toastService.success('Avaliação atualizada com sucesso');
      }
    });
  }

  onDelete(evaluation: Evaluation): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Excluir Avaliação',
        message: 'Tem certeza que deseja excluir esta avaliação?',
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && evaluation.id) {
        this.evaluationService.delete(evaluation.id).subscribe({
          next: () => {
            this.loadEvaluations();
            this.toastService.success('Avaliação removida com sucesso');
          },
          error: (error) => {
            console.error('Error deleting evaluation:', error);
            this.toastService.error('Erro ao excluir avaliação');
          }
        });
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  calculateIMC(weight: number, height: number): number {
    if (!weight || !height || height === 0) return 0;
    return weight / (height * height);
  }
}
