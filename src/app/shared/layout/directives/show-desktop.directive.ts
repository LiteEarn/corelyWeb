import { Directive, inject, TemplateRef, ViewContainerRef, effect } from '@angular/core';
import { ResponsiveService } from '../responsive.service';

@Directive({
  selector: '[showDesktop]',
  standalone: true,
})
export class ShowDesktopDirective {
  private templateRef = inject(TemplateRef);
  private viewContainer = inject(ViewContainerRef);
  private responsive = inject(ResponsiveService);

  constructor() {
    effect(() => {
      const isDesktop = this.responsive.layoutMode() === 'DESKTOP';
      if (isDesktop) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }
}
