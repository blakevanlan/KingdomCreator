import { Language, getLanguage } from "../../i18n/language";
import * as Cookie from "js-cookie";

export interface SettingsParams {
  language: Language
}

export class Settings implements SettingsParams {
  constructor(readonly language: Language) {}

  save() {
    Cookie.set("i18n", this, {expires: 365});
  }

  static load(): Settings {
    try {
      const data = Cookie.getJSON("i18n") || {};
      return this.createFromObject(data);
    } catch (e) {
      console.error("Failed to load i18n settings: ", e);
      return this.createFromObject({});
    }
  }

  static createFromObject(data: any) {
    return new Settings(data.language || this.attemptToDetectLanguage());
  }

  static attemptToDetectLanguage(): Language {
    if (!window.navigator || !window.navigator.language) {
      return Language.ENGLISH;
    }
    return window.navigator && window.navigator.language
      ? getLanguage(window.navigator.language)
      : Language.ENGLISH;
  }
}
