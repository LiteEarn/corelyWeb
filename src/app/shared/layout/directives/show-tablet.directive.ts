import { Directive, inject, TemplateRef, ViewContainerRef, effect } from '@angular/core';
import { ResponsiveService } from '../responsive.service';

@Directive({
  selector: '[showTablet]',
  standalone: true,
})
export class ShowTabletDirective {
  private templateRef = inject(TemplateRef);
  private viewContainer = inject(ViewContainerRef);
  private responsive = inject(ResponsiveService);

  constructor() {
    effect(() => {
      const isTablet = this.responsive.layoutMode() === 'TABLET';
      if (isTablet) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }
}
