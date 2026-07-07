import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { PermissionService } from '../../core/rbac';
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

  menuItems: MenuItemDef[] = [];

  ngOnInit(): void {
    this.menuItems = this.permissionService.getMenuItems();
  }
}
