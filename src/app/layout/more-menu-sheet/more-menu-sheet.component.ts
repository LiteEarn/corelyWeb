import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NavigationService } from '../../shared/navigation/navigation.service';

@Component({
  selector: 'app-more-menu-sheet',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './more-menu-sheet.component.html',
  styleUrl: './more-menu-sheet.component.scss',
})
export class MoreMenuSheetComponent {
  navigation = inject(NavigationService);

  onItemClick(): void {
    this.navigation.closeMoreSheet();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('more-sheet-overlay')) {
      this.navigation.closeMoreSheet();
    }
  }
}
