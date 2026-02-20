<template>
  <div class="main">
    <h3>{{ $t("Results") }} ({{ filteredCards.length }})</h3>
    
    <!-- Supply Cards -->
    <SearchLayout :items="searchGetCards('SupplyCard')" :title="$t('Kingdoms Cards')" :getCostName="getCostName" :getCardTypeNames="getCardTypeNames"
      :is-vertical="true" :generic-nb-columns="numberOfColumnsForSupplyCards" />
      <div v-if="false">
    <!-- Events -->
    <SearchLayout :items="searchGetCards('Event')" :title="$t('Events')" :getCostName="getCostName" :getCardTypeNames="getCardTypeNames"
      :is-vertical="false" :generic-nb-columns="numberOfColumnsForAddons" />
    <!-- Landmarks -->
    <SearchLayout :items="searchGetCards('Landmark')" :title="$t('Landmarks')" :getCostName="getCostName" :getCardTypeNames="getCardTypeNames"
      :is-vertical="false" :generic-nb-columns="numberOfColumnsForAddons" />
    <!-- Ways -->
    <SearchLayout :items="searchGetCards('Way')" :title="$t('Ways')" :getCostName="getCostName" :getCardTypeNames="getCardTypeNames"
      :is-vertical="false" :generic-nb-columns="numberOfColumnsForAddons" />
    <!-- Projects -->
    <SearchLayout :items="searchGetCards('Project')" :title="$t('Projects')" :getCostName="getCostName" :getCardTypeNames="getCardTypeNames"
      :is-vertical="false" :generic-nb-columns="numberOfColumnsForAddons" />
    <!--Boons -->
    <SearchLayout :items="searchGetCards('Boon')" :title="$t('Boons')" :getCostName="getCostName" :getCardTypeNames="getCardTypeNames"
      :is-vertical="false" :generic-nb-columns="numberOfColumnsForAddons" />
    <!-- Allies -->
    <SearchLayout :items="searchGetCards('Ally')" :title="$t('Allies')" :getCostName="getCostName" :getCardTypeNames="getCardTypeNames"
      :is-vertical="false" :generic-nb-columns="numberOfColumnsForAddons" />
    <!-- Traits -->
    <SearchLayout :items="searchGetCards('Trait')" :title="$t('Traits')" :getCostName="getCostName" :getCardTypeNames="getCardTypeNames"
      :is-vertical="false" :generic-nb-columns="numberOfColumnsForAddons" />
    <!-- Prophecies -->
    <SearchLayout :items="searchGetCards('Prophecy')" :title="$t('Prophecies')" :getCostName="getCostName" :getCardTypeNames="getCardTypeNames"
      :is-vertical="false" :generic-nb-columns="numberOfColumnsForAddons" />
    
    <SearchLayout :items="searchGetCards('OtherCard')" :title="$t('Other Cards')" :getCostName="getCostName" :getCardTypeNames="getCardTypeNames"
      :is-vertical="true" :generic-nb-columns="numberOfColumnsForSupplyCards" />

        </div>


  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSettingsStore } from '@/pinia/settings-store';
import { useWindowStore } from '@/pinia/window-store';


import { Cards } from '@/utils/cards';
import type { SetId } from '@/dominion/set-id';
import { Randomizer } from '@/randomizer/randomizer';
import { OTHER_CARD_TYPES, OTHER_CARD_TYPES_HORIZONTAL } from '@/utils/cards-other';
import { OtherCard } from '@/dominion/other-card';
import { useSearchStore } from '@/pinia/search-store';

import { CardType, VISIBLE_CARD_TYPES } from '@/dominion/card-type';
import  { SupplyCard } from '@/dominion/supply-card';
import { Event } from '@/dominion/event';
import { Landmark } from '@/dominion/landmark';
import { Way } from '@/dominion/way';
import { Project } from '@/dominion/project';
import { Boon } from '@/dominion/boon';
import { Ally } from '@/dominion/ally';
import { Trait } from '@/dominion/trait'; 
import { Prophecy } from '@/dominion/prophecy';


import type { Card } from '@/dominion/card';
import type { Cost } from '@/dominion/cost';
import { DominionSets } from '@/dominion/dominion-sets';
import { Addons_TYPE } from '@/dominion/addon';
import type { Addon } from '@/dominion/addon';
import { SortOption } from '@/settings/settings';

import SearchLayout from './SearchLayout.vue';




