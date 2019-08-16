<template>
  <div class="modifiers-container">
    <transition name="fade">
      <div v-if="isVisible" class="modifiers-header">Additional</div> 
    </transition>
    <div class="modifiers" :class=[columnClass]>
      <div class="clear-left"></div>
      <transition name="fade">
        <div class="kingdom-supply_card use-colonies" v-if="metadata.useColonies">
          <static-card-component cardImageUrl="/img/cards/prosperity_coloniesplatinums.png">
            <static-card-description-component description="Colonies & Platinums" />
          </static-card-component>
        </div>
      </transition>
      <transition name="fade">
        <div class="kingdom-supply_card" v-if="metadata.useShelters">
          <static-card-component cardImageUrl="/img/cards/darkages_shelters.png">
            <static-card-description-component description="Shelters" />
          </static-card-component>
        </div>
      </transition>
    </div>
    <div class="clear"></div>
  </div>
</template>

<script lang="ts">
import StaticCardComponent from "./static-card.vue";
import StaticCardDescriptionComponent from "./static-card-description.vue";
import { Metadata } from "../randomizer/kingdom";
import { Vue, Component } from "vue-property-decorator";
import { State } from "vuex-class";

@Component
export default class ModifiersComponent extends Vue {
  constructor() {
    super({
      components: {
        "static-card-component": StaticCardComponent,
        "static-card-description-component": StaticCardDescriptionComponent,
      }
    });
  }
  @State(state => state.randomizer.kingdom.metadata) readonly metadata!: Metadata;
  @State(state => state.window.width) readonly windowWidth!: number;
  
  get isVisible() {
    return this.metadata.useColonies || this.metadata.useShelters;
  }

  get columnClass() {
    return this.windowWidth > 450 ? "five-columns" : "four-columns";
  }

}
Vue.component("modifiers-component", ModifiersComponent);
</script>

<style>
.modifiers-container {
  display: flex;
  flex-direction: column;
}

.modifiers-header {
  margin: 10px 0 0;
  font-size: 20px;
}

.modifiers {
  display: flex;
  flex-direction: row;
}

.modifiers-header.fade-enter-active,
.modifiers-header.fade-leave-active,
.modifiers-container .kingdom-supply_card.fade-enter-active,
.modifiers-container .kingdom-supply_card.fade-leave-active {
  transition: opacity .3s;
}
.modifiers-header.fade-enter,
.modifiers-header.fade-leave-to,
.modifiers-container .kingdom-supply_card.fade-enter,
.modifiers-container .kingdom-supply_card.fade-leave-to {
  opacity: 0;
}
.use-colonies .supply-card__front-set-name {
  font-size: 16px;
}
</style>
