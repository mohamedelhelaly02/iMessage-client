import { Component, inject, signal } from '@angular/core';
import { ChatHeader } from './chat-header/chat-header';
import { Messages } from './messages/messages';
import { Composer } from './composer/composer';
import { ConversationService } from '../../services/conversation-service';
import { SignalRService } from '../../../../core/hub/signalR-service';
import { AuthStateService } from '../../../../core/services/auth-state-service';

@Component({
  imports: [ChatHeader, Messages, Composer],
  selector: 'app-chat-main',
  styleUrl: './chat-main.css',
  templateUrl: './chat-main.html',
})
export class ChatMain {
  private _isTyping = signal<boolean>(false);
  private _typingTimeout: any;
  private readonly _conversationService = inject(ConversationService);
  private readonly _signalRService = inject(SignalRService);
  private readonly _authStateService = inject(AuthStateService);

  selectedConversation = this._conversationService.currentSelectedConversation;

  onMessageSend(message: string) {
  }
  async onUserTyping() {
    const conversationId = this.selectedConversation()?.id;
    if (!conversationId)
      return;

    if (!this._isTyping()) {
      this._isTyping.set(true);

      await this._signalRService.startTyping(conversationId);
      await this._signalRService.startConversationTyping(conversationId);
    }

    this.resetTypingTimeout(conversationId);

  }
  resetTypingTimeout(conversationId: string) {
    if (this._typingTimeout) {
      clearTimeout(this._typingTimeout);
    }

    this._typingTimeout = setTimeout(() => {
      this.stopTyping(conversationId);
      this.stopConversationTyping(conversationId);
    }, 1000);
  }

  private stopTyping(conversationId: string) {
    this._signalRService.stopTyping(conversationId);
  }

  private stopConversationTyping(conversationId: string): void {
    if (!this._isTyping())
      return;
    this._isTyping.set(false);
    this._signalRService.stopConversationTyping(conversationId);
  }

  isOtherUserTyping(): boolean {
    const conversation = this.selectedConversation();
    if (!conversation) {
      return false;
    }
    const otherParticipant = conversation
      ?.participants.find(
        p => p.userId != this._authStateService.currentUser()?.id);

    if (!otherParticipant) {
      return false;
    }

    return this._signalRService.isUserTyping(conversation.id, otherParticipant.userId);

  }

}
