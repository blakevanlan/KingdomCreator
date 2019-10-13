import Vue from "vue";
import PageComponent, { MenuItemType } from "./components/page.vue";
import RulebooksComponent from "./components/rulebooks.vue";
import { initializeWindowListener } from "./setup";
import { store } from "./stores/sets-store";

const SUBTITLE = "Original rule books of Dominion Sets";

initializeWindowListener(store);
new Vue({
  el: "#app",
  template: `
  <page-component :subtitle="subtitle" :selectedType="selectedType">
      <div class="content main">
      <rulebooks-component />
    </div>
  </page-component>
  `,
  store: store,
  data: {
    selectedType: MenuItemType.RULES,
    subtitle: SUBTITLE
  },
  components: {
    "page-component": PageComponent,
    "rulebooks-component": RulebooksComponent
  }
});