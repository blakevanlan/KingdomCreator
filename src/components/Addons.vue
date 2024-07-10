<template>
  <div class="addons" v-if="hasAddons">
    <div class="addons-header">
      <AddonTitle :has-events="canHaveEvents" :has-landmarks="canHaveLandmarks" :has-projects="canHaveProjects"
        :has-ways="canHaveWays" :has-traits="canHaveTraits" />
    </div>
    <GridLayout :class="{ 'addon--is-enlarged': isEnlarged }" :items="activeContainers"
      :number-of-columns="numberOfColumns" :is-vertical="false">
      <template v-slot:default="slotProps">
        <FlippingCard @card-back-click="handleClick(slotProps.item)" :card="slotProps.item.addon"
          :is-vertical="false" />
      </template>
    </GridLayout>
  </div>
</template>

<script lang="ts">
/* import Vue, typescript */
import { defineComponent, computed, ref, onMounted, watch } from "vue";

/* import Dominion Objects and type*/
import type { Addon } from "../dominion/addon";

/* import store  */
import { useWindowStore } from "../pinia/window-store";
import { useRandomizerStore } from "../pinia/randomizer-store";

/* import Components */
import AddonTitle from "./AddonTitle.vue";
import GridLayout from "./GridLayout.vue";
import FlippingCard from "./FlippingCard.vue";

interface AddonContainer {
  addon: Addon | null,
}

const NUMBER_OF_ADDONS = 2;

export default defineComponent({
  name: 'Addons',
  components: {
    AddonTitle,
    GridLayout,
    FlippingCard,
  },
  setup() {
    const windowStore = useWindowStore();
    const randomizerStore = useRandomizerStore();

    const isEnlarged = computed(() => windowStore.isEnlarged);
    const windowWidth = computed(() => windowStore.width);
    const addons = computed(() => randomizerStore.addons);
    const hasAddons = computed(() => randomizerStore.hasAddons);
    const canHaveEvents = computed(() => randomizerStore.canHaveEvents);
    const canHaveLandmarks = computed(() => randomizerStore.canHaveLandmarks);
    const canHaveProjects = computed(() => randomizerStore.canHaveProjects);
    const canHaveWays = computed(() => randomizerStore.canHaveWays);
    const canHaveTraits = computed(() => randomizerStore.canHaveTraits);
    const activeContainers = ref<AddonContainer[]>([]);

    const numberOfColumns = computed(() => {
      return isEnlarged.value ? 1 : windowWidth.value > 525 ? 3 : 2;
    });

    onMounted(() => {
      activeContainers.value = fillWithEmptyAddonContainers([]);
      updateAddonContainers();
    });


    const handleAddonsChanged = () => {
      updateAddonContainers();
    };
    watch(addons, handleAddonsChanged)

    const handleClick = (addonContainer: AddonContainer) => {
      if (!addonContainer.addon) {
        randomizerStore.RANDOMIZE_UNDEFINED_ADDON();
      }
    };

    const updateAddonContainers = () => {
      const currentAddons = addons.value;
      if (!currentAddons.length) {
        activeContainers.value = fillWithEmptyAddonContainers([]);
        return;
      }
      const newAddons = findNewAddons(activeContainers.value, addons.value);
      let newAddonsIndex = 0;
      const newContainers = [];
      for (let i = 0; i < activeContainers.value.length; i++) {
        const container = activeContainers.value[i];
        if (container.addon != null
          && containsAddon(addons.value, container.addon)) {
          newContainers.push(container);
        } else {
          newContainers.push({
            addon: newAddons.length > newAddonsIndex ? newAddons[newAddonsIndex++] : null
          });
        }
      }
      activeContainers.value = fillWithEmptyAddonContainers(newContainers);
    }

    const findNewAddons = (containers: AddonContainer[], addons: Addon[]) => {
      let existingIds = containers
        .filter(container => container.addon != null)
        .map(container => container.addon!.id);
      let newAddons: Addon[] = [];
      for (let addon of addons) {
        if (existingIds.indexOf(addon.id) == -1) {
          newAddons.push(addon);
        }
      }
      return newAddons;
    }

    const containsAddon = (list: Addon[], addon: Addon) =>{
      return list.some((listAddon) => listAddon.id == addon.id);
    }

    const fillWithEmptyAddonContainers = (list: AddonContainer[]) => {
      for (let i = list.length; i < NUMBER_OF_ADDONS; i++) {
        list.push({ addon: null });
      }
      return list;
    }
    return {
      numberOfColumns,
      hasAddons,
      canHaveEvents,
      canHaveLandmarks,
      canHaveProjects,
      canHaveWays,
      canHaveTraits,
      isEnlarged,
      activeContainers,
      handleClick,
    }
  }
});
</script>

<style scoped>
/* .addons .flip-card__content__back {
  cursor: pointer;
} */

.addon--is-enlarged .card-description {
  font-size: 18px !important;
}
</style>