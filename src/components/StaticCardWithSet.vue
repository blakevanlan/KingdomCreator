<template>
  <StaticCard
    :class="set.id"
    :is-vertical="isVertical"
    :card-image-url="cardImageUrl"
  >
    <CardOverlay :card="card" />
  </StaticCard>
</template>

<script lang="ts">
import { Card } from "../dominion/card";
import { SupplyCard } from "../dominion/supply-card";
import { Vue, Component, Prop } from "vue-property-decorator";
import { State } from "vuex-class";
import { getCardImageUrl } from "../utils/resources";
import { DominionSets } from "../dominion/dominion-sets";
import { Language } from "../i18n/language";
import StaticCard from "./StaticCard.vue";
import CardOverlay from "./CardOverlay.vue";

@Component({
  components: {
    StaticCard,
    CardOverlay,
  }
})
export default class StaticCardWithSet extends Vue {
  @Prop() readonly card!: Card;
  @State(state => state.i18n.language) readonly language!: Language;
  
  get isVertical() {
    return this.card instanceof SupplyCard;
  }

  get cardImageUrl() {
    return getCardImageUrl(this.card.id, this.language);
  }

  get set() {
    return DominionSets.getSetById(this.card.setId).name;
  }
}
</script>