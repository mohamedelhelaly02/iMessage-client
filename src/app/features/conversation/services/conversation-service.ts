import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Service, signal, WritableSignal } from '@angular/core';
import { IConversation } from '../models/conversation';
import { Observable, tap } from 'rxjs';

@Service()
export class ConversationService {

    selectedConversationId: WritableSignal<string> = signal<string>('');

    private _conversations: WritableSignal<IConversation[]> = signal<IConversation[]>([]);

    readonly conversations = this._conversations.asReadonly();

    private readonly BASE_URL: string = 'https://localhost:7116/api/conversations';
    private readonly httpClient = inject(HttpClient);

    private readonly headers = new HttpHeaders()
        .set('Content-Type', 'application/json');



    getConversations(): Observable<IConversation[]> {
        return this.httpClient.get<IConversation[]>(this.BASE_URL, {
            headers: this.headers
        })
            .pipe(tap((response) => {
                this._conversations.set(response);
                console.log(this.conversations())
            }));
    }
}
