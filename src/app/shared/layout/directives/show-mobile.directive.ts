import { Directive, inject, TemplateRef, ViewContainerRef, effect } from '@angular/core';
import { ResponsiveService } from '../responsive.service';

@Directive({
  selector: '[showMobile]',
  standalone: true,
})
export class ShowMobileDirective {
  private templateRef = inject(TemplateRef);
  private viewContainer = inject(ViewContainerRef);
  private responsive = inject(ResponsiveService);

  constructor() {
    effect(() => {
      const isMobile = this.responsive.layoutMode() === 'MOBILE';
      if (isMobile) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }
}
