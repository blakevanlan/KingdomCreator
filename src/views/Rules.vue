<template>
  <Page :subtitle="$t('rules_page_subtitle')" :selectedType="selectedType">
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

@Component({
  components: {
    Page,
    Rulebooks
  }
})
export default class Rules extends Base {
  selectedType = MenuItemType.RULES
}
</script>
