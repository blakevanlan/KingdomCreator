import Vue from "vue";
import EnlargeButtonComponent from "./components/enlarge-button.vue";
import PageComponent, { MenuItemType } from "./components/page.vue";
import RandomizerComponent from "./components/randomizer.vue";
import { store } from "./stores/index-store";
import { initializeWindowListener } from "./setup";

const SUBTITLE = "Dominion card picker for desktop and mobile"

initializeWindowListener(store);
new Vue({
  el: "#app",
  template: `
  <div>
    <page-component :subtitle="subtitle" :selectedType="selectedType">
      <randomizer-component @specify-replacement="showReplaceModal = true" />
    </page-component>
    <enlarge-button-component />
  </div>
  `,
  store: store,
  data: {
    subtitle: SUBTITLE,
    selectedType: MenuItemType.RANDOMIZER,
  },
  components: {
    "page-component": PageComponent,
    "randomizer-component": RandomizerComponent,
    "enlarge-button-component": EnlargeButtonComponent,
  },
});