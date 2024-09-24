<template>
  <div>
    <ReplaceSupplyCardModal :key="randomizerKingdomId" />
    <Page :subtitle="$t('index_page_subtitle')" :selectedType="selectedType">
      <Randomizer @specify-replacement="showReplaceModal = true" />
    </Page>
    <EnlargeButton />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import useBase from "./base";
import Page, { MenuItemType } from "../components/Page.vue";

import EnlargeButton from "../components/EnlargeButton.vue";
import Randomizer from "../components/Randomizer.vue";
import ReplaceSupplyCardModal from "../components/ReplaceSupplyCardModal.vue";
import { useRandomizerStore } from '../pinia/randomizer-store';

export default defineComponent({
  name: "Index",
  components: {
    Page,
    Randomizer,
    ReplaceSupplyCardModal,
    EnlargeButton
  },
  setup() {
    useBase();
    const randomizerStore= useRandomizerStore();

    const selectedType = MenuItemType.RANDOMIZER;
    const randomizerKingdomId = ref(randomizerStore.kingdom.id);
    const showReplaceModal = ref(false);
  return {
      randomizerKingdomId,
      selectedType,
      showReplaceModal
    };
  }

});
</script>