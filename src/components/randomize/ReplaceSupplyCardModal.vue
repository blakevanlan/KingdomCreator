<template>
  <div>
    <transition name="fade">
      <div class="modal-background" v-if="specifying"></div>
    </transition>
    <transition name="expand-fade">
      <div class="modal-container" v-if="specifying" @keydown.esc="handleEscapeKey">
        <div class="modal" tabindex="0" ref="modal">
  <div class="modal__title">
    {{ $t("ReplaceModal") }} " {{ specifying_names }} "
  </div>
  <div class="modal__subtitle">
    {{ $t('Customize the replacement card') }}
  </div>
  
  <div class="modal__body">
    <div class="modal__body__left-pane">
      <div class="modal__body__filters">
        <div class="modal__body__section">
          <div class="modal__body__section__title">Set</div>
          <div class="modal__body__section__options">
            <div class="modal__body__section__option">
              <label class="checkbox">
                <input type="radio" id="selectedSet" :value="null" v-model="selectedSetId" />
                <span>Any Set</span>
              </label>
            </div>
            <div v-for="set in sets" :key="set.setId" class="modal__body__section__option">
              <label class="checkbox">
                <input type="radio" id="selectedSet" :value="set.setId" v-model="selectedSetId" />
                <span>{{ set.name }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="modal__body__section__sep"></div>

        <div class="modal__body__section">
          <div class="modal__body__section__title">Type</div>
          <div class="modal__body__section__options">
            <div class="modal__body__section__option">
              <label class="checkbox">
                <input type="radio" id="selectedType" :value="null" v-model="selectedType" />
                <span>Any Type</span>
              </label>
            </div>
            <div v-for="visibleType in filteredVisibleTypes" :key="visibleType.type" class="modal__body__section__option">
              <label class="checkbox">
                <input type="radio" id="selectedType" :value="visibleType.type" v-model="selectedType" />
                <span>{{ visibleType.name }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="modal__body__section__sep"></div>

        <div class="modal__body__section modal__body__section--cost">
          <div class="modal__body__section__title">Cost</div>
          <div class="modal__body__section__options">
            <div class="modal__body__section__option">
              <div class="standard-button standard-button--is-small" @click="toggleSelectAllCosts">
                {{ allCostsSelected ? 'Deselect All' : 'Select All' }}
              </div>
            </div>
            <div v-for="visibleCost in visibleCosts" :key="visibleCost.type" class="modal__body__section__option">
              <label class="checkbox">
                <input type="checkbox" id="selectedCost" :value="visibleCost.type" v-model="selectedCosts" />
                <span>{{ visibleCost.name }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      </div>

    <div class="modal__body__section__sep" v-if="isSingleCardSelected"></div>

    <div class="modal__body__section modal__body__section--choose" v-if="isSingleCardSelected">
      <div class="modal__body__section__title">{{ $t('Choose Card') }}</div>
      <input 
        type="text" 
        class="card-search-input" 
        v-model="searchQuery" 
        :placeholder="$t('Search card...')" 
      />
      <div class="modal__body__section__options cards-list-scrollable">
        <div 
          v-for="card in searchedCards" 
          :key="card.id" 
          class="card-selection-item" 
          @click="handleSelectCard(card)"
          @mouseenter="handleMouseEnterCard(card, $event)"
          @mousemove="handleMouseMoveCard"
          @mouseleave="handleMouseLeaveCard"
        >
          {{ $t(card.id) }}
        </div>
        <div v-if="searchedCards.length === 0" class="no-cards-message">
          {{ $t('No matching cards') }}
        </div>
      </div>
      </div>
  </div>

  <div class="modal__footer">
    <div class="modal__footer__left">
      <div class="standard-button standard-button--is-grey" @click="handleCancel">Cancel</div>
      <div class="standard-button standard-button--is-primary" @click="handleRandomize">Randomize</div>
    </div>

    <div class="modal__footer__right" v-if="isSingleCardSelected">
      <span class="modal__footer__text" >
        {{ $t('ChooseCardExplanation') }}
      </span>
    </div>
  </div>
</div>
      </div>
    </transition>

    <!-- Floating Card Preview -->
    <div 
      v-if="hoveredCard && isSingleCardSelected" 
      class="card-hover-preview" 
      :style="previewStyle"
    >
      <img :src="hoveredCardImageUrl" class="card-hover-preview__img" @error="handleImgError" />
    </div>
  </div>
</template>	

<script lang="ts">
/* import Vue, typescript */
import { defineComponent, computed, watch, ref } from 'vue';

/* import Dominion Objects and type*/
import type { SetId } from '@/dominion/set-id';
import { DominionSets } from '@/dominion/dominion-sets';
import { CardType } from '@/dominion/card-type';
import { CostType } from '@/dominion/cost-type';
import { Cards } from '@/utils/cards';
import { Randomizer } from '@/randomizer/randomizer';
import type { SupplyCard } from '@/dominion/supply-card';
import { getCardImageUrl, incaseofImgerror } from '@/utils/resources';

/* import store  */
import { useRandomizerStore } from '@/pinia/randomizer-store';
import { usei18nStore } from '@/pinia/i18n-store';
import { useI18n } from 'vue-i18n';
import type { RandomizeSupplyCardParams } from '@/pinia/randomizer-store';
import { useSettingsStore } from '@/pinia/settings-store';

import  { getUnselectedSupplyCards, getSelectedSupplyCards } from '@/pinia/randomizer-actions';
import { VISIBLE_CARD_TYPES } from '@/dominion/card-type';
import { VISIBLE_COSTS } from '@/dominion/cost-type';
import { RANDOMIZATION_CONSTRAINT_USE } from '@/settings/Settings-value'

/* import Components */

export default defineComponent({
  name: "ReplaceSupplyCardModal",
  setup() {
    const { t } = useI18n()
    const randomizerStore = useRandomizerStore()
    const i18nStore = usei18nStore();
    const settingsStore = useSettingsStore();
    const selectedSetIds = computed(() => randomizerStore.settings.selectedSets);
    const selectedSetId = ref<SetId | null>(null);
    const selectedType = ref<CardType | null>(null);
    const selectedCosts = ref<CostType[]>(VISIBLE_COSTS.map(cost => cost.type)); 
    const visibleTypes = VISIBLE_CARD_TYPES;
    const visibleCosts = VISIBLE_COSTS;
    const specifying = computed(() => { return randomizerStore.specifyingReplacementSupplyCard });
    const specifying_names= computed(() => { return randomizerStore.selection.selectedSupplyIds.map(c=>t(c)).join(', ') });
    
    const searchQuery = ref('');
    const kingdom = computed(() => randomizerStore.kingdom);
    const sets = computed(() => {
      return selectedSetIds.value.map((setId) => DominionSets.getSetById(setId)).sort((a, b) => {
        return a.name == b.name ? 0 : a.name < b.name ? -1 : 1;
      });
    });

    const filteredVisibleTypes = computed(() => {
      const randomizerSettings = randomizerStore.settings.randomizerSettings;
      let outputTypes = []; // Commencez avec tous les types visibles
      const excludeCardIds = getSelectedSupplyCards(randomizerStore).map((card) => card.id);
      const includeCardIds = getUnselectedSupplyCards(randomizerStore).map((card) => card.id);
    
      const allSupplyCards =
        Cards.getAllSupplyCards(Cards.getAllCardsFromSets(DominionSets.getAllSets()));
      const allSupplyCardsToUse =
        Randomizer.removeDuplicateCards(
          allSupplyCards.filter(Cards.filterByIncludedSetIds(selectedSetIds.value)), [])
          .filter(card => !excludeCardIds.includes(card.id))
          .filter(card => !includeCardIds.includes(card.id))
      for (const visibleType of VISIBLE_CARD_TYPES) {
        if (visibleType.type === CardType.ATTACK  && !randomizerSettings.allowAttacks)  // Supposons que randomizerSettings.allowAttacks existe
          continue;
        if (allSupplyCardsToUse.some(card => card.isOfType(visibleType.type)))
          outputTypes.push(visibleType);
      }
      return outputTypes;
    })

    const filteredCards = computed(() => {
      if (!specifying.value) return [];
      const randomizerSettings = randomizerStore.settings.randomizerSettings;
      const setIdsToUse = selectedSetId.value ? [selectedSetId.value] : selectedSetIds.value;
      const allSupplyCards = Cards.getAllSupplyCards(
                  Cards.getAllCardsFromSets(DominionSets.getAllSets()
                    .filter(set => setIdsToUse.includes(set.setId))
                  ));
      // remove duplicate cards and cards in kingdom
      let cards = Randomizer.removeDuplicateCards(allSupplyCards,[])
        .filter(card => {
          const inKingdom = kingdom.value.supply.getSupplyCardsWithBaneandOthers().some(c => c.id === card.id);
          return !inKingdom 
        });
      if (selectedType.value) {
        cards = cards.filter(card => card.isOfType(selectedType.value!));
      }
      cards = cards.filter(card => selectedCosts.value.includes(card.cost.getType()));
      if (!randomizerSettings.allowAttacks) {
        cards = cards.filter(card => !card.isOfType(CardType.ATTACK));
      }
      if (RANDOMIZATION_CONSTRAINT_USE()) {
        const excludedCardIds = new Set(
          setIdsToUse.flatMap(setId => {
            const constraints = settingsStore.getSetConstraints(setId);
            return (constraints && constraints.isSelected && constraints.excludedCards) ? constraints.excludedCards : [];
          })
        );
        if (excludedCardIds.size > 0) {
          cards = cards.filter(card => !excludedCardIds.has(card.id));
        }
      }
      return cards.sort((a, b) => {
        const nameA = t(a.id);
        const nameB = t(b.id);
        return nameA.localeCompare(nameB);
      });
    });

    const searchedCards = computed(() => {
      const query = searchQuery.value.trim().toLowerCase();
      if (!query) {
        return filteredCards.value;
      }
      return filteredCards.value.filter(card => {
        const localizedName = t(card.id).toLowerCase();
        const rawId = card.id.toLowerCase();
        return localizedName.includes(query) || rawId.includes(query);
      });
    });

    const isSingleCardSelected = computed(() => {
      return randomizerStore.selection.selectedSupplyIds.length === 1;
    });

    const hoveredCard = ref<SupplyCard | null>(null);
    const mouseX = ref(0);
    const mouseY = ref(0);
    let isHoveringEnabled = false;

    const handleMouseEnterCard = (card: SupplyCard, event: MouseEvent) => {
      if (!isHoveringEnabled) return;
      hoveredCard.value = card;
      updateMousePosition(event);
    };

    const handleMouseMoveCard = (event: MouseEvent) => {
      if (!isHoveringEnabled) return;
      updateMousePosition(event);
    };

    const handleMouseLeaveCard = () => {
      hoveredCard.value = null;
    };


    const updateMousePosition = (event: MouseEvent) => {
      mouseX.value = event.clientX;
      mouseY.value = event.clientY;
    };

    const hoveredCardImageUrl = computed(() => {
      if (!hoveredCard.value) return '';
      return getCardImageUrl(hoveredCard.value.id, i18nStore.language);
    });

    const previewStyle = computed(() => {
      const offset = 15;
      let left = mouseX.value + offset;
      let top = mouseY.value + offset;
      
      if (left + 200 > window.innerWidth) {
        left = mouseX.value - 200 - offset;
      }
      if (top + 280 > window.innerHeight) {
        top = window.innerHeight - 280 - offset;
      }
      
      return {
        position: 'fixed' as const,
        left: `${left}px`,
        top: `${top}px`,
        zIndex: 9999,
        pointerEvents: 'none' as const
      };
    });

    const handleImgError = (ev: globalThis.Event) => {
      incaseofImgerror(ev);
    };

    const handleSpecifyingChanged = () => {
      // Focus the modal so that escape works properly.	
      setTimeout(() => {
        if (specifying.value) {
          searchQuery.value = '';
          isHoveringEnabled = true;
          (document.querySelector('.modal') as HTMLElement).focus();
        }
      }, 0);
    }
    watch(specifying, handleSpecifyingChanged);

    // New computed property to check if all costs are selected
    const allCostsSelected = computed(() => {
      return selectedCosts.value.length === visibleCosts.length;
    });

    // New method to toggle "Select All" / "Deselect All"
    const toggleSelectAllCosts = () => {
      if (allCostsSelected.value) {
        selectedCosts.value = []; // Deselect all
      } else {
        selectedCosts.value = visibleCosts.map(cost => cost.type); // Select all
      }
    };

    const cleanExitfunction = () => {
      isHoveringEnabled = false;
      hoveredCard.value = null;
      selectedSetId.value = null;
      selectedType.value = null;
      selectedCosts.value = VISIBLE_COSTS.map(cost => cost.type);
    }

    const handleEscapeKey = () => {
      cleanExitfunction();
      randomizerStore.CLEAR_SPECIFYING_REPLACEMENT_SUPPLY_CARD();
    }
    const handleCancel = () => {
      randomizerStore.CLEAR_SPECIFYING_REPLACEMENT_SUPPLY_CARD();
      cleanExitfunction();
    }
    const handleRandomize = () => {
      randomizerStore.RANDOMIZE_SUPPLY_CARD({
        selectedSetId: selectedSetId.value,
        selectedCardType: selectedType.value,
        selectedCostTypes: selectedCosts.value
      } as RandomizeSupplyCardParams);
      cleanExitfunction();
    }

    const handleSelectCard = (card: SupplyCard) => {
      randomizerStore.REPLACE_SPECIFYING_CARD(card);
      cleanExitfunction()
    }
    
    return {
      specifying,
      specifying_names,
      selectedSetId,
      selectedType,
      selectedCosts,
      sets,
      visibleTypes,
      visibleCosts,
      filteredVisibleTypes,
      allCostsSelected,
      toggleSelectAllCosts,
      handleEscapeKey,
      handleCancel,
      handleRandomize,
      searchQuery,
      searchedCards,
      handleSelectCard,
      isSingleCardSelected,
      hoveredCard,
      handleMouseEnterCard,
      handleMouseMoveCard,
      handleMouseLeaveCard,
      hoveredCardImageUrl,
      previewStyle,
      handleImgError,
    }
  }
})

</script>	

<style scoped>
  .modal-background,
	.modal-container {
	  position: fixed;
	  height: 100%;
	  left: 0;
	  top: 0;
	  width: 100%;
	  z-index: 0;
	}

	.modal-background {
	  background: rgba(0, 0, 0, 0.4);
	  z-index: 10;
	}

	.modal-container {
	  align-items: center;
	  display: flex;
	  flex-direction: row;
	  justify-content: center;
	  z-index: 20;
	}

	.modal {
	  background: #fff;
	  border-radius: 8px;
	  box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
	  min-width: 300px;
	  max-height: 605px;
	  max-width: calc(100% - 8px);
	  outline: none;
	  overflow-x: hidden;
	  overflow-y: hidden;
	  z-index: 20;
	}

	.modal__title {
	  font-size: 28px;
	  padding: 20px 20px 0 20px;
	}

	.modal__subtitle {
	  color: #777;
	  font-size: 14px;
	  border-bottom: 1px solid #ccc;
	  margin-bottom: 8px;
	  padding: 0 20px 4px 20px;
	}

	.modal__body {
	  display: flex;
	  flex-direction: row;
	  flex-wrap: wrap;
	  justify-content: stretch;
	  padding: 0 20px;
	}

	.modal__body__section {
	  display: flex;
	  flex-direction: column;
	  margin: 6px;
	  width: 130px;
	}

	.modal__body__section__options {
	  display: flex;
	  flex-direction: column;
    max-height: 255px;
	}

	.modal__body__section__sep {
	  background: #ccc;
	  height: auto;
	  margin: 36px 16px;
	  width: 1px;
	}

	.modal__body__section__title {
	  font-size: 24px;
	  margin-bottom: 5px;
	}

	.modal__body__section .checkbox {
	  font-size: 18px;
	}

  .modal__body__left-pane {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    max-height: 400px;
    overflow-y: auto;
  }
  
  .modal__body__filters {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: stretch;
  }

/* Nouveau Footer Global */
  .modal__footer {
    background: #eee;
    border-top: 1px solid #ccc;
    display: flex;
    flex-direction: row;
    padding: 16px 20px;
    margin-top: 20px;
  }

  /* Zone des boutons : prend tout l'espace disponible à gauche 
     et pousse les boutons vers la droite de cette zone (juste avant la séparation) */
  .modal__footer__left {
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    padding-right: 32px; /* Aligné avec la marge du séparateur vertical */
  }

  .modal__footer__left .standard-button {
    margin-left: 8px;
  }

  /* Zone du texte : fait exactement la même largeur (250px) 
     que la colonne "Choose Card" du dessus */
  .modal__footer__right {
    width: 250px;
    margin-left: 16px; /* Aligné avec la marge du séparateur vertical */
    display: flex;
    align-items: center;
  }

  /* Style du texte */
  .modal__footer__text {
    color: #333;
    font-size: 16px;
    text-align: left;
  }

  .modal__footer__buttons {
    display: flex;
    flex-direction: row;
  }

  .modal__footer__buttons .standard-button {
    margin-left: 8px;
  }

  .standard-button {
    /* Existing styles for standard-button */
    padding: 8px 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    display: inline-block;
    font-size: 16px;
    text-align: center;
    transition: background-color 0.2s ease;
  }
  
  .standard-button--is-grey {
    background-color: #f0f0f0;
    color: #333;
  }
  
  .standard-button--is-primary {
    background-color: #007bff;
    color: #fff;
    border-color: #007bff;
  }
  
  /* New style for the small button */
  .standard-button--is-small {
    background-color: #e0e0e0;
    color: #333;
    padding: 4px 8px; /* Smaller padding */
    font-size: 14px; /* Smaller font size */
    margin-bottom: 8px; /* Add some space below the button */
  }
  
  .standard-button--is-small:hover {
    background-color: #d0d0d0;
  }

  .modal__body__section--choose {
    width: 250px;
    height: 300px;
  }
  
  .card-search-input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    margin-bottom: 6px;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.2s ease;
  }

  .card-search-input:focus {
    border-color: #007bff;
  }
  
  .cards-list-scrollable {
    max-height: 215px;
    overflow-y: auto;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 4px;
    background: #fafafa;
    display: flex;
    flex-direction: column;
    gap: 4px;
    box-sizing: border-box;
  }

  .card-selection-item {
    padding: 4px 12px;
    background: #fff;
    border: 2px solid #e0e0e0;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s ease;
    text-align: left;
  }

  .card-selection-item:hover {
    background: #007bff;
    color: #fff;
    border-color: #007bff;
  }

  .no-cards-message {
    padding: 12px;
    color: #888;
    text-align: center;
    font-size: 14px;
  }

  .card-hover-preview {
    width: 200px;
    height: 310px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
    background: #000;
    overflow: hidden;
    pointer-events: none;
    transition: transform 0.1s ease-out;
  }
  
  .card-hover-preview__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

 

	@media (max-width: 570px) {
	  .modal {
	    height: calc(100vh - 8px);
	  }

	  .modal__title {
	    padding: 12px 12px 0 12px;
	  }

	  .modal__subtitle {
	    padding: 0 12px 4px 12px;
	  }

	  .modal__body {
	    display: block;
	    max-width: 100%;
	    padding: 0 6px;
	  }

	  .modal__body__section {
	    box-sizing: border-box;
	    flex: 0 1 auto;
	    margin-bottom: 10px;
	    max-width: 100%;
	    width: auto;
	  }

	  .modal__body__section__sep {
	    display: none;
	  }

	  .modal__body__section__options {
	    display: flex;
	    flex-direction: row;
	    flex-wrap: wrap;
      
	  }

    .modal__body__section--cost .modal__body__section__options {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 12px 12px; /* Ajoute un espace vertical (12px) et horizontal (16px) entre chaque coût */
   /*     margin-top: 8px; Crée de l'espace sous le bouton Deselect/Select All */
    }

	  .modal__body__section__option {
	    width: 50%;
	  }

	  .modal__body__section--cost 
    .modal__body__section__option {
	    width: 33%;
	  }
    
    .modal__body__section--cost 
    .modal__body__section__option {
      width: auto; /* Reset width for the "Select/Deselect All" button */
    }

    .modal__body__section--cost 
    .modal__body__section__option:first-child {
      width: 100%; 
    }

    .modal__body__section--choose {
      width: 100% !important;
      margin-top: 15px;
    }
    .cards-list-scrollable {
      max-height: 200px;
      display: flex !important;
      flex-direction: column !important;
      flex-wrap: nowrap !important;
    }
    .card-selection-item {
      width: 100% !important;
      box-sizing: border-box;
    }
    .card-hover-preview {
      display: none !important;
    }
	}
</style>