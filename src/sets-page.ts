import Vue from "vue";
import Page, { MenuItemType } from "./components/Page.vue";
import PresetKingdom from "./components/PresetKingdom.vue";
import SetsSidebar from "./components/SetsSidebar.vue";
import { DominionKingdoms } from "./dominion/dominion-kingdoms";
import { State, store } from "./stores/sets-store";
import { initializeWindowListener } from "./setup";

const SUBTITLE = "Recommended Sets of 10";

initializeWindowListener(store);
new Vue({
  el: "#app",
  template: `
  <Page :subtitle="subtitle" :selectedType="selectedType">
    <div class="content">
      <SetsSidebar />
      <div class="main">
        <div class="sets-description">
          Players can play Dominion with any set of 10 Kingdom cards, but these sets have been
          specially picked out to be entertaining and show off card interactions and strategies.
        </div>
        <div class="kingdoms">
          <PresetKingdom v-for="kingdom in kingdoms" :key="kingdom.name" :kingdom="kingdom" />
        </div>
      </div>
    </div>
  </Page>
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
    Page,
    PresetKingdom,
    SetsSidebar,
  }
});