import { Component, inject } from '@angular/core';
import { LanguageCode, LanguageService, availableLanguages } from '../../../core/services/language.service';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  selector: 'app-language-switcher',
  styleUrl: './language-switcher.css',
  templateUrl: './language-switcher.html',
})
export class LanguageSwitcher {
  private readonly _languageService = inject(LanguageService);

  readonly currentLanguage = this._languageService.currentSelectedLang;

  readonly languages = availableLanguages;

  onLanguageChange(language: LanguageCode) {
    this._languageService.setLanguage(language);
  }

}
