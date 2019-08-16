<template>
  <div class="modal-container">
    <transition name="fade">
      <div class="modal-background" v-if="show"></div>
    </transition>
    <transition name="expand-fade">
      <div class="modal" v-if="show">
        <div class="sets" v-for="set in sets" :key="set.setId">
          <div class="set">
            <label class="checkbox">
              <input type="radio" id="selectedSet" :value="set.setId" v-model="selectedSetId" />
              <span>{{ set.name }}</span>
            </label>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import StaticCardComponent from "./static-card.vue";
import StaticCardDescriptionComponent from "./static-card-description.vue";
import { Vue, Component, Prop } from "vue-property-decorator";
import { Settings } from "../settings/settings";
import { SetId } from "../dominion/set-id";
import { State } from "vuex-class";
import { DominionSets } from "../dominion/dominion-sets";

@Component
export default class ReplaceSupplyCardModalComponent extends Vue {
  constructor() {
    super({
      components: {
        "static-card-component": StaticCardComponent,
        "static-card-description-component": StaticCardDescriptionComponent,
      }
    });
  }
  @Prop() readonly show!: boolean;
  @State(state => state.randomizer.settings) readonly settings!: Settings;
  @State(state => state.randomizer.settings.selectedSets) readonly selectedSetIds!: SetId[];
  selectedSetId: SetId | null = null;
  
  get sets() {
    return this.selectedSetIds.map((setId) => DominionSets.getSetById(setId));
  }
}
Vue.component("replace-supply-card-modal-component", ReplaceSupplyCardModalComponent);
</script>

<style>
.modal-container,
.modal-background {
  position: absolute;
  height: 100%;
  left: 0;
  top: 0;
  width: 100%;
}

.modal-background {
  background: rgba(0, 0, 0, 0.2);
}

.modal {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}
</style>
