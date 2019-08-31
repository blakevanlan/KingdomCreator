<template>
  <div class="addons" v-if="canHaveAddons">
    <div class="addons-header">
      {{ addonSummary }}  
    </div>
    <div class="addon_cards">
      <div v-for="addonContainer in activeContainers"
          @click="handleClick(addonContainer)"
          class="addon_card"
          :class="{ 'addon_card--is-enlarged': isEnlarged }"
        >
        <flipping-card-component :card="addonContainer.addon" :is-vertical="true" />
      </div>
    </div>
    <div class="clear"></div>
  </div>
</template>

<script lang="ts">
import FlippingCardComponent from "./flipping-card.vue";
import { Addon } from "../dominion/addon";
import { Vue, Component, Watch } from "vue-property-decorator";
import { Getter, State } from "vuex-class";
import { RANDOMIZE_UNDEFINED_ADDON } from "../stores/randomizer/action-types";

interface AddonContainer {
  addon: Addon | null,
}

const NUMBER_OF_ADDONS = 2;

@Component
export default class AddonsComponent extends Vue {
  constructor() {
    super({components: {"flipping-card-component": FlippingCardComponent}});
  }
  @State(state => state.randomizer.selection) readonly selection!: Selection;
  @State(state => state.window.isEnlarged) readonly isEnlarged!: boolean;
  @Getter("canHaveAddons") readonly canHaveAddons!: boolean;
  @Getter("addonSummary") readonly addonSummary!: string;
  @Getter("addons") readonly addons!: Addon[];
  activeContainers: AddonContainer[] = AddonsComponent.fillWithEmptyAddonContainers([]);

  mounted() {
    this.updateAddonContainers();
  }
  
  @Watch("addons")
  handleAddonsChanged() {
    this.updateAddonContainers();
  }
  
  handleClick(addonContainer: AddonContainer) {
    if (!addonContainer.addon) {
      this.$store.dispatch(RANDOMIZE_UNDEFINED_ADDON);
    }
  }

  private updateAddonContainers() {
    if (!this.addons.length) {
      this.activeContainers = AddonsComponent.fillWithEmptyAddonContainers([]);
      return;
    }
    const newAddons = AddonsComponent.findNewAddons(this.activeContainers, this.addons);
    let newAddonsIndex = 0;
    const newContainers = [];
    for (let i = 0; i < this.activeContainers.length; i++) {
      const container = this.activeContainers[i];
      if (container.addon != null 
          && AddonsComponent.containsAddon(this.addons, container.addon)) {
        newContainers.push(container);
      } else {
        newContainers.push({
          addon: newAddons.length > newAddonsIndex ? newAddons[newAddonsIndex++] : null
        });
      }
    }
    this.activeContainers = AddonsComponent.fillWithEmptyAddonContainers(newContainers);
  }

  private static findNewAddons(containers: AddonContainer[], addons: Addon[]) {
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

  private static containsAddon(list: Addon[], addon: Addon) {
    return list.some((listAddon) => listAddon.id == addon.id);
  }

  private static fillWithEmptyAddonContainers(list: AddonContainer[]) {
    for (let i = list.length; i < NUMBER_OF_ADDONS; i++) {
      list.push({addon: null});
    }
    return list;
  }
}
Vue.component("addons-component", AddonsComponent);
</script>

<style>
.addon_cards {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.addon_card {
  cursor: pointer;
  position: relative;
  width: 30%;
  padding-bottom: 18.77%; /* 473:296 = 30 * (296 / 473) */
  margin-right: 4px;
}

@media (max-width: 525px) {
  .addon_card {
    width: 49.25%;
    padding-bottom: 28.32%; /* 473:296 = 45.25 * (296 / 473) */
    margin: 0.25%;
  }
    
  .supply-card__front-set-name {
    font-size: 11px;
  }
  
  .supply-card__front-set-name.baseset2,
  .supply-card__front-set-name.intrigue2,
  .supply-card__front-set-name.hinterlands {
    font-size: 9px;
  }
}

.addon_card.addon_card--is-enlarged {
  width: 99.8%;
  padding-bottom: 62.454%; /* 473:296 = 99.8 * (296 / 473) */
  margin: 0 0.1% 4px 0.1%;
}

.addon_card--is-enlarged .supply-card__front-set-name {
  font-size: 18px;
}

</style>