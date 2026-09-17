import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ConversationService } from '../../../services/conversation-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IConversation } from '../../../models/conversation';
import { AuthStateService } from '../../../../../core/auth/auth-state-service';
import { SignalRService } from '../../../../../core/hub/signalR-service';

const AVATAR_COLORS = [
  'avatar--purple',
  'avatar--blue',
  'avatar--green',
  'avatar--orange',
  'avatar--pink',
  'avatar--teal',
];

@Component({
  imports: [],
  selector: 'app-chat-list',
  styleUrl: './chat-list.css',
  templateUrl: './chat-list.html',
})
export class ChatList implements OnInit {

  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly conversationService = inject(ConversationService);
  private readonly authStateService = inject(AuthStateService);
  readonly signalRService = inject(SignalRService);

  readonly currentUser = this.authStateService.currentUser();

  conversations = this.conversationService.conversations;

  ngOnInit() {
    this.conversationService.getConversations()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.signalRService.isConnected()) {
          this.loadOnlineStatus();
        }
      });
  }

  private async loadOnlineStatus(): Promise<void> {
    const userIds = this.conversations()
      .map(conv =>
        this.getOtherParticipant(conv)?.userId
      )
      .filter(
        (userId): userId is string => !!userId
      );

    if (userIds.length === 0)
      return;

    await this.signalRService.getOnlineStatus(userIds);
  }


  getAvatarColorClass(conversation: IConversation) {
    const seed = this.isGroup(conversation)
      ? conversation.id
      : this.getOtherParticipant(conversation)?.userId ?? conversation.id;

    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }

  formatTime(dateString: string | null): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  }

  getDisplayName(conversation: IConversation) {
    if (conversation.conversationType === "Group") {
      return conversation.title ?? "مجموعة بدون اسم";
    }

    return this.getOtherParticipant(conversation)?.displayName;
  }

  getOtherParticipant(conversation: IConversation) {
    return conversation.participants.find(p => p.userId !== this.currentUser?.id);
  }

  getAvatarInitial(conversation: IConversation) {
    const name = this.getDisplayName(conversation)?.trim() ?? '';
    return name.length > 0 ? name?.charAt(0).toUpperCase() : '؟';
  }
  isGroup(conversation: IConversation) {
    return conversation.conversationType === "Group";
  }

  selectConversation(id: string) {
    console.log(`Selected Conversation: ${id}`);
    this.conversationService.selectConversation(id);
  }

  isUserOnline(conversation: IConversation) {
    var otherParticipant = this.getOtherParticipant(conversation);
    if (!otherParticipant)
      return;

    return this.signalRService.isUserOnline(otherParticipant.userId);
  }
}
