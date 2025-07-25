<template>
  <div class="main">
    <h3>{{ $t("Results") }} ({{ cards.length }})</h3>
    <div class="card-grid">
      <div v-for="card in cards" :key="card.id" class="card-grid-item">

      <div class="beforeStaticSet">
        <StaticCardWithSet :card="card" style="position:relative;"/>
      </div>
        <div class="card-details">
          <span class="card-name">{{ $t(card.id) }}</span>
          <span class="card-set">{{ getSetName(card.setId) }}</span>
          <span class="card-cost">{{ getCostName(card.cost) }}</span>
          <span class="card-types">{{ getCardTypeNames(card) }}</span>
        </div>

      </div>
    </div>
    <p v-if="cards.length === 0">{{ $t("No cards found matching your criteria.") }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { CardType, VISIBLE_CARD_TYPES } from "../dominion/card-type";
import type { Cost } from '../dominion/cost';
import type { SupplyCard } from '../dominion/supply-card';
import { DominionSets } from '../dominion/dominion-sets';
import StaticCardWithSet from "./StaticCardWithSet.vue";

export default defineComponent({
  name: "SearchResultsDisplay",
  components: {
    StaticCardWithSet
  },
  props: {
    cards: {
      type: Array as PropType<SupplyCard[]>,
      required: true,
    },
  },
  setup() {
    const { t, locale } = useI18n();

    const getCostName = (cost: Cost) => {
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
      return parts.length > 0 ? parts.join(' + ') : `${t("Coins",0)}`;
    };

    const getCardTypeNames = (card: SupplyCard) => {
      // On parcourt dynamiquement tous les types de CardType
      const types = Object.values(CardType).filter(type => (card as any)[type]);
      return types.map(type => {
        const visibleType = VISIBLE_CARD_TYPES.find(vt => vt.type === type);
        return visibleType ? visibleType.name : type;
      }).join(', ');
    };

    const getSetName = (setId: string) => {
      const set = DominionSets.getSetById(setId as any);
      return set ? t(set.setId) : setId;
    };

    return {
      getCostName,
      getCardTypeNames,
      getSetName,
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