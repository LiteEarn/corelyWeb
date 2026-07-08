import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { BottomNavComponent } from '../bottom-nav/bottom-nav.component';
import { MoreMenuSheetComponent } from '../more-menu-sheet/more-menu-sheet.component';
import { NavigationService } from '../../shared/navigation/navigation.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    SidebarComponent,
    TopbarComponent,
    BottomNavComponent,
    MoreMenuSheetComponent,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent {
  navigation = inject(NavigationService);

  @HostListener('document:keydown.escape')
  onKeydownEscape(): void {
    if (this.navigation.isMoreSheetOpen()) {
      this.navigation.closeMoreSheet();
    }
    if (this.navigation.isDrawerOpen()) {
      this.navigation.closeDrawer();
    }
  }

  onToggleMenu(): void {
    this.navigation.toggle();
  }

  onDrawerClose(): void {
    this.navigation.closeDrawer();
  }

  onBackdropClick(): void {
    this.navigation.closeDrawer();
  }
}
