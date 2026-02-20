<template>
  <div>
    <div v-if="set && displayData">
      <div class="preset-kingdom_title">
        <div class="preset-kingdom_title_name">{{ $t(set.setId) }}</div>
      </div>
      <GenericLayout :items="displayData.SupplyCards" :title="$t('Kingdoms Cards')" 
          :shape="Shape.CARD" :showOverlay="OverlayCheck" :generic-nb-columns="numberOfColumnsForSupplyCards" :is-vertical="true" />
      <GenericLayout :items="displayData.Events" :title="$t('Events')" 
          :shape="Shape.CARD" :showOverlay="OverlayCheck" :generic-nb-columns="numberOfColumnsForAddons" :is-vertical="false" />
      <GenericLayout :items="displayData.Landmarks" :title="$t('Landmarks')" 
          :shape="Shape.CARD" :showOverlay="OverlayCheck" :generic-nb-columns="numberOfColumnsForAddons" :is-vertical="false" />
      <GenericLayout :items="displayData.Projects" :title="$t('Projects')" 
          :shape="Shape.CARD" :showOverlay="OverlayCheck" :generic-nb-columns="numberOfColumnsForAddons" :is-vertical="false" />
      <GenericLayout :items="displayData.Ways" :title="$t('Ways')" 
          :shape="Shape.CARD" :showOverlay="OverlayCheck" :generic-nb-columns="numberOfColumnsForAddons" :is-vertical="false" />
      <GenericLayout :items="displayData.Boons" :title="$t('Boons')" 
          :shape="Shape.CARD" :showOverlay="OverlayCheck" :generic-nb-columns="numberOfColumnsForAddons" :is-vertical="false" />  
      <GenericLayout :items="displayData.Allies" :title="$t('Allies')" 
          :shape="Shape.CARD" :showOverlay="OverlayCheck" :generic-nb-columns="numberOfColumnsForAddons" :is-vertical="false" />
      <GenericLayout :items="displayData.Traits" :title="$t('Traits ')" 
          :shape="Shape.CARD" :showOverlay="OverlayCheck" :generic-nb-columns="numberOfColumnsForAddons" :is-vertical="false" />
      <GenericLayout :items="displayData.Prophecies" :title="$t('Prophecies')" 
          :shape="Shape.CARD" :showOverlay="OverlayCheck" :generic-nb-columns="numberOfColumnsForAddons" :is-vertical="false" />

      <!-- otherCards : Basic Supply Cards, Ruins, Shelters, Non-Supply, Travellers, Artefacts, Hexes, -->        
      <GenericLayout v-for="group in displayData.verticalOthers" :key="group.cardType"
          :items="group.items" :title="$t(group.title)" :shape="Shape.CARD" :showOverlay="OverlayCheck"
          :generic-nb-columns="numberOfColumnsForSupplyCards" :is-vertical="true" />
          
      <GenericLayout v-for="group in displayData.horizontalOthers" :key="group.cardType"
          :items="group.items" :title="$t(group.title)" 
          :shape="Shape.CARD" :showOverlay="OverlayCheck" :generic-nb-columns="numberOfColumnsForAddons" :is-vertical="false" />  
      <GenericLayout v-for="group in displayData.verticalMats" :key="group.cardType"
          :items="group.items" :title="$t(group.title)" 
          :shape="Shape.CARD" :showOverlay="OverlayCheck" :generic-nb-columns=3 :is-vertical="true" />
      <GenericLayout v-for="group in displayData.horizontalMats" :key="group.cardType"
          :items="group.items" :title="$t(group.title)" 
          :shape="Shape.CARD" :showOverlay="OverlayCheck" :generic-nb-columns=2 :is-vertical="false" />
      <GenericLayout v-for="group in displayData.squareMats" :key="group.cardType"
          :items="group.items" :title="$t(group.title)" 
          :shape="group.shape" :showOverlay="OverlayCheck" :generic-nb-columns=3 :is-vertical="false" />
    </div>
  </div>
</template>
 
<script lang="ts">
/* import Vue, typescript */
import { defineComponent, computed } from 'vue';
import { useI18n } from 'vue-i18n';

