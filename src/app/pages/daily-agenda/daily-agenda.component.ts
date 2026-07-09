import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, catchError, of, takeUntil } from 'rxjs';
import { DsPageHeaderComponent } from '../../shared/design-system';
import { DsEmptyStateComponent } from '../../shared/design-system';
import { DsStatusChipComponent, ChipStatus } from '../../shared/design-system/status-chip/status-chip.component';
import { LoadingComponent } from '../../shared/components';
import { SessionService } from '../../features/sessions/session.service';
import { Session } from '../../features/sessions/session.model';

@Component({
  selector: 'app-daily-agenda',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DsPageHeaderComponent,
    DsEmptyStateComponent,
    DsStatusChipComponent,
    LoadingComponent,
  ],
  templateUrl: './daily-agenda.component.html',
  styleUrl: './daily-agenda.component.scss',
})
export class DailyAgendaComponent implements OnInit {
  sessions: Session[] = [];
  selectedDate: Date = new Date();
  loading = false;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(private sessionService: SessionService) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.loading = true;
    this.error = null;

    this.sessionService.getAll({ sessionDate: this.formatDate(this.selectedDate) })
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.loading = false;
          this.error = 'Erro ao carregar a agenda. Tente novamente.';
          return of([]);
        })
      )
      .subscribe((sessions) => {
        this.sessions = sessions;
        this.loading = false;
      });
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

  getStatusChip(status: string): { status: ChipStatus; label: string } {
    const map: Record<string, { status: ChipStatus; label: string }> = {
      SCHEDULED: { status: 'completed', label: 'Agendada' },
      IN_PROGRESS: { status: 'warning', label: 'Em andamento' },
      COMPLETED: { status: 'success', label: 'Concluída' },
      CANCELLED: { status: 'cancelled', label: 'Cancelada' },
    };
    return map[status.toUpperCase()] || { status: 'pending', label: status };
  }

  formatTime(startTime: string, endTime: string): string {
    return `${startTime} - ${endTime}`;
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  isToday(): boolean {
    const today = new Date();
    return this.formatDate(this.selectedDate) === this.formatDate(today);
  }

  isPast(): boolean {
    const today = new Date();
    return this.selectedDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }
}
