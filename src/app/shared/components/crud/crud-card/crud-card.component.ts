import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'crud-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crud-card.component.html',
  styleUrl: './crud-card.component.scss',
})
export class CrudCardComponent {
  @Input() cardTemplate!: TemplateRef<any>;
  @Input() items: any[] = [];
  @Input() trackBy: (index: number, item: any) => any = (index: number) => index;
}
