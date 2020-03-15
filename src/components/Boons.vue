<template>
  <div>
    <transition name="slow-fade">
      <div v-if="activeBoons.length" class="boons-header">Boons</div> 
    </transition>
    <transition name="slow-fade">
      <GridLayout
        v-if="activeBoons.length"
        class="boons"
        :class="{'boons--is-enlarged': isEnlarged}"
        :items="activeBoons"
        :number-of-columns="numberOfColumns"
        :is-vertical="false"
      >
        <template v-slot:default="slotProps">
          <FlippingCard
            :card="slotProps.item"
            :is-vertical="false"
          />
        </template>
      </GridLayout>
    </transition>
  </div>
</template>

<script lang="ts">
import GridLayout from "./GridLayout.vue";
import FlippingCard from "./FlippingCard.vue";
import { Boon } from "../dominion/boon";
import { Cards } from "../utils/cards";
import { Vue, Component, Watch } from "vue-property-decorator";
import { State } from "vuex-class";

@Component({
  components: {
    GridLayout,
    FlippingCard
  }
})
export default class Boons extends Vue {
  @State(state => state.randomizer.kingdom.boons) readonly boons!: Boon[];
  @State(state => state.window.width) readonly windowWidth!: number;
  @State(state => state.window.isEnlarged) readonly isEnlarged!: boolean;
  activeBoons: Boon[] = [];
  
  get numberOfColumns() {
    return this.isEnlarged ? 1 : this.windowWidth > 525 ? 3 : 2;
  }
  
  @Watch("boons")
  handleBoonsChanged() {
    if (!this.boons.length) {
      this.activeBoons = [];
      return;
    }
    const newBoons = Cards.difference(this.boons, this.activeBoons);
    const removeIds = new Set(Cards.extractIds(Cards.difference(this.activeBoons, this.boons)));
    let newBoonIndex = 0;
    const newActiveBoons: Boon[] = [];
    for (let i = 0; i < this.activeBoons.length; i++) {
      if (removeIds.has(this.activeBoons[i].id)) {
        if (newBoonIndex < newBoons.length) {
          newActiveBoons.push(newBoons[newBoonIndex++]);
        }
      } else {
        newActiveBoons.push(this.activeBoons[i]);
      }
    }
    this.activeBoons = newActiveBoons.concat(newBoons.slice(newBoonIndex));
  }
}
</script>

<style>
.boons-header {
  margin: 10px 0 0;
  font-size: 20px;
}
</style>
