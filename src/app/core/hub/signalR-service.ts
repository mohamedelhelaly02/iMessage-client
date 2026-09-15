import { inject, Service } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { AuthStateService } from '../auth/auth-state-service';
import { ToastService } from '../../shared/services/toast-service';

@Service()
export class SignalRService {
    private hubConnection!: signalR.HubConnection;
    private readonly HUB_URL: string = 'https://localhost:7116/hubs/chat';

    private readonly authStateService = inject(AuthStateService);
    private readonly toastService = inject(ToastService);

    async startConnection(): Promise<void> {
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(this.HUB_URL, {
                accessTokenFactory: () => this.authStateService.token() || '',
            })
            .withAutomaticReconnect()
            .build();

        this.hubConnection.on('ReceiveCallerConnected', () => {
            this.toastService.success("Connected");
        });

        try {
            await this.hubConnection.start();
            console.log('SignalR connection started')
        } catch (error) {
            console.error('Error while starting SignalR connection: ', error)
        }
    }

    async stopConnection(): Promise<void> {
        if (this.hubConnection) {
            try {
                await this.hubConnection.stop();
                console.log('SignalR connection stopped');
            } catch (err) {
                console.error(
                    'Error while stopping SignalR connection:',
                    err
                );
            }
        }
    }


    async notifyCallerOnline() {
        await this.hubConnection.invoke('NotifyCallerOnline');
    }

}
