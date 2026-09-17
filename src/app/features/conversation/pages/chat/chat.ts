import { Component, inject } from '@angular/core';
import { NoSelectedChat } from '../../components/no-selected-chat/no-selected-chat';
import { ChatMain } from '../../components/chat-main/chat-main';
import { Sidebar } from '../../components/sidebar/sidebar';
import { ConversationService } from '../../services/conversation-service';

@Component({
  imports: [Sidebar, ChatMain, NoSelectedChat],
  selector: 'app-chat',
  styleUrl: './chat.css',
  templateUrl: './chat.html',
})
export class Chat {
  private readonly conversationService = inject(ConversationService);

  selectedConversation = this.conversationService.currentSelectedConversation;

}
