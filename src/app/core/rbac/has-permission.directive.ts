import { Directive, Input, TemplateRef, ViewContainerRef, inject, OnInit } from '@angular/core';
import { PermissionService } from './permission.service';

@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private permissionService = inject(PermissionService);

  private requiredPermissions: string[] = [];
  private isHidden = true;

  @Input({ required: true, alias: 'hasPermission' })
  set hasPermission(val: string | string[]) {
    this.requiredPermissions = Array.isArray(val) ? val : [val];
    this.updateView();
  }

  ngOnInit(): void {
    this.updateView();
  }

  private updateView(): void {
    const hasAccess = this.requiredPermissions.length === 0 ||
      this.requiredPermissions.some(p => this.permissionService.hasPermission(p));

    if (hasAccess && this.isHidden) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.isHidden = false;
    } else if (!hasAccess && !this.isHidden) {
      this.viewContainer.clear();
      this.isHidden = true;
    }
  }
}
