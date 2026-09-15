import { Injectable, inject, signal } from '@angular/core';
import { Subject } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { AuthStateService } from '../auth/auth-state-service';
import { ToastService } from '../../shared/services/toast-service';

@Injectable({ providedIn: 'root' })
export class SignalRService {
    private hubConnection!: signalR.HubConnection;
    private readonly HUB_URL: string = 'https://localhost:7116/hubs/chat';

    private readonly authStateService = inject(AuthStateService);
    private readonly toastService = inject(ToastService);

    async startConnection(): Promise<void> {
        if (
            this.hubConnection?.state === signalR.HubConnectionState.Connected ||
            this.hubConnection?.state === signalR.HubConnectionState.Connecting
        ) {
            return;
        }

        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(this.HUB_URL, {
                accessTokenFactory: () => this.authStateService.token() || '',
            })
            .withAutomaticReconnect()
            .build();

        this.registerHubEvents();

        try {
            await this.hubConnection.start();
            console.log('SignalR connection started');
            this.toastService.success('Connected');
        } catch (error) {
            console.error('Error while starting SignalR connection: ', error);
        }
    }

    async stopConnection(): Promise<void> {
        if (this.hubConnection) {
            try {
                await this.hubConnection.stop();
                console.log('SignalR connection stopped');
            } catch (err) {
                console.error('Error while stopping SignalR connection:', err);
            }
        }
    }

    async notifyCallerOnline(): Promise<void> {
        if (!this.hubConnection ||
            this.hubConnection.state !== signalR.HubConnectionState.Connected) {
            console.warn(
                'Cannot notify caller. SignalR state:',
                this.hubConnection?.state ?? 'not initialized'
            );
            return;
        }

        try {
            await this.hubConnection.invoke('NotifyCallerOnline');
            console.log('Caller notification sent');
        } catch (error) {
            console.error('Failed to notify caller:', error);
        }
    }

    private registerHubEvents(): void {
        this.hubConnection.on('ReceiveCallerConnected', () => {
            console.log('connected, welcome to our hub');
        });

    }
}