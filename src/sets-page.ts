import Vue from "vue";
import PageComponent, { MenuItemType } from "./components/page.vue";
import PresetKingdomComponent from "./components/preset-kingdom.vue";
import SetsSidebarComponent from "./components/sets-sidebar.vue";
import { DominionKingdoms } from "./dominion/dominion-kingdoms";
import { State, store } from "./stores/sets-store";
import { initializeWindowListener } from "./setup";

const SUBTITLE = "Recommended Sets of 10";

initializeWindowListener(store);
new Vue({
  el: "#app",
  template: `
  <page-component :subtitle="subtitle" :selectedType="selectedType">
    <div class="content">
      <sets-sidebar-component />
      <div class="main">
        <div class="sets-description">
          Players can play Dominion with any set of 10 Kingdom cards, but these sets have been
          specially picked out to be entertaining and show off card interactions and strategies.
        </div>
        <div class="kingdoms">
          <preset-kingdom-component v-for="kingdom in kingdoms" :key="kingdom.name" :kingdom="kingdom" />
        </div>
      </div>
    </div>
  </page-component>
  `,
  store: store,
  data: {
    subtitle: SUBTITLE,
    selectedType: MenuItemType.SETS
  },
  computed: {
    kingdoms: function() {
      const setId = (this.$store.state as State).selectedSetId;
      return DominionKingdoms.kingdoms[setId];
    }
  },
  components: {
    "page-component": PageComponent,
    "preset-kingdom-component": PresetKingdomComponent,
    "sets-sidebar-component": SetsSidebarComponent,
  }
});