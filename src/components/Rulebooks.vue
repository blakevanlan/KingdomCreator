<template>
  <div class="rulebooks">
    <div class="rulebooks-description">
      {{ $t("rules_page_description") }}
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
import { defineComponent, computed, ref } from "vue";
import { useI18n } from "vue-i18n";

/* import Dominion Objects and type*/
import { SetId, Set_To_Ignore_Rules, Sets_To_Ignore_Regroup } from "../dominion/set-id";
import { DominionSets } from "../dominion/dominion-sets";
import { Year_set } from "../dominion/digital_cards/digital-cards-Illustrator"

import { Language } from "../i18n/language";

/* import store  */
import { usei18nStore } from '../pinia/i18n-store';
import { useSetsStore } from '../pinia/sets-store';
import { useWindowStore } from "../pinia/window-store";


/* import Components */
import GridLayout, { Shape } from "./GridLayout.vue";
import Rulebook from "./Rulebook.vue";
import type { RulebookInterface } from "./Rulebook.vue";

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
    const setsStore = useSetsStore()
    const WinSize = computed(() =>{ return WindowStore.width });
    const language = computed(() => {return i18nStore.language});
    const setsOrderType = ref(setsStore.setsOrderType)

    const numberOfColumns = computed(() => {
      if (WinSize.value < 600) return 1;
      if (WinSize.value < 1000) return 2;
      if (WinSize.value  < 1400) return 3;
      return 4
    }) 

    const rulebooks = computed(() => { 
        const AllSetIdsToConsider = DominionSets.getAllSetsIds()
            .filter(setId => !Sets_To_Ignore_Regroup.has(setId))
            .filter(setid => !Set_To_Ignore_Rules[Language.ENGLISH].has(setid))
       //     .filter(setId => { return (HideMultipleVersionSets.indexOf(setId) == -1) })
       // const sortedSets = AllSetIdsToConsider.sort((a, b) => (Year_set.find(set => set.id === a)?.order ||0) - (Year_set.find(set => set.id === b)?.order ||0))
        const sortedSets = setsOrderType.value === 'date'   // Check if sortType has a value (not undefined)
            ? AllSetIdsToConsider.sort((a, b) => (Year_set.find(set => set.id === a)?.order ||0) - (Year_set.find(set => set.id === b)?.order ||0))
            : AllSetIdsToConsider.sort((a, b) => t(a).localeCompare(t(b)))
        const listsets = sortedSets
          .map(setid => {
            return {
              id: setid,
              name: t(setid),
            } as RulebookInterface
          })
          .filter((set) => !(
            language.value == Language.FRENCH  
              ? Set_To_Ignore_Rules[language.value].has(set.id as SetId) 
              : "" )
          )
          .filter((set) => !(
            language.value == Language.GERMAN  
              ? Set_To_Ignore_Rules[language.value].has(set.id as SetId) 
              : "" )
          )
        return listsets;
      }
      )

    
    return { 
      rulebooks,
      numberOfColumns,
      Shape
    };
  }
});
</script>

