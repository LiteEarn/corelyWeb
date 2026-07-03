import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
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
  imports: [
    CommonModule,
    MatCardModule,
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
          console.log('[Dashboard] API response:', JSON.stringify(dashboard, null, 2));
          console.log('[Dashboard] todayClasses:', dashboard.todayClasses, typeof dashboard.todayClasses);
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

  retry(): void {
    this.loadDashboard();
  }

  navigateToMakeupApproval(): void {
    this.router.navigate(['/makeup-approval']);
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

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }
}
