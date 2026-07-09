import { Component, Input, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'responsive-card-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="responsive-card-list" role="list" aria-label="Lista de registros">
      <ng-container *ngFor="let item of items; trackBy: trackBy">
        <ng-container *ngTemplateOutlet="cardTemplate; context: { $implicit: item }"></ng-container>
      </ng-container>
    </div>
  `,
  styles: [`
    .responsive-card-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  `]
})
export class ResponsiveCardListComponent {
  @Input() cardTemplate!: TemplateRef<any>;
  @Input() items: any[] = [];
  @Input() trackBy: (index: number, item: any) => any = (index: number) => index;
}
