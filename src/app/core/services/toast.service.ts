import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private snackBar: MatSnackBar) {}

  success(message: string, duration: number = 3000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 5000): void {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration: number = 4000): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration: number = 3000): void {
    this.show(message, 'info', duration);
  }

  private show(message: string, type: 'success' | 'error' | 'warning' | 'info', duration: number): void {
    const config: MatSnackBarConfig = {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: this.getPanelClass(type)
    };

    this.snackBar.open(message, 'Fechar', config);
  }

  private getPanelClass(type: 'success' | 'error' | 'warning' | 'info'): string[] {
    switch (type) {
      case 'success':
        return ['toast-success'];
      case 'error':
        return ['toast-error'];
      case 'warning':
        return ['toast-warning'];
      case 'info':
        return ['toast-info'];
      default:
        return ['toast-info'];
    }
  }
}
