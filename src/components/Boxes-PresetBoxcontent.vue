<template>
  <div>
    <div v-for="set in sets" :set="set">
      <div class="preset-kingdom_title">
        <div class="preset-kingdom_title_name">{{ $t(set.setId) }}</div>
      </div>

      <!-- Supply Cards -->
      <GenericLayout :items="getCards(set.supplyCards.concat(getOtherCards(set, 'Normal Supply Cards') as any []))" :title="$t('Kingdoms Cards')" 
        :shape="Shape.CARD" :showOverlay="OverlayCheck" :generic-nb-columns="numberOfColumnsForSupplyCards" :is-vertical="true" />
      <!-- generic slot : Events -->
      <GenericLayout :items="getCards(set.events.concat(getOtherCards(set, 'Events') as any []))" :title="$t('Events')" 
        :shape="Shape.CARD" :showOverlay="OverlayCheck" :generic-nb-columns="numberOfColumnsForAddons" :is-vertical="false" />
      <!-- generic slot : Landmarks -->
      <GenericLayout :items="getCards(set.landmarks.concat(getOtherCards(set, 'Landmarks') as any []))" :title="$t('Landmarks')" 
        :shape="Shape.CARD" :showOverlay="OverlayCheck" :generic-nb-columns="numberOfColumnsForAddons" :is-vertical="false" />
      <!-- generic slot : Projects -->
      <GenericLayout :items="getCards(set.projects.concat(getOtherCards(set, 'Projects') as any []))" :title="$t('Projects')" 
        :shape="Shape.CARD" :showOverlay="OverlayCheck" :generic-nb-columns="numberOfColumnsForAddons" :is-vertical="false" />
      <!-- generic slot : Ways -->
      <GenericLayout :items="getCards(set.ways.concat(getOtherCards(set, 'Ways') as any []))" :title="$t('Ways')"
        :shape="Shape.CARD" :showOverlay="OverlayCheck" :generic-nb-columns="numberOfColumnsForAddons" :is-vertical="false" />
      <!-- generic slot : Boons -->
      <GenericLayout :items="getCards(set.boons.concat(getOtherCards(set, 'Boons') as any []))" :title="$t('Boons')"
        :shape="Shape.CARD" :showOverlay="OverlayCheck" :generic-nb-columns="numberOfColumnsForAddons" :is-vertical="false" />
      <!-- generic slot : Allies -->
      <GenericLayout :items="getCards(set.allies.concat(getOtherCards(set, 'Allies') as any []))" :title="$t('Allies')"
        :shape="Shape.CARD" :showOverlay="OverlayCheck" :generic-nb-columns="numberOfColumnsForAddons" :is-vertical="false" />
      <!-- generic slot : Traits -->
      <GenericLayout :items="getCards(set.traits.concat(getOtherCards(set, 'Traits') as any []))" :title="$t('Traits')"
        :shape="Shape.CARD" :showOverlay="OverlayCheck" :generic-nb-columns="numberOfColumnsForAddons" :is-vertical="false" />
      <!-- generic slot : Prophecies -->
      <GenericLayout :items="getCards(set.prophecies.concat(getOtherCards(set, 'Prophecies') as any []))" :title="$t('Prophecies')"
        :shape="Shape.CARD" :showOverlay="OverlayCheck" :generic-nb-columns="numberOfColumnsForAddons" :is-vertical="false" />

      <!-- otherCards : Basic Supply Cards, Ruins, Shelters, Non-Supply, Travellers, Artefacts, Hexes, -->
      <GenericLayout v-for="card in GetOtherCardTypes('vertical')" :key="card.cardType"
        :items="getCards(getOtherCards(set, card.cardType), challenge_sortBoxesSet(card.cardType))" :title="$t(card.title)"
        :shape="Shape.CARD" :showOverlay="OverlayCheck" :generic-nb-columns="numberOfColumnsForSupplyCards"
        :is-vertical="true" />

      <GenericLayout v-for="card in GetOtherCardTypes('horizontal')" :key="card.cardType"
        :items="getCards(getOtherCards(set, card.cardType))" :title="$t(card.title)" :shape="Shape.CARD"
        :showOverlay="OverlayCheck" :generic-nb-columns="numberOfColumnsForAddons" :is-vertical="false" />

      <GenericLayout v-for="card in GetOtherCardTypes('verticalMat')" :key="card.cardType"
        :items="getCards(getOtherCards(set, card.cardType))" :title="$t(card.title)" :shape="Shape.CARD"
        :showOverlay="OverlayCheck" :generic-nb-columns=3 :is-vertical="true" />

      <GenericLayout v-for="card in GetOtherCardTypes('horizontalMat')" :key="card.cardType"
        :items="getCards(getOtherCards(set, card.cardType))" :title="$t(card.title)" :shape="Shape.CARD"
        :showOverlay="OverlayCheck" :generic-nb-columns=2 :is-vertical="false" />

      <GenericLayout v-for="card in GetOtherCardTypes('squareMat')" :key="card.cardType"
        :items="getCards(getOtherCards(set, card.cardType))" :title="$t(card.title)"
        :shape="getshapeofmat(card.cardType)" :showOverlay="OverlayCheck" :generic-nb-columns=3 :is-vertical="false" />
    </div>
  </div>
