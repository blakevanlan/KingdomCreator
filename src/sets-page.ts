import Vue from "vue";
import Sets from "./views/Sets.vue"
import { store } from "./stores/sets-store";
import { initializeWindowListener } from "./setup";

initializeWindowListener(store);
new Vue({
  store,
  render: h => h(Sets)
}).$mount("#app");
