import { Component, effect, inject } from '@angular/core';
import { AuthStateService } from './core/auth/auth-state-service';
import { SignalRService } from './core/hub/signalR-service';
import { RouterOutlet } from '@angular/router';
import { Toast } from './shared/components/toast/toast';

@Component({
  imports: [RouterOutlet, Toast],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly signalRService = inject(SignalRService);
  private readonly authStateService = inject(AuthStateService);

  constructor() {

    effect(() => {
      const isAuthenticated = this.authStateService.isAuthenticated();
      if (isAuthenticated) {
        this.connect();
      } else {
        this.disconnect();
      }
    });
  }

  async connect(): Promise<void> {
    try {
      await this.signalRService.startConnection();
      await this.signalRService.notifyCallerOnline();
    } catch (error) {
      console.error(error);
    }
  }

  async disconnect(): Promise<void> {
    await this.signalRService.stopConnection();
  }

}
