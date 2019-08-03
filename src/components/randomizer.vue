<template>
  <div class="content">
    <randomizer-sidebar-component @randomize="handleRandomize" />
    <div class="main">
      <sortable-supply-cards-component />
      <addons-component />
      <modifiers-component />
    </div>
  </div>
</template>

<script lang="ts">
import AddonsComponent from "./addons.vue";
import SortableSupplyCardsComponent from "./sortable-supply-cards.vue";
import RandomizerSidebarComponent from "./randomizer-sidebar.vue";
import { Getter, State } from "vuex-class";
import { Vue, Component } from "vue-property-decorator";
import { Settings} from "../settings/settings";
import { RandomizerSettings } from "../settings/randomizer-settings";
import { LOAD_INITIAL_KINGDOM, RANDOMIZE } from "../stores/randomizer/action-types";
import ModifiersComponent from "./modifiers.vue";

@Component
export default class Randomizer extends Vue {
  constructor() {
    super({
      components: {
        "addons-component": AddonsComponent,
        "modifiers-component": ModifiersComponent,
        "randomizer-sidebar-component": RandomizerSidebarComponent,
        "sortable-supply-cards-component": SortableSupplyCardsComponent,
      }
    });
  }

  @Getter("isCondensed") readonly isCondensed!: boolean;
  @State(state => state.randomizer.settings) readonly settings!: Settings;
  @State(state => state.randomizer.settings.randomizerSettings)
      readonly randomizerSettings!: RandomizerSettings;

  mounted() {
    this.$store.dispatch(LOAD_INITIAL_KINGDOM);
  }

  handleRandomize() {
    this.$store.dispatch(RANDOMIZE);
  }
}
</script>