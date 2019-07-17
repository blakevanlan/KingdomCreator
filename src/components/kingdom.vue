<template>
  <div class="main">
    <div class="kingdom-supply" :class=[columnClass]>
      <div class="kingdom-supply_card" v-for="(supplyCard, index) in kingdom.supply.supplyCards"
          :key=index>
        <card-component :card="supplyCard" :is-vertical="false" />
      </div>
      <div class="clear"></div>
    </div>
    <div class="addons-header" v-if="hasAddons">
      {{ addonSummary }}  
    </div>
    <div class="addons">
      <div class="kingdom-addon_card" v-for="addon in addons">
        <card-component :card="addon" :is-vertical="false" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import CardComponent from "./card.vue";
import { Addon } from "../dominion/addon";
import { State, Getter } from "vuex-class";
import { Vue, Component } from "vue-property-decorator";
import { getCardImageUrl } from "../utils/images";
import { Kingdom } from "../models/kingdom";

@Component
export default class KingdomComponent extends Vue {
  constructor() {
    super({components: {"card-component": CardComponent}});
  }
  @State(state => state.randomizer.kingdom) readonly kingdom!: Kingdom;
  @Getter("addons") readonly addons!: Addon[];
  @Getter("hasAddons") readonly hasAddons!: boolean;
  @Getter("addonSummary") readonly addonSummary!: string;

  get columnClass() {
    return "five-columns"
  }

  getCardImageUrl = getCardImageUrl;
}
Vue.component("kingdom-component", KingdomComponent);
</script>