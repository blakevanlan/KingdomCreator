<template>
  <div>
    <transition name="slow-fade">
      <div v-if="activeBoons.length" class="boons-header">Boons</div>
    </transition>
    <transition name="slow-fade">
      <GridLayout v-if="activeBoons.length" class="boons" :class="{ 'boons--is-enlarged': isEnlarged }"
        :items="activeBoons" :number-of-columns="numberOfColumns" :is-vertical="false">
        <template v-slot:default="slotProps">
          <FlippingCard :card="slotProps.item" :is-vertical="false" />
        </template>
      </GridLayout>
    </transition>
  </div>
</template>

<script lang="ts">
/* import Vue, typescript */
import { defineComponent, computed, ref, watch, onMounted } from "vue";

/* import Dominion Objects and type*/
import type { Boon } from "../dominion/boon";
import { Cards } from "../utils/cards";

/* import store  */
import { useRandomizerStore } from "../pinia/randomizer-store";
import { useWindowStore } from "../pinia/window-store";

/* import Components */
import GridLayout from "./GridLayout.vue";
import FlippingCard from "./FlippingCard.vue";

export default defineComponent({
  name: 'Boons',
  components: {
    GridLayout,
    FlippingCard
  },
  setup() {
    const randomizerStore = useRandomizerStore();
    const boons = computed(() => randomizerStore.kingdom.boons);
    const windowStore = useWindowStore();
    const isEnlarged = computed(() => windowStore.isEnlarged);
    const windowWidth = computed(() => windowStore.width);
    const activeBoons = ref([] as Boon[]);

    const numberOfColumns = computed(() => {
      return isEnlarged.value ? 1 : windowWidth.value > 525 ? 3 : 2;
    });

    const updateBoonsContainers = () => {
      if (!boons.value.length) {
        activeBoons.value = [];
        return;
      }
      const newBoons = Cards.difference(boons.value, activeBoons.value);
      const removeIds = new Set(Cards.extractIds(Cards.difference(activeBoons.value, boons.value)));
      let newBoonIndex = 0;
      const newActiveBoons: Boon[] = [];
      for (let i = 0; i < activeBoons.value.length; i++) {
        if (removeIds.has(activeBoons.value[i].id)) {
          if (newBoonIndex < newBoons.length) {
            newActiveBoons.push(newBoons[newBoonIndex++]);
          }
        } else {
          newActiveBoons.push(activeBoons.value[i]);
        }
      }
      activeBoons.value = newActiveBoons.concat(newBoons.slice(newBoonIndex));
    }

    onMounted(() => {
      activeBoons.value = boons.value
      updateBoonsContainers();
    });

    const handleBoonsChanged = () => {
      updateBoonsContainers();
    };
    watch(boons, handleBoonsChanged)

    return {
      numberOfColumns,
      activeBoons,
      isEnlarged
    }
  }
});
</script>

<style scoped>
.boons-header {
  margin: 10px 0 0;
  font-size: 20px;
}
</style>
