import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject, Service, signal, WritableSignal } from '@angular/core';
import { IConversation } from '../models/conversation';
import { Observable, tap } from 'rxjs';

@Service()
export class ConversationService {
    private readonly BASE_URL: string = 'https://localhost:7116/api/conversations';
    private readonly httpClient = inject(HttpClient);
    private readonly headers = new HttpHeaders()
        .set('Content-Type', 'application/json');


    private _conversations: WritableSignal<IConversation[]> = signal<IConversation[]>([]);
    private selectedConversationId: WritableSignal<string> = signal<string>('');

    currentSelectedConversation = computed(() => {
        return this._conversations().find(c => c.id === this.selectedConversationId());
    });

    readonly conversations = this._conversations.asReadonly();

    getConversations(): Observable<IConversation[]> {
        return this.httpClient.get<IConversation[]>(this.BASE_URL, {
            headers: this.headers
        })
            .pipe(tap((response) => {
                this._conversations.set(response);
            }));
    }


    resetConversationState(): void {
        this.selectedConversationId.set('');
    }

    selectConversation(id: string) {
        this.selectedConversationId.set(id);
        this.loadConversationMessages(id);
    }

    private loadConversationMessages(id: string) {
        this.httpClient.get(`${this.BASE_URL}/${id}/messages`, {
            headers: this.headers
        }).pipe(tap((response) => { }))
    }
}
