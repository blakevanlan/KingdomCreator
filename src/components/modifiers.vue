<template>
  <div>
    <transition name="slow-fade">
      <div v-if="modifiers.length" class="modifiers-header">Additional</div> 
    </transition>
    <transition name="slow-fade">
      <grid-layout-component
        class="modifiers"
        :class="{'modifiers--is-enlarged': isEnlarged}"
        :items="modifiers"
        :number-of-columns="numberOfColumns"
        :is-vertical="true"
      >
        <template v-slot:default="slotProps">
          <static-card-component :cardImageUrl="slotProps.item.imageUrl">
            <card-description-component
              :description="slotProps.item.name"
              :descriptionClass="slotProps.item.className"
            />
          </static-card-component>
        </template>
      </grid-layout-component>
    </transition>
  </div>
</template>

<script lang="ts">
import StaticCardComponent from "./static-card.vue";
import CardDescriptionComponent from "./card-description.vue";
import { Metadata } from "../randomizer/kingdom";
import { Vue, Component } from "vue-property-decorator";
import { State } from "vuex-class";
import GridLayoutComponent from "./grid-layout.vue";

interface Modifier {
  name: string;
  imageUrl: string;
  className: string;
}

@Component
export default class ModifiersComponent extends Vue {
  constructor() {
    super({
      components: {
        "grid-layout-component": GridLayoutComponent,
        "static-card-component": StaticCardComponent,
        "card-description-component": CardDescriptionComponent,
      }
    });
  }
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
        name: "Colonies & Platinums",
        imageUrl: "/img/cards/prosperity_coloniesplatinums.png",
        className: "use-colonies"
      });
    }
    if (this.metadata.useShelters) {
      modifiers.push({
        name: "Shelters",
        imageUrl: "/img/cards/darkages_shelters.png",
        className: "use-shelters"
      });
    }
    return modifiers;
  }

}
Vue.component("modifiers-component", ModifiersComponent);
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
