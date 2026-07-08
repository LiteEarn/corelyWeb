import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'responsive-page-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="responsive-page-container" [class.fluid]="fluid">
      <ng-content select="[pageHeader]"></ng-content>
      <div class="responsive-page-content">
        <ng-content></ng-content>
      </div>
      <div class="responsive-page-footer" *ngIf="showFooter">
        <ng-content select="[pageFooter]"></ng-content>
      </div>
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
    .responsive-page-content {
      margin-top: 24px;
    }
    .responsive-page-footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid var(--ds-border, #E2E8F0);
    }
    @media (max-width: 959px) {
      .responsive-page-container {
        padding: 24px 16px;
      }
      .responsive-page-content {
        margin-top: 20px;
      }
    }
    @media (max-width: 599px) {
      .responsive-page-container {
        padding: 16px 12px;
      }
      .responsive-page-content {
        margin-top: 16px;
      }
      .responsive-page-footer {
        margin-top: 24px;
      }
    }
  `]
})
export class ResponsivePageContainerComponent {
  @Input() fluid = false;
  @Input() showFooter = false;
}
