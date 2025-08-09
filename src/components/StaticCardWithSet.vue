<template>
  <StaticCard
    :class="cardSet"
    :is-vertical="isVertical"
    :card-image-url="cardImageUrl"
  >
    <CardOverlay :card="card" v-if="show_Overlay"/> 
  </StaticCard>
</template>

<script lang="ts">
/* import Vue, typescript */
import { defineComponent, computed, ref } from "vue";
import type { PropType } from "vue";

/* import Dominion Objects and type*/
import type { Card } from "../dominion/card";
import { SupplyCard } from "../dominion/supply-card";
import { DominionSets } from "../dominion/dominion-sets";
import { ShowOverlayOptions } from "../utils/resources";
import { IMAGES_MISSING_FROM_TRANSLATIONS, LANGUAGES_WITH_TRANSLATED_CARDS } from '../dominion/set-id.ts'
import { Language } from '../i18n/language';
import { getCardImageUrl } from "../utils/resources";

/* import store  */
import { usei18nStore } from "../pinia/i18n-store";

/* import Components */
import StaticCard from "./StaticCard.vue";
import CardOverlay from "./CardOverlay.vue";


export default defineComponent({
  name: "StaticCardWithSet",
  components: {
    StaticCard,
    CardOverlay
  },
  props: {
    card: {
      type: Object as PropType<Card>,
      required: true,
    },
    showOverlay: {
      type: String as PropType<ShowOverlayOptions>,
      default: ShowOverlayOptions.TRUE,
    },
  },
  setup(props) {
    const i18nStore = usei18nStore();
    const language = computed(() => i18nStore.language);

    const show_Overlay = computed(() => {
      switch (props.showOverlay) {
        case ShowOverlayOptions.TRUE:
          return true;
        case ShowOverlayOptions.FALSE:
          return false;
        case ShowOverlayOptions.CHECK:
          return !LANGUAGES_WITH_TRANSLATED_CARDS.has(language.value) ||
            IMAGES_MISSING_FROM_TRANSLATIONS.get(language.value)?.has(props.card.setId);
      }

    });

    const isVertical = computed(() => {
      return props.card instanceof SupplyCard;
    });

    const cardImageUrl = computed(() => {
      return getCardImageUrl(props.card.id.replace("tohidesplitcard", ""), language.value);
    });

    const cardSet = computed(() => {
      return DominionSets.getSetById(props.card.setId).name;
    });

    return {
      show_Overlay,
      isVertical,
      cardImageUrl,
      cardSet
    };
  },
});
</script>