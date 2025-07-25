<template>
  <div>
    <transition name="fade">
      <div class="modal-background" v-if="specifying"></div>
    </transition>
    <transition name="expand-fade">
      <div class="modal-container" v-if="specifying" @keydown.esc="handleEscapeKey">
        <div class="modal" tabindex="0" ref="modal">
          <div class="modal__title">
            {{ $t("ReplaceModal") }} {{ specifying_names }}
          </div>
          <div class="modal__subtitle">
            {{ $t('Customize the replacement card') }}
          </div>
          <div class="modal__body">
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

          <div class="modal__footer">
            <div class="standard-button standard-button--is-grey" @click="handleCancel">Cancel</div>
            <div class="standard-button standard-button--is-primary" @click="handleRandomize">Randomize</div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>	

<script lang="ts">
/* import Vue, typescript */
import { defineComponent, computed, watch, ref } from "vue";

/* import Dominion Objects and type*/
import type { SetId } from "../dominion/set-id";
import { DominionSets } from "../dominion/dominion-sets";
import { CardType } from "../dominion/card-type";
import { CostType } from "../dominion/cost-type";
import { Cards } from "../utils/cards";
import { Randomizer } from "../randomizer/randomizer";


/* import store  */
import { useRandomizerStore } from "../pinia/randomizer-store";
import { useI18n } from "vue-i18n";
import type { RandomizeSupplyCardParams } from "../pinia/randomizer-store";
import  { getUnselectedSupplyCards, getSelectedSupplyCards } from "../pinia/randomizer-actions"
import { VISIBLE_CARD_TYPES } from "../dominion/card-type"
import { VISIBLE_COSTS } from "../dominion/cost-type"

/* import Components */

export default defineComponent({
  name: "ReplaceSupplyCardModal",
  setup() {
    const { t } = useI18n()
    const randomizerStore = useRandomizerStore()
    const selectedSetIds = computed(() => { console.log (randomizerStore.selection); return randomizerStore.settings.selectedSets});
    const selectedSetId = ref<SetId | null>(null);
    const selectedType = ref<CardType | null>(null);
    const selectedCosts = ref<CostType[]>(VISIBLE_COSTS.map(cost => cost.type)); 
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


    const visibleTypes = VISIBLE_CARD_TYPES;
    const visibleCosts = VISIBLE_COSTS;

    const specifying = computed(() => { return randomizerStore.specifyingReplacementSupplyCard });
    const specifying_names= computed(() => { return randomizerStore.selection.selectedSupplyIds.map(c=>t(c)).join(', ') });
    const handleSpecifyingChanged = () => {
      // Focus the modal so that escape works properly.	
      setTimeout(() => {
        if (specifying.value) {
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

    const handleEscapeKey = () => {
      randomizerStore.CLEAR_SPECIFYING_REPLACEMENT_SUPPLY_CARD();
    }
    const handleCancel = () => {
      randomizerStore.CLEAR_SPECIFYING_REPLACEMENT_SUPPLY_CARD();
    }
    const handleRandomize = () => {
      randomizerStore.RANDOMIZE_SUPPLY_CARD({
        selectedSetId: selectedSetId.value,
        selectedCardType: selectedType.value,
        selectedCostTypes: selectedCosts.value
      } as RandomizeSupplyCardParams);
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
      allCostsSelected, // Make available to template
      toggleSelectAllCosts, // Make available to template
      handleEscapeKey,
      handleCancel,
      handleRandomize
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
	  overflow-y: auto;
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
	}

	.modal__body__section__sep {
	  background: #ccc;
	  height: auto;
	  margin: 36px 16px;
	  width: 1px;
	}

	.modal__body__section__title {
	  font-size: 24px;
	  margin-bottom: 6px;
	}

	.modal__body__section .checkbox {
	  font-size: 18px;
	}

	.modal__footer {
	  background: #eee;
	  border-top: 1px solid #ccc;
	  display: flex;
	  flex-direction: row;
	  justify-content: flex-end;
	  margin-top: 12px;
	  padding: 16px 20px;
	}

	.modal__footer .standard-button {
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

	  .modal__body__section__option {
	    width: 50%;
	  }

	  .modal__body__section--cost .modal__body__section__option {
	    width: 33%;
	  }
    
    .modal__body__section--cost .modal__body__section__option {
      width: auto; /* Reset width for the "Select/Deselect All" button */
    }

    .modal__body__section--cost .modal__body__section__option:first-child {
      width: 100%; /* Make the button take full width */
    }
	}
</style>