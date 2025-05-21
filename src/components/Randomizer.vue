<template>
  <div class="content">
    <RandomizerSidebar @randomize="handleRandomize" />
    <div class="main">
      <KingdomNotValid />
      <SortableSupplyCards />
      <Addons />
      <Boons />
      <AllyProphecySection />
      <Modifiers />
      <div style="margin-top: 4px;">
        <CopyButton :text="supplyCardsCopyText" class="randomizer-copy-button" />
        <FullScreenButton v-if="!isCondensed" :text="supplyCardsCopyText" class="randomizer-copy-button" />
      </div>
    </div>
    <div class="clearfix"></div>
  </div>
</template>

<script lang="ts">
/* import Vue, typescript */
import { defineComponent, ref, computed } from 'vue';
import { onBeforeMount, watch } from 'vue';
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

/* import Dominion Objects and type*/
import type { Card } from "../dominion/card";

/* import store  */
import { useRandomizerStore } from "../pinia/randomizer-store";
import { useWindowStore } from "../pinia/window-store";
import { usei18nStore } from '../pinia/i18n-store';
import { deserializeKingdom, serializeKingdom } from "../randomizer/serializer";

/* import Components */
import Addons from "./Addons.vue";
import AllyProphecySection from "./AllyProphecySection.vue";
import Boons from "./Boons.vue";
import CopyButton from "./CopyButton.vue";
import FullScreenButton from "./FullScreenButton.vue";
import Modifiers from "./Modifiers.vue";
import RandomizerSidebar from "./RandomizerSidebar.vue";
import SortableSupplyCards from "./SortableSupplyCards.vue";
import KingdomNotValid from "./KingdomNotValid.vue";

export default defineComponent({
  name: "Randomizer",
  components: {
    Addons,
    AllyProphecySection,
    Boons,
    CopyButton,
    FullScreenButton,
    Modifiers,
    RandomizerSidebar,
    SortableSupplyCards,
    KingdomNotValid
  },
  setup() {
    const randomizerStore = useRandomizerStore();
    const windowStore = useWindowStore();
    const i18nStore = usei18nStore();
    const { t } = useI18n();
    const route = useRoute();
    const router = useRouter();
    const kingdom = computed(()=>{return randomizerStore.kingdom});
    const settings = ref(randomizerStore.settings);

    const isCondensed = computed(() =>{ return windowStore.isCondensed});
    // const randomizerSettings = randomizerStore.settings.randomizerSettings;

    const onKingdomChanged= () => {
      const query = {  lang: i18nStore.language,
          ...serializeKingdom(kingdom.value)
        }
      if (!isEqual(route.query, query)) {
        router.replace({ query })
      }
    }
    watch(kingdom, onKingdomChanged)

    const supplyCardsCopyText = computed(() => {
      return (
        (kingdom.value.supply.supplyCards as Card[]).concat(
          kingdom.value.events,
          kingdom.value.landmarks,
          kingdom.value.projects,
          kingdom.value.ways,
          kingdom.value.boons,
          kingdom.value.ally ? [kingdom.value.ally] : [],
          kingdom.value.prophecy ? [kingdom.value.prophecy] : [],
          kingdom.value.traits,
        ).map((card) => t(card.id)).join(', ')
      )
    })

    const handleRandomize = () => {
      randomizerStore.RANDOMIZE()
    }

    const isEqual = (a: any, b: any) => {
      const keysA = Object.keys(a)
      const keysB = Object.keys(b)
      if (keysA.length !== keysB.length) {
        return false
      }
      for (const key of keysA) {
        if (a[key] !== b[key]) {
          return false
        }
      }
      return true
    }

    onBeforeMount(() => {
      const kingdomFromUrl = deserializeKingdom(route.query, settings.value.selectedSets)
      randomizerStore.LOAD_INITIAL_KINGDOM(kingdomFromUrl)
    })

    return {
      supplyCardsCopyText,
      handleRandomize,
      kingdom,
      settings,
      isCondensed
    }
  }
});
</script>

<style scoped>
.randomizer-copy-button {
  margin-top: 4px;
}
</style>