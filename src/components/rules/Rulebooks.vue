<template>
  <div class="rulebooks">
    <div class="rulebooks-description">
      {{ $t("rules_page_description") }}
    </div>
    <div class="rulebooks-sort" role="group" :aria-label="$t('Sort')">
      <span>{{ $t("Sort") }}:</span>
      <label>
        <input
          type="radio"
          name="rulebooks-sort"
          value="alpha"
          v-model="setsOrderType"
          @change="handleSetOrderTypeChange('alpha')"
        />
        {{ $t("Alphabetical") }}
      </label>
      <label>
        <input
          type="radio"
          name="rulebooks-sort"
          value="date"
          v-model="setsOrderType"
          @change="handleSetOrderTypeChange('date')"
        />
        {{ $t("Date") }}
      </label>
    </div>
    <GridLayout 
      :items="rulebooks"
      :number-of-columns="numberOfColumns"
      :is-vertical="true"
      :shape="Shape.SQUARE"
    >
      <template v-slot:default="slotProps">
        <Rulebook :rulebook="slotProps.item" />
      </template>
    </GridLayout>
  </div>
</template>

<script lang="ts">
/* import Vue, typescript */
import { defineComponent, computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

/* import Dominion Objects and type*/
import { Sets_To_Ignore_Regroup } from '@/dominion/set-id';
import { DominionSets } from '@/dominion/dominion-sets';
import { Year_set } from '@/dominion/digital_cards/digital-cards-Illustrator';
import { hasRulebookVersions } from '@/dominion/rulebook-versions';

/* import store  */
import { usei18nStore } from '@/pinia/i18n-store';
import { useSetsStore } from '@/pinia/sets-store';
import { useWindowStore } from '@/pinia/window-store';
import { useSettingsStore } from '@/pinia/settings-store';

/* import Components */
import GridLayout, { Shape } from '../GridLayout.vue';
import Rulebook from './Rulebook.vue';
import type { RulebookInterface } from './Rulebook.vue';

export default defineComponent({
  name: "Rulebooks",
  components: {
    GridLayout,
    Rulebook
  },
  setup() {
    const { t } = useI18n();
    const i18nStore = usei18nStore();
    const WindowStore = useWindowStore();
    const setsStore = useSetsStore();
    const settingsStore = useSettingsStore();
    const WinSize = computed(() =>{ return WindowStore.width });
    const language = computed(() => {return i18nStore.language});
    const setsOrderType = ref(setsStore.setsOrderType)

    const handleSetOrderTypeChange = (value: string) => {
      setsStore.updateSetsOrderType(value);
    };

    const numberOfColumns = computed(() => {
      if (WinSize.value < 600) return 1;
      if (WinSize.value < 1000) return 2;
      if (WinSize.value  < 1400) return 3;
      return 4
    }) 

    const rulebooks = computed(() => {  
        const AllSetIdsToConsider = DominionSets.getAllSetsIds()
            .filter(setId => {if (settingsStore.isUsingOnlyOwnedsets){
                    return settingsStore.ownedSets.indexOf(setId as never) != -1
                  } else { return true; }})
            .filter(setId => !Sets_To_Ignore_Regroup.has(setId))
            .filter(setId => hasRulebookVersions(setId, language.value))
       //     .filter(setId => { return (HideMultipleVersionSets.indexOf(setId) == -1) })
       // const sortedSets = AllSetIdsToConsider.sort((a, b) => (Year_set.find(set => set.id === a)?.order ||0) - (Year_set.find(set => set.id === b)?.order ||0))
        const sortedSets = setsOrderType.value === 'date'   // Check if sortType has a value (not undefined)
            ? AllSetIdsToConsider.sort((a, b) => (Year_set.find(set => set.id === a)?.order ||0) - (Year_set.find(set => set.id === b)?.order ||0))
            : AllSetIdsToConsider.sort((a, b) => t(a).localeCompare(t(b)))
        return sortedSets.map(setid => ({
          id: setid,
          name: t(setid),
        } as RulebookInterface));
      }
      )

    
    return { 
      rulebooks,
      numberOfColumns,
      setsOrderType,
      handleSetOrderTypeChange,
      Shape
    };
  }
});
</script>

<style scoped>
.rulebooks-sort {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin: 0 0 12px;
}

.rulebooks-sort label {
  align-items: center;
  display: inline-flex;
  gap: 4px;
}
</style>
