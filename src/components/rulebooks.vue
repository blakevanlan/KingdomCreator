<template>
  <div class="rulebooks">
    <div class="rulebooks-description">
      Here are the rulebooks published with each set of dominion. Rulebooks
      contain descriptions of kingdom card and how they interact with other
      kingdom cards.
    </div>
    <GridLayout 
      :items="RULEBOOK_IDS"
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
import Rulebook, { RulebookInterface } from "./rulebook.vue";
import { SetId } from "../dominion/set-id";
import { DominionSets } from "../dominion/dominion-sets";

const SETS_TO_IGNORE = new Set([SetId.PROMOS]);
const RULEBOOK_IDS = 
  DominionSets
    .getAllSets()
    .filter(s => !SETS_TO_IGNORE.has(s.setId))
    .map(s => {
      return {
        id: s.setId,
        name: s.name
      } as RulebookInterface
    })
    .concat({
      id: "guildscornucopia",
      name: "Guilds / Cornucopia"
    })
    .sort((a, b) => {
      return a.id == b.id ? 0 : a.id < b.id ? -1 : 1;
    });

@Component({
  components: {
    GridLayout,
    Rulebook
  }
})
export default class Rulebooks extends Vue {
  RULEBOOK_IDS = RULEBOOK_IDS;
  Shape = Shape;
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