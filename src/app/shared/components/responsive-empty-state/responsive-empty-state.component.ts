import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'responsive-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div
      class="responsive-empty-state"
      [class.empty--sm]="size === 'sm'"
      [class.empty--md]="size === 'md'"
      [class.empty--lg]="size === 'lg'"
      role="status"
    >
      <div class="empty-icon-wrapper">
        <mat-icon class="empty-icon">{{ icon }}</mat-icon>
      </div>
      <h3 class="empty-title">{{ title }}</h3>
      <p *ngIf="description" class="empty-description">{{ description }}</p>
      <button
        *ngIf="showAction"
        mat-raised-button
        color="primary"
        class="empty-cta"
        (click)="actionClick.emit()"
      >
        <mat-icon>{{ actionIcon }}</mat-icon>
        {{ actionText }}
      </button>
    </div>
  `,
  styles: [`
    .responsive-empty-state {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; text-align: center;
    }
    .empty--lg { padding: 96px 32px; }
    .empty--md { padding: 64px 24px; }
    .empty--sm { padding: 32px 16px; }
    .empty-icon-wrapper {
      width: 72px; height: 72px; border-radius: 9999px;
      background: #F1F5F9; display: flex; align-items: center;
      justify-content: center; margin-bottom: 24px;
    }
    .empty--sm .empty-icon-wrapper { width: 48px; height: 48px; margin-bottom: 16px; }
    .empty-icon { font-size: 36px; width: 36px; height: 36px; color: #94A3B8; }
    .empty--sm .empty-icon { font-size: 24px; width: 24px; height: 24px; }
    .empty-title { font-size: 18px; font-weight: 600; color: #0F172A; margin: 0 0 8px; }
    .empty--sm .empty-title { font-size: 16px; }
    .empty-description { font-size: 14px; color: #64748B; margin: 0 0 24px; max-width: 400px; }
    .empty-cta { margin-top: 8px; }
    @media (max-width: 599px) {
      .empty--lg { padding: 48px 12px; }
      .empty-cta { width: 100%; }
    }
  `]
})
export class ResponsiveEmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Nenhum dado encontrado';
  @Input() description = '';
  @Input() showAction = false;
  @Input() actionText = 'Adicionar';
  @Input() actionIcon = 'add';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Output() actionClick = new EventEmitter<void>();
}
