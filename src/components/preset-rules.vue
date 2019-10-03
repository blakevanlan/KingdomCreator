<template>
  <div class="main_rule">
      <div class="rules-description">
          Here are the booklet of each published set of dominion. Booklets contain description of kingdoms cards for each set and how they interact with other kingdom card.
      </div>

    <card-layout-component 
      :items="sets"
      :number-of-columns="3"
      :is-vertical="true"
      shape="square"
    >
      <template v-slot:default="slotProps">
        <static-rule-with-set-component :rulefromset="slotProps.item" />
      </template>
    </card-layout-component>

  </div>
</template>


<script lang="ts">
import { State } from "vuex-class";
import { Vue, Component } from "vue-property-decorator";
import CardLayoutComponent from "./card-layout.vue";
import StaticRuleWithSetComponent from "./static-rule-with-set.vue";
import { IgnoreSetIdRules } from "../dominion/set-id";
import { DominionSets } from "../dominion/dominion-sets";

@Component
export default class PresetRules extends Vue {
  constructor() {
    super({
      components: {
        "card-layout-component": CardLayoutComponent,
        "static-rule-with-set-component": StaticRuleWithSetComponent      }
    });
  }
  @State(state => state.window.width) windowWidth!: number;
 
 get sets() {
    return DominionSets.getAllSets().filter( (set) => !IgnoreSetIdRules.has(set.setId) );
  }
 
};


</script>

<style>

.content {
  padding: unset;
}

.main_rule {
  width:95%;
}



</style>