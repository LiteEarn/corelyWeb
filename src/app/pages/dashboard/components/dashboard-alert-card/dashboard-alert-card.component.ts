import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DashboardAlert } from '../../dashboard.model';

@Component({
  selector: 'app-dashboard-alert-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './dashboard-alert-card.component.html',
  styleUrl: './dashboard-alert-card.component.scss',
})
export class DashboardAlertCardComponent {
  @Input() alerts: DashboardAlert[] = [];
  @Output() resolve = new EventEmitter<DashboardAlert>();

  getAlertIcon(type: string): string {
    const map: Record<string, string> = {
      FULL_CLASS: 'group',
      PENDING_MAKEUP: 'assignment',
      ONGOING_CLASS: 'play_circle',
    };
    return map[type.toUpperCase()] || 'info';
  }

  getSeverityClass(severity: string): string {
    const map: Record<string, string> = {
      ERROR: 'severity-error',
      WARNING: 'severity-warning',
      INFO: 'severity-info',
    };
    return map[severity.toUpperCase()] || 'severity-info';
  }

  getSeverityLabel(severity: string): string {
    const map: Record<string, string> = {
      ERROR: 'Crítico',
      WARNING: 'Atenção',
      INFO: 'Informativo',
    };
    return map[severity.toUpperCase()] || 'Info';
  }

  trackByAlertTitle(index: number, alert: DashboardAlert): string {
    return alert.title + alert.message;
  }
}
