import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SessionService } from '../../core/session/session.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  private sessionService = inject(SessionService);

  userName = this.sessionService.userName;
  userRole = this.sessionService.currentRole;
  userStudio = this.sessionService.currentStudio;
}
