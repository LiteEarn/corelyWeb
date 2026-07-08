import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

export interface KpiItem {
  label: string;
  value: string | number;
  icon: string;
  color: 'primary' | 'accent' | 'warn';
}

@Component({
  selector: 'app-dashboard-kpi-carousel',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatCardModule],
  templateUrl: './dashboard-kpi-carousel.component.html',
  styleUrl: './dashboard-kpi-carousel.component.scss',
})
export class DashboardKpiCarouselComponent {
  @Input() items: KpiItem[] = [];

  scrollIndex = 0;

  get canScrollPrev(): boolean {
    return this.scrollIndex > 0;
  }

  get canScrollNext(): boolean {
    return this.scrollIndex < this.items.length - 1;
  }

  scrollPrev(): void {
    if (this.canScrollPrev) {
      this.scrollIndex--;
    }
  }

  scrollNext(): void {
    if (this.canScrollNext) {
      this.scrollIndex++;
    }
  }

  scrollTo(index: number): void {
    this.scrollIndex = index;
  }

  get visibleItems(): KpiItem[] {
    return this.items.slice(this.scrollIndex, this.scrollIndex + 2);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
