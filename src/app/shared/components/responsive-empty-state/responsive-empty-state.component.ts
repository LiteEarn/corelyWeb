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
      [class.empty--small]="size === 'small'"
      [class.empty--medium]="size === 'medium'"
      [class.empty--large]="size === 'large'"
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
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .empty--large {
      padding: 96px 32px;
    }
    .empty--medium {
      padding: 64px 24px;
    }
    .empty--small {
      padding: 32px 16px;
    }
    .empty-icon-wrapper {
      width: 72px;
      height: 72px;
      border-radius: 9999px;
      background: #F1F5F9;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
    }
    .empty--small .empty-icon-wrapper {
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }
    .empty-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: #94A3B8;
    }
    .empty--small .empty-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    .empty-title {
      font-size: 18px;
      font-weight: 600;
      color: #0F172A;
      margin: 0 0 8px;
    }
    .empty--small .empty-title {
      font-size: 16px;
    }
    .empty-description {
      font-size: 14px;
      color: #64748B;
      margin: 0 0 24px;
      max-width: 400px;
    }
    .empty-cta {
      margin-top: 8px;
    }
    @media (max-width: 959px) {
      .empty--large {
        padding: 64px 16px;
      }
      .empty-description {
        max-width: 100%;
      }
    }
    @media (max-width: 599px) {
      .empty--large {
        padding: 48px 12px;
      }
      .empty-cta {
        width: 100%;
      }
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
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Output() actionClick = new EventEmitter<void>();
}
