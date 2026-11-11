<template>
  <div class="history-page">
    <div class="history-header">
      <h1>{{ $t('gameHistory') }}</h1>
      <button 
        v-if="historyLength > 0" 
        class="btn-danger" 
        @click="confirmClearAll"
      >
        {{ $t('deleteAll') }}
      </button>
    </div>

    <div v-if="!isSignedIn" class="history-message message--disconnected">
      <p>{{ $t('googleDriveRequired') }}</p>
    </div>
    <!-- Chargement de l'historique -->
    <div v-else-if="historyIsLoading" class="empty-history">
      <p>{{ $t('historyLoading') }}</p>
    </div>
    <!-- Si l'historique est vide -->
    <div v-else-if="historyLength === 0" class="empty-history">
      <p>{{ $t('noHistoryYet') }}</p>
      <router-link to="/" class="btn-primary">{{ $t('generateKingdom') }}</router-link>
    </div>

    <!-- Liste de l'historique avec filtres -->
    <div v-else class="history-container">
      <!-- Section de filtrage -->
      <div class="filters-section">
        <div class="filter-group">
          <label for="filter-card">{{ $t('filterByCard') }} :</label>
          <input 
            id="filter-card"
            type="text" 
            v-model="filterCardName" 
            :placeholder="$t('cardNameExample')"
            class="filter-input"
          />
        </div>
        <div class="filter-group">
          <label for="filter-date">{{ $t('filterByDate') }} :</label>
          <div class="date-inputs">
            <input 
              id="filter-date-start"
              type="date" 
              v-model="filterStartDate" 
              class="filter-input date-input"
              :title="$t('startDate')"
            />
            <span class="date-separator">{{ $t('to') }}</span>
            <input 
              id="filter-date-end"
              type="date" 
              v-model="filterEndDate" 
              class="filter-input date-input"
              :title="$t('endDate')"
            />
            <button 
              :disabled="!(filterStartDate || filterEndDate || filterCardName || filterRating > 0)" 
              class="btn-clear-filters" 
              @click="clearFilters"
              :title="$t('resetFilters')"
            >
              ❌
            </button>
          </div>
        </div>
        <div class="filter-group filter-group--rating">
          <label>{{ $t('filterByRating') }} :</label>
          <div class="rating-filter-container">
            <div class="rating-stars">
              <img 
                v-for="star in 5" 
                :key="star" 
                :src="'./img/elements/victory_130.png'" 
                :class="['rating-star', { 'rating-star--active': star <= (hoveredFilterRating || filterRating) }]" 
                @mouseenter="hoveredFilterRating = star"
                @mouseleave="hoveredFilterRating = 0"
                @click="toggleFilterRating(star)"
                :title="$t('ratingFilterTitle', { rating: star })"
              />
            </div>
            <button 
              v-if="filterRating > 0" 
              class="btn-clear-rating" 
              @click="filterRating = 0"
              :title="$t('clearRatingFilter')"
            >
              ❌
            </button>
          </div>
        </div>
      </div>

      <!-- Liste de l'historique -->
      <div v-if="filteredHistory.length > 0" class="history-list">
        <div 
          v-for="item in filteredHistory" 
          :key="item.hash" 
          class="history-item"
        >
          <div class="item-details">
            <HistoryKingdomDetails :kingdom="getKingdom(item.hash)" :timestamp="item.timestamp" />
          </div>
          <div class="item-actions">
            <div class="action-buttons-vertical">
              <!-- Bouton pour charger/rejouer ce royaume -->
              <button class="btn-secondary" @click="PlayAgainKingdom(item.hash)">
                🎯 {{ $t('playAgain') }}
              </button>
              <!-- Zone d'évaluation -->
              <div class="item-rating">
                <div class="rating-stars">
                  <img 
                    v-for="star in 5" 
                    :key="star" 
                    :src="'./img/elements/victory_130.png'" 
                    :class="['rating-star', { 'rating-star--active': star <= (hoveredRatings[item.hash] || getRating(item.hash)) }]" 
                    @mouseenter="hoveredRatings[item.hash] = star"
                    @mouseleave="hoveredRatings[item.hash] = 0"
                    @click="setRating(item.hash, star)"
                    :title="'Note : ' + star + ' / 5'"
                  />
                </div>
              </div>
            </div>
            <!-- Bouton de suppression unitaire -->
            <button class="btn-icon-danger" @click="confirmDelete(item.hash)">
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- Aucun résultat de filtrage -->
      <div v-else class="empty-history">
        <p>{{ $t('noMatchCriteria') }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { useHistoryStore } from '@/pinia/history-store';
import { useRandomizerStore } from '@/pinia/randomizer-store';
import { useGoogleSyncStore } from '@/pinia/google-sync-store';

import { deserializeKingdomFromHash } from '@/randomizer/kingdom-hash';
import { serializeKingdom } from '@/randomizer/serializer';
import { Language } from '@/i18n/language';
import { DominionSets } from '@/dominion/dominion-sets';
import { EventTracker, EventType } from '@/analytics/follow-activity';

import HistoryKingdomDetails from './HistoryKingdomDetails.vue';

export default defineComponent({
  name: "HistoryView",
  components: {
    HistoryKingdomDetails 
  },
  setup() {
    const historyStore = useHistoryStore();
    const googleSyncStore = useGoogleSyncStore();
    const randomizerStore = useRandomizerStore();
    const route = useRoute();
    const router = useRouter();
    const { t } = useI18n();

    const filterCardName = ref('');
    const filterStartDate = ref('');
    const filterEndDate = ref('');
    const filterRating = ref(0);
    const hoveredFilterRating = ref(0);

    const isSignedIn = computed(() => googleSyncStore.isSignedIn);
    const historyLength = computed(() => Object.keys(historyStore.playedKingdoms).length);
    const historyIsLoading = computed(() => historyStore.isLoading);
    
    const hoveredRatings = ref<Record<string, number>>({});

    // Trier l'historique du plus récent au plus ancien
    const sortedHistory = computed(() => {
      return Object.entries(historyStore.playedKingdoms)
        .map(([hash, val]) => {
          let timestamp = 0;
          if (typeof val === 'object' && val !== null) {
            timestamp = val.timestamp;
          } else if (typeof val === 'number') {
            timestamp = val;
          }
          return { hash, timestamp };
        })
        .sort((a, b) => b.timestamp - a.timestamp);
    });

    const getKingdom = (hash: string) => {
      return deserializeKingdomFromHash(hash);
    };

    // Filtrage multi-critères (ET)
    const filteredHistory = computed(() => {
      return sortedHistory.value.filter(item => {
        // 0. Filtrage sur la note (rating)
        if (filterRating.value > 0) {
          const entry = historyStore.playedKingdoms[item.hash];
          const rating = (typeof entry === 'object' && entry !== null) ? (entry.rating || 0) : 0;
          if (rating < filterRating.value) {
            return false;
          }
        }

        // 1. Filtrage sur la date (Date de début et Date de fin)
        if (filterStartDate.value) {
          const start = new Date(filterStartDate.value);
          start.setHours(0, 0, 0, 0);
          if (item.timestamp < start.getTime()) {
            return false;
          }
        }
        if (filterEndDate.value) {
          const end = new Date(filterEndDate.value);
          end.setHours(23, 59, 59, 999);
          if (item.timestamp > end.getTime()) {
            return false;
          }
        }

        // 2. Filtrage sur le nom des cartes (vérification ID et traduction localisée)
        if (filterCardName.value) {
          const query = filterCardName.value.toLowerCase().trim();
          const kingdom = getKingdom(item.hash);
          if (!kingdom) return false;

          // Rassembler toutes les cartes du royaume
          const allCards: any[] = [];
          if (kingdom.supply?.supplyCards) {
            allCards.push(...kingdom.supply.supplyCards);
          }
          if (kingdom.supply?.baneCard) allCards.push(kingdom.supply.baneCard);
          if (kingdom.supply?.ferrymanCard) allCards.push(kingdom.supply.ferrymanCard);
          if (kingdom.supply?.obeliskCard) allCards.push(kingdom.supply.obeliskCard);
          if (kingdom.supply?.mouseWay) allCards.push(kingdom.supply.mouseWay);
          if (kingdom.supply?.riverboatCard) allCards.push(kingdom.supply.riverboatCard);
          if (kingdom.supply?.approachingArmyCard) allCards.push(kingdom.supply.approachingArmyCard);
          if (kingdom.supply?.traitsSupply) {
            allCards.push(...kingdom.supply.traitsSupply);
          }
          if (kingdom.events) allCards.push(...kingdom.events);
          if (kingdom.landmarks) allCards.push(...kingdom.landmarks);
          if (kingdom.projects) allCards.push(...kingdom.projects);
          if (kingdom.ways) allCards.push(...kingdom.ways);
          if (kingdom.traits) allCards.push(...kingdom.traits);
          if (kingdom.ally) allCards.push(kingdom.ally);
          if (kingdom.prophecy) allCards.push(kingdom.prophecy);

          const matchesCard = allCards.some(card => {
            if (!card) return false;
            // Test avec l'ID de la carte
            //if (card.id.toLowerCase().includes(query)) return true;
            // Test avec le nom traduit
            const translatedName = t(card.name);
            if (translatedName.toLowerCase().includes(query)) return true;
            return false;
          });

          if (!matchesCard) return false;
        }

        return true;
      });
    });

    const getKingdomCardsText = (hash: string) => {
      const kingdom = getKingdom(hash);
      if (!kingdom || !kingdom.supply || !kingdom.supply.supplyCards) {
        return t('Unknown or invalid kingdom');
      }

      const sortedCards = [...kingdom.supply.supplyCards].sort((a: any, b: any) => {
        const setOrder = (setId: string) => {
          const index = DominionSets.getAllSetsIds().indexOf(setId as any);
          return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
        };

        const setDiff = setOrder(a.setId) - setOrder(b.setId);
        if (setDiff !== 0) return setDiff;

        return a.id.localeCompare(b.id);
      });

      return sortedCards.map((card: any) => t(card.id)).join(', ');
    };

    const PlayAgainKingdom = async (hash: string) => {
      try {
        const kingdom = deserializeKingdomFromHash(hash);
        if (!kingdom) return;
        EventTracker.trackEvent(EventType.HISTORY_KINGDOM_REPLAY, kingdom);
        await historyStore.addKingdomToHistory(kingdom);

        const lang = Array.isArray(route.query.lang)
          ? route.query.lang[0]
          : route.query.lang || Language.ENGLISH;

        randomizerStore.LOAD_INITIAL_KINGDOM(kingdom, 'play_again');

        await router.push({
          path: '/',
          query: {
            lang,
            ...serializeKingdom(kingdom)
          }
        });
      } catch (e) {
        console.error("Erreur lors du chargement du royaume à rejouer :", e);
      }
    };

    const formatDate = (timestamp: number) => {
      return new Date(timestamp).toLocaleDateString(undefined, {
        day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute:'2-digit'
      });
    };

    const clearFilters = () => {
      filterCardName.value = '';
      filterStartDate.value = '';
      filterEndDate.value = '';
      filterRating.value = 0;
    };

    const toggleFilterRating = (star: number) => {
      if (filterRating.value === star) {
        filterRating.value = 0;
      } else {
        filterRating.value = star;
      }
    };

    const confirmDelete = (hash: string) => {
      if (window.confirm(t("Voulez-vous vraiment supprimer ce royaume de l'historique ?"))) {
        historyStore.deleteKingdomFromHistory(hash);
      }
    };

    const confirmClearAll = () => {
      if (window.confirm(t("Voulez-vous vraiment supprimer TOUT l'historique ?"))) {
        historyStore.clearAllHistory();
      }
    };

    const getRating = (hash: string): number => {
      const entry = historyStore.playedKingdoms[hash];
      if (typeof entry === 'object' && entry !== null) {
        return entry.rating || 0;
      }
      return 0;
    };

    const setRating = (hash: string, rating: number) => {
      const currentRating = getRating(hash);
      if (currentRating === rating) {
        historyStore.setKingdomRating(hash, rating -1);
      } else {
        historyStore.setKingdomRating(hash, rating);
      }
    };

    return {
      historyStore,
      historyLength,
      sortedHistory,
      filteredHistory,
      historyIsLoading,
      isSignedIn,
      filterCardName,
      filterStartDate,
      filterEndDate,
      filterRating,
      hoveredFilterRating,
      toggleFilterRating,
      clearFilters,
      getKingdom,
      getKingdomCardsText,
      PlayAgainKingdom,
      formatDate,
      confirmDelete,
      confirmClearAll,
      getRating,
      setRating,
      hoveredRatings
    };
  }
});
</script>

<style scoped>
.history-page { padding: 20px; max-width: 1318px;  margin: 0 auto; }
.history-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.history-container { display: flex; flex-direction: column; gap: 20px; }
.filters-section {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  background: #fcfcfc;
  border: 1px solid #e0e0e0;
  padding: 16px;
  border-radius: 8px;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 220px;
}
.filter-group--rating {
  flex: 0 1 auto;
  min-width: unset;
}
.rating-filter-container {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 38px;
}
.btn-clear-rating {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1em;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}
.btn-clear-rating:hover {
  transform: scale(1.1);
}
.filter-group label {
  font-weight: bold;
  font-size: 0.9em;
  color: #02779e;
}
.filter-input {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.95em;
  outline: none;
  transition: border-color 0.2s;
}
.filter-input:focus {
  border-color: #02779e;
}
.date-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}
.date-input {
  flex: 1;
}
.date-separator {
  font-size: 0.9em;
  color: #666;
}
.btn-clear-filters {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.1em;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-clear-filters:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.btn-clear-filters:hover {
  transform: scale(1.1);
}
.history-list { display: flex; flex-direction: column; gap: 12px; }
.history-item { 
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  padding: 5px 12px 12px 12px; 
  border: 1px solid #ccc; 
  border-radius: 6px; 
  background: #fff;
}
.item-meta { font-size: 0.85em; color: #666; min-width: 80px; }
.item-details { flex: 1; padding: 0 15px; color: #333; font-weight: 500; }
.item-actions { display: flex; gap: 8px; }
.btn-danger { background: #d32f2f; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; }
.btn-icon-danger { background: transparent; border: none; cursor: pointer; font-size: 1.2em; }
.btn-secondary { background: #f0f0f0; border: 1px solid #ccc; padding: 6px 12px; border-radius: 4px; cursor: pointer; }

.item-rating {
  display: flex;
  align-items: center;
}
.action-buttons-vertical {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.rating-stars {
  display: flex;
  gap: 4px;
}
.rating-star {
  width: 24px;
  height: 24px;
  cursor: pointer;
  filter: grayscale(100%) opacity(30%);
  transition: all 0.2s ease;
}
.rating-star--active {
  filter: none;
}
.rating-star:hover {
  transform: scale(1.2);
  filter: none;
}

@media (max-width: 768px) {
  .history-page { padding: 12px; }
  .history-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    text-align: center;
  }
  .filters-section {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 12px;
  }
  .filter-group {
    min-width: unset;
  }
  .date-inputs {
    flex-wrap: wrap;
  }
  .date-input {
    min-width: 100px;
  }
  .history-item {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
    padding: 10px;
  }
  .item-details {
    padding: 0;
  }
  .action-buttons-vertical {
    display: contents;
  }
  .item-rating {
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
  }
  .item-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #eee;
    padding-top: 10px;
    width: 100%;
  }
  .item-actions .btn-secondary {
    padding: 5px 10px;
    font-size: 0.8rem;
  }
  .item-actions .btn-icon-danger {
    font-size: 1rem;
    padding: 4px;
  }
  .history-header .btn-danger {
    padding: 6px 12px;
    font-size: 0.85rem;
    align-self: center;
  }
}
</style>