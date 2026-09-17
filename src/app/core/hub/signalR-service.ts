import { Service, inject, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { AuthStateService } from '../auth/auth-state-service';
import { ToastService } from '../../shared/services/toast-service';

@Service()
export class SignalRService {
    isConnected = signal<boolean>(false);
    private hubConnection!: signalR.HubConnection;
    private readonly HUB_URL: string = 'https://localhost:7116/hubs/chat';
    private readonly authStateService = inject(AuthStateService);
    private readonly toastService = inject(ToastService);

    private readonly _onlineUsersSignal = signal<Set<string>>(new Set());

    readonly onlineUsers = this._onlineUsersSignal.asReadonly();

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
            this.isConnected.set(true);
        } catch (error) {
            console.error('Error while starting SignalR connection: ', error);
            this.isConnected.set(true);
        }
    }

    async stopConnection(): Promise<void> {
        if (this.hubConnection) {
            try {
                await this.hubConnection.stop();
                console.log('SignalR connection stopped');
                this.isConnected.set(false);
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

    async getOnlineStatus(userIds: string[]) {
        if (!this.hubConnection ||
            this.hubConnection.state !== signalR.HubConnectionState.Connected) {
            console.warn(
                'Cannot get online users status. SignalR state:',
                this.hubConnection?.state ?? 'not initialized'
            );
            return;
        }

        try {
            await this.hubConnection.invoke('GetOnlineStatus', userIds);
        } catch (error) {
            console.error('Failed to get online user status:', error)
        }

    }


    private registerHubEvents(): void {
        this.hubConnection.on('ReceiveCallerConnected', () => {
            this.toastService.success('Connected');
        });

        this.hubConnection.on('UserOnline', (userId) => {
            console.log(`User with id '${userId}' is now online.`);
            this._onlineUsersSignal.update(users => {
                const updated = new Set(users);

                updated.add(userId);

                return updated;
            });
        });

        this.hubConnection.on('UserOffline', (userId) => {
            console.log(`User with id '${userId}' is now online.`);
            this._onlineUsersSignal.update(users => {

                const updated = new Set(users);

                updated.delete(userId);

                return updated;
            });
        });


        this.hubConnection.on('OnlineStatus', statuses => {
            console.log(`Online status: ${statuses}`);

            this._onlineUsersSignal.update(users => {
                const updated = new Set(users);

                for (const [userId, isOnline] of Object.entries(statuses)) {

                    if (isOnline) {
                        updated.add(userId);
                    } else {
                        updated.delete(userId);
                    }
                }

                return updated;
            });

        });

    }

    isUserOnline(userId: string): boolean {
        return this._onlineUsersSignal().has(userId);
    }
}