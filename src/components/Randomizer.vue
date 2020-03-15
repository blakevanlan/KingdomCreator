<template>
  <div class="content">
    <RandomizerSidebar @randomize="handleRandomize" />
    <div class="main">
      <SortableSupplyCards />
      <Addons />
      <Boons />
      <Modifiers />
    </div>
  </div>
</template>

<script lang="ts">
import Addons from "./Addons.vue";
import Boons from "./Boons.vue";
import SortableSupplyCards from "./SortableSupplyCards.vue";
import RandomizerSidebar from "./RandomizerSidebar.vue";
import { Getter, State } from "vuex-class";
import { Vue, Component, Watch } from "vue-property-decorator";
import { Settings} from "../settings/settings";
import { RandomizerSettings } from "../settings/randomizer-settings";
import { LOAD_INITIAL_KINGDOM, RANDOMIZE } from "../stores/randomizer/action-types";
import { deserializeKingdom, serializeKingdom } from "../randomizer/serializer";
import Modifiers from "./Modifiers.vue";
import { Kingdom } from "../randomizer/kingdom";

@Component({
  components: {
    Addons,
    Boons,
    Modifiers,
    RandomizerSidebar,
    SortableSupplyCards,
  }
})
export default class Randomizer extends Vue {
  @Getter("isCondensed") readonly isCondensed!: boolean;
  @State(state => state.randomizer.kingdom) readonly kingdom!: Kingdom;
  @State(state => state.randomizer.settings) readonly settings!: Settings;
  @State(state => state.randomizer.settings.randomizerSettings)
      readonly randomizerSettings!: RandomizerSettings;

  mounted() {
    const kingdomFromUrl = deserializeKingdom(this.$route.query);
    this.$store.dispatch(LOAD_INITIAL_KINGDOM, kingdomFromUrl);
  }

  handleRandomize() {
    this.$store.dispatch(RANDOMIZE);
  }

  @Watch("kingdom")
  onKingdomChanged() {
    const query = {
      ...this.$route.query,
      ...serializeKingdom(this.kingdom)
    };
    if (!this.isEqual(this.$route.query, query)) {
      this.$router.replace({query});
    }
  }

  isEqual(a: any, b: any) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length != keysB.length) {
      return false;
    }
    for (let key of keysA) {
      if (a[key] != b[key]) {
        return false;
      }
    }
    return true;
  }
}
</script>