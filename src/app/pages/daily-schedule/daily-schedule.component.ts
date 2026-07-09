import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { API_CONFIG } from '../../core/config/api.config';
import { DsPageHeaderComponent, DsEmptyStateComponent } from '../../shared/design-system';
import { DsStatusChipComponent, ChipStatus } from '../../shared/design-system/status-chip/status-chip.component';
import { DsButtonComponent } from '../../shared/design-system/button/button.component';
import { LoadingComponent } from '../../shared/components';
import { DailyScheduleService } from './daily-schedule.service';
import { DailyScheduleResponse, DailyKpis, DailySessionItem, DailyScheduleFilters } from './daily-schedule.model';
import { InstructorService } from '../../features/instructors/instructor.service';
import { ClassGroupService } from '../../features/class-groups/class-group.service';
import { SessionService } from '../../features/sessions/session.service';
import { ToastService } from '../../core/services/toast.service';
import { CurrentStudioService } from '../../core/services/current-studio.service';
import { Instructor } from '../../features/instructors/instructor.model';
import { ClassGroup } from '../../features/class-groups/class-group.model';

interface FilterState {
  date: Date;
  instructorId: string;
  status: string;
  classGroupId: string;
}

type KpiKey = 'totalToday' | 'inProgress' | 'completed' | 'cancelled';

const KPI_CONFIG: { key: KpiKey; label: string; icon: string; color: string }[] = [
  { key: 'totalToday', label: 'Aulas Hoje', icon: 'calendar_today', color: 'bg-blue-50 text-blue-700' },
  { key: 'inProgress', label: 'Em Andamento', icon: 'play_circle', color: 'bg-amber-50 text-amber-700' },
  { key: 'completed', label: 'Concluídas', icon: 'check_circle', color: 'bg-green-50 text-green-700' },
  { key: 'cancelled', label: 'Canceladas', icon: 'cancel', color: 'bg-red-50 text-red-700' },
];

@Component({
  selector: 'app-daily-schedule',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    DsPageHeaderComponent,
    DsEmptyStateComponent,
    DsStatusChipComponent,
    DsButtonComponent,
    LoadingComponent,
  ],
  templateUrl: './daily-schedule.component.html',
  styleUrl: './daily-schedule.component.scss',
})
export class DailyScheduleComponent implements OnInit, OnDestroy {
  data: DailyScheduleResponse | null = null;
  instructors: Instructor[] = [];
  classGroups: ClassGroup[] = [];

  filters: FilterState = {
    date: new Date(),
    instructorId: 'all',
    status: 'all',
    classGroupId: 'all',
  };

  loading = false;
  error: string | null = null;
  sessionActionLoading: Record<string, 'start' | 'complete' | 'cancel' | null> = {};

