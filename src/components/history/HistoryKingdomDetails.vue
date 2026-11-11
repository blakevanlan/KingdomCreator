<template>
  <div class="kingdom-details-display">
    <!-- Colonne Date/Heure sur 2 lignes -->
    <div class="datetime-column" v-if="timestamp">
      <div class="date-row">{{ formatDateOnly(timestamp) }}</div>
      <div class="time-row">{{ formatTimeOnly(timestamp) }}</div>
    </div>

    <!-- Colonne Contenu (Cartes regroupées par set) -->
    <div class="details-column">
      <!-- Section Supplies -->
      <div class="section-container" v-if="groupedCards.length > 0">
        <h3 class="section-title">{{ $t('Supplies') }}</h3>
        <div class="groups-container">
          <div v-for="group in groupedCards" :key="group.setId" class="set-group-box">
            <img :src="getSetIconUrl(group.setId)" class="set-icon" :alt="group.setId" :title="$t(group.setId)" />
            <div class="cards-group">
              <div 
                v-for="item in group.items" 
                :key="item.card.id" 
                class="card-hover-container"
              >
                <span class="card-inline-name">
                  {{ $t(item.card.id) }}<span v-if="item.labelSuffix" class="special-card-suffix">{{ item.labelSuffix }}</span>
                </span>
                <div class="card-preview-tooltip">
                  <img :src="cardImageUrl(item.card.id)" :alt="item.card.id" class="preview-img" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sections Addons (Events, Landmarks, etc., hors Boons) sur une seule ligne -->
      <div class="section-container" v-if="groupedAddons.length > 0">
        <h3 class="section-title">
          {{ $t('Addons') }} (
          <AddonTitle 
            :has-events="!!(kingdom?.events && kingdom.events.length)"
            :has-landmarks="!!(kingdom?.landmarks && kingdom.landmarks.length)"
            :has-projects="!!(kingdom?.projects && kingdom.projects.length)"
            :has-ways="!!(kingdom?.ways && kingdom.ways.length)"
            :has-traits="!!(kingdom?.traits && kingdom.traits.length)"
            :has-ally="!!kingdom?.ally"
            :has-prophecy="!!kingdom?.prophecy"
          />
          )
        </h3>
        <div class="groups-container">
          <div v-for="group in groupedAddons" :key="group.setId" class="set-group-box">
            <img :src="getSetIconUrl(group.setId)" class="set-icon" :alt="group.setId" :title="$t(group.setId)" />
            <div class="cards-group">
              <div 
                v-for="addon in group.items" 
                :key="addon.id" 
                class="card-hover-container"
              >
                <span class="card-inline-name addon-style">{{ $t(addon.id) }}</span>
                <div class="card-preview-tooltip">
                  <img :src="cardImageUrl(addon.id)" :alt="addon.id" class="preview-img addon-preview-img" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Boons -->
      <div class="section-container" v-if="groupedBoons.length > 0">
        <h3 class="section-title">{{ $t('Boons') }}</h3>
        <div class="groups-container">
          <div v-for="group in groupedBoons" :key="group.setId" class="set-group-box">
            <img :src="getSetIconUrl(group.setId)" class="set-icon" :alt="group.setId" :title="$t(group.setId)" />
            <div class="cards-group">
              <div 
                v-for="boon in group.items" 
                :key="boon.id" 
                class="card-hover-container"
              >
                <span class="card-inline-name boon-style">{{ $t(boon.id) }}</span>
                <div class="card-preview-tooltip">
                  <img :src="cardImageUrl(boon.id)" :alt="boon.id" class="preview-img boon-preview-img" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { Kingdom } from '@/randomizer/kingdom';
import { getCardImageUrl } from '@/utils/resources';
import { usei18nStore } from '@/pinia/i18n-store';
import AddonTitle from '@/components/AddonTitle.vue';

