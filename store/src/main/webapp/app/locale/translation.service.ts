import axios from 'axios';
import { type Composer } from 'vue-i18n';
import dayjs from 'dayjs';
import languages from '@/shared/config/languages';

export default class TranslationService {
  private i18n: Composer;
  private languages = languages();

  constructor(i18n: Composer) {
    this.i18n = i18n;
  }

  public loadTranslations({ currentLanguage, urlPrefix, hash }: { currentLanguage: string; urlPrefix: string; hash: string }) {
    if (!this.i18n) return;
    axios.get(`${urlPrefix}i18n/${currentLanguage}.json?_=${hash}`).then((res: any) => {
      if (res.data) {
        this.i18n.mergeLocaleMessage(currentLanguage, res.data);
      }
    });
  }

  public async refreshTranslation(newLanguage: string) {
    if (this.i18n && !this.i18n.messages[newLanguage]) {
      const res = await axios.get(`i18n/${newLanguage}.json?_=${I18N_HASH}`);
      this.i18n.setLocaleMessage(newLanguage, res.data);
    }
  }

  public setLocale(lang: string) {
    dayjs.locale(lang);
    this.i18n.locale.value = lang;
    axios.defaults.headers.common['Accept-Language'] = lang;
    document.querySelector('html').setAttribute('lang', lang);
  }

  public isLanguageSupported(lang: string) {
    return Boolean(this.languages[lang]);
  }

  public getLocalStoreLanguage(): string | null {
    return localStorage.getItem('currentLanguage');
  }
}
