import Vue from "vue";
import PageComponent, { MenuItemType } from "./components/page.vue";
import RandomizerComponent from "./components/randomizer.vue";
import ReplaceSupplyCardModalComponent from "./components/replace-supply-card-modal.vue"
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
    <replace-supply-card-modal-component
      :key="this.$store.state.randomizer.kingdom.id"
      :show="showReplaceModal"
      @close="showReplaceModal = false"
    />
  </div>
  `,
  store: store,
  data: {
    subtitle: SUBTITLE,
    selectedType: MenuItemType.RANDOMIZER,
    showReplaceModal: false,
  },
  methods: {
    
  },
  components: {
    "page-component": PageComponent,
    "randomizer-component": RandomizerComponent,
    "replace-supply-card-modal-component": ReplaceSupplyCardModalComponent,
  },
});