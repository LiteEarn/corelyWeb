import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'responsive-page-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="responsive-page-container" [class.fluid]="fluid">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .responsive-page-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 32px 16px;
      width: 100%;
      box-sizing: border-box;
    }
    .responsive-page-container.fluid {
      max-width: 100%;
    }
    @media (max-width: 959px) {
      .responsive-page-container { padding: 24px 16px; }
    }
    @media (max-width: 599px) {
      .responsive-page-container { padding: 16px 12px; }
    }
  `]
})
export class ResponsivePageContainerComponent {
  @Input() fluid = false;
}
