import Vue from "vue";
import Vuex from "vuex";
import { SetId } from "../dominion/set-id";
import { windowStore, State as WindowStoreState } from "./window/window-store";

Vue.use(Vuex);

export interface State {
  selectedSetId: SetId;
  window: WindowStoreState;
}

export const store = new Vuex.Store({
  state: {
    selectedSetId: SetId.BASE_SET
  } as State,
  mutations: {
    UPDATE_SELECTED_SET (state: State, setId: SetId) {
      state.selectedSetId = setId;
    }
  },
  modules: {
    window: windowStore,
  }
});
