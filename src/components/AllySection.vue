<template>
  <div>
    <transition name="slow-fade">
      <div v-if="ally" class="ally-header">Ally</div> 
    </transition>
    <transition name="slow-fade">
      <GridLayout
        v-if="ally"
        :items="[ally]"
        :number-of-columns="numberOfColumns"
        :is-vertical="false"
      >
        <template v-slot:default="slotProps">
          <FlippingCard :card="slotProps.item" :is-vertical="false" />
        </template>
      </GridLayout>
    </transition>
  </div>
</template>

<script lang="ts">
import GridLayout from "./GridLayout.vue";
import FlippingCard from "./FlippingCard.vue";
import { Vue, Component } from "vue-property-decorator";
import { State } from "vuex-class";
import { Ally } from "../dominion/ally";

@Component({
  components: {
    GridLayout,
    FlippingCard
  }
})
export default class AllySection extends Vue {
  @State(state => state.randomizer.kingdom.ally) readonly ally!: Ally[];
  @State(state => state.window.width) readonly windowWidth!: number;
  @State(state => state.window.isEnlarged) readonly isEnlarged!: boolean;

  get numberOfColumns() {
    return this.isEnlarged ? 1 : this.windowWidth > 525 ? 3 : 2;
  }
}
</script>

<style>
.ally-header {
  margin: 10px 0 0;
  font-size: 20px;
}
</style>
