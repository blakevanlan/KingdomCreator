import Vue from "vue";
import Index from "./views/Index.vue";
import { store } from "./stores/index-store";
import { initializeWindowListener } from "./setup";

initializeWindowListener(store);
new Vue({
  store,
  render: h => h(Index)
}).$mount("#app");