</template>
 
<script lang="ts">
/* import Vue, typescript */
import { defineComponent, computed } from 'vue';
import { useI18n } from "vue-i18n";

/* import Dominion Objects and type*/
import type { DominionSet } from "../dominion/dominion-set";
import { DominionSets } from "../dominion/dominion-sets";
import type { SupplyCard } from "../dominion/supply-card";
import { SupplyCardSorter } from "../utils/supply-card-sorter";
import { ShowOverlayOptions } from '../utils/resources';  

/* import store  */
import { useWindowStore } from '../pinia/window-store';
import { useSetsStore } from "../pinia/sets-store";
import { SortOption } from "../settings/settings";

/* import Components */
import GenericLayout from "./GenericLayout.vue";
import { Shape as shapeFromGridLayout } from "./GridLayout.vue";

const FOUR_COLUMN_SUPPLY_CARD_WIDTH = 450;
const TWO_COLUMN_ADDON_WIDTH = 525;

interface genericCardTypes {
  cardType: string;
  title: string;
}

const OTHER_CARD_TYPES: genericCardTypes[] = [
  { cardType: "Knight", title: "Supply Cards - Knights" }, /* dark Ages */
  { cardType: "Castle", title: "Supply Cards - Castles" }, /* empires */
  { cardType: "Basic Cards Treasure", title: "Basic Cards" },
  { cardType: "Basic Cards Victory", title: "Basic Cards" },
  { cardType: "Basic Cards", title: "Basic Cards" },
  { cardType: "Ruins", title: "Basic Cards - Ruins" }, /* dark Ages */
  { cardType: "Shelter", title: "Basic Cards - Shelters" }, /* dark Ages */
  { cardType: "Non-Supply Cards", title: "Non-Supply Cards" },
  { cardType: "Split Cards", title: "Supply Cards Split Piles" },
  { cardType: "Travellers Page", title: "Supply Cards - Travellers - Page Progression" }, /* adventures */
  { cardType: "Travellers Peasant", title: "Supply Cards - Travellers - Peasant Progression" }, /* adventures */
  { cardType: "Prize", title: "Non-Supply Cards" },
  { cardType: "Heirloom", title: "Non-Supply Cards - Heirlooms" }, /*nocturne */
  { cardType: "Loot", title: "Loot Cards" },
  { cardType: "version", title: "Multiples versions of Cards" },

];

const OTHER_CARD_TYPES_HORIZONTAL: genericCardTypes[] = [
  { cardType: "Hexes", title: "Hexes" }, /*nocturne */
  { cardType: "States", title: "States" }, /*nocturne */
  { cardType: "Artifacts", title: "Artifacts" }, /* Renaissance */
];

