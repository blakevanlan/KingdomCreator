<template>
  <div class="rulebooks">
    <div class="rulebooks-description">
      Here are the rulebooks published with each set of dominion. Rulebooks contain descriptions of kingdom card and how they interact with other kingdom cards.
    </div>
    <grid-layout-component 
      :items="RULEBOOK_IDS"
      :number-of-columns="3"
      :is-vertical="true"
      :shape="Shape.SQUARE"
    >
      <template v-slot:default="slotProps">
        <rulebook-component :rulebook="slotProps.item" />
      </template>
    </grid-layout-component>
  </div>
</template>


<script lang="ts">

import { Vue, Component } from "vue-property-decorator";
import GridLayoutComponent, { Shape } from "./grid-layout.vue";
import RulebookComponent, { Rulebook } from "./rulebook.vue";
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
      } as Rulebook
    })
    .concat({
      id: "guildscornucopia",
      name: "Guilds / Cornucopia"
    })
    .sort((a, b) => {
      return a.id == b.id ? 0 : a.id < b.id ? -1 : 1;
    });

@Component
export default class Rulebooks extends Vue {
  constructor() {
    super({
      components: {
        "grid-layout-component": GridLayoutComponent,
        "rulebook-component": RulebookComponent
      }
    });
  }
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