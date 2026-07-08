import { Component, Input, TemplateRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResponsiveService } from '../../../layout/responsive.service';
import { LayoutMode } from '../../../layout/layout-mode.enum';

@Component({
  selector: 'crud-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crud-card.component.html',
  styleUrl: './crud-card.component.scss',
})
export class CrudCardComponent {
  responsive = inject(ResponsiveService);
  readonly LayoutMode = LayoutMode;

  @Input() cardTemplate!: TemplateRef<any>;
  @Input() items: any[] = [];
  @Input() trackBy: (index: number, item: any) => any = (index: number) => index;
}