const OTHER_CARD_TYPES_MAT_HORIZONTAL: genericCardTypes[] = [
  { cardType: "Mat Horizontal", title: "Mat included in box" },
];

const OTHER_CARD_TYPES_MAT: genericCardTypes[] = [
  { cardType: "Mat Vertical", title: "Mat included in box" },
];

const OTHER_CARD_TYPES_MAT_SQUARE: genericCardTypes[] = [
  { cardType: "Mat Square", title: "Mat included in box" },
  { cardType: "advToken", title: "Tokens included in box" },
  { cardType: "Tokens", title: "Tokens included in box" },
];


export default defineComponent({
  name: 'PresetBoxContent',
  components: {
    GenericLayout,
  },
  setup() {
    const windowStore = useWindowStore();
    const setsStore = useSetsStore();
    const { t } = useI18n();

    const Shape = shapeFromGridLayout
    const sets = computed(() => {
      return [(DominionSets.sets[setsStore.selectedBoxesSetId] as DominionSet)];
    });

    const numberOfColumnsForSupplyCards = computed(() => {
      return windowStore.isEnlarged ? 2 : windowStore.width <= FOUR_COLUMN_SUPPLY_CARD_WIDTH ? 4 : 5;
    });

    const numberOfColumnsForAddons = computed(() => {
      return windowStore.isEnlarged ? 1 : windowStore.width <= TWO_COLUMN_ADDON_WIDTH ? 2 : 3;
    });

    const getshapeofmat = (mycardtype: string) => {
      if (mycardtype == 'advToken') return Shape.SMALLSQUARE
      return Shape.SQUARE
    };

    const getCards = (cardIds: any[], origine = SortOption.ALPHABETICAL) => {
      if (origine == SortOption.SET) 
        return SupplyCardSorter.sort(cardIds as SupplyCard[], setsStore.sortBoxesSet, t);
      else 
      //console.log("cardIds", cardIds, "origine", origine, SupplyCardSorter.sort(cardIds as SupplyCard[], origine, t))
        return SupplyCardSorter.sort(cardIds as SupplyCard[], origine, t);
    };

    const getOtherCards = (usingSet: DominionSet, typeRequested: string) => {
      return usingSet.otherCards.filter((card) => ((card.type).includes(typeRequested)));
    };

    // const OtherCardTypes = (isVertical: boolean) => {
    //   return isVertical ? OTHER_CARD_TYPES : OTHER_CARD_TYPES_HORIZONTAL;
    // };
    const GetOtherCardTypes = (typeRequested: string) => {
      if (typeRequested == 'horizontal') return OTHER_CARD_TYPES_HORIZONTAL;
      if (typeRequested == 'vertical') return OTHER_CARD_TYPES;
      if (typeRequested == 'horizontalMat') return OTHER_CARD_TYPES_MAT_HORIZONTAL;
      if (typeRequested == 'verticalMat') return OTHER_CARD_TYPES_MAT;
      if (typeRequested == 'squareMat') return OTHER_CARD_TYPES_MAT_SQUARE;
      return OTHER_CARD_TYPES;
    };

    const challenge_sortBoxesSet = (mycard_type: string) => {
      if (mycard_type == "Travellers Page" || mycard_type == "Travellers Peasant") return SortOption.COST;
      if (mycard_type == "Split Cards") return SortOption.ORDERSTRING;
      if (mycard_type == "Castle") return SortOption.COST;
      return setsStore.sortBoxesSet;
    };
    const OverlayCheck = ShowOverlayOptions.CHECK;

    return {
      Shape,
      sets,
      numberOfColumnsForSupplyCards,
      numberOfColumnsForAddons,
      getshapeofmat,
      getCards,
      getOtherCards,
      // OtherCardTypes,
      GetOtherCardTypes,
      challenge_sortBoxesSet,
      OverlayCheck
    };
  },
});
</script>

<style scoped>
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