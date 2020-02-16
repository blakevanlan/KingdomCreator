<template>
  <CardDescription
    class="card-set-description"
    :description="setName"
    :description-class="card.setId" 
  />
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { DominionSets } from "../dominion/dominion-sets";
import { Card } from "../dominion/card";
import CardDescription from "./CardDescription.vue";

@Component({
  components: {
    CardDescription
  }
})
export default class CardSetDescription extends Vue {
  @Prop() readonly card!: Card;

  get setName() {
    return DominionSets.getSetById(this.card.setId).name;
  }
}
</script>

<style>
@media (max-width: 900px) {
  .card-set-description .card-description {
    font-size: 16px;
  }

  .card-set-description .baseset2,
  .card-set-description .intrigue2,
  .card-set-description .hinterlands {
    font-size: 14px;
  }
}  

@media (max-width: 400px) {
  .card-set-description .card-description {
    font-size: 10px
  }
}
</style>