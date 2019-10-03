<template>
  <div>
    <div class="preset-kingdom_title">
      <div class="preset-kingdom_title_name">{{kingdom.name}}</div>
      <div class="preset-kingdom_title_sets" v-for="set in sets" :key="set.setId">
        <span class="preset-kingdom_set-name" :class="[set.setId]">{{set.name}}</span>
      </div>
    </div>

    <div class="preset-kingdom_metadata" v-if="hasMetadata">
      <div class="preset-kingdom_metadata_use-platinums-and-colonies"
          v-if="kingdom.metadata.useColonies">
        Use Platinums/Colonies
      </div>
      <div class="preset-kingdom_metadata_use-shelters"
          v-if="kingdom.metadata.useShelters">
        Use Shelters
      </div>
    </div>

    <card-layout-component
      :items="getCards(kingdom.supplyIds)"
      :number-of-columns="numberOfColumnsForSupplyCards"
      :is-vertical="true"
    >
      <template v-slot:default="slotProps">
        <static-card-with-set-component :card="slotProps.item" />
      </template>
    </card-layout-component>

    <div v-if="titleForAddons.length">
      <div class="preset-kingdom__addon-title">
        {{titleForAddons}}
      </div>
      <card-layout-component
        :items="getCards(addonIds)"
        :number-of-columns="numberOfColumnsForAddons"
        :is-vertical="false"
      >
        <template v-slot:default="slotProps">
          <static-card-with-set-component :card="slotProps.item" />
        </template>
      </card-layout-component>
    </div>
        
    <div v-if="kingdom.boonIds.length">
      <div class="preset-kingdom__addon-title">Boons</div>
      <card-layout-component
        :items="getCards(kingdom.boonIds)"
        :number-of-columns="numberOfColumnsForAddons"
        :is-vertical="false"
      >
        <template v-slot:default="slotProps">
          <static-card-with-set-component :card="slotProps.item" />
        </template>
      </card-layout-component>
    </div>
  </div>
</template>

<script lang="ts">
import CardLayoutComponent from "./card-layout.vue";
import { DominionKingdom } from "../dominion/dominion-kingdom";
import { DominionSets } from "../dominion/dominion-sets";
import { State } from "vuex-class";
import { Vue, Component, Prop } from "vue-property-decorator";
//import { getCardImageUrl } from "../utils/images";
import { getMessageForAddonsDescription } from "../utils/messages";
import StaticCardWithSetComponent from "./static-card-with-set.vue";

const FOUR_COLUMN_SUPPLY_CARD_WIDTH = 450;
const TWO_COLUMN_ADDON_WIDTH = 525;

@Component
export default class PresetKingdom extends Vue {
  constructor() {
    super({
      components: {
        "card-layout-component": CardLayoutComponent,
        "static-card-with-set-component": StaticCardWithSetComponent,
      }
    });
  }
  @Prop() readonly kingdom!: DominionKingdom;
  @State(state => state.window.width) windowWidth!: number;
  
  get sets() {
    return this.kingdom.setIds.map(DominionSets.getSetById);
  }

  get numberOfColumnsForSupplyCards() {
    return this.windowWidth <= FOUR_COLUMN_SUPPLY_CARD_WIDTH ? 4 : 5;
  }

  get numberOfColumnsForAddons() {
    return this.windowWidth <= TWO_COLUMN_ADDON_WIDTH ? 2 : 3;
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

  getCards(cardIds: string[]) {
    return cardIds.map(DominionSets.getCardById);
  }

//  getCardImageUrl = getCardImageUrl;
}
</script>

<style>

.preset-kingdom_title {
  align-items: center;
  border-bottom: 1px solid #ccc;
  display:flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin: 24px 0 12px;
}

.preset-kingdom_title_name {
  color: #555;
  font-size: 36px;
  margin: 0 12px 0 0;
}

.preset-kingdom_title_sets {
  display: flex;
  flex-direction: row;
  margin: 2px 0;
}
 
.preset-kingdom_set-name {
  display: block;
  background: rgba(220, 220, 220, 0.7);
  color: #fff;
  margin-right: 4px;
  padding: 6px 8px;
  text-shadow: 1px 1px 4px #fff;
  font-size: 16px;
}

.preset-kingdom_metadata {
  display: flex;
  flex-direction: row;
  margin-bottom: 10px;
}

.preset-kingdom_metadata_use-platinums-and-colonies,
.preset-kingdom_metadata_use-shelters {
  color: #fff;
  font-size: 14px;
  padding: 2px 6px;
  margin-right: 6px;
}
  
.preset-kingdom_metadata_use-platinums-and-colonies {
  background: #C8CE0B; /* prosperity-color */
}

.preset-kingdom_metadata_use-shelters {
  background: #b1572a; /* darkages-color */
}

.preset-kingdom__addon-title {
  color: #555;
  font-size: 24px;
  margin: 12px 0 8px 0;
}  

@media (max-width: 450px) {
  .preset-kingdom_title_name {
    font-size: 30px;
    margin-right: 8px;
  }
    
  .preset-kingdom_set-name {
    font-size: 14px;
    padding: 4px 6px;
  }
}

</style>