import { UPDATE_SELECTED_SET } from "./stores/window/mutation-types";
import { Store } from "vuex";

export function initializeWindowListener<S>(store: Store<S>) {
  window.addEventListener("resize", () => {
    updateWindowSize(store);
  });
  updateWindowSize(store);
}

function updateWindowSize<S>(store: Store<S>) {
  store.commit(UPDATE_SELECTED_SET, window.outerWidth);
}
