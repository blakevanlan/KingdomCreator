<template>
  <div class="rulebooks">
    <div class="rulebooks-description">
      {{ $t("rules_page_description") }}
    </div>
    <GridLayout 
      :items="rulebooks"
      :number-of-columns="3"
      :is-vertical="true"
      :shape="Shape.SQUARE"
    >
      <template v-slot:default="slotProps">
        <Rulebook :rulebook="slotProps.item" />
      </template>
    </GridLayout>
  </div>
</template>


<script lang="ts">

import { Vue, Component } from "vue-property-decorator";
import GridLayout, { Shape } from "./GridLayout.vue";
import Rulebook, { RulebookInterface } from "./Rulebook.vue";
import { SetId } from "../dominion/set-id";
import { DominionSets } from "../dominion/dominion-sets";

const SETS_TO_IGNORE = new Set([SetId.PROMOS]);

@Component({
  components: {
    GridLayout,
    Rulebook
  }
})
export default class Rulebooks extends Vue {
  Shape = Shape;

  get rulebooks() {
    return DominionSets
      .getAllSets()
      .filter(s => !SETS_TO_IGNORE.has(s.setId))
      .map(s => {
        return {
          id: s.setId,
          name: this.$t(s.setId)
        } as RulebookInterface
      })
      .concat({
        id: "guildscornucopia",
        name: `${this.$tc(SetId.GUILDS)} / ${this.$tc(SetId.CORNUCOPIA)}`
      })
      .sort((a, b) => {
        return a.id == b.id ? 0 : a.id < b.id ? -1 : 1;
      });
  }
};
</script>

<style>
.rulebooks {
  max-width: 800px;
}

.rulebooks-description {
  font-family: 'Alegreya Sans', sans-serif;
  font-weight: 300;
  margin: 10px 5px;
}
</style>