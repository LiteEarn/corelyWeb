import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'responsive-loading-state',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div
      class="responsive-loading-state"
      [class.loading--inline]="inline"
      [class.loading--overlay]="overlay"
      role="status"
      aria-label="Carregando"
    >
      <mat-spinner
        *ngIf="!skeleton"
        [diameter]="size === 'small' ? 24 : size === 'large' ? 48 : 32"
        class="loading-spinner"
      ></mat-spinner>

      <div *ngIf="skeleton" class="loading-skeleton" [class.skeleton--card]="skeleton === 'card'">
        <div class="skeleton-row" *ngFor="let _ of [].constructor(skeletonRows)">
          <div class="skeleton-line" [style.width.%]="getRandomWidth()"></div>
        </div>
      </div>

      <span *ngIf="message" class="loading-message">{{ message }}</span>
    </div>
  `,
  styles: [`
    .responsive-loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 16px;
      gap: 16px;
    }
    .loading--inline {
      padding: 24px 16px;
    }
    .loading--overlay {
      position: absolute;
      inset: 0;
      background: rgba(255,255,255,0.8);
      z-index: 10;
    }
    .loading-message {
      font-size: 14px;
      color: #64748B;
    }
    .loading-skeleton {
      width: 100%;
      max-width: 400px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .skeleton-row {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .skeleton-line {
      height: 16px;
      border-radius: 8px;
      background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .skeleton--card .skeleton-row {
      padding: 16px;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
    }
  `]
})
export class ResponsiveLoadingStateComponent {
  @Input() inline = false;
  @Input() overlay = false;
  @Input() skeleton: boolean | 'card' = false;
  @Input() skeletonRows = 3;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() message = '';

  private widthOptions = [40, 60, 75, 85, 95];

  getRandomWidth(): number {
    return this.widthOptions[Math.floor(Math.random() * this.widthOptions.length)];
  }
}
