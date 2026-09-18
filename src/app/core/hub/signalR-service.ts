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
    private readonly _typingUsers = signal<Map<string, Set<string>>>(new Map());

    readonly onlineUsers = this._onlineUsersSignal.asReadonly();
    readonly typingUsers = this._typingUsers.asReadonly();

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
            this.isConnected.set(false);
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

    async startTyping(conversatioId: string): Promise<void> {
        if (!this.isConnected())
            return;
        try {
            await this.hubConnection.invoke('StartTyping', conversatioId)
        } catch (error) {
            console.error(`Failed to start typing: ${error}`);
        }
    }

    async stopTyping(conversatioId: string): Promise<void> {
        if (!this.isConnected())
            return;
        try {
            await this.hubConnection.invoke('StopTyping', conversatioId)
        } catch (error) {
            console.error(`Failed to stop typing: ${error}`);
        }
    }


    async joinConversation(id: string): Promise<void> {
        try {
            await this.hubConnection.invoke('JoinConversation', id);
            console.log("successfully joined group: ", id);
        } catch (error) {
            console.error(`Can not join conversation: ${error}`)
        }
    }

    async leaveConversation(id: string): Promise<void> {
        try {
            await this.hubConnection.invoke('LeaveConversation', id);
        } catch (error) {
            console.error(`Can not leave conversation: ${error}`)
        }
    }


    isUserOnline(userId: string): boolean {
        return [...this._onlineUsersSignal()].some(
            onlineUser => onlineUser.id === userId
        );
    }

    isUserTyping(conversationId: string, userId: string): boolean {
        return this._typingUsers().get(conversationId)?.has(userId) ?? false;
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

        this.hubConnection.on('UserTyping', (conversationId, userId) => {

            if (!conversationId || !userId || userId === this.authStateService.currentUser()?.id) {
                return;
            }

            const wasTyping = this.isUserTyping(conversationId, userId);

            if (!wasTyping) {
                const typingPulse = new Audio('/assets/sounds/typing-sound.mp3');
                typingPulse.play().catch(() => { });
            }


            this._typingUsers.update(typingUsers => {
                const updatedTypingUsers = new Map(typingUsers);
                const typingUserIds = new Set(updatedTypingUsers.get(conversationId) ?? []);

                typingUserIds.add(userId);
                updatedTypingUsers.set(conversationId, typingUserIds);

                return updatedTypingUsers;
            });

        });

        this.hubConnection.on('UserStoppedTyping', (conversationId: string, userId: string) => {
            if (!conversationId || !userId || userId === this.authStateService.currentUser()?.id) {
                return;
            }

            this._typingUsers.update(typingUsers => {
                const updatedTypingUsers = new Map(typingUsers);
                const typingUserIds = new Set(updatedTypingUsers.get(conversationId) ?? []);

                typingUserIds.delete(userId);

                if (typingUserIds.size === 0) {
                    updatedTypingUsers.delete(conversationId);
                } else {
                    updatedTypingUsers.set(conversationId, typingUserIds);
                }

                return updatedTypingUsers;
            });
        });


        this.hubConnection.onreconnecting(error => {
            console.warn('SignalR reconnecting', error);
        });

        this.hubConnection.onreconnected(connectionId => {
            console.log('SignalR reconnected:', connectionId);
        });

        this.hubConnection.onclose(error => {
            console.error('SignalR closed', error);
        });

    }

}
