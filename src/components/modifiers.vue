<template>
  <div class="modifiers-container">
    <transition name="fade">
      <div v-if="isVisible" class="modifiers-header">Additional</div> 
    </transition>
    <div class="modifiers" :class=[columnClass]>
      <div class="clear-left"></div>
      <transition name="fade">
        <div class="kingdom-supply_card" v-if="metadata.useColonies">
          <static-card-component
              :cardImageUrl="'/img/cards/prosperity_coloniesplatinums.png'"
              :description="'Colonies & Platinums'" />
        </div>
      </transition>
      <transition name="fade">
        <div class="kingdom-supply_card" v-if="metadata.useShelters">
          <static-card-component
              :cardImageUrl="'/img/cards/darkages_shelters.png'"
              :description="'Shelters'" />
        </div>
      </transition>
    </div>
    <div class="clear"></div>
  </div>
</template>

<script lang="ts">
import StaticCardComponent from "./static-card.vue";
import { Metadata } from "../models/kingdom";
import { Vue, Component } from "vue-property-decorator";
import { State } from "vuex-class";

@Component
export default class ModifiersComponent extends Vue {
  constructor() {
    super({components: {"static-card-component": StaticCardComponent}});
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
.modifiers-header.fade-enter-active,
.modifiers-header.fade-leave-active,
.kingdom-supply_card.fade-enter-active,
.kingdom-supply_card.fade-leave-active {
  transition: opacity .3s;
}
.modifiers-header.fade-enter,
.modifiers-header.fade-leave-to,
.modifiers-container .kingdom-supply_card.fade-enter,
.modifiers-container .kingdom-supply_card.fade-leave-to {
  opacity: 0;
}
</style>
