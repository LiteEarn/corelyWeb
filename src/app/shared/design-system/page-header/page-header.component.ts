import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DS_COLORS, DS_FONT_SIZE, DS_FONT_WEIGHT } from '../design-system.constants';

@Component({
  selector: 'ds-page-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss'
})
export class DsPageHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() showBackButton: boolean = false;
  @Input() showActionButton: boolean = false;
  @Input() actionButtonText: string = '';
  @Input() backButtonText: string = 'Voltar';
  @Output() actionButtonClick = new EventEmitter<void>();
  @Output() backButtonClick = new EventEmitter<void>();
}
