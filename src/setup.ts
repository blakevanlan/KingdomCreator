import { UPDATE_WINDOW_WIDTH } from "./stores/window/mutation-types";
import { Store } from "vuex";

export function initializeWindowListener<S>(store: Store<S>) {
  window.addEventListener("resize", () => {
    updateWindowSize(store);
  });
  updateWindowSize(store);
}

function updateWindowSize<S>(store: Store<S>) {
  console.log("width=", window.outerWidth);
  store.commit(UPDATE_WINDOW_WIDTH, window.outerWidth);
}
