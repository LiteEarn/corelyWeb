import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';

export type ChipStatus = 'active' | 'inactive' | 'pending' | 'success' | 'warning';

@Component({
  selector: 'ds-status-chip',
  standalone: true,
  imports: [CommonModule, MatChipsModule],
  templateUrl: './status-chip.component.html',
  styleUrl: './status-chip.component.scss'
})
export class DsStatusChipComponent {
  @Input() status: ChipStatus = 'active';
  @Input() label: string = '';

  get chipClass(): string {
    return `ds-chip-${this.status}`;
  }
}
