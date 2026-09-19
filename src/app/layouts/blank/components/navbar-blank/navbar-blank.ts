import { Component, inject, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../../../core/services/language.service';
import { LanguageSwitcher } from '../../../../shared/components/language-switcher/language-switcher';

@Component({
  imports: [LanguageSwitcher, TranslatePipe],
  selector: 'app-navbar-blank',
  styleUrl: './navbar-blank.css',
  templateUrl: './navbar-blank.html',
})
export class NavbarBlank {
  readonly isRtl = inject(LanguageService).isRtl;
  logoutEvent = output<void>();

  logout() {
    this.logoutEvent.emit();
  }
}
