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
}
