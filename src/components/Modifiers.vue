<template>
  <div>
    <transition name="slow-fade">
      <div v-if="modifiers.length" class="modifiers-header">Additional</div>
    </transition>
    <transition name="slow-fade">
      <GridLayout class="modifiers" :class="{ 'modifiers--is-enlarged': isEnlarged }" :items="modifiers"
        :number-of-columns="numberOfColumns" :is-vertical="true">
        <template v-slot:default="slotProps">
          <StaticCard :cardImageUrl="slotProps.item.imageUrl">
            <CardTitleOverlay :title="slotProps.item.name" :title-class="slotProps.item.className" />
          </StaticCard>
        </template>
      </GridLayout>
    </transition>
  </div>
</template>

<script lang="ts">
/* import Vue, typescript */
import { defineComponent, computed, ref } from 'vue';
import { useI18n } from "vue-i18n";

/* import Dominion Objects and type*/
/* import store  */
import { useWindowStore } from '../pinia/window-store';
import { useRandomizerStore } from "../pinia/randomizer-store";

/* import Components */
import StaticCard from "./StaticCard.vue";
import CardTitleOverlay from "./CardTitleOverlay.vue";
import GridLayout from "./GridLayout.vue";

interface Modifier {
  name: string;
  imageUrl: string;
  className: string;
}

export default defineComponent({
  name: 'Modifiers',
  components: {
    GridLayout,
    StaticCard,
    CardTitleOverlay
  },
  setup() {
    const { t } = useI18n()
    const windowStore = useWindowStore();
    const randomizerStore = useRandomizerStore();

    const metadata = computed(() => randomizerStore.kingdom.metadata);
    const windowWidth = ref(windowStore.width);
    const isEnlarged = ref(windowStore.isEnlarged);

    const numberOfColumns = computed(() => {
      return isEnlarged.value ? 2 : windowWidth.value > 450 ? 5 : 4;
    });

    const modifiers = computed(() => {
      const modifiers: Modifier[] = [];
      if (metadata.value.useColonies) {
        modifiers.push({
          name: t("colonies_and_platinums"),
          imageUrl: "./img/cards/prosperity_coloniesplatinums.png",
          className: "use-colonies"
        });
      }
      if (metadata.value.useShelters) {
        modifiers.push({
          name: t("shelters"),
          imageUrl: "./img/cards/darkages_shelters.png",
          className: "use-shelters"
        });
      }
      return modifiers;
    });

    return {
      modifiers,
      isEnlarged,
      numberOfColumns
    }
  }
})
</script>

<style scoped>
.modifiers-header {
  margin: 10px 0 0;
  font-size: 20px;
}

.modifiers .use-colonies {
  font-size: 16px;
}

@media (max-width: 525px) {
  .modifiers .use-colonies {
    font-size: 12px;
  }

  .modifiers .use-shelters {
    font-size: 13px;
  }
}

.modifiers.modifiers--is-enlarged .use-colonies {
  font-size: 16px;
}

.modifiers.modifiers--is-enlarged .use-shelters {
  font-size: 18px;
}
</style>
