import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { ResponsiveService } from '../../shared/layout/responsive.service';
import { LayoutMode } from '../../shared/layout/layout-mode.enum';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    SidebarComponent,
    TopbarComponent
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent {
  private responsive = inject(ResponsiveService);

  isSidebarOpen = true;
  isMobile = this.responsive.isMobile;
  layoutMode = this.responsive.layoutMode;
  isDesktop = this.responsive.isDesktop;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
