import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private snack: MatSnackBar) {}

  success(message: string, config?: MatSnackBarConfig) {
    this.open(message, { panelClass: ['snack-success'], duration: 3000, ...config });
  }

  error(message: string, config?: MatSnackBarConfig) {
    this.open(message, { panelClass: ['snack-error'], duration: 5000, ...config });
  }

  info(message: string, config?: MatSnackBarConfig) {
    this.open(message, { panelClass: ['snack-info'], duration: 3000, ...config });
  }

  private open(message: string, config?: MatSnackBarConfig) {
    this.snack.open(message, config?.panelClass?.includes('snack-error') ? 'Dismiss' : undefined, {
      horizontalPosition: 'right',
      verticalPosition: 'top',
      ...config
    });
  }
}
