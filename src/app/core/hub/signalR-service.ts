import { Service, inject, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { AuthStateService } from '../auth/auth-state-service';
import { ToastService } from '../../shared/services/toast-service';
import { IUser } from '../../features/auth/models/user';

export interface IUserPresenceDto {
    isOnline: boolean,
    user: IUser
}

@Service()
export class SignalRService {
    isConnected = signal<boolean>(false);
    private hubConnection!: signalR.HubConnection;
    private readonly HUB_URL: string = 'https://localhost:7116/hubs/chat';
    private readonly authStateService = inject(AuthStateService);
    private readonly toastService = inject(ToastService);

    private readonly _onlineUsersSignal = signal<Set<IUser>>(new Set());

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

        this.hubConnection.on('UserOnline', (user: IUser) => {
            console.log(`User with id '${user.id}' is now online.`);
            this._onlineUsersSignal.update(users =>
                new Set([
                    ...[...users].filter(onlineUser => onlineUser.id !== user.id),
                    user,
                ])
            );
        });

        this.hubConnection.on('UserOffline', (user: IUser) => {
            console.log(`User with id '${user.id}' is now offline.`);
            this._onlineUsersSignal.update(users =>
                new Set([...users].filter(onlineUser => onlineUser.id !== user.id))
            );
        });


        this.hubConnection.on('OnlineStatus', (onlineStatus: IUserPresenceDto[]) => {
            console.log('Online status:', onlineStatus);

            this._onlineUsersSignal.update(users => {
                const requestedUserIds = new Set(
                    onlineStatus.map(status => status.user.id));

                const updated = new Set(
                    [...users].filter(user => !requestedUserIds.has(user.id)));

                onlineStatus
                    .filter(status => status.isOnline)
                    .forEach(status => updated.add(status.user));

                return updated;
            });
        });

    }

    isUserOnline(userId: string): boolean {
        return [...this._onlineUsersSignal()].some(
            onlineUser => onlineUser.id === userId
        );
    }
}