  readonly kpis = KPI_CONFIG;
  readonly statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'SCHEDULED', label: 'Agendada' },
    { value: 'IN_PROGRESS', label: 'Em Andamento' },
    { value: 'COMPLETED', label: 'Concluída' },
    { value: 'CANCELLED', label: 'Cancelada' },
  ];

  private http = inject(HttpClient);
  private destroy$ = new Subject<void>();

  constructor(
    private dailyScheduleService: DailyScheduleService,
    private instructorService: InstructorService,
    private classGroupService: ClassGroupService,
    private sessionService: SessionService,
    private toastService: ToastService,
    private currentStudioService: CurrentStudioService,
  ) {}

  ngOnInit(): void {
    forkJoin({
      instructors: this.instructorService.getAll({ active: true }).pipe(catchError(() => [])),
      classGroups: this.classGroupService.getAll({ active: true }).pipe(catchError(() => [])),
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.instructors = result.instructors;
        this.classGroups = result.classGroups;
      },
    });
    this.loadSchedule();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSchedule(): void {
    this.loading = true;
    this.error = null;

    const filters: DailyScheduleFilters = {
      studioId: this.currentStudioService.getStudioId(),
      date: this.formatDate(this.filters.date),
    };
    if (this.filters.instructorId !== 'all') {
      filters['instructorId'] = this.filters.instructorId;
    }
    if (this.filters.status !== 'all') {
      filters['status'] = this.filters.status;
    }
    if (this.filters.classGroupId !== 'all') {
      filters['classGroupId'] = this.filters.classGroupId;
    }

    this.dailyScheduleService.getDailySchedule(filters).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.data = response;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Erro ao carregar a agenda do dia. Tente novamente.';
        this.toastService.error('Erro ao carregar a agenda do dia.');
      },
    });
  }

  onDateChange(date: Date): void {
    this.filters.date = date;
    this.loadSchedule();
  }

  goToToday(): void {
    this.filters.date = new Date();
    this.loadSchedule();
  }

  clearFilters(): void {
    this.filters = { date: new Date(), instructorId: 'all', status: 'all', classGroupId: 'all' };
    this.loadSchedule();
  }

  onFilterChange(): void {
    this.loadSchedule();
  }

  startSession(session: DailySessionItem): void {
    const id = session.id;
    if (!id || this.sessionActionLoading[id]) return;
    this.sessionActionLoading[id] = 'start';
    this.sessionService.start(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        session.status = 'IN_PROGRESS';
        this.sessionActionLoading[id] = null;
        this.toastService.success('Aula iniciada.');
        this.refreshKpis();
      },
      error: () => {
        this.sessionActionLoading[id] = null;
        this.toastService.error('Não foi possível iniciar a aula.');
      },
    });
  }

  completeSession(session: DailySessionItem): void {
    const id = session.id;
    if (!id || this.sessionActionLoading[id]) return;
    this.sessionActionLoading[id] = 'complete';
    this.sessionService.complete(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        session.status = 'COMPLETED';
        this.sessionActionLoading[id] = null;
        this.toastService.success('Aula finalizada.');
        this.refreshKpis();
      },
      error: () => {
        this.sessionActionLoading[id] = null;
        this.toastService.error('Não foi possível finalizar a aula.');
      },
    });
  }

  cancelSession(session: DailySessionItem): void {
    const id = session.id;
    if (!id || this.sessionActionLoading[id]) return;
    if (!confirm('Tem certeza que deseja cancelar esta aula?')) return;
    this.sessionActionLoading[id] = 'cancel';
    const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.sessions}/${id}/cancel`;
    this.http.patch(url, {}).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        session.status = 'CANCELLED';
        this.sessionActionLoading[id] = null;
        this.toastService.success('Aula cancelada.');
        this.refreshKpis();
      },
      error: () => {
        this.sessionActionLoading[id] = null;
        this.toastService.error('Não foi possível cancelar a aula.');
      },
    });
  }

  getKpiValue(key: KpiKey): number {
    if (!this.data) return 0;
    return this.data.kpis[key];
  }

  getStatusChip(status: string): { status: ChipStatus; label: string } {
    const map: Record<string, { status: ChipStatus; label: string }> = {
      SCHEDULED: { status: 'completed', label: 'Agendada' },
      IN_PROGRESS: { status: 'warning', label: 'Em andamento' },
      COMPLETED: { status: 'success', label: 'Concluída' },
      CANCELLED: { status: 'cancelled', label: 'Cancelada' },
    };
    return map[status] || { status: 'pending', label: status };
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatTime(time: string): string {
    if (!time) return '';
    return time.substring(0, 5);
  }

  getDayName(date: Date): string {
    return date.toLocaleDateString('pt-BR', { weekday: 'long' }).toUpperCase();
  }

  getFormattedDate(date: Date): string {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  isToday(): boolean {
    return this.formatDate(this.filters.date) === this.formatDate(new Date());
  }

  getInstructorName(session: DailySessionItem): string {
    return session.instructorName || 'Não encontrado';
  }

  get occupancyLabel(): string {
    return 'capacidade';
  }

  private refreshKpis(): void {
    this.loadSchedule();
  }
}
