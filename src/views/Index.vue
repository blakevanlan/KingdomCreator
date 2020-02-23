<template>
  <div>
    <ReplaceSupplyCardModal :key="this.$store.state.randomizer.kingdom.id" />
    <Page :subtitle="subtitle" :selectedType="selectedType">
      <Randomizer @specify-replacement="showReplaceModal = true" />
    </Page>
    <EnlargeButton />
  </div>
</template>

<script lang="ts">

import { Component } from "vue-property-decorator";
import Base from "./base";
import EnlargeButton from "../components/EnlargeButton.vue";
import Page, { MenuItemType } from "../components/Page.vue";
import Randomizer from "../components/Randomizer.vue";
import ReplaceSupplyCardModal from "../components/ReplaceSupplyCardModal.vue";

const SUBTITLE = "Dominion card picker for desktop and mobile";

@Component({
  components: {
    Page,
    Randomizer,
    ReplaceSupplyCardModal,
    EnlargeButton,
  }
})
export default class Index extends Base {
  subtitle = SUBTITLE
  selectedType = MenuItemType.RANDOMIZER
}
</script>
