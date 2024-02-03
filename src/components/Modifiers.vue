<template>
  <div>
    <transition name="slow-fade">
      <div v-if="modifiers.length" class="modifiers-header">Additional</div>
    </transition>
    <transition name="slow-fade">
      <GridLayout
        class="modifiers"
        :class="{'modifiers--is-enlarged': isEnlarged}"
        :items="modifiers"
        :number-of-columns="numberOfColumns"
        :is-vertical="true"
      >
        <template v-slot:default="slotProps">
          <StaticCard :cardImageUrl="slotProps.item.imageUrl">
            <CardTitleOverlay
              :title="slotProps.item.name"
              :title-class="slotProps.item.className"
            />
          </StaticCard>
        </template>
      </GridLayout>
    </transition>
  </div>
</template>

<script lang="ts">
import StaticCard from "./StaticCard.vue";
import CardTitleOverlay from "./CardTitleOverlay.vue";
import { Metadata } from "../randomizer/kingdom";
import { Vue, Component } from "vue-property-decorator";
import { State } from "vuex-class";
import GridLayout from "./GridLayout.vue";

interface Modifier {
  name: string;
  imageUrl: string;
  className: string;
}

@Component({
  components: {
    GridLayout,
    StaticCard,
    CardTitleOverlay
  }
})
export default class Modifiers extends Vue {
  @State(state => state.randomizer.kingdom.metadata) readonly metadata!: Metadata;
  @State(state => state.window.width) readonly windowWidth!: number;
  @State(state => state.window.isEnlarged) readonly isEnlarged!: boolean;

  get numberOfColumns() {
    return this.isEnlarged ? 2 : this.windowWidth > 450 ? 5 : 4;
  }

  get modifiers() {
    const modifiers: Modifier[] = [];
    if (this.metadata.useColonies) {
      modifiers.push({
        name: this.$tc("colonies_and_platinums"),
        imageUrl: "img/cards/prosperity_coloniesplatinums.png",
        className: "use-colonies"
      });
    }
    if (this.metadata.useShelters) {
      modifiers.push({
        name: this.$tc("shelters"),
        imageUrl: "img/cards/darkages_shelters.png",
        className: "use-shelters"
      });
    }
    return modifiers;
  }
}
</script>

<style>
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
