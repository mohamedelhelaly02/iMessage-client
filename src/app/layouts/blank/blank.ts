import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from '../../shared/components/toast/toast';
import { NavbarBlank } from './components/navbar-blank/navbar-blank';
import { ConversationService } from '../../features/conversation/services/conversation-service';
import { LanguageService } from '../../core/services/language.service';
import { AuthStateService } from '../../core/services/auth-state-service';
@Component({
  imports: [RouterOutlet, Toast, NavbarBlank],
  selector: 'app-blank',
  styleUrl: './blank.css',
  templateUrl: './blank.html',
})
export class Blank {
  private readonly authStateService = inject(AuthStateService);
  private readonly conversationService = inject(ConversationService);
  readonly isRtl = inject(LanguageService).isRtl;

  async onLogout() {
    if (confirm('Are you sure to signout ?')) {
      this.authStateService.resetAuthState();
      this.conversationService.resetConversationState();
    }
  }
}