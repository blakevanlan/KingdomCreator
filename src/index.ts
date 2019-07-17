import Vue from "vue";
import PageComponent, { MenuItemType } from "./components/page.vue";
import RandomizerComponent from "./components/randomizer.vue";
import { store } from "./stores/index-store";
import { initializeWindowListener } from "./setup";

const SUBTITLE = "Dominion card picker for desktop and mobile"

initializeWindowListener(store);
new Vue({
  el: "#app",
  template: `
  <page-component :subtitle="subtitle" :selectedType="selectedType">
    <randomizer-component />
  </page-component>
  `,
  store: store,
  data: {
    subtitle: SUBTITLE,
    selectedType: MenuItemType.RANDOMIZER
  },
  computed: {
  },
  components: {
    "page-component": PageComponent,
    "randomizer-component": RandomizerComponent,
  }
});