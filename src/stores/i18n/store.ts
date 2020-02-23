import { Language } from "../../i18n/language"
import { I18n } from "../../i18n/i18n";
import { Settings } from "./settings";
import { actions } from "./actions";

export interface State {
  language: Language;
}

export const store = {
  state: {
    language: Language.ENGLISH,
  } as State,
  actions,
  mutations: {
    SET_LANGUAGE (state: State, language: Language) {
      I18n.setLanguage(language);
      state.language = language;
      new Settings(language).save();
    }
  }
};
