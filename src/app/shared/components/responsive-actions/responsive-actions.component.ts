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
  selector: 'responsive-actions',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule],
  template: `
    <div class="responsive-actions" (click)="$event.stopPropagation()">
      <ng-container *ngIf="responsive.layoutMode() !== LayoutMode.MOBILE">
        <button
          *ngFor="let action of visibleActions"
          mat-icon-button
          class="action-btn"
          [disabled]="action.disabled"
          [attr.aria-label]="action.label"
          (click)="onAction(action.action)"
        >
          <mat-icon>{{ action.icon }}</mat-icon>
        </button>

        <button
          *ngIf="menuActions.length > 0"
          mat-icon-button
          class="action-btn"
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
          class="action-btn action-btn--mobile"
          [matMenuTriggerFor]="mobileMenu"
          aria-label="Abrir menu de ações"
          (click)="$event.stopPropagation()"
        >
          <mat-icon>more_vert</mat-icon>
        </button>

        <mat-menu #mobileMenu="matMenu" xPosition="before">
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
    .responsive-actions { display: flex; align-items: center; gap: 4px; }
    .action-btn { width: 40px; height: 40px; }
    .action-btn--mobile { width: 44px; height: 44px; }
  `]
})
export class ResponsiveActionsComponent {
  responsive = inject(ResponsiveService);
  readonly LayoutMode = LayoutMode;

  @Input() actions: ResponsiveAction[] = [];
  @Input() item: any;
  @Input() visibleActionsCount = 3;
  @Output() actionClick = new EventEmitter<{ action: string; item: any }>();

  get visibleActions(): ResponsiveAction[] {
    if (this.responsive.layoutMode() === LayoutMode.MOBILE) return [];
    return this.actions.slice(0, this.visibleActionsCount);
  }

  get menuActions(): ResponsiveAction[] {
    if (this.responsive.layoutMode() === LayoutMode.MOBILE) return this.actions;
    return this.actions.slice(this.visibleActionsCount);
  }

  onAction(action: string): void {
    this.actionClick.emit({ action, item: this.item });
  }
}
