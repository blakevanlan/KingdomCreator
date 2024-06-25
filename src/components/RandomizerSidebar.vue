<template>
  <div class="sidebar">
    <a class="standard-button standard-button--is-primary standard-button--large desktop_randomize-button"
      v-if="!isCondensed" @click="handleRandomize">
      {{ $t(randomizeButtonText) }}
    </a>
    <div class="sidebar-content filters">
      <div class="sidebar-content-title">
        <span>{{ $t("Sets") }}</span>
        <div class="sidebar-content-option">
        <label class="checkbox sidebar-content-option">
            <input type="radio" style="margin-left:5px;" v-model="setsOrderType" :value="'alpha'"
            @change="handleSetOrderTypeChange('alpha')" />
            <span>{{ $t("Alphabetical") }}</span>
        </label> 
        <label class="checkbox sidebar-content-option" style="margin-left:10px;">
            <input type="radio" style="margin-left:5px;" v-model="setsOrderType" :value="'date'"
            @change="handleSetOrderTypeChange('date')" />
            <span>{{ $t("Date") }}</span>
        </label>
        </div>
      </div>
      <div class="sets">
        <div class="set" v-for="setId in setIds" :key="setId">
          <label class="checkbox">
            <input type="checkbox" v-model="selectedSetIds" :id="setId" :value="setId">
            <span>{{ $t(setId) }} <span v-if="FindMultipleVersionSets(setId).length !== 0"> - 1st</span></span>
          </label>
          <span v-if="FindMultipleVersionSets(setId).length !== 0">
            <label class="checkbox suboption-set">
              <input type="checkbox" v-model="selectedSetIds" :id="(FindMultipleVersionSets(setId))[0].idv2"
                :value="(FindMultipleVersionSets(setId))[0].idv2">
              <span>2nd</span>
            </label>
          </span>
        </div>
      </div>
      <div class="clear"></div>
      <div class="sidebar-content-title">{{ $t("Options") }}</div>
      <div class="option">
        <label class="checkbox">
          <input type="checkbox" v-model="requireActionProvider">
          <span>{{ $t("Require +2 Action") }}</span>
        </label>
      </div>
      <div class="option">
        <label class="checkbox">
          <input type="checkbox" v-model="requireCardProvider">
          <span>{{ $t("Require Drawer") }}</span>
        </label>
      </div>
      <div class="option">
        <label class="checkbox">
          <input type="checkbox" v-model="requireBuyProvider">
          <span>{{ $t("Require Buy") }}</span>
        </label>
      </div>
      <div class="option">
        <label class="checkbox">
          <input type="checkbox" v-model="allowAttacks">
          <span>{{ $t("Allow Attacks") }}</span>
        </label>
        <div class="suboption">
          <label class="checkbox" :class="{ disable: !allowAttacks }">
            <input type="checkbox" v-model="requireReaction" :disabled="!allowAttacks">
            <span>{{ $t("Require Reaction") }}</span>
          </label>
        </div>
      </div>
      <div class="option">
        <label class="checkbox">
          <input type="checkbox" v-model="requireTrashing">
          <span>{{ $t("Require Trashing") }}</span>
        </label>
      </div>
      <div class="option" v-if="isAlchemySelected">
        <label class="checkbox">
          <input type="checkbox" v-model="isAlchemyRecommendationEnabled">
          <span>{{ $t("3Plus_Alchemy_Cards") }}</span>
        </label>
      </div>
      <div class="option" v-if="isDistributeCostAllowed">
        <label class="checkbox">
          <input type="checkbox" v-model="distributeCost">
          <span>{{ $t("Distribute Cost") }}</span>
        </label>
      </div>
      <div class="option" v-if="isPrioritizeSetAllowed">
        <label class="checkbox">
          <input type="checkbox" v-model="isPrioritizeSetEnabled">
          <span>{{ $t("Prioritize Set") }}</span>
        </label>
        <div class="suboption">
          <select aria-label="prioritizeSet" :disabled="!isPrioritizeSetEnabled" v-model="prioritizeSet">
            <option v-if="prioritizeSet == null" :value="null">{{ $t("Choose set") }}</option>
            <option v-for="setId in selectedSetIds" :value="setId" :key="setId">
              {{ getSetName(setId) }}
            </option>
          </select>
        </div>
      </div>
      <div class="sidebar-content-title">{{ $t("Sort") }}</div>
      <div class="option" v-for="sortOption in sortOptions" :key="sortOption.value">
        <label class="checkbox">
          <input type="radio" name="sortOption" :value="sortOption.value" v-model="selectedSortOption">
          <span>{{ $t(sortOption.display) }}</span>
        </label>
      </div>
      <a class="standard-button standard-button--is-primary standard-button--large condensed_randomize-button"
        v-if="isCondensed" @click="handleRandomize">
        {{ $t(randomizeButtonText) }}
      </a>
    </div>
  </div>
