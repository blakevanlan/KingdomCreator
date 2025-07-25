<template>
  <div class="sidebar">
        <a class="standard-button standard-button--is-primary standard-button--large desktop_randomize-button masking-button">
      {{ "placeHolder" }}
    </a> 
    <div class="sidebar-content filters">
      <div class="sidebar-content-title">{{ $t("SearchFilters") }}</div>
      <div class="filter-group">
        <div for="cardName" class="checkbox">{{ $t("CardName_Partial") }}:</div>
        <input type="text" id="cardName" :value="searchName" @input="updateSearchName" class="sidebar-input" />
      </div>
      <div class="checkbox">{{ $t("SetsFilter") }}</div>
      <div class="filter-group">
        <div class="listbox-container">
          <Listbox :modelValue="selectedSetIds" multiple @update:modelValue="updateSelectedSetIds">
            <div class="settingsInput listbox-wrapper">
              <ListboxButton class="listboxCard">
                <span class="truncate-block">
                  {{ getButtonTextForSets(selectedSetIds) }}
                </span>
                <span class="chevronlistbox">
                  <ChevronUpDownIcon class="chevronlistboxIcon" aria-hidden="true" />
                </span>
              </ListboxButton>
              <transition leave-active-class="listboxTransition" leave-from-class="listboxOpacityleavefrom"
                leave-to-class="listboxOpacityleaveto">
                <ListboxOptions class="listboxOptions">
                  <ListboxOption v-slot="{ active, selected }" v-for="set in sets" :key="set.setId" :value="set.setId"
                    as="template">
                    <li class="listboxOption" :class="{ 'active-listbox-option': active }">
                      <span class="truncate-block">{{ $t(set.setId) }}</span>
                      <span v-if="selected" class="listboxOptionSelected">
                        <CheckIcon class="chevronlistboxIcon" aria-hidden="true" />
                      </span>
                    </li>
                  </ListboxOption>
                </ListboxOptions>
              </transition>
            </div>
          </Listbox>
        </div>
      </div>
      <div class="checkbox">{{ $t("TypesFilter") }}</div>
      <div class="filter-group">
        <div class="listbox-container">
          <Listbox :modelValue="selectedCardTypes" multiple @update:modelValue="updateSelectedCardTypes">
            <div class="settingsInput listbox-wrapper">
              <ListboxButton class="listboxCard">
                <span class="truncate-block">
                  {{ getButtonTextForTypes(selectedCardTypes) }}
                </span>
                <span class="chevronlistbox">
                  <ChevronUpDownIcon class="chevronlistboxIcon" aria-hidden="true" />
                </span>
              </ListboxButton>
              <transition leave-active-class="listboxTransition" leave-from-class="listboxOpacityleavefrom"
                leave-to-class="listboxOpacityleaveto">
                <ListboxOptions class="listboxOptions">
                  <ListboxOption v-slot="{ active, selected }" v-for="visibleType in allVisibleCardTypes"
                    :key="visibleType.type" :value="visibleType.type" as="template">
                    <li class="listboxOption" :class="{ 'active-listbox-option': active }">
                      <span class="truncate-block">{{ $t(visibleType.name) }}</span>
                      <span v-if="selected" class="listboxOptionSelected">
                        <CheckIcon class="chevronlistboxIcon" aria-hidden="true" />
                      </span>
                    </li>
                  </ListboxOption>
                </ListboxOptions>
              </transition>
            </div>
          </Listbox>
        </div>
      </div>
      <div class="checkbox">{{ $t("CostsFilter") }}</div>
      <div class="filter-group">
        <div class="listbox-container">
          <Listbox :modelValue="selectedCostTypes" multiple @update:modelValue="updateSelectedCostTypes">
            <div class="settingsInput listbox-wrapper">
              <ListboxButton class="listboxCard">
                <span class="truncate-block">
                  {{ getButtonTextForCosts(selectedCostTypes) }}
                </span>
                <span class="chevronlistbox">
                  <ChevronUpDownIcon class="chevronlistboxIcon" aria-hidden="true" />
                </span>
              </ListboxButton>
              <transition leave-active-class="listboxTransition" leave-from-class="listboxOpacityleavefrom"
                leave-to-class="listboxOpacityleaveto">
                <ListboxOptions class="listboxOptions">
                  <ListboxOption v-slot="{ active, selected }" v-for="visibleCost in visibleCosts"
                    :key="visibleCost.type" :value="visibleCost.type" as="template">
                    <li class="listboxOption" :class="{ 'active-listbox-option': active }">
                      <span class="truncate-block">{{ $t(visibleCost.name) }}</span>
                      <span v-if="selected" class="listboxOptionSelected">
                        <CheckIcon class="chevronlistboxIcon" aria-hidden="true" />
                      </span>
                    </li>
                  </ListboxOption>
                </ListboxOptions>
              </transition>
            </div>
          </Listbox>
        </div>
      </div>
      <div class="clear"></div>
      <div class="sidebar-content-title">{{ $t("Sort") }}</div>
      <div class="filter-group">
        <div class="option" v-for="sortOption in sortOptions" :key="sortOption.value">
          <label class="checkbox">
            <input type="radio" name="sortOption" :value="sortOption.value" v-model="selectedSortOption">
            <span>{{ $t(sortOption.display) }}</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';
