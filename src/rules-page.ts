import Vue from "vue";
import Rules from "./views/Rules.vue"
import { initializeWindowListener } from "./setup";
import { store } from "./stores/sets-store";

initializeWindowListener(store);
new Vue({
  store,
  render: h => h(Rules)
}).$mount("#app");
