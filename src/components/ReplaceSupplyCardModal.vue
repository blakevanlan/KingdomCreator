<template>
  <div>
    <transition name="fade">
      <div class="modal-background" v-if="specifying"></div>
    </transition>
    <transition name="expand-fade">
      <div class="modal-container" v-if="specifying" @keydown.esc="handleEscapeKey">
        <div class="modal" tabindex="0" ref="modal">
          <div class="modal__title">
            Replace {{ specifying.name }}
          </div>
          <div class="modal__subtitle">
            Customize the replacement card
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
                <div v-for="visibleType in visibleTypes" :key="visibleType.type" class="modal__body__section__option">
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

/* import store  */
import { useRandomizerStore } from "../pinia/randomizer-store";
import type { RandomizeSupplyCardParams } from "../pinia/randomizer-store";

/* import Components */

interface VisibleType<T> {
  type: T;
  name: string;
}
const VISIBLE_CARD_TYPES: VisibleType<CardType>[] = [
  { type: CardType.ACTION, name: "Action" },
  { type: CardType.ACTION_SUPPLIER, name: "+2 Actions" },
  { type: CardType.DRAWER, name: "+ Cards" },
  { type: CardType.BUY_SUPPLIER, name: "+1 Buy" },
  { type: CardType.ATTACK, name: "Attack" },
  { type: CardType.DURATION, name: "Duration" },
  { type: CardType.REACTION, name: "Reaction" },
  { type: CardType.RESERVE, name: "Reserve" },
  { type: CardType.TRASHING, name: "Trashing" },
  { type: CardType.TREASURE, name: "Treasure" },
  { type: CardType.VICTORY, name: "Victory" },
];
const VISIBLE_COSTS: VisibleType<CostType>[] = [
  { type: CostType.TREASURE_2_OR_LESS, name: "0-2" },
  { type: CostType.TREASURE_3, name: "3" },
  { type: CostType.TREASURE_4, name: "4" },
  { type: CostType.TREASURE_5, name: "5" },
  { type: CostType.TREASURE_6, name: "6" },
  { type: CostType.TREASURE_7, name: "7" },
  { type: CostType.TREASURE_8_OR_MORE, name: "8+" },
];

export default defineComponent({
  name: "ReplaceSupplyCardModal",
  setup() {
    const randomizerStore = useRandomizerStore()
    const selectedSetIds = computed(() => randomizerStore.settings.selectedSets);
    const selectedSetId = ref<SetId | null>(null);
    const selectedType = ref<CardType | null>(null);
    const selectedCosts = [
      CostType.TREASURE_2_OR_LESS,
      CostType.TREASURE_3,
      CostType.TREASURE_4,
      CostType.TREASURE_5,
      CostType.TREASURE_6,
      CostType.TREASURE_7,
      CostType.TREASURE_8_OR_MORE,
    ];
    const sets = computed(() => {
      return selectedSetIds.value.map((setId) => DominionSets.getSetById(setId)).sort((a, b) => {
        return a.name == b.name ? 0 : a.name < b.name ? -1 : 1;
      });
    });

    const visibleTypes = VISIBLE_CARD_TYPES;
    const visibleCosts = VISIBLE_COSTS;

    const specifying = computed(() => { return randomizerStore.specifyingReplacementSupplyCard });
    const handleSpecifyingChanged = () => {
      // Focus the modal so that escape works properly.	
      setTimeout(() => {
        if (specifying.value) {
          (document.querySelector('.modal') as HTMLElement).focus();
        }
      }, 0);
    }
    watch(specifying, handleSpecifyingChanged);

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
        selectedCostTypes: selectedCosts
      } as RandomizeSupplyCardParams);
    }
    return {
      specifying,
      selectedSetId,
      selectedType,
      selectedCosts,
      sets,
      visibleTypes,
      visibleCosts,
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
	}
</style>