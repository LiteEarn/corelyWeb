import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'ds-page-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './page-card.component.html',
  styleUrl: './page-card.component.scss'
})
export class DsPageCardComponent {
  @Input() maxWidth: string = '900px';
  @Input() padding: string = '32px';
}
