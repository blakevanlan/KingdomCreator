<template>
  <Page :subtitle="$t('sets_page_subtitle')" :selectedType="selectedType">
    <div class="content">
      <SetsSidebar />
      <div class="main">
        <div class="sets-description">{{
          $t("sets_page_description")
        }}</div>
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

@Component({
  components: {
    Page,
    PresetKingdom,
    SetsSidebar
  }
})
export default class Rules extends Base {
  selectedType = MenuItemType.SETS

  get kingdoms() {
    const setId = (this.$store.state as State).selectedSetId;
    return DominionKingdoms.kingdoms[setId];
  }
}
</script>
