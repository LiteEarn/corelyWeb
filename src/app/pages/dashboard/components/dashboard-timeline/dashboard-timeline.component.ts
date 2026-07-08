import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DsButtonComponent } from '../../../../shared/design-system/button/button.component';
import { DsStatusChipComponent, ChipStatus } from '../../../../shared/design-system/status-chip/status-chip.component';
import { UpcomingSession } from '../../dashboard.model';

@Component({
  selector: 'app-dashboard-timeline',
  standalone: true,
  imports: [CommonModule, MatIconModule, DsButtonComponent, DsStatusChipComponent],
  templateUrl: './dashboard-timeline.component.html',
  styleUrl: './dashboard-timeline.component.scss',
})
export class DashboardTimelineComponent {
  @Input() sessions: UpcomingSession[] = [];
  @Output() openSession = new EventEmitter<string>();

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

  formatTime(time: string): string {
    return (time || '').substring(0, 5);
  }

  trackBySessionId(index: number, session: UpcomingSession): string {
    return session.id;
  }
}
