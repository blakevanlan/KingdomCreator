<template>
  <div class="kingdom">
    <div class="kingdom-title">
      <div class="kingdom-title_name">{{kingdom.name}}</div>
      <div class="kingdom-title_sets" v-for="set in sets">
        <span class="set-name" :class="[set.setId]">{{set.name}}</span>
      </div>
    </div>

    <div class="kingdom-metadata" v-if="hasMetadata">
      <div class="kingdom-metadata_use-platinums-and-colonies"
          v-if="kingdom.metadata.useColonies">
        Use Platinums/Colonies
      </div>
      <div class="kingdom-metadata_use-shelters"
          v-if="kingdom.metadata.useShelters">
        Use Shelters
      </div>
    </div>

    <div class="kingdom-supply" :class=[columnClass]>
      <div class="kingdom-supply_card" v-for="supplyCardId in kingdom.supplyIds">
        <img class="kingdom-supply_card-image" :src="getCardImageUrl(supplyCardId)" />
      </div>
      <div class="clear"></div>
    </div>

    <div class="kingdom-extra-cards-horizontal" v-if="titleForAddons.length">
      <div class="kingdom-extra-cards-horizontal_title">
        {{titleForAddons}}
      </div>
      <div class="kingdom-extra-cards-horizontal_cards" v-for="addonId in addonIds">
        <img class="kingdom-extra-cards-horizontal_image" :src="getCardImageUrl(addonId)" />
      </div>
      <div class="clear"></div>
    </div>
        
    <div class="kingdom-extra-cards-horizontal" v-if="kingdom.boonIds.length">
      <div class="kingdom-extra-cards-horizontal_title">Boons</div>
      <div class="kingdom-extra-cards-horizontal_cards" v-for="boonId in kingdom.boonIds">
        <img class="kingdom-extra-cards-horizontal_image" :src="getCardImageUrl(boonId)" />
      </div>
      <div class="clear"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { DominionKingdom } from "../dominion/dominion-kingdom";
import { DominionSets } from "../dominion/dominion-sets";
import { State } from "vuex-class";
import { Vue, Component, Prop } from "vue-property-decorator";
import { getCardImageUrl } from "../utils/images";
import { getMessageForAddonsDescription } from "../utils/messages";

const FOUR_COLUMN_WIDTH = 450;

@Component
export default class PresetKingdom extends Vue {
  @Prop() readonly kingdom!: DominionKingdom;
  @State(state => state.window.width) windowWidth!: number;
  
  get sets() {
    return this.kingdom.setIds.map(DominionSets.getSetById);
  }

  get columnClass() {
    return this.windowWidth <= FOUR_COLUMN_WIDTH ? "four-columns" : "five-columns";
  }

  get titleForAddons() {
    const hasEvents = this.kingdom.eventIds.length > 0;
    const hasLandmarks = this.kingdom.landmarkIds.length > 0;
    const hasProjects = this.kingdom.projectIds.length > 0;
    return getMessageForAddonsDescription(hasEvents, hasLandmarks, hasProjects);
  }

  get addonIds() {
    return this.kingdom.eventIds.concat(
        this.kingdom.landmarkIds, this.kingdom.projectIds);
  }

  get hasMetadata() {
    return this.kingdom.metadata.useColonies || this.kingdom.metadata.useShelters;
  }

  getCardImageUrl = getCardImageUrl;
}
</script>
