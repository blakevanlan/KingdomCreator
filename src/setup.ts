import Vue from "vue";
import VueRouter from "vue-router";
import { UPDATE_WINDOW_WIDTH } from "./stores/window/mutation-types";
import { Store } from "vuex";
import { I18n } from "./i18n/i18n";

export function initialize<S>(router: VueRouter, store: Store<S>) {
  initializeWindowListener(store);
  new Vue({
    store,
    router,
    i18n: I18n.getInstance(),
    template: "<router-view></router-view>"
  }).$mount("#app");
}

function initializeWindowListener<S>(store: Store<S>) {
  window.addEventListener("resize", () => {
    updateWindowSize(store);
  });
  updateWindowSize(store);
}

function updateWindowSize<S>(store: Store<S>) {
  store.commit(UPDATE_WINDOW_WIDTH, window.outerWidth);
}
