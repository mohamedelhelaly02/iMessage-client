import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSwitcher } from '../../../../shared/components/language-switcher/language-switcher';

@Component({
  imports: [TranslatePipe, LanguageSwitcher],
  selector: 'app-auth-navbar',
  styleUrl: './auth-navbar.css',
  templateUrl: './auth-navbar.html',
})
export class AuthNavbar {
}
