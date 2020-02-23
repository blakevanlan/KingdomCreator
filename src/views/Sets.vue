<template>
  <Page :subtitle="subtitle" :selectedType="selectedType">
    <div class="content">
      <SetsSidebar />
      <div class="main">
        <div class="sets-description">
          Players can play Dominion with any set of 10 Kingdom cards, but these sets have been
          specially picked out to be entertaining and show off card interactions and strategies.
        </div>
        <div class="kingdoms">
          <PresetKingdom v-for="kingdom in kingdoms" :key="kingdom.name" :kingdom="kingdom" />
        </div>
      </div>
    </div>
  </Page>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import Base from "./base";
import Page, { MenuItemType } from "../components/Page.vue";
import PresetKingdom from "../components/PresetKingdom.vue";
import SetsSidebar from "../components/SetsSidebar.vue";
import { DominionKingdoms } from "../dominion/dominion-kingdoms";
import { State } from "../stores/sets-store";

const SUBTITLE = "Recommended Sets of 10";

@Component({
  components: {
    Page,
    PresetKingdom,
    SetsSidebar
  }
})
export default class Rules extends Base {
  subtitle = SUBTITLE
  selectedType = MenuItemType.SETS

  get kingdoms() {
    const setId = (this.$store.state as State).selectedSetId;
    return DominionKingdoms.kingdoms[setId];
  }
}
</script>
