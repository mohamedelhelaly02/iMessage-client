import { Component, inject } from '@angular/core';
import { ChatHeader } from './chat-header/chat-header';
import { Messages } from './messages/messages';
import { Composer } from './composer/composer';
import { ConversationService } from '../../services/conversation-service';
import { IConversation } from '../../models/conversation';

@Component({
  imports: [ChatHeader, Messages, Composer],
  selector: 'app-chat-main',
  styleUrl: './chat-main.css',
  templateUrl: './chat-main.html',
})
export class ChatMain {
  private readonly conversationService = inject(ConversationService);
  conversations = this.conversationService.conversations();
  selectedConversationId = this.conversationService.selectedConversationId();

  getSelectedConversation(): IConversation | undefined {
    return this.conversations.find(c => c.id === this.selectedConversationId);
  }

}
