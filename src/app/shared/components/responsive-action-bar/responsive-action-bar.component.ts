import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ResponsiveService } from '../../layout/responsive.service';
import { LayoutMode } from '../../layout/layout-mode.enum';

export interface ResponsiveAction {
  label: string;
  icon: string;
  action: string;
  disabled?: boolean;
}

@Component({
  selector: 'responsive-action-bar',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule],
  template: `
    <div class="responsive-action-bar" (click)="$event.stopPropagation()">
      <ng-container *ngIf="responsive.layoutMode() !== LayoutMode.MOBILE">
        <button
          *ngFor="let action of visibleActions"
          mat-icon-button
          class="action-button"
          [disabled]="action.disabled"
          [attr.aria-label]="action.label"
          (click)="onAction(action.action)"
        >
          <mat-icon>{{ action.icon }}</mat-icon>
        </button>

        <button
          *ngIf="menuActions.length > 0"
          mat-icon-button
          class="action-button"
          [matMenuTriggerFor]="menu"
          aria-label="Mais ações"
        >
          <mat-icon>more_vert</mat-icon>
        </button>

        <mat-menu #menu="matMenu" xPosition="before">
          <button
            *ngFor="let action of menuActions"
            mat-menu-item
            [disabled]="action.disabled"
            (click)="onAction(action.action)"
          >
            <mat-icon>{{ action.icon }}</mat-icon>
            <span>{{ action.label }}</span>
          </button>
        </mat-menu>
      </ng-container>

      <ng-container *ngIf="responsive.layoutMode() === LayoutMode.MOBILE">
        <button
          mat-icon-button
          class="action-button action-button--mobile"
          [matMenuTriggerFor]="mobileMenu"
          aria-label="Abrir menu de ações"
          (click)="$event.stopPropagation()"
        >
          <mat-icon>more_vert</mat-icon>
        </button>

        <mat-menu #mobileMenu="matMenu" xPosition="before" class="responsive-mobile-menu">
          <button
            *ngFor="let action of actions"
            mat-menu-item
            [disabled]="action.disabled"
            (click)="onAction(action.action)"
          >
            <mat-icon>{{ action.icon }}</mat-icon>
            <span>{{ action.label }}</span>
          </button>
        </mat-menu>
      </ng-container>
    </div>
  `,
  styles: [`
    .responsive-action-bar {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .action-button {
      width: 40px;
      height: 40px;
    }
    .action-button--mobile {
      width: 44px;
      height: 44px;
    }
  `]
})
export class ResponsiveActionBarComponent {
  responsive = inject(ResponsiveService);
  readonly LayoutMode = LayoutMode;

  @Input() actions: ResponsiveAction[] = [];
  @Input() item: any;
  @Input() visibleActionsCount = 3;
  @Output() actionClick = new EventEmitter<{ action: string; item: any }>();

  get visibleActions(): ResponsiveAction[] {
    if (this.responsive.layoutMode() === LayoutMode.MOBILE) {
      return [];
    }
    return this.actions.slice(0, this.visibleActionsCount);
  }

  get menuActions(): ResponsiveAction[] {
    if (this.responsive.layoutMode() === LayoutMode.MOBILE) {
      return this.actions;
    }
    return this.actions.slice(this.visibleActionsCount);
  }

  onAction(action: string): void {
    this.actionClick.emit({ action, item: this.item });
  }
}
