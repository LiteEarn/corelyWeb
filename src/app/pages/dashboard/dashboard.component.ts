import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
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
import { DashboardOperationalResponse } from './dashboard.model';
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
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dashboard) => {
          this.data = dashboard;
          this.loading = false;
        },
        error: () => {
          this.error = true;
          this.loading = false;
          this.toastService.error('Erro ao carregar o dashboard.');
        },
      });
  }

  get computedAverageOccupancy(): number {
    if (!this.data?.classOccupancy?.length) {
      return this.data?.averageOccupancy ?? 0;
    }
    const total = this.data.classOccupancy.reduce((sum, item) => sum + item.occupancyPercent, 0);
    return Math.round(total / this.data.classOccupancy.length);
  }

  get computedAttendanceRate(): number {
    return this.data?.todayAttendanceRate ?? 0;
  }

  get displayUpcomingSessions() {
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
      full_class: 'group',
      pending_makeup: 'assignment',
      ongoing_class: 'play_circle',
    };
    return map[type] || 'info';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }
}
