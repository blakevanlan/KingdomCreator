<template>
  <Page :subtitle="subtitle" :selectedType="selectedType">
    <div class="content main">
      <Rulebooks />
    </div>
  </Page>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import Page, { MenuItemType } from "../components/Page.vue";
import Rulebooks from "../components/Rulebooks.vue";

const SUBTITLE = "Original rule books of Dominion Sets";

@Component({
  components: {
    Page,
    Rulebooks
  }
})
export default class Rules extends Vue {
  subtitle = SUBTITLE
  selectedType = MenuItemType.RULES
}
</script>
