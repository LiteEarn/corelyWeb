import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-responsive-form-section',
  standalone: true,
  imports: [CommonModule, MatExpansionModule],
  template: `
    <div class="responsive-form-section">
      <ng-container *ngIf="!useExpansionPanel; else expansionPanel">
        <h2 class="section-title" *ngIf="title">{{ title }}</h2>
        <div class="section-content">
          <ng-content></ng-content>
        </div>
      </ng-container>
      <ng-template #expansionPanel>
        <mat-expansion-panel class="form-expansion-panel" [expanded]="expanded" [hideToggle]="false">
          <mat-expansion-panel-header>
            <mat-panel-title>{{ title }}</mat-panel-title>
          </mat-expansion-panel-header>
          <ng-content></ng-content>
        </mat-expansion-panel>
      </ng-template>
    </div>
  `,
  styles: [`
    .responsive-form-section {
      margin-bottom: 24px;
    }

    .responsive-form-section:last-child {
      margin-bottom: 0;
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #0F172A;
      margin: 0 0 24px 0;
      letter-spacing: -0.2px;
    }

    .form-expansion-panel {
      border-radius: 12px !important;
      border: 1px solid #E2E8F0 !important;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
      margin-bottom: 16px;
    }

    .form-expansion-panel .mat-expansion-panel-header {
      font-weight: 600;
      font-size: 15px;
    }

    @media (max-width: 768px) {
      .responsive-form-section {
        margin-bottom: 16px;
      }

      .section-title {
        margin: 0 0 16px 0;
      }
    }
  `]
})
export class ResponsiveFormSectionComponent {
  @Input() title: string = '';
  @Input() useExpansionPanel: boolean = false;
  @Input() expanded: boolean = true;
}
