<template>
  <div class="content">
    <randomizer-sidebar-component @randomize="handleRandomize" />
    <kingdom-component />
  </div>
</template>

<script lang="ts">
import KingdomComponent from "./kingdom.vue";
import RandomizerSidebarComponent from "./randomizer-sidebar.vue";
import { Getter, State } from "vuex-class";
import { Vue, Component } from "vue-property-decorator";
import { Settings} from "../settings/settings";
import { RandomizerSettings } from "../settings/randomizer-settings";
import { LOAD_INITIAL_KINGDOM, RANDOMIZE } from "../stores/randomizer/action-types";

@Component
export default class Randomizer extends Vue {
  constructor() {
    super({
      components: {
        "kingdom-component": KingdomComponent,
        "randomizer-sidebar-component": RandomizerSidebarComponent,
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