import { useI18n } from 'vue-i18n';
import { useSettingsStore } from "../pinia/settings-store";
import { useSearchStore } from "../pinia/search-store";
import type { SetId } from "../dominion/set-id";
import { DominionSets } from "../dominion/dominion-sets";
import { CardType, VISIBLE_CARD_TYPES } from "../dominion/card-type";
import { CostType, VISIBLE_COSTS } from "../dominion/cost-type";
import { SortOption } from "../settings/settings";

export default defineComponent({
  name: "SearchFilters",
  components: {
    Listbox,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
    CheckIcon,
    ChevronUpDownIcon,
  },
  setup() {
    const { t } = useI18n();
    const SearchStore = useSearchStore();
    const SettingsStore = useSettingsStore();

    const searchName = computed({
      get: () => SearchStore.searchName,
      set: (val: string) => SearchStore.searchName = val
    });
    const selectedSetIds = computed({
      get: () => SearchStore.selectedSetIds,
      set: (val: SetId[]) => SearchStore.selectedSetIds = val
    });
    const selectedCardTypes = computed({
      get: () => SearchStore.selectedCardTypes,
      set: (val: CardType[]) => SearchStore.selectedCardTypes = val
    });
    const selectedCostTypes = computed({
      get: () => SearchStore.selectedCostTypes,
      set: (val: CostType[]) => SearchStore.selectedCostTypes = val
    });
    const sortOptions = [
      { display: "Set", value: "SET" },
      { display: "Alphabetical", value: "ALPHABETICAL" },
      { display: "Cost", value: "COST" },
    ];
    const selectedSortOption = computed({
      get: () => SearchStore.selectedSortOption,
      set: (val: string) => SearchStore.selectedSortOption = val
    });

    const updateSearchName = (event: Event) => {
      searchName.value = (event.target as HTMLInputElement).value;
    };
    const updateSelectedSetIds = (value: SetId[]) => {
      selectedSetIds.value = value;
    };
    const updateSelectedCardTypes = (value: CardType[]) => {
      selectedCardTypes.value = value;
    };
    const updateSelectedCostTypes = (value: CostType[]) => {
      selectedCostTypes.value = value;
    };

    const sets = computed(() => {
      let setIds: SetId[];
      if (SettingsStore.isUsingOnlyOwnedsets && SettingsStore.ownedSets.length > 0) {
        setIds = SettingsStore.ownedSets as SetId[];
      } else {
        setIds = DominionSets.getAllSets().map(set => set.setId) as SetId[];
      }
      return DominionSets.getAllSets()
        .filter(set => setIds.includes(set.setId))
        .sort((a, b) => t(a.setId).localeCompare(t(b.setId)));
    });

    const allVisibleCardTypes = VISIBLE_CARD_TYPES;
    const visibleCosts = VISIBLE_COSTS;

    const getButtonTextForSets = (selectedIds: SetId[]) => {
      if (selectedIds.length === 0) {
        return t('AnySet');
      } else if (selectedIds.length === sets.value.length) {
        return t('AllSetsSelected');
      } else {
        const selectedNames = selectedIds.map(id => t(id));
        return `${selectedNames.length} ${t('SetsSelected', selectedNames.length)}: ${selectedNames.join(', ')}`;
      }
    };

    const getButtonTextForTypes = (selectedTypes: CardType[]) => {
      if (selectedTypes.length === 0) {
        return t('AnyType');
      } else if (selectedTypes.length === allVisibleCardTypes.length) {
        return t('AllTypesSelected');
      } else {
        const selectedNames = selectedTypes.map(type => {
          const visibleType = VISIBLE_CARD_TYPES.find(vt => vt.type === type);
          return visibleType ? visibleType.name : type;
        });
        return `${selectedNames.length} ${t('TypesSelected', selectedNames.length)}: ${selectedNames.join(', ')}`;
      }
    };

    const getButtonTextForCosts = (selectedCosts: CostType[]) => {
      if (selectedCosts.length === 0) {
        return t('AnyCost');
      } else if (selectedCosts.length === visibleCosts.length) {
        return t('AllCostsSelected');
      } else {
        const selectedNames = selectedCosts.map(cost => {
          const visibleCost = VISIBLE_COSTS.find(vc => vc.type === cost);
          return visibleCost ? visibleCost.name : cost;
        });
        return `${selectedNames.length} ${t('CostsSelected', selectedNames.length)}: ${selectedNames.join(', ')}`;
      }
    };

    return {
      searchName,
      selectedSetIds,
      selectedCardTypes,
      selectedCostTypes,
      updateSearchName,
      updateSelectedSetIds,
      updateSelectedCardTypes,
      updateSelectedCostTypes,
      sets,
      allVisibleCardTypes,
      visibleCosts,
      getButtonTextForSets,
      getButtonTextForTypes,
      getButtonTextForCosts,
      sortOptions,
      selectedSortOption,
    };
  },
});
</script>

