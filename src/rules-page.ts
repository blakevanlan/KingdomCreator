import Vue from "vue";
import Page, { MenuItemType } from "./components/Page.vue";
import Rulebooks from "./components/Rulebooks.vue";
import { initializeWindowListener } from "./setup";
import { store } from "./stores/sets-store";

const SUBTITLE = "Original rule books of Dominion Sets";

initializeWindowListener(store);
new Vue({
  el: "#app",
  template: `
  <Page :subtitle="subtitle" :selectedType="selectedType">
      <div class="content main">
      <Rulebooks />
    </div>
  </Page>
  `,
  store: store,
  data: {
    selectedType: MenuItemType.RULES,
    subtitle: SUBTITLE
  },
  components: {
    Page,
    Rulebooks
  }
});