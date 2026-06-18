import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { DsPageHeaderComponent } from '../../shared/design-system/page-header/page-header.component';
import { DsPageCardComponent } from '../../shared/design-system/page-card/page-card.component';
import { DsEmptyStateComponent } from '../../shared/design-system/empty-state/empty-state.component';
import { DashboardService } from './dashboard.service';
import { DashboardData } from './dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    StatCardComponent,
    LoadingComponent,
    DsPageHeaderComponent,
    DsPageCardComponent,
    DsEmptyStateComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  dashboardData: DashboardData | null = null;
  loading = true;
  error = false;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = false;
    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        console.log('[Dashboard] API Response:', data);

        // Correctly assign the data directly as it matches DashboardData interface
        this.dashboardData = data;

        console.log('Dashboard model', this.dashboardData); // Log the dashboard model

        this.loading = false;
      },
      error: (err) => {
        console.error('[Dashboard] API Error:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  retry(): void {
    this.loadDashboard();
  }

  getOccupancyRateColor(): string {
    if (!this.dashboardData || this.dashboardData.occupancyRate === undefined) return 'primary';
    const rate = this.dashboardData.occupancyRate;
    if (rate >= 80) return 'accent';
    if (rate >= 50) return 'primary';
    return 'warn';
  }

  formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('pt-BR');
  }

  truncateDescription(description: string, maxLength: number = 50): string {
    if (!description) return '';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  }
}