<style scoped>
:root {
  --primary-font: 'Segoe UI', 'Arial', sans-serif;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
}


/* Styles from SearchCards.vue for filter-group and listbox components */
.search-filters {
  display: flex;
  flex-direction: column; /* Default to column for small screens */
  gap: 20px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  flex-direction: column;
  /*min-width: 250px;*/
}

.filter-group label {
  font-weight: bold;
  margin-bottom: 5px;
}

.filter-group input[type="text"] {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
 
}

.listbox-container {
  position: relative;
  width: 100%;
}

.listbox-wrapper {
  position: relative;
  width: 100%;
}

.listboxCard {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  text-align: left;
  cursor: default;
  border-radius: .5rem;
  padding: .5rem 2.5rem .5rem .75rem;
  border: 1px solid #ccc;
  background-color: #fff;
  font-family: var(--primary-font);
  font-weight: bold;
  /* font-size: 0.9em; */
}

.listboxCard:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  border-color: #4F46E5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.5);
}

.truncate-block {
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.chevronlistbox {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  display: flex;
  align-items: center;
}

.chevronlistboxIcon {
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
}

.listboxTransition {
  transition-property: opacity, transform;
  transition-duration: 0.1s;
  transition-timing-function: ease-out;
}

.listboxOpacityleavefrom {
  opacity: 1;
  transform: translateY(0);
}

.listboxOpacityleaveto {
  opacity: 0;
  transform: translateY(-5px);
}

.listboxOptions {
  position: absolute;
  max-height: 15rem;
  width: 100%;
  border-radius: 0.375rem;
  overflow: auto;
  background-color: #fff;
  z-index: 20; /* Le menu déroulant reste au-dessus */
  list-style: none;
  padding: 0;
  margin-top: 4px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #eee;
}

.listboxOptions:focus {
  outline: none;
}

.listboxOption {
  user-select: none;
  position: relative;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 0.9em;
}

.listboxOption:hover,
.listboxOption.active-listbox-option {
  background-color: #f3f4f6;
  color: #1f2937;
}

.listboxOptionSelected {
  display: flex;
  align-items: center;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  padding-left: 0.75rem;
  color: #4F46E5;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .search-filters {
    flex-direction: column;
    gap: 15px;
  }
  .filter-group {
    min-width: unset;
    width: 85%;
  }
}

.desktop_randomize-button,
.condensed_randomize-button {
  display: block;
  margin: 2px;
}

.condensed_randomize-button {
  margin-top: 12px;
}

.masking-button {
  background: unset;
  border-color: unset;
  box-shadow: unset;
  color:#ffffff;
  pointer-events: none;
  cursor: default;
}

</style>