import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ClassOccupancy } from '../../dashboard.model';

@Component({
  selector: 'app-dashboard-occupancy-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './dashboard-occupancy-card.component.html',
  styleUrl: './dashboard-occupancy-card.component.scss',
})
export class DashboardOccupancyCardComponent {
  @Input() items: ClassOccupancy[] = [];

  getBarColor(percent: number): string {
    if (percent >= 80) return 'warn';
    if (percent >= 50) return 'accent';
    return 'primary';
  }

  trackByClassGroupId(index: number, item: ClassOccupancy): string {
    return item.classGroupId;
  }
}
