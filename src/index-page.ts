import Vue from "vue";
import EnlargeButton from "./components/EnlargeButton.vue";
import Page, { MenuItemType } from "./components/Page.vue";
import Randomizer from "./components/Randomizer.vue";
import ReplaceSupplyCardModal from "./components/ReplaceSupplyCardModal.vue"
import { store } from "./stores/index-store";
import { initializeWindowListener } from "./setup";

const SUBTITLE = "Dominion card picker for desktop and mobile"

initializeWindowListener(store);
new Vue({
  el: "#app",
  template: `
  <div>
    <ReplaceSupplyCardModal :key="this.$store.state.randomizer.kingdom.id" />
    <Page :subtitle="subtitle" :selectedType="selectedType">
      <Randomizer @specify-replacement="showReplaceModal = true" />
    </Page>
    <EnlargeButton />
  </div>
  `,
  store: store,
  data: {
    subtitle: SUBTITLE,
    selectedType: MenuItemType.RANDOMIZER,
  },
  components: {
    Page,
    Randomizer,
    ReplaceSupplyCardModal,
    EnlargeButton,
  },
});