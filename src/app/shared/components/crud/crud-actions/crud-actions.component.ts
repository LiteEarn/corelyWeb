import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { ResponsiveService } from '../../../layout/responsive.service';
import { LayoutMode } from '../../../layout/layout-mode.enum';

export interface CrudAction {
  label: string;
  icon: string;
  action: string;
  disabled?: boolean;
}

@Component({
  selector: 'crud-actions',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBottomSheetModule,
  ],
  templateUrl: './crud-actions.component.html',
  styleUrl: './crud-actions.component.scss',
})
export class CrudActionsComponent {
  responsive = inject(ResponsiveService);
  readonly LayoutMode = LayoutMode;

  @Input() actions: CrudAction[] = [];
  @Output() actionClick = new EventEmitter<{ action: string; item: any }>();
  @Input() item: any;
  @Input() visibleActionsCount = 3;

  get visibleActions(): CrudAction[] {
    if (this.responsive.layoutMode() === LayoutMode.MOBILE) {
      return [];
    }
    return this.actions.slice(0, this.visibleActionsCount);
  }

  get menuActions(): CrudAction[] {
    if (this.responsive.layoutMode() === LayoutMode.MOBILE) {
      return this.actions;
    }
    return this.actions.slice(this.visibleActionsCount);
  }

  onAction(action: string): void {
    this.actionClick.emit({ action, item: this.item });
  }
}
