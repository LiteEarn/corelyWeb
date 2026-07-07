import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-responsive-form-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="responsive-form-grid"
      [class.cols-3]="desktopColumns === 3"
      [class.cols-2]="desktopColumns === 2">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .responsive-form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
      width: 100%;
    }

    .responsive-form-grid .full-width {
      grid-column: 1 / -1;
    }

    .responsive-form-grid.cols-3 {
      grid-template-columns: repeat(3, 1fr);
    }

    @media (max-width: 959px) {
      .responsive-form-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
      }

      .responsive-form-grid.cols-3 {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 599px) {
      .responsive-form-grid,
      .responsive-form-grid.cols-3 {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }
  `]
})
export class ResponsiveFormGridComponent {
  @Input() desktopColumns: 2 | 3 = 2;
}
