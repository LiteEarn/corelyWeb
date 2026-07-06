import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { SessionService } from '../../core/session/session.service';
import { AuthService } from '../../core/auth/auth.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  private sessionService = inject(SessionService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  userName = this.sessionService.userName;
  userEmail = this.sessionService.userEmail;
  userRole = this.sessionService.currentRole;
  userStudio = this.sessionService.currentStudio;

  get roleDisplay(): string {
    const roleMap: Record<string, string> = {
      OWNER: 'Proprietário',
      ADMIN: 'Administrador',
      RECEPTIONIST: 'Recepcionista',
      INSTRUCTOR: 'Instrutor',
      FINANCIAL: 'Financeiro',
      STUDENT: 'Aluno',
    };
    return roleMap[this.userRole()] || this.userRole();
  }

  get studioName(): string {
    return this.userStudio()?.name || '';
  }

  onNavigateProfile(): void {
    // TODO: implementar navegação para perfil do usuário
  }

  onChangePassword(): void {
    // TODO: implementar navegação para alterar senha
  }

  onLogout(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Sair',
        message: 'Deseja realmente sair?',
        confirmText: 'Sair',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.authService.logout();
      }
    });
  }
}
