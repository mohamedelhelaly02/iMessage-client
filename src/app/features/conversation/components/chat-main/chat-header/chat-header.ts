import { DatePipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
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
  imports: [DatePipe],
  selector: 'app-chat-header',
  styleUrl: './chat-header.css',
  templateUrl: './chat-header.html',
})
export class ChatHeader {
  private readonly authStateService = inject(AuthStateService);
  private readonly signalRService = inject(SignalRService);
  private currentUserId = this.authStateService.currentUser()?.id;

  conversation = input.required<IConversation | undefined>();

  isGroup(conversation: IConversation): boolean {
    return conversation.conversationType === 'Group';
  }

  private getOtherParticipant(conversation: IConversation) {
    return conversation.participants.find((p) => p.userId !== this.currentUserId);
  }

  getDisplayName(conversation: IConversation): string {
    if (this.isGroup(conversation)) {
      return conversation.title ?? 'مجموعة بدون اسم';
    }
    return this.getOtherParticipant(conversation)?.displayName ?? 'مستخدم محذوف';
  }

  getAvatarInitial(conversation: IConversation): string {
    const name = this.getDisplayName(conversation).trim();
    return name.length > 0 ? name.charAt(0).toUpperCase() : '؟';
  }

  getAvatarPictureUrl(conversation: IConversation): string | null {
    if (this.isGroup(conversation)) {
      return null;
    }
    return this.getOtherParticipant(conversation)?.pictureUrl ?? null;
  }

  getAvatarColorClass(conversation: IConversation): string {
    const seed = this.isGroup(conversation)
      ? conversation.id
      : this.getOtherParticipant(conversation)?.userId ?? conversation.id;

    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }

  getSubtitle(conversation: IConversation): string | null {
    if (!this.isGroup(conversation)) {
      return null;
    }

    const names = conversation.participants
      .filter((p) => p.userId !== this.currentUserId)
      .map((p) => p.displayName);

    if (names.length === 0) return null;
    if (names.length <= 2) return names.join('، ');

    return `${names.slice(0, 2).join('، ')} و${names.length - 2} آخرين`;
  }

  isUserOnline(conversation: IConversation) {
    var otherParticipant = this.getOtherParticipant(conversation);
    if (!otherParticipant)
      return;

    return this.signalRService.isUserOnline(otherParticipant.userId);
  }

  getLastSeenAtUtc(conversation: IConversation): string | null {
    return this.getOtherParticipant(conversation)?.lastSeenAtUtc ?? null;
  }
}