</template>

<script lang="ts">
/* import Vue, typescript */
import { defineComponent, ref, computed, watch } from "vue";
import { useI18n } from 'vue-i18n'

/* import Dominion Objects and type*/
import { DominionSets } from "../dominion/dominion-sets";
import { MultipleVersionSets, HideMultipleVersionSets, Sets_To_Ignore_Regroup } from "../dominion/set-id";
import type { SetId } from "../dominion/set-id";
import { Year_set } from "../dominion/digital_cards/digital-cards-Illustrator"

/* imoprt store  */
import { useWindowStore } from "../pinia/window-store";
import { useRandomizerStore } from "../pinia/randomizer-store";
import { useSetsStore } from '../pinia/sets-store';

import type { SettingsParams } from "../settings/settings";
import { SortOption } from "../settings/settings";
import type { RandomizerSettingsParams, RandomizerSettingsParamsBoolean } from "../settings/randomizer-settings";

/* import Components */

export default defineComponent({
  name: "RandomizerSidebar",
  components: {
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const randomizerStore = useRandomizerStore()
    const setsStore = useSetsStore()
    const windowStore = useWindowStore()
    const isCondensed = computed(() => { return windowStore.isCondensed });
    const isDistributeCostAllowed = computed(() => { return randomizerStore.isDistributeCostAllowed });
    const isPrioritizeSetAllowed = computed(() => { return randomizerStore.isPrioritizeSetAllowed });
    const isAlchemySelected = computed(() => { return randomizerStore.isAlchemySelected });
    const randomizeButtonText = computed(() => { return randomizerStore.randomizeButtonText });
    const settings = computed(() => { return randomizerStore.settings });
    const randomizerSettings = computed(() => { return randomizerStore.settings.randomizerSettings });
    const setsOrderType = ref(setsStore.setsOrderType)

    const setIds = computed(() => { 
        const AllSetIdsToConsider = DominionSets.getAllSetsIds()
            .filter(setId => !Sets_To_Ignore_Regroup.has(setId))
            .filter(setId => { return (HideMultipleVersionSets.indexOf(setId) == -1) })
        const sortedSets = setsOrderType.value === 'date'   // Check if sortType has a value (not undefined)
            ? AllSetIdsToConsider.sort((a, b) => (Year_set.find(set => set.id === a)?.order ||0) - (Year_set.find(set => set.id === b)?.order ||0))
            : AllSetIdsToConsider.sort((a, b) => t(a).localeCompare(t(b)))
        return sortedSets;
      }
      );

    const selectedSetIds = ref(settings.value.selectedSets);
    watch(selectedSetIds, (values: string[]) => {
      // Clear the prioritized set if it's no longer selected.
      if (!values.some(x => x == prioritizeSet.value)) {
        updateRandomizerSettings({ prioritizeSet: null });
      }
      randomizerStore.UPDATE_SETTINGS({
        selectedSets: values.map(DominionSets.convertToSetId)
      } as SettingsParams);
    })

    const FindMultipleVersionSets = (setValue: string) => {
      return MultipleVersionSets.filter(set => { return (set.id === setValue) })
    }

    type SettingsObject = {
      [key: string]: boolean;
    }

    function createComputedSettingsObject(property: keyof RandomizerSettingsParamsBoolean) {
      return computed<boolean>({
        // Calcul de la propriété
        get: (): boolean => randomizerSettings.value[property],
        // Mise à jour de la propriété
        set: (value: boolean) => {
          const updateObject: SettingsObject = {};
          updateObject[property] = value;
          updateRandomizerSettings(updateObject);
        }
      });
    }

    const requireActionProvider = createComputedSettingsObject('requireActionProvider');
    const requireCardProvider = createComputedSettingsObject('requireCardProvider');
    const requireBuyProvider = createComputedSettingsObject('requireBuyProvider');
    const allowAttacks = createComputedSettingsObject('allowAttacks');
    const requireReaction = createComputedSettingsObject('requireReaction');
    const requireTrashing = createComputedSettingsObject('requireTrashing');
    const distributeCost = createComputedSettingsObject('distributeCost');

    // const prioritizeSet = createComputedSettingsObject('prioritizeSet');

    const isAlchemyRecommendationEnabled = createComputedSettingsObject('isAlchemyRecommendationEnabled');

    const sortOptions = [
      { display: "Set", value: SortOption.SET },
      { display: "Alphabetical", value: SortOption.ALPHABETICAL },
      { display: "Cost", value: SortOption.COST },
    ];

    const selectedSortOption = computed({
      get: () => settings.value.sortOption,
      set: (sortOption: SortOption) => {
        randomizerStore.UPDATE_SETTINGS({ sortOption: sortOption } as SettingsParams);
      }
    })

    const prioritizeSet = computed({
      get: () => randomizerSettings.value.prioritizeSet,
      set: (value: SetId | null) => { updateRandomizerSettings({ prioritizeSet: value }) }
    })

    const isPrioritizeSetEnabled = computed({
      get: () => { return randomizerSettings.value.prioritizeSet != null },
      set: (value: boolean) => {
        const setId = value && selectedSetIds.value.length
          ? DominionSets.convertToSetId((selectedSetIds.value).concat().sort()[0])
          : null;
        updateRandomizerSettings({ prioritizeSet: setId });
      }
    })

    const getSetName = (setId: SetId) => {
      return DominionSets.getSetById(setId).name;
    }

    const handleRandomize = () => {
      emit("randomize")
    }

    const handleSetOrderTypeChange = (value: string) => {
      setsStore.updateSetsOrderType(value);
    };

    const updateRandomizerSettings = (params: RandomizerSettingsParams) => {
      randomizerStore.UPDATE_SETTINGS({
        randomizerSettings: params
      } as SettingsParams);
    }

    return {
      randomizeButtonText,
      handleRandomize,
      handleSetOrderTypeChange,
      isCondensed,
      setIds,
      selectedSetIds,
      setsOrderType,
      FindMultipleVersionSets,
      requireActionProvider,
      requireBuyProvider,
      requireCardProvider,
      requireReaction,
      requireTrashing,
      allowAttacks,
      prioritizeSet,
      isPrioritizeSetAllowed,
      isPrioritizeSetEnabled,
      selectedSortOption,
      sortOptions,
      distributeCost,
      isDistributeCostAllowed,
      isAlchemySelected,
      isAlchemyRecommendationEnabled,
      getSetName,
      updateRandomizerSettings,

    }
  }
})
</script>

<style scoped>
.desktop_randomize-button,
.condensed_randomize-button {
  display: block;
  margin: 2px;
}

.condensed_randomize-button {
  margin-top: 12px;
}
</style>