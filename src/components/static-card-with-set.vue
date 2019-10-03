<template>
  <static-card-component
    :class="set.id"
    :is-vertical="isVertical"
    :card-image-url="cardImageUrl"
  >
    <card-set-description-component :card="card" />
  </static-card-component>
</template>

<script lang="ts">
import { Card } from "../dominion/card";
import { SupplyCard } from "../dominion/supply-card";
import { Vue, Component, Prop } from "vue-property-decorator";
import { getCardImageUrl } from "../utils/resources";
import { DominionSets } from "../dominion/dominion-sets";
import StaticCardComponent from "./static-card.vue";
import CardSetDescriptionComponent from "./card-set-description.vue";

@Component
export default class StaticCardWithSetComponent extends Vue {
  constructor() {
    super({
      components: {
        "static-card-component": StaticCardComponent,
        "card-set-description-component": CardSetDescriptionComponent,
      }
    });
  }
  @Prop() readonly card!: Card;
  
  get isVertical() {
    return this.card instanceof SupplyCard;
  }

  get cardImageUrl() {
    return getCardImageUrl(this.card.id);
  }

  get set() {
    return DominionSets.getSetById(this.card.setId).name;
  }
}
Vue.component("static-card-with-set-component", StaticCardWithSetComponent);
</script>