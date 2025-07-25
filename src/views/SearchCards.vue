<template>
  <Page :subtitle="$t('search_cards_page_subtitle')">
    <div class="content">
      <div class="sets-description">{{$t("search_page_description")}}</div>
        <SearchFilters />
      <SearchResultsDisplay :cards="filteredCards" />
    </div>
  </Page>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import useBase from "./base";
import Page, { MenuItemType } from "../components/Page.vue";
import SearchFilters from "../components/SearchFilters.vue"; 
import SearchResultsDisplay from "../components/SearchResultsDisplay.vue";
import { useI18n } from 'vue-i18n';
import { useSettingsStore } from "../pinia/settings-store";
import { useSearchStore } from "../pinia/search-store";

// Dominion Objects and types
import type { SetId } from "../dominion/set-id";
import { DominionSets } from "../dominion/dominion-sets";
import { CardType } from "../dominion/card-type";
import { Cards } from "../utils/cards";
import { Randomizer } from "../randomizer/randomizer";


export default defineComponent({
  name: "SearchCards",
  components: {
    Page,
    SearchFilters,
    SearchResultsDisplay,
  },
  setup() {
    useBase();
    const { t } = useI18n();
    const SettingsStore = useSettingsStore();

    const SearchStore = useSearchStore();

    const setsToUse = computed<SetId[]>(() => {
      if (SettingsStore.isUsingOnlyOwnedsets && SettingsStore.ownedSets.length > 0) {
        return SettingsStore.ownedSets as SetId[];
      }
      // Si aucun paramètre custom, on prend tous les sets
      return DominionSets.getAllSets().map(set => set.setId) as SetId[];
    });
    const excludedCards = computed(() => {
      return setsToUse.value.flatMap(setId => (SettingsStore.getSetConstraints(setId)?.excludedCards ?? []));
    });

    const allDominionCards = computed(() => {
      const sets = DominionSets.getAllSets().filter(set => setsToUse.value.includes(set.setId));
      const cards = Cards.getAllSupplyCards(Cards.getAllCardsFromSets(sets));
      return cards.filter(card => !excludedCards.value.includes(card.id));
    });

    function getTypesFromCard(card: any): CardType[] {
      // Simplification dynamique : chaque valeur de CardType correspond à une propriété booléenne
      return Object.values(CardType).filter(type => card[type]);
    }

    const filteredCards = computed(() => {
      let cards = allDominionCards.value;

      if (SearchStore.selectedSetIds.length > 0) {
        cards = cards.filter(card => SearchStore.selectedSetIds.includes(card.setId));
      }

      if (SearchStore.searchName) {
        const lowerSearchName = SearchStore.searchName.toLowerCase();
        cards = cards.filter(card => card.name && card.name.toLowerCase().includes(lowerSearchName));
      }

      if (SearchStore.selectedCardTypes.length > 0) {
        cards = cards.filter(card =>
          SearchStore.selectedCardTypes.some(selectedType => getTypesFromCard(card).includes(selectedType))
        );
      }

      if (SearchStore.selectedCostTypes.length > 0) {
        cards = cards.filter(card => {
          if (!card.cost) return false;
          return SearchStore.selectedCostTypes.includes(card.cost.getType());
        });
      }

      // to remove duplicate and avoid problem with multiple version of Set           
      cards = Randomizer.removeDuplicateCards(cards, []);
      console.log("cards in filteredcards after deduplicate:", cards);

      // Tri selon l'option sélectionnée
      switch (SearchStore.selectedSortOption) {
        case 'SET':
          return cards.sort((a, b) => (a.setId || '').localeCompare(b.setId || ''));
        case 'COST':
          return cards.sort((a, b) => {
            const costA = a.cost ? a.cost.treasure + a.cost.potion * 10 + a.cost.debt * 100 : 0;
            const costB = b.cost ? b.cost.treasure + b.cost.potion * 10 + b.cost.debt * 100 : 0;
            return costA - costB;
          });
        case 'ALPHABETICAL':
        default:
          return cards.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      }
    });

    return {
      filteredCards,
    };
  },
});
</script>

