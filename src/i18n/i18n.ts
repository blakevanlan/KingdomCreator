import Vue from "vue"
import VueI18n from "vue-i18n"
import en from "./en";
import { Language } from "./language";

Vue.use(VueI18n);

export class I18n {
  private static readonly instance = new VueI18n({
    locale: Language.ENGLISH,
    fallbackLocale: Language.ENGLISH,
    messages: { en }
  });
  private static readonly loaded = new Set([Language.ENGLISH]);

  static getInstance(): VueI18n {
    return this.instance;
  }

  static async setLanguage(language: Language): Promise<any> {
    this.instance.locale = language;
    document.querySelector("html")!.setAttribute("lang", language);
  }

  static async loadLanguage(language: Language): Promise<any> {
    if (this.loaded.has(language)) {
      return Promise.resolve();
    }
    const { messages } = await import(/* webpackChunkName: "language-[request]" */ `./${language}.ts`);
    this.instance.setLocaleMessage(language, messages);
    this.loaded.add(language);
  }
}
