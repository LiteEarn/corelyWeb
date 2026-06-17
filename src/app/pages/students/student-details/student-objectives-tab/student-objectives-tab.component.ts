import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { DsPageHeaderComponent, DsStatusChipComponent, DsEmptyStateComponent } from '../../../../shared/design-system';
import { ObjectiveService } from '../../../../features/objectives/objective.service';
import { Objective, ObjectiveStatus } from '../../../../features/objectives/objective.model';
import { ObjectiveDialogComponent } from './objective-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-student-objectives-tab',
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
  templateUrl: './student-objectives-tab.component.html',
  styleUrl: './student-objectives-tab.component.scss'
})
export class StudentObjectivesTabComponent implements OnInit {
  @Input() studentId!: string;

  displayedColumns: string[] = ['title', 'status', 'startDate', 'targetDate', 'actions'];
  objectives: Objective[] = [];
  dataSource = new MatTableDataSource<Objective>([]);
  isLoading: boolean = false;

  constructor(
    private objectiveService: ObjectiveService,
    private dialog: MatDialog,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadObjectives();
  }

  loadObjectives(): void {
    this.isLoading = true;
    this.objectiveService.getAll({ studentId: this.studentId }).subscribe({
      next: (data) => {
        this.objectives = data;
        this.dataSource.data = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading objectives:', error);
        this.isLoading = false;
      }
    });
  }

  onCreate(): void {
    const dialogRef = this.dialog.open(ObjectiveDialogComponent, {
      width: '600px',
      data: {
        studentId: this.studentId,
        isEditMode: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadObjectives();
        this.toastService.success('Objetivo criado com sucesso');
      }
    });
  }

  onEdit(objective: Objective): void {
    const dialogRef = this.dialog.open(ObjectiveDialogComponent, {
      width: '600px',
      data: {
        studentId: this.studentId,
        isEditMode: true,
        objective: objective
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadObjectives();
        this.toastService.success('Objetivo atualizado com sucesso');
      }
    });
  }

  onDelete(objective: Objective): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Excluir Objetivo',
        message: 'Tem certeza que deseja excluir este objetivo?',
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && objective.id) {
        this.objectiveService.delete(objective.id).subscribe({
          next: () => {
            this.loadObjectives();
            this.toastService.success('Objetivo removido com sucesso');
          },
          error: (error) => {
            console.error('Error deleting objective:', error);
            this.toastService.error('Erro ao excluir objetivo');
          }
        });
      }
    });
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

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }
}
