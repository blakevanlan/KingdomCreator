import { SET_LANGUAGE } from "./mutation-types";
import { UPDATE_LANGUAGE } from "./action-types";
import { State } from "./store";
import { ActionContext } from "vuex";
import { I18n } from "../../i18n/i18n"
import { Language } from "../../i18n/language";
import { Settings } from "./settings";

interface Context extends ActionContext<State, any> {}

export const actions = {
  async LOAD_DEFAULT_LANGUAGE(context: Context) {
    const settings = Settings.load();
    return context.dispatch(UPDATE_LANGUAGE, settings.language);
  },
  async UPDATE_LANGUAGE(context: Context, language: Language) {
    await I18n.loadLanguage(language);
    context.commit(SET_LANGUAGE, language);
  }
}
