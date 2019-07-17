import Vue from "vue";
import Vuex from "vuex";
import { windowStore, State as WindowState } from "./window/window-store";
import { randomizerStore, State as RandomizerState } from "./randomizer/randomizer-store";

Vue.use(Vuex);

export interface State {
  window: WindowState;
  randomizer: RandomizerState;
}

export const store = new Vuex.Store({
  state: {
  } as State,
  mutations: {
  },
  modules: {
    randomizer: randomizerStore,
    window: windowStore,
  }
});
