import Vue from "vue";
import PageComponent, { MenuItemType } from "./components/page.vue";
import PresetRulesComponent from "./components/preset-rules.vue";
import { store } from "./stores/sets-store";
import { initializeWindowListener } from "./setup";

const SUBTITLE = "Original rule books of Dominion Sets";

initializeWindowListener(store);

new Vue({
  el: "#app",
  template: `
  <page-component :subtitle="subtitle" :selectedType="selectedType">
  <div class="content">
	  <preset-rules-component />
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
	"preset-rules-component": PresetRulesComponent,
  }
});