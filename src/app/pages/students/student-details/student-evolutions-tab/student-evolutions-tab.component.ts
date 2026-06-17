import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DsPageHeaderComponent, DsEmptyStateComponent } from '../../../../shared/design-system';
import { EvolutionService } from '../../../../features/evolutions/evolution.service';
import { Evolution } from '../../../../features/evolutions/evolution.model';
import { EvolutionDialogComponent } from './evolution-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-student-evolutions-tab',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    MatDialogModule,
    DsPageHeaderComponent,
    DsEmptyStateComponent
  ],
  templateUrl: './student-evolutions-tab.component.html',
  styleUrl: './student-evolutions-tab.component.scss'
})
export class StudentEvolutionsTabComponent implements OnInit {
  @Input() studentId!: string;

  evolutions: Evolution[] = [];
  isLoading: boolean = false;

  constructor(
    private evolutionService: EvolutionService,
    private dialog: MatDialog,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadEvolutions();
  }

  loadEvolutions(): void {
    this.isLoading = true;
    this.evolutionService.getAll({ studentId: this.studentId }).subscribe({
      next: (data) => {
        this.evolutions = data.sort((a, b) =>
          new Date(b.evolutionDate).getTime() - new Date(a.evolutionDate).getTime()
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading evolutions:', error);
        this.isLoading = false;
      }
    });
  }

  onCreate(): void {
    const dialogRef = this.dialog.open(EvolutionDialogComponent, {
      width: '600px',
      data: {
        studentId: this.studentId,
        isEditMode: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEvolutions();
        this.toastService.success('Evolução criada com sucesso');
      }
    });
  }

  onEdit(evolution: Evolution): void {
    const dialogRef = this.dialog.open(EvolutionDialogComponent, {
      width: '600px',
      data: {
        studentId: this.studentId,
        isEditMode: true,
        evolution: evolution
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEvolutions();
        this.toastService.success('Evolução atualizada com sucesso');
      }
    });
  }

  onDelete(evolution: Evolution): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Excluir Evolução',
        message: 'Tem certeza que deseja excluir esta evolução?',
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && evolution.id) {
        this.evolutionService.delete(evolution.id).subscribe({
          next: () => {
            this.loadEvolutions();
            this.toastService.success('Evolução removida com sucesso');
          },
          error: (error) => {
            console.error('Error deleting evolution:', error);
            this.toastService.error('Erro ao excluir evolução');
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
}
