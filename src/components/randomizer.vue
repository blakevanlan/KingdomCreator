<template>
  <div class="content">
    <RandomizerSidebar @randomize="handleRandomize" />
    <div class="main">
      <SortableSupplyCards />
      <Addons />
      <Boons />
      <Modifiers />
      <AdBanner />
    </div>
  </div>
</template>

<script lang="ts">
import Addons from "./Addons.vue";
import Boons from "./boons.vue";
import SortableSupplyCards from "./SortableSupplyCards.vue";
import RandomizerSidebar from "./RandomizerSidebar.vue";
import { Getter, State } from "vuex-class";
import { Vue, Component } from "vue-property-decorator";
import { Settings} from "../settings/settings";
import { RandomizerSettings } from "../settings/randomizer-settings";
import { LOAD_INITIAL_KINGDOM, RANDOMIZE } from "../stores/randomizer/action-types";
import Modifiers from "./Modifiers.vue";
import AdBanner from "./AdBanner.vue";

@Component({
  components: {
    Addons,
    Boons,
    AdBanner,
    Modifiers,
    RandomizerSidebar,
    SortableSupplyCards,
  }
})
export default class Randomizer extends Vue {
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