export default defineComponent({
  name: "HistoryKingdomDetails",
  components: {
    AddonTitle
  },
  props: {
    kingdom: {
      type: Object as PropType<Kingdom>,
      required: true
    },
    timestamp: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const i18nStore = usei18nStore();
    const { t } = useI18n();
    const language = computed(() => i18nStore.language);

    // Fonction générique pour regrouper les éléments par Set
    const groupBySet = (items: any[]) => {
      const maps: Record<string, any[]> = {};
      items.forEach(item => {
        if (!item) return;
        const setId = item.setId || 'unknown';
        if (!maps[setId]) maps[setId] = [];
        maps[setId].push(item);
      });
      return Object.entries(maps).map(([setId, groupedItems]) => ({
        setId,
        items: groupedItems
      }));
    };

    // Regrouper les Supply Cards par leur Set d'origine
    const groupedCards = computed(() => {
      const supply = props.kingdom?.supply;
      if (!supply) return [];
      
      const cards: { card: any; labelSuffix?: string }[] = [];
      
      // Cartes standard
      if (supply.supplyCards) {
        supply.supplyCards.forEach(c => cards.push({ card: c }));
      }
      
      // Cartes spéciales
      if (supply.baneCard) {
        cards.push({ card: supply.baneCard, labelSuffix: ` (${t('Bane')})` });
      }
      if (supply.ferrymanCard) {
        cards.push({ card: supply.ferrymanCard, labelSuffix: ` (${t('Ferryman')})` });
      }
      if (supply.obeliskCard) {
        cards.push({ card: supply.obeliskCard, labelSuffix: ` (${t('Obelisk')})` });
      }
      if (supply.mouseWay) {
        cards.push({ card: supply.mouseWay, labelSuffix: ` (${t('Way of the Mouse')})` });
      }
      if (supply.riverboatCard) {
        cards.push({ card: supply.riverboatCard, labelSuffix: ` (${t('Riverboat')})` });
      }
      if (supply.approachingArmyCard) {
        cards.push({ card: supply.approachingArmyCard, labelSuffix: ` (${t('Prophecy')})` });
      }

      // Regrouper par SetId
      const maps: Record<string, { card: any; labelSuffix?: string }[]> = {};
      cards.forEach(item => {
        const setId = item.card.setId || 'unknown';
        if (!maps[setId]) maps[setId] = [];
        maps[setId].push(item);
      });
      
      return Object.entries(maps).map(([setId, groupedItems]) => ({
        setId,
        items: groupedItems
      }));
    });

    const getSetIconUrl = (setId: string) => {
      return `./img/Templates-set/${setId}-small.png`;
    };

    const cardImageUrl = (id: string) => {
      return getCardImageUrl(id.replace("tohidesplitcard", ""), language.value);
    };

    // Regrouper tous les addons (Events, Landmarks, etc.) sauf les Boons
    const groupedAddons = computed(() => {
      const k = props.kingdom;
      if (!k) return [];
      const items: any[] = [];
      if (k.events) items.push(...k.events);
      if (k.landmarks) items.push(...k.landmarks);
      if (k.projects) items.push(...k.projects);
      if (k.ways) items.push(...k.ways);
      if (k.traits) items.push(...k.traits);
      if (k.ally) items.push(k.ally);
      if (k.prophecy) items.push(k.prophecy);
      return groupBySet(items);
    });

    // Regrouper les Boons
    const groupedBoons = computed(() => {
      const k = props.kingdom;
      if (!k || !k.boons || !k.boons.length) return [];
      return groupBySet(k.boons);
    });

    const formatDateOnly = (ts: number) => {
      return new Date(ts).toLocaleDateString(undefined, {
        day: '2-digit', month: '2-digit', year: '2-digit'
      });
    };

    const formatTimeOnly = (ts: number) => {
      return new Date(ts).toLocaleTimeString(undefined, {
        hour: '2-digit', minute: '2-digit'
      });
    };

    return {
      groupedCards,
      groupedAddons,
      groupedBoons,
      cardImageUrl,
      getSetIconUrl,
      formatDateOnly,
      formatTimeOnly
    };
  }
});
</script>

<style scoped>
.kingdom-details-display {
  display: flex;
  gap: 16px;
}

.datetime-column {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-width: 90px;
  border-right: 1px solid #eee;
  padding-right: 12px;
  text-align: center;
}

.date-row {
  font-size: 0.95rem;
  font-weight: 700;
  color: #333;
}

.time-row {
  font-size: 0.85rem;
  color: #666;
  margin-top: 4px;
}

.details-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #02779e;
  margin: 0;
}

.groups-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 4px;
}

.set-group-box {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 6px 10px;
  background: #f8fafc;
}

.set-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  flex-shrink: 0;
}

.cards-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.card-inline-name {
  background: #fff;
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid #cbd5e1;
  font-size: 0.85rem;
  display: inline-block;
  cursor: default;
  transition: all 0.2s;
}

.card-inline-name:hover {
  background-color: #f1f5f9;
  border-color: #02779e;
}

.addon-style {
  font-style: italic;
}

.boon-style {
  color: #c2410c; /* Couleur orangée pour distinguer les bienfaits */
}

.special-card-suffix {
  font-size: 0.75rem;
  color: #b91c1c;
  font-weight: bold;
  margin-left: 4px;
}

/* --- Système de Tooltip --- */
.card-hover-container {
  position: relative;
  display: inline-block;
}

.card-preview-tooltip {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100; 
  transition: opacity 0.15s ease, visibility 0.15s ease;
  pointer-events: none;
  filter: drop-shadow(0px 8px 20px rgba(0,0,0,0.3)); 
}

.preview-img {
  width: 160px; 
  height: auto;
  border-radius: 8px;
  display: block;
}

.addon-preview-img, .boon-preview-img {
  width: auto; 
  height: 160px; 
}

.card-hover-container:hover .card-preview-tooltip {
  visibility: visible;
  opacity: 1;
}

@media (max-width: 768px) {
  .kingdom-details-display {
    flex-direction: column;
    gap: 10px;
  }
  
  .datetime-column {
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    min-width: unset;
    border-right: none;
    border-bottom: 1px solid #eee;
    padding-right: 0;
    padding-bottom: 8px;
    width: 100%;
    text-align: left;
  }
  
  .date-row {
    font-size: 0.9rem;
  }
  
  .time-row {
    font-size: 0.85rem;
    margin-top: 0;
  }

  .groups-container {
    gap: 6px;
  }

  .set-group-box {
    padding: 4px 8px;
    gap: 6px;
  }
  
  .card-inline-name {
    font-size: 0.8rem;
    padding: 2px 6px;
  }

  /* Disable tooltips on mobile to prevent sticky tooltips and layout issues */
  .card-preview-tooltip {
    display: none !important;
  }
}
</style>