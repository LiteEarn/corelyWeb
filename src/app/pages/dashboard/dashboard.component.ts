import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, finalize } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
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
import { FeatureGateService } from '../../core/rbac/feature-gate.service';
import { ResponsiveService, LayoutMode } from '../../shared/layout';
import {
  DashboardKpiCarouselComponent,
  DashboardTimelineComponent,
  DashboardOccupancyCardComponent,
  DashboardAlertCardComponent,
  QuickActionsComponent,
  DashboardSkeletonComponent,
} from './components';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressBarModule,
    StatCardComponent,
    DsPageHeaderComponent,
    DsPageCardComponent,
    DsEmptyStateComponent,
    DsStatusChipComponent,
    DsButtonComponent,
    DashboardKpiCarouselComponent,
    DashboardTimelineComponent,
    DashboardOccupancyCardComponent,
    DashboardAlertCardComponent,
    QuickActionsComponent,
    DashboardSkeletonComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  data: DashboardOperationalResponse | null = null;
  loading = true;
  error = false;

  responsive = inject(ResponsiveService);
  readonly LayoutMode = LayoutMode;

  private destroy$ = new Subject<void>();

  constructor(
    private dashboardService: DashboardService,
    private toastService: ToastService,
    private featureGateService: FeatureGateService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (this.featureGateService.canViewDashboard()) {
      this.loadDashboard();
    } else {
      this.loading = false;
      this.data = null;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboard(): void {
    if (!this.featureGateService.canViewDashboard()) {
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

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

  get kpiItems() {
    if (!this.data) return [];
    const k = this.data.summary.kpis;
    return [
      { label: 'Aulas Hoje', value: k.classesToday, icon: 'today', color: 'primary' as const },
      { label: 'Em Andamento', value: k.classesInProgress, icon: 'play_circle', color: 'accent' as const },
      { label: 'Alunos Ativos', value: k.activeStudents, icon: 'people', color: 'primary' as const },
      { label: 'Presentes Hoje', value: k.studentsPresentToday, icon: 'person', color: 'primary' as const },
      { label: 'Reposições Pendentes', value: k.pendingMakeups, icon: 'refresh', color: 'warn' as const },
      { label: 'Ocupação Média', value: `${k.averageOccupancy}%`, icon: 'bar_chart', color: 'primary' as const },
      { label: 'Frequência Hoje', value: `${k.todayAttendanceRate}%`, icon: 'fact_check', color: 'accent' as const },
    ];
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

  get displayAlerts() {
    return this.data?.alerts?.slice(0, 5) ?? [];
  }

  get computedAverageOccupancy(): number {
    return this.data?.summary?.kpis?.averageOccupancy ?? 0;
  }

  get computedAttendanceRate(): number {
    return this.data?.summary?.kpis?.todayAttendanceRate ?? 0;
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

  handleQuickAction(action: string): void {
    const routes: Record<string, string> = {
      attendance: '/attendance',
      enrollment: '/enrollments/new',
      student: '/students/new',
      agenda: '/daily-agenda',
    };
    this.router.navigate([routes[action] || '/dashboard']);
  }

  openSession(sessionId: string): void {
    this.router.navigate(['/sessions', sessionId]);
  }

  resolveAlert(alert: DashboardAlert): void {
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

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  formatTime(time: string): string {
    return (time || '').substring(0, 5);
  }
}
