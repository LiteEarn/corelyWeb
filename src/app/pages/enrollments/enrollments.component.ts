import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { DsPageHeaderComponent, DsStatusChipComponent } from '../../shared/design-system';
import { ResponsiveCrudComponent, CrudActionsComponent, CrudAction } from '../../shared/components/crud';
import { EnrollmentService } from '../../features/enrollments/enrollment.service';
import { Enrollment } from '../../features/enrollments/enrollment.model';
import { StudentService } from '../../features/students/student.service';
import { Student } from '../../features/students/student.model';
import { ClassGroupService } from '../../features/class-groups/class-group.service';
import { ClassGroup } from '../../features/class-groups/class-group.model';
import { ReactiveFormsModule } from "@angular/forms";
import { ToastService } from '../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { FeatureGateService } from '../../core/rbac/feature-gate.service';

@Component({
  selector: 'app-enrollments',
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
    MatDialogModule,
    ReactiveFormsModule,
    DsPageHeaderComponent,
    DsStatusChipComponent,
    ResponsiveCrudComponent,
    CrudActionsComponent,
    LoadingComponent,
    MatTableModule,
  ],
  templateUrl: './enrollments.component.html',
  styleUrl: './enrollments.component.scss'
})
export class EnrollmentsComponent implements OnInit, OnDestroy {
  private enrollmentService = inject(EnrollmentService);
  private studentService = inject(StudentService);
  private classGroupService = inject(ClassGroupService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private toastService = inject(ToastService);
  private featureGateService = inject(FeatureGateService);

  displayedColumns: string[] = ['studentName', 'classGroupName', 'enrollmentDate', 'status', 'actions'];
  enrollments: Enrollment[] = [];
  filteredEnrollments: Enrollment[] = [];
  dataSource = new MatTableDataSource<Enrollment>([]);
  students: Student[] = [];
  classGroups: ClassGroup[] = [];
  searchValue = '';
  studentFilter = 'all';
  classGroupFilter = 'all';
  statusFilter = 'all';
  isLoading = false;

  private destroy$ = new Subject<void>();

  readonly crudActions: CrudAction[] = [
    { label: 'Visualizar', icon: 'visibility', action: 'view' },
    { label: 'Editar', icon: 'edit', action: 'edit' },
    { label: 'Excluir', icon: 'delete', action: 'delete' },
  ];

  ngOnInit(): void {
    if (this.featureGateService.canLoadEnrollments()) {
      this.loadEnrollments();
    }
    if (this.featureGateService.canLoadStudentDropdown()) {
      this.loadStudents();
    }
    if (this.featureGateService.canLoadClassGroupDropdown()) {
      this.loadClassGroups();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEnrollments(): void {
    this.isLoading = true;
    this.enrollmentService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.enrollments = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.handleHttpError(error, 'Erro ao carregar matrículas');
      }
    });
  }

  loadStudents(): void {
    this.studentService.getAll({ active: true }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => { this.students = data; },
      error: (error: HttpErrorResponse) => { this.handleHttpError(error, 'Erro ao carregar alunos'); }
    });
  }

  loadClassGroups(): void {
    this.classGroupService.getAll({ active: true }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => { this.classGroups = data; },
      error: (error: HttpErrorResponse) => { this.handleHttpError(error, 'Erro ao carregar turmas'); }
    });
  }

  applyFilters(): void {
    this.filteredEnrollments = this.enrollments.filter(enrollment => {
      const matchesSearch = !this.searchValue ||
        (enrollment.studentName && enrollment.studentName.toLowerCase().includes(this.searchValue.toLowerCase())) ||
        (enrollment.classGroupName && enrollment.classGroupName.toLowerCase().includes(this.searchValue.toLowerCase()));

      const matchesStudent = this.studentFilter === 'all' || enrollment.studentId === this.studentFilter;
      const matchesClassGroup = this.classGroupFilter === 'all' || enrollment.classGroupId === this.classGroupFilter;
      const matchesStatus = this.statusFilter === 'all' || enrollment.status === this.statusFilter;

      return matchesSearch && matchesStudent && matchesClassGroup && matchesStatus;
    });
    this.dataSource.data = this.filteredEnrollments;
  }

  onSearchChange(value: string): void {
    this.searchValue = value;
    this.applyFilters();
  }

  onStudentFilterChange(value: string): void { this.studentFilter = value; this.applyFilters(); }
  onClassGroupFilterChange(value: string): void { this.classGroupFilter = value; this.applyFilters(); }
  onStatusFilterChange(value: string): void { this.statusFilter = value; this.applyFilters(); }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'Ativa', 'inactive': 'Inativa', 'cancelled': 'Cancelada', 'completed': 'Concluída'
    };
    return statusMap[status] || status;
  }

  formatDate(date: string): string {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  }

  navigateToNew(): void {
    this.router.navigate(['/enrollments/new']);
  }

  onAction(event: { action: string; item: Enrollment }): void {
    switch (event.action) {
      case 'view':
        if (event.item.id) this.router.navigate(['/enrollments', event.item.id]);
        break;
      case 'edit':
        if (event.item.id) this.router.navigate(['/enrollments', event.item.id, 'edit']);
        break;
      case 'delete':
        this.deleteEnrollment(event.item);
        break;
    }
  }

  deleteEnrollment(enrollment: Enrollment): void {
    if (!enrollment.id) return;
    if (!this.featureGateService.canManageEnrollments()) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Excluir Matrícula',
        message: `Tem certeza que deseja excluir a matrícula de ${enrollment.studentName || 'este aluno'} na turma ${enrollment.classGroupName || 'esta turma'}?`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && enrollment.id) {
        this.enrollmentService.delete(enrollment.id).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.toastService.success('Matrícula excluída com sucesso.');
            this.loadEnrollments();
          },
          error: (error: HttpErrorResponse) => {
            this.handleHttpError(error, 'Erro ao excluir matrícula');
          }
        });
      }
    });
  }

  private handleHttpError(error: HttpErrorResponse, defaultMessage: string): void {
    let message = defaultMessage;
    if (error.status === 400) message = error.error?.message || 'Requisição inválida.';
    else if (error.status === 404) message = error.error?.message || 'Recurso não encontrado.';
    else if (error.status === 409) message = error.error?.message || 'Conflito de dados.';
    else if (error.status === 500) message = error.error?.message || 'Erro interno do servidor.';
    this.toastService.error(message);
  }
}
