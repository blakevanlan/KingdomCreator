<template>
  <Page :subtitle="subtitle" :selectedType="selectedType">
    <div class="content main">
      <Rulebooks />
    </div>
  </Page>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import Base from "./base";
import Page, { MenuItemType } from "../components/Page.vue";
import Rulebooks from "../components/Rulebooks.vue";

const SUBTITLE = "Original rule books of Dominion Sets";

@Component({
  components: {
    Page,
    Rulebooks
  }
})
export default class Rules extends Base {
  subtitle = SUBTITLE
  selectedType = MenuItemType.RULES
}
</script>
