import { Component, Input, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { PermissionService } from '../../core/rbac';
import { ResponsiveService } from '../../shared/layout/responsive.service';
import type { MenuItemDef } from '../../core/rbac/permission-matrix';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  @Input() isSidebarOpen = true;
  private permissionService = inject(PermissionService);
  private responsive = inject(ResponsiveService);

  menuItems: MenuItemDef[] = [];

  readonly isMobile = this.responsive.isMobile;
  readonly isOverlayMode = computed(() => this.responsive.isMobile());

  ngOnInit(): void {
    this.menuItems = this.permissionService.getMenuItems();
  }
}
