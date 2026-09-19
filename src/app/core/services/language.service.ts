import { computed, Injectable, signal } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

interface ILanguage {
    code: string;
    name: string;
    flag: string
}

@Injectable({ providedIn: 'root' })
export class LanguageService {

    private readonly _languagesSignal = signal<ILanguage[]>([
        { code: 'ar', name: 'العربية', flag: '🇸🇦' },
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
    ]);

    readonly languages = this._languagesSignal.asReadonly();

    private readonly _currentLanguageSignal = signal<ILanguage>(
        this.getInitialLanguage());

    readonly currentSelectedLang = this._currentLanguageSignal.asReadonly();
    readonly isRtl = computed(() => this._currentLanguageSignal().code === 'ar');

    constructor(private readonly _translateService: TranslateService) {
        this._translateService.addLangs(['en', 'ar', 'fr']);
        this.setLanguage(this._currentLanguageSignal());
    }

    setLanguage(language: ILanguage) {
        this._currentLanguageSignal.set(language);

        localStorage.setItem('lang', JSON.stringify(language));
        this._translateService.use(language.code);

        document.documentElement.lang = language.code;
        document.documentElement.dir = language.code === 'ar' ? 'rtl' : 'ltr';
    }

    getInitialLanguage(): ILanguage {
        const storedLanguage = localStorage.getItem('lang');
        if (!storedLanguage)
            return this._languagesSignal()[0];

        try {
            const language = JSON.parse(storedLanguage) as ILanguage;
            console.log("Parsed lang: ", language);
            
            if (!this.isSupportedLanguage(language)) {
                return this._languagesSignal()[0];
            }

            return language;
        } catch (error) {
            return this._languagesSignal()[0];
        }
    }

    private isSupportedLanguage(language: ILanguage): boolean {
        return this._languagesSignal().some(l => l.code === language.code);
    }

}