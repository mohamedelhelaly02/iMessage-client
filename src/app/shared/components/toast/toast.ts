import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast-service';

@Component({
  imports: [],
  selector: 'app-toast',
  styleUrl: './toast.css',
  templateUrl: './toast.html',
})
export class Toast {
  private toastService = inject(ToastService);

  toasts = this.toastService.toasts;

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }

  toastAccentColor(type: string): string {
    const colors: Record<string, string> = {
      success: '#30d158',
      error: '#ff3b30',
      warning: '#ff9f0a',
      info: '#0a84ff',
    };
    return colors[type] ?? colors['info'];
  }
}
