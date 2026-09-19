import { computed, Injectable, signal } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

export type LanguageCode = 'en' | 'ar' | 'fr';
export type Language = { code: string, name: string, flag: string };
export const availableLanguages: Language[] = [
    {
        code: 'en',
        name: 'English',
        flag: '🇬🇧'
    },
    {
        code: 'ar',
        name: 'العربية',
        flag: '🇪🇬'
    },
    {
        code: 'fr',
        name: 'Français',
        flag: '🇫🇷'
    }
];

@Injectable({ providedIn: 'root' })
export class LanguageService {
    private readonly _currentLanguageSignal = signal<LanguageCode>(
        this.getInitialLanguage());

    readonly currentSelectedLang = this._currentLanguageSignal.asReadonly();
    readonly isRtl = computed(() => this._currentLanguageSignal() === 'ar');

    constructor(private readonly _translateService: TranslateService) {
        this._translateService.addLangs(['en', 'ar', 'fr']);
        this.setLanguage(this._currentLanguageSignal());
    }

    setLanguage(language: LanguageCode) {
        console.log('current selected: ', language);
        this._currentLanguageSignal.set(language);

        localStorage.setItem('lang', language);
        this._translateService.use(language);

        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }

    getInitialLanguage(): LanguageCode {
        const language = localStorage.getItem('lang');
        if (!language) {
            return 'en';
        }

        if (this.isSupportedLanguage(language)) {
            return language as LanguageCode;
        }

        return 'en';
    }
    isSupportedLanguage(language: string | null) {
        if (!language)
            return false;

        return (
            language === 'en' ||
            language === 'ar' ||
            language === 'fr'
        );

    }

}