import Vue from "vue";
import Vuex from "vuex";
import { windowStore, State as WindowState } from "./window/window-store";
import { randomizerStore, State as RandomizerState } from "./randomizer/randomizer-store";
import { store as i18nStore, State as I18nState } from "./i18n/store";

Vue.use(Vuex);

export interface State {
  window: WindowState;
  randomizer: RandomizerState;
  i18n: I18nState
}

export const store = new Vuex.Store({
  state: {
  } as State,
  modules: {
    randomizer: randomizerStore,
    window: windowStore,
    i18n: i18nStore,
  }
});
