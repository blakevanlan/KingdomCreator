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
           {{ $t("Use Platinums/Colonies") }}
      </div>
      <div class="preset-kingdom_metadata_use-shelters"
          v-if="kingdom.metadata.useShelters">
          {{ $t("Use Shelters") }}
      </div>
    </div>

    <GridLayout
      :items="getSupplyCards(kingdom)"
      :number-of-columns="numberOfColumnsForSupplyCards"
      :is-vertical="true"
    >
      <template v-slot:default="slotProps">
        <StaticCardWithSet :card="slotProps.item" />
        <BaneCardCover v-if="isBaneCard(slotProps.item)" />
      </template>
    </GridLayout>

    <div v-if="addonIds.length">
      <div class="preset-kingdom__addon-title">
        <AddonTitle
          :has-events="kingdom.eventIds.length > 0"
          :has-landmarks="kingdom.landmarkIds.length > 0"
          :has-projects="kingdom.projectIds.length > 0"
          :has-ways="kingdom.wayIds.length > 0"
          :has-allies="kingdom.allyIds.length > 0"
          :has-traits="kingdom.traitIds.length > 0"
        />
      </div>
      <GridLayout
        :items="getCards(addonIds)"
        :number-of-columns="numberOfColumnsForAddons"
        :is-vertical="false"
      >
        <template v-slot:default="slotProps">
          <StaticCardWithSet :card="slotProps.item" />
        </template>
      </GridLayout>
    </div>
        
    <div v-if="kingdom.boonIds.length">
      <div class="preset-kingdom__addon-title">Boons</div>
      <GridLayout
        :items="getCards(kingdom.boonIds)"
        :number-of-columns="numberOfColumnsForAddons"
        :is-vertical="false"
      >
        <template v-slot:default="slotProps">
          <StaticCardWithSet :card="slotProps.item" />
        </template>
      </GridLayout>
    </div>

    <CopyButton :text="copyText" class="preset-kingdom-copy-button" />
  </div>
</template>

<script lang="ts">
import AddonTitle from "./AddonTitle.vue";
import GridLayout from "./GridLayout.vue";
import { DominionKingdom } from "../dominion/dominion-kingdom";
import { DominionSets } from "../dominion/dominion-sets";
import { SupplyCard } from "../dominion/supply-card";
import { State } from "vuex-class";
import { Vue, Component, Prop } from "vue-property-decorator";
import StaticCardWithSet from "./StaticCardWithSet.vue";
import BaneCardCover from "./BaneCardCover.vue";
import CopyButton from "./CopyButton.vue";

const FOUR_COLUMN_SUPPLY_CARD_WIDTH = 450;
const TWO_COLUMN_ADDON_WIDTH = 525;

@Component({
  components: {
    AddonTitle,
    GridLayout,
    StaticCardWithSet,
    BaneCardCover,
    CopyButton,
  }
})
export default class PresetKingdom extends Vue {
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

  get addonIds() {
    return this.kingdom.eventIds.concat(
        this.kingdom.landmarkIds, this.kingdom.projectIds, this.kingdom.wayIds, this.kingdom.allyIds, this.kingdom.traitIds);
  }

  get hasMetadata() {
    return this.kingdom.metadata.useColonies || this.kingdom.metadata.useShelters;
  }

  get copyText() {
    return this.kingdom.supplyIds.concat(this.addonIds).map((id) => this.$t(id)).join(", ");
  }

  getSupplyCards(kingdom: DominionKingdom) {
    const cardIds = this.kingdom.supplyIds.concat();
    if (this.kingdom.baneCardId) {
      cardIds.push(this.kingdom.baneCardId);
    }
    return this.getCards(cardIds);
  }

  getCards(cardIds: string[]) {
    return cardIds.map(DominionSets.getCardById);
  }

  isBaneCard(supplyCard: SupplyCard) {
    return this.kingdom.baneCardId &&
      this.kingdom.baneCardId == supplyCard.id;
  }

  getCopyText(kingdom: DominionKingdom) {

  }
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

.preset-kingdom-copy-button {
  margin-top: 4px;
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