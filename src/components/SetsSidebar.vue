<template>
  <div class="sidebar">
    <div class="sidebar-content">
      <div class="sidebar-content-title">Sets</div>
      <div class="sets" v-for="set in sets" :key="set.setId">
        <div class="set">
          <label class="checkbox">
            <input type="radio" id="selectedSet" :value="set.setId" v-model="selectedSetId" />
            <span>{{ $t(set.setId) }}</span>
			<span v-if="FindMultipleVersionSets(set.setId).length !== 0"> -  1st
                <input type="radio" v-model="selectedSetId" :id="(FindMultipleVersionSets(set.setId))[0].idv2" :value="(FindMultipleVersionSets(set.setId))[0].idv2">2nd
              </span>
            </span>
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
import { MultipleVersionSets, HideMultipleVersionSets } from "../dominion/set-id";
import { State } from "../stores/sets-store";
import { SetId } from "../dominion/set-id";
import { Vue, Component } from "vue-property-decorator";

const SETS_TO_IGNORE = new Set([SetId.PROMOS]);

@Component
export default class SetsSidebar extends Vue {
  get sets() {
    return DominionSets.getAllSets().filter((set) => !SETS_TO_IGNORE.has(set.setId))
                                    .filter(set => {return (HideMultipleVersionSets.indexOf(set.setId) == -1)});
  }

  get selectedSetId() {
    return (this.$store.state as State).selectedSetId;
  }
  set selectedSetId(value: SetId) {
    this.$store.commit(UPDATE_SELECTED_SET, value);
  }
  FindMultipleVersionSets(setValue: string) {
    return MultipleVersionSets.filter(set => {return (set.id===setValue)})
  }
}
</script>