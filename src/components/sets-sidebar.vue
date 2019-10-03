<template>
  <div class="sidebar">
    <div class="sidebar-content">
      <div class="sidebar-content-title">Sets</div>
      <div class="sets" v-for="set in sets" :key="set.setId">
        <div class="set">
          <label class="checkbox">
            <input type="radio" id="selectedSet" :value="set.setId" v-model="selectedSetId" />
            <span>{{ set.name }}</span>
          </label>
        </div>
      </div>
      <div class="clear"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { UPDATE_SELECTED_SET } from "../stores/sets-store-mutation-types";
import { DominionSets } from "../dominion/dominion-sets";
import { State } from "../stores/sets-store";
import { SetId, IgnoreSetIdKingdoms } from "../dominion/set-id";
import { Vue, Component } from "vue-property-decorator";


@Component
export default class SetsSidebar extends Vue {
  get sets() {
    return DominionSets.getAllSets().filter((set) => !IgnoreSetIdKingdoms.has(set.setId));
  }

  get selectedSetId() {
    return (this.$store.state as State).selectedSetId;
  }
  set selectedSetId(value: SetId) {
    this.$store.commit(UPDATE_SELECTED_SET, value);
  }
}
</script>