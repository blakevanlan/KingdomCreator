<template>
  <div>
    <transition name="slow-fade">
      <div v-if="ally" class="ally-header">Ally</div>
    </transition>
    <transition name="slow-fade">
      <GridLayout v-if="ally" :items="[ally]" :number-of-columns="numberOfColumns" :is-vertical="false">
        <template v-slot:default="slotProps">
          <FlippingCard :card="slotProps.item" :is-vertical="false" />
        </template>
      </GridLayout>
    </transition>
  </div>
</template>

<script lang="ts">
/* import Vue, typescript */
import { defineComponent, computed, ref } from 'vue';

/* import Dominion Objects and type*/
/* import store  */
import { useRandomizerStore } from "../pinia/randomizer-store";
import { useWindowStore } from "../pinia/window-store";

/* import Components */
import GridLayout from "./GridLayout.vue";
import FlippingCard from "./FlippingCard.vue";

export default defineComponent({
  name: "AllySection",
  components: {
    GridLayout,
    FlippingCard
  },
  setup() {
    const randomizerStore = useRandomizerStore();
    const windowStore = useWindowStore()

    const ally = computed(() => randomizerStore.kingdom.ally);
    const windowWidth = computed(() => windowStore.width);
    const isEnlarged = computed(() => windowStore.isEnlarged);

    const numberOfColumns = computed(() =>{
      // console.log("numberOfColumns",numberOfColumns)
      return isEnlarged.value ? 1 : windowWidth.value > 525 ? 3 : 2;
    });

    return {
      ally,
      numberOfColumns
    }
  }
  })
</script>

<style scoped>
.ally-header {
  margin: 10px 0 0;
  font-size: 20px;
}
</style>
