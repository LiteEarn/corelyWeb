import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';

import { DsPageHeaderComponent, DsEmptyStateComponent } from '../../shared/design-system';
import { DsStatusChipComponent, ChipStatus } from '../../shared/design-system/status-chip/status-chip.component';
import { DsButtonComponent } from '../../shared/design-system/button/button.component';
import { LoadingComponent } from '../../shared/components';
import { MakeupRequestService } from '../../features/makeup-requests/makeup-request.service';
import { MakeupRequest, MakeupRequestStatus } from '../../features/makeup-requests/makeup-request.model';
import { StudentService } from '../../features/students/student.service';
import { InstructorService } from '../../features/instructors/instructor.service';
import { Instructor } from '../../features/instructors/instructor.model';
import { ToastService } from '../../core/services/toast.service';
import { MakeupApprovalApproveDialogComponent } from './makeup-approval-approve-dialog.component';
import { MakeupApprovalRejectDialogComponent } from './makeup-approval-reject-dialog.component';

@Component({
  selector: 'app-makeup-approval',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    DsPageHeaderComponent,
    DsEmptyStateComponent,
    DsStatusChipComponent,
    DsButtonComponent,
    LoadingComponent,
  ],
  templateUrl: './makeup-approval.component.html',
  styleUrl: './makeup-approval.component.scss',
})
export class MakeupApprovalComponent implements OnInit, OnDestroy {
  requests: MakeupRequest[] = [];
  filteredRequests: MakeupRequest[] = [];
  instructors: Instructor[] = [];

  statusFilter: string = '';
  studentFilter: string = '';
  instructorFilter: string = '';
  dateFilter: string = '';
  dateModel: Date | null = null;

  loading = false;
  error: string | null = null;
  actionLoading: Record<string, string> = {};

  private allRequests: MakeupRequest[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private makeupRequestService: MakeupRequestService,
    private studentService: StudentService,
    private instructorService: InstructorService,
    private toastService: ToastService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadInstructors();
    this.loadRequests();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRequests(): void {
    this.loading = true;
    this.error = null;

    const filters: Record<string, string> = {};
    if (this.statusFilter) filters['status'] = this.statusFilter;
    if (this.studentFilter) filters['studentId'] = this.studentFilter;
    if (this.instructorFilter) filters['instructorId'] = this.instructorFilter;
    if (this.dateFilter) filters['absenceDate'] = this.dateFilter;

    this.makeupRequestService.getAll(filters).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.allRequests = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Erro ao carregar solicitações de reposição.';
        this.toastService.error('Erro ao carregar solicitações.');
      },
    });
  }

  private loadInstructors(): void {
    this.instructorService.getAll({ active: true }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.instructors = data;
      },
    });
  }

  onFilterChange(): void {
    this.loadRequests();
  }

  clearFilters(): void {
    this.statusFilter = '';
    this.studentFilter = '';
    this.instructorFilter = '';
    this.dateFilter = '';
    this.dateModel = null;
    this.loadRequests();
  }

  onDateChange(date: Date | null): void {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      this.dateFilter = `${year}-${month}-${day}`;
    } else {
      this.dateFilter = '';
    }
    this.onFilterChange();
  }

  private applyFilters(): void {
    this.filteredRequests = this.allRequests.filter((r) => {
      if (this.statusFilter && r.status !== this.statusFilter) return false;
      return true;
    });
  }

  getStatusChip(status: MakeupRequestStatus): { status: ChipStatus; label: string } {
    const map: Record<MakeupRequestStatus, { status: ChipStatus; label: string }> = {
      REQUESTED: { status: 'pending', label: 'Solicitada' },
      APPROVED: { status: 'success', label: 'Aprovada' },
      REJECTED: { status: 'cancelled', label: 'Rejeitada' },
      USED: { status: 'completed', label: 'Utilizada' },
      EXPIRED: { status: 'inactive', label: 'Expirada' },
    };
    return map[status] || { status: 'pending', label: status };
  }

  hasActiveFilters(): boolean {
    return !!(this.statusFilter || this.studentFilter || this.instructorFilter || this.dateFilter);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  openApproveDialog(request: MakeupRequest): void {
    const dialogRef = this.dialog.open(MakeupApprovalApproveDialogComponent, {
      width: '480px',
      data: { makeupRequestId: request.id },
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (!result || !result.sessionId) return;

      const requestId = request.id!;
      this.actionLoading[requestId] = 'approve';

      this.makeupRequestService.approve(requestId, { sessionId: result.sessionId }).pipe(
        takeUntil(this.destroy$),
      ).subscribe({
        next: (updated) => {
          Object.assign(request, updated);
          this.actionLoading[requestId] = '';
          this.toastService.success('Reposição aprovada.');
        },
        error: () => {
          this.actionLoading[requestId] = '';
          this.toastService.error('Não foi possível aprovar a reposição.');
        },
      });
    });
  }

  openRejectDialog(request: MakeupRequest): void {
    const dialogRef = this.dialog.open(MakeupApprovalRejectDialogComponent, {
      width: '480px',
      data: { makeupRequestId: request.id },
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (!result) return;

      const requestId = request.id!;
      this.actionLoading[requestId] = 'reject';

      const body: { reason?: string } = {};
      if (result.reason) body.reason = result.reason;

      this.makeupRequestService.reject(requestId, body).pipe(
        takeUntil(this.destroy$),
      ).subscribe({
        next: (updated) => {
          Object.assign(request, updated);
          this.actionLoading[requestId] = '';
          this.toastService.success('Reposição rejeitada.');
        },
        error: () => {
          this.actionLoading[requestId] = '';
          this.toastService.error('Não foi possível rejeitar a reposição.');
        },
      });
    });
  }

  isActionLoading(requestId: string | undefined, action: string): boolean {
    return this.actionLoading[requestId || ''] === action;
  }
}
