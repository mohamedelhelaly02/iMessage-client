import { Component, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../core/services/language.service';
import { UpperCasePipe } from '@angular/common';

@Component({
  imports: [FormsModule, UpperCasePipe],
  selector: 'app-language-switcher',
  styleUrl: './language-switcher.css',
  templateUrl: './language-switcher.html',
})
export class LanguageSwitcher {
  isOpen = signal<boolean>(false);
  private readonly _languageService = inject(LanguageService);
  readonly languages = this._languageService.languages;
  readonly selectedLanguage = this._languageService.currentSelectedLang;

  toggleOpen(event: Event): void {
    event.stopPropagation();
    this.isOpen.update((v) => !v);
  }

  selectLanguage(lang: any) {
    console.log("Selecting language: ", lang);

    this._languageService.setLanguage(lang);
  }

  @HostListener('document:click')
  closeOnOutsideClick(): void {
    this.isOpen.set(false);
  }
}