/* import Dominion Objects and type*/
import type { DominionSet } from '@/dominion/dominion-set';
import { DominionSets } from '@/dominion/dominion-sets';
import type { SupplyCard } from '@/dominion/supply-card';
import { SupplyCardSorter } from '@/utils/supply-card-sorter';
import { ShowOverlayOptions } from '@/utils/resources'; 
import { OTHER_CARD_TYPES, OTHER_CARD_TYPES_HORIZONTAL, 
          OTHER_CARD_TYPES_MAT_HORIZONTAL, OTHER_CARD_TYPES_MAT, 
          OTHER_CARD_TYPES_MAT_SQUARE } from '@/utils/cards-other' 
import { getOtherCards } from '@/utils/cards-other';

/* import store  */
import { useWindowStore } from '@/pinia/window-store';
import { useSetsStore } from '@/pinia/sets-store';
import { SortOption } from '@/settings/settings';

/* import Components */
import GenericLayout from '../GenericLayout.vue';
import { Shape as shapeFromGridLayout } from '../GridLayout.vue';

const FOUR_COLUMN_SUPPLY_CARD_WIDTH = 450;
const TWO_COLUMN_ADDON_WIDTH = 525;


export default defineComponent({
  name: 'PresetBoxContent',
  components: {
    GenericLayout,
  },
  setup() {
    const windowStore = useWindowStore();
    const setsStore = useSetsStore();
    const { t } = useI18n();

    const Shape = shapeFromGridLayout;
    const OverlayCheck = ShowOverlayOptions.CHECK;

    const set = computed(() => {
      return (DominionSets.sets[setsStore.selectedBoxesSetId] as DominionSet);
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

    const getCards = (cardIds: any[], origine = SortOption.SET) => {
      if (origine == SortOption.SET) 
        return SupplyCardSorter.sort(cardIds as SupplyCard[], setsStore.sortBoxesSet, t); 
      else 
        return SupplyCardSorter.sort(cardIds as SupplyCard[], origine, t);
    };

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

    const displayData = computed(() => {
      const s = set.value;
      if (!s) return null;
      
      // Fonction utilitaire interne pour éviter la répétition
      const sort = (cards: any[], option = setsStore.sortBoxesSet) => {
        return SupplyCardSorter.sort(cards as SupplyCard[], option, t);
      };

      return {
      // Sections standards
      SupplyCards: sort(s.supplyCards.concat(getOtherCards(s, 'Normal Supply Cards') as any[])),
      Events: sort(s.events.concat(getOtherCards(s, 'Events') as any[])),
      Landmarks: sort(s.landmarks.concat(getOtherCards(s, 'Landmarks') as any[])),
      Projects: sort(s.projects.concat(getOtherCards(s, 'Projects') as any[])),
      Ways: sort(s.ways.concat(getOtherCards(s, 'Ways') as any[])),
      Boons: sort(s.boons.concat(getOtherCards(s, 'Boons') as any[])),
      Allies: sort(s.allies.concat(getOtherCards(s, 'Allies') as any[])),
      Traits: sort(s.traits.concat(getOtherCards(s, 'Traits') as any[])),
      Prophecies: sort(s.prophecies.concat(getOtherCards(s, 'Prophecies') as any[])),

      // Sections dynamiques (OtherCardTypes)
      verticalOthers: OTHER_CARD_TYPES.map(type => ({
        ...type,
        items: sort(getOtherCards(s, type.cardType), challenge_sortBoxesSet(type.cardType))
      })).filter(group => group.items.length > 0),

      horizontalOthers: OTHER_CARD_TYPES_HORIZONTAL.map(type => ({
        ...type,
        items: sort(getOtherCards(s, type.cardType))
      })).filter(group => group.items.length > 0),

      verticalMats: OTHER_CARD_TYPES_MAT.map(type => ({
        ...type,
        items: sort(getOtherCards(s, type.cardType))
      })).filter(group => group.items.length > 0),

      horizontalMats: OTHER_CARD_TYPES_MAT_HORIZONTAL.map(type => ({
        ...type,
        items: sort(getOtherCards(s, type.cardType))
      })).filter(group => group.items.length > 0),

      squareMats: OTHER_CARD_TYPES_MAT_SQUARE.map(type => ({
        ...type,
        items: sort(getOtherCards(s, type.cardType)),
        shape: getshapeofmat(type.cardType)
      })).filter(group => group.items.length > 0)
    };
  });

    return {
      Shape,
      set,
      numberOfColumnsForSupplyCards,
      numberOfColumnsForAddons,
      getshapeofmat,
      displayData,
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