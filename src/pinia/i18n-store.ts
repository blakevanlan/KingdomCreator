import { defineStore } from 'pinia';
import { Language } from '../i18n/language';
import { i18n, setI18nLanguage, loadLocaleMessages, getLocale } from '../i18n/i18n';
import type { I18n } from 'vue-i18n';

export const usei18nStore = defineStore(
  'i18nStore',
  {
    state: () => ({
      language: Language.ENGLISH,
    }),
    persist: true,
    actions: {
      async LOAD_DEFAULT_LANGUAGE() {
        //console.log("LOAD_DEFAULT_LANGUAGE")
        return this.UPDATE_LANGUAGE(Language.ENGLISH);
      },
      async UPDATE_LANGUAGE(language: Language) {
        //console.log("UPDATE_LANGUAGE")
        this.SET_LANGUAGE(language);
        loadLocaleMessages(i18n as I18n, language);
      },
      SET_LANGUAGE (language: Language) {
        //console.log("SET_LANGUAGE")
        setI18nLanguage(i18n as I18n, language);
        //setLocale(i18n as I18n, language);
        this.language = language;
      },
    },
  }
);