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
import { Vue, Component, Prop } from "vue-property-decorator";
import { State } from "vuex-class";
import { Card } from "../dominion/card";
import { Language } from "../i18n/language";
import TextOverlay from "./TextOverlay.vue";

const LANGUAGES_WITH_TRANSLATED_CARDS = new Set([Language.ENGLISH, Language.FRENCH]);

@Component({
  components: {
    TextOverlay
  }
})
export default class CardOverlay extends Vue {
  @Prop() readonly card!: Card;
  @State(state => state.i18n.language) readonly language!: Language;

  get hasCardName() {
    return !LANGUAGES_WITH_TRANSLATED_CARDS.has(this.language);
  }
}
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