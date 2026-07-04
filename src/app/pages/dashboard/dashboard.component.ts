import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, finalize } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import {
  DsPageHeaderComponent,
  DsPageCardComponent,
  DsEmptyStateComponent,
  DsStatusChipComponent,
  DsButtonComponent,
} from '../../shared/design-system';
import { ChipStatus } from '../../shared/design-system/status-chip/status-chip.component';
import { DashboardService } from './dashboard.service';
import { DashboardOperationalResponse, UpcomingSession, DashboardAlert } from './dashboard.model';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressBarModule,
    StatCardComponent,
    LoadingComponent,
    DsPageHeaderComponent,
    DsPageCardComponent,
    DsEmptyStateComponent,
    DsStatusChipComponent,
    DsButtonComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  data: DashboardOperationalResponse | null = null;
  loading = true;
  error = false;

  private destroy$ = new Subject<void>();

  constructor(
    private dashboardService: DashboardService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = false;

    this.dashboardService
      .getOperationalDashboard()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (dashboard) => {
          this.data = dashboard;
        },
        error: () => {
          this.error = true;
          this.toastService.error('Erro ao carregar o dashboard.');
        },
      });
  }

  get computedAverageOccupancy(): number {
    return this.data?.summary?.averageOccupancy ?? 0;
  }

  get computedAttendanceRate(): number {
    return this.data?.summary?.todayAttendanceRate ?? 0;
  }

  get displayUpcomingSessions(): UpcomingSession[] {
    return this.data?.upcomingSessions?.slice(0, 5) ?? [];
  }

  get displayPendingMakeups() {
    return this.data?.pendingMakeupRequests?.slice(0, 5) ?? [];
  }

  get displayClassOccupancy() {
    return this.data?.classOccupancy?.slice(0, 5) ?? [];
  }

  retry(): void {
    this.loadDashboard();
  }

  navigateToSchedule(): void {
    this.router.navigate(['/schedule']);
  }

  navigateToMakeupApproval(): void {
    this.router.navigate(['/makeup-approval']);
  }

  navigateToMakeups(): void {
    this.router.navigate(['/makeup-approval']);
  }

  navigateToClasses(): void {
    this.router.navigate(['/class-groups']);
  }

  navigateToAlertRoute(alert: DashboardAlert): void {
    if (alert.actionRoute) {
      this.router.navigate([alert.actionRoute]);
    }
  }

  getSessionStatus(status: string): ChipStatus {
    const map: Record<string, ChipStatus> = {
      SCHEDULED: 'completed',
      IN_PROGRESS: 'warning',
      COMPLETED: 'success',
      CANCELLED: 'cancelled',
    };
    return map[status.toUpperCase()] || 'pending';
  }

  getSessionStatusLabel(status: string): string {
    const map: Record<string, string> = {
      SCHEDULED: 'Agendada',
      IN_PROGRESS: 'Em andamento',
      COMPLETED: 'Concluída',
      CANCELLED: 'Cancelada',
    };
    return map[status.toUpperCase()] || status;
  }

  getOccupancyColor(percentage: number): string {
    if (percentage >= 80) return 'warn';
    if (percentage >= 50) return 'accent';
    return 'primary';
  }

  getAlertIcon(type: string): string {
    const map: Record<string, string> = {
      FULL_CLASS: 'group',
      PENDING_MAKEUP: 'assignment',
      ONGOING_CLASS: 'play_circle',
    };
    return map[type.toUpperCase()] || 'info';
  }

  getAlertSeverityClass(severity: string): string {
    const map: Record<string, string> = {
      ERROR: 'alert-error',
      WARNING: 'alert-warning',
      INFO: 'alert-info',
    };
    return map[severity.toUpperCase()] || 'alert-info';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }
}
