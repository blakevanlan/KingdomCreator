<template>
  <TextOverlay
    class="card-overlay"
    :class="{'card-overlay--has-card-name': hasCardName}"
  >
    <template v-if="hasCardName">
      <div
      class="card-name"
        :class="card.setId"
      >
        {{ $t(card.id) }}
      </div>
      <svg class="separator" viewBox="0 0 74 15" xmlns="http://www.w3.org/2000/svg">
        <path fill="#fff" d="M37.5 0L45 7.5 37.5 15 30 7.5z"/>
        <path stroke="#fff" d="M0 7.5h74"/>
      </svg>
    </template>
    <div
      class="set-name"
      :class="card.setId"
    >
      {{ $t(card.setId) }}
    </div>
  </TextOverlay>
</template>

<script lang="ts">
/* import Vue, typescript */
import { defineComponent, computed } from 'vue';
import type { PropType } from 'vue';

/* import Dominion Objects and type*/
import type { Card } from '../dominion/card';
import { IMAGES_MISSING_FROM_TRANSLATIONS, LANGUAGES_WITH_TRANSLATED_CARDS } from '../dominion/set-id.ts'

/* import store  */
import { usei18nStore } from "../pinia/i18n-store";
import { Language } from '../i18n/language';

/* import Components */
import TextOverlay from './TextOverlay.vue';

export default defineComponent({
  name: "CardOverlay",
  components: {
    TextOverlay,
  },
  props: {
    card: {
      type: Object as PropType<Card>,
      required: true,
    },
  },
  setup(props) {
    const i18nStore = usei18nStore();

    const language = computed(() => i18nStore.language);
    const hasCardName = computed(() => {
      return !LANGUAGES_WITH_TRANSLATED_CARDS.has(language.value) ||
        IMAGES_MISSING_FROM_TRANSLATIONS.get(language.value)?.has(props.card.setId);
    });
  
    return {
      // language,
      hasCardName,
    };
  },
});
</script>

<style scoped>
.card-overlay {
  margin-top: -10px;
}
.card-overlay--has-card-name {
  margin-top: -24px;
}
.card-name,
.set-name {
  font-size: 15px;
}
.card-overlay--has-card-name .set-name {
  font-size: 12px;
}
.separator {
  height: 6px;
  opacity: 0.5;
  margin: 2px 0;
}

@media (max-width: 400px) {
  .card-name,
  .set-name {
    font-size: 10px !important;
  }
}
</style>