export default defineComponent({
  name: "SearchResultsDisplay",
  components: {
    SearchLayout
  },
  setup() {
    const { t, locale } = useI18n();
    const windowStore = useWindowStore();
    const SettingsStore = useSettingsStore();
    const SearchStore = useSearchStore();
    const FOUR_COLUMN_SUPPLY_CARD_WIDTH = 450;
    const TWO_COLUMN_ADDON_WIDTH = 550;

    const numberOfColumnsForSupplyCards = computed(() => {
      return windowStore.isEnlarged ? 2 : windowStore.width <= FOUR_COLUMN_SUPPLY_CARD_WIDTH ? 3 : 4;
    });

    const numberOfColumnsForAddons = computed(() => {
      return windowStore.isEnlarged ? 1 : windowStore.width <= TWO_COLUMN_ADDON_WIDTH ? 2 : 3;
    });

    // Get sets to use
    const setsToUse = computed<SetId[]>(() => {
      if (SettingsStore.isUsingOnlyOwnedsets && SettingsStore.ownedSets.length > 0) {
        return SettingsStore.ownedSets as SetId[];
      }
      return DominionSets.getAllSets().map(set => set.setId) as SetId[];
    });

    const isAddon = (card: Card): boolean => {
      return (Object.values(Addons_TYPE) as string[]).includes(card.constructor.name);
    };
    const getCostName = (card: Card) => {
      if (card instanceof SupplyCard || card instanceof OtherCard || isAddon(card)) {
        const cost = (card as SupplyCard | Addon).cost;
        if (cost) {
        const parts: string[] = [];
        if (cost.treasure > 0) {
          parts.push(`${cost.treasure} ${t("Coins",cost.treasure)}`);
        }
        if (cost.potion > 0) {
          parts.push(`${cost.potion} ${t("Potion",cost.potion)}`);
        }
        if (cost.debt > 0) {
          parts.push(`${cost.debt} ${t("Debt",cost.debt)}`);
        }
        return parts.length > 0 ? parts.join(' + ') : '';
        }
      }
      return ''
    };
    const getCostNameFromCard =(card: Card) => {
      switch (card.constructor.name) {
        case Addons_TYPE.EVENT:
        case Addons_TYPE.LANDMARK:
          return getCostName(card as Card);
      default:
        throw new Error(`Unknown card type: `);
      return false
      }
    }
    const getCardTypeNames = (card: Card) => {
      // On parcourt dynamiquement tous les types de CardType
      const types = Object.values(CardType).filter(type => (card as any)[type]);
      return types.map(type => {
        const visibleType = VISIBLE_CARD_TYPES.find(vt => vt.type === type);
        return visibleType ? visibleType.name : type;
      }).join(', ');
    };
    const getSetName = (setId: string) =>{ return t(setId); };

    const allCards = () => {
      const sets = DominionSets.getAllSets().filter(set => setsToUse.value.includes(set.setId));
      //let cards = Cards.getAllSupplyCards(Cards.getAllCardsFromSets(sets))
      let cards = Cards.getAllSupplyCards(Cards.getAllCardsFromSets(sets))
      const otherCards = Cards.getAllOtherCardsFromSets(sets);
      for (const otherCardType of OTHER_CARD_TYPES) {
        const xx = otherCards.filter((card) => ((card as OtherCard).type.includes(otherCardType.cardType)));
        cards.push(...xx as SupplyCard[]);
      }
      //cards = Randomizer.removeDuplicateCards(cards, []);
      cards = cards.filter((card, index, self) => {
        const x = card.id.replace('tohidesplitcard','')
        return index === self.findIndex((c) => c.id === x)
      });

      let hcards = Cards.getAllNonSupplyCards(Cards.getAllCardsFromSets(sets));
      for (const otherCardType of OTHER_CARD_TYPES_HORIZONTAL) {
        const xx = otherCards.filter((card) => ((card as OtherCard).type.includes(otherCardType.cardType)));
        hcards.push(...xx as Card[]);
      }
      let finalCards = (cards as Card[]).concat(hcards) 
      const excludedCards = setsToUse.value.flatMap(setId => (SettingsStore.getSetConstraints(setId)?.excludedCards ?? []));
      return finalCards.filter(card => !excludedCards.includes(card.id));
    };

    const getTypesFromCard = (card: any): CardType[] => {
      return Object.values(CardType).filter(type => card[type]);
    };

    const filteredCards = computed(() => {
      let cards = allCards();
      // Apply filters from SettingsStore.searchFilters
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
          console.log('Filtering cost for card', card.id, card.constructor.name);
          if (card instanceof SupplyCard || card instanceof OtherCard || isAddon(card)) {
            const cost = (card as SupplyCard | Addon).cost;
            if (!cost) return false;
            return SearchStore.selectedCostTypes.includes((cost as Cost).getType());
          }
          return false;
        });
      }
      //return cards
      switch (SearchStore.selectedSortOption) {
        case SortOption.SET:
          return cards.sort((a, b) => (a.setId || '').localeCompare(b.setId || ''));
        case SortOption.COST:
          return cards.sort((a, b) => {
            // On définit une petite fonction interne pour extraire le coût en toute sécurité
            const getNumericCost = (card: any) => {
              if (card.cost) {
                return (card.cost.treasure || 0) + (card.cost.potion || 0) * 10 + (card.cost.debt || 0) * 100;
              }
              return 0; // Coût 0 pour ce qui n'a pas de propriété cost
            };
            const costA = getNumericCost(a);
            const costB = getNumericCost(b);
            return costA - costB !== 0 ? costA- costB : (a.name || '').localeCompare(b.name || '');
          });
        case SortOption.ALPHABETICAL:
        default:
          return cards.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      }
    });

    const searchGetCards = (typeRequested: string) => {
      let cards = filteredCards.value;
      if (typeRequested) {
        cards = cards.filter(card => {
          if (card instanceof OtherCard) {
            switch (typeRequested) {
              case 'SupplyCard':
                return (card as OtherCard).type.includes('Normal Supply Cards');
              case 'Event':
                return (card as OtherCard).type.includes('Events');
              case 'Landmark':
                return (card as OtherCard).type.includes('Landmarks');
              case 'Way':
                return (card as OtherCard).type.includes('Ways');
              case 'Project':
                return (card as OtherCard).type.includes('Projects');
              case 'Boon':
                return (card as OtherCard).type.includes('Boons');
              case 'Ally':
                return (card as OtherCard).type.includes('Allies');
              case 'Trait':
                return (card as OtherCard).type.includes('Traits');
              case 'Prophecy':
                return (card as OtherCard).type.includes('Prophecies');
              case 'OtherCard':
                for (const otherCardType of OTHER_CARD_TYPES) {
                  if ((card as OtherCard).type.includes(otherCardType.cardType)) {
                    return true;
                  }
                }
                return false;
              default:
                console.log('Unknown card type requested for OtherCard:', typeRequested);
                return false;
            }

          } else {
            switch (typeRequested) {
              case 'SupplyCard':
                return card instanceof SupplyCard;
              case 'Event':
                return card instanceof Event;
              case 'Landmark':
                return card instanceof Landmark;
              case 'Way':
                return card instanceof Way;
              case 'Project':
                return card instanceof Project;
              case 'Boon':
                return card instanceof Boon;
              case 'Ally':
                return card instanceof Ally;
              case 'Trait':
                return card instanceof Trait;
              case 'Prophecy':
                return card instanceof Prophecy;
              case 'OtherCard':
                return false; // Les OtherCards sont gérés dans la condition précédente
              default:
                console.log('Unknown card type requested:', typeRequested);
                return false;
            }
          }
        });
      }
      cards = Randomizer.removeDuplicateCards(cards as any, []);
      return cards;
    };

    return {
      getCostName,
      getCostNameFromCard,
      getCardTypeNames,
      getSetName,
      filteredCards,
      searchGetCards,
      numberOfColumnsForSupplyCards,
      numberOfColumnsForAddons
    };
  },
});
</script>

<style scoped>
.main {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-grow: 1;
}

h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 18px;
  margin-bottom: 20px;
  align-items: start;
  border-bottom: 1px solid #ccc;
}

.card-grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 10px 6px 12px 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  width: 180px;
  max-width: 100%;
}

.beforeStaticSet{
  display: flex;
  flex-direction: column;
  position : relative;
}

.beforeStaticSet img {
  width: 100%;
  height: auto;
  display: block;
}

.card-details {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 0.85em;
  color: #555;
  width: 100%;
  align-items: center;
  margin-top: 6px;
  overflow: hidden;
}

.card-details span {
  width: 100%;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.card-name {
  font-weight: bold;
  color: #333;
  font-size: 1em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-set, .card-cost, .card-types {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-overlay{
  position:absolute;
}

:deep(.static-card__img) {
  position: unset !important;
}
/*
:deep(.card-overlay),
:deep(.static-card__overlay) { 
   right: unset !important;
  top: 50% !important;
  left: 50% !important;
  bottom: unset !important;
  transform: translate(0%, -250%) !important;

  display: flex !important;
  flex-direction: column;
  align-items: center !important;
  justify-content: center !important;
  
}
  */
</style>