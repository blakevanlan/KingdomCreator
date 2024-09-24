<template>
  <Page :subtitle="$t('rules_page_subtitle')" :selectedType="selectedType">
    <div class="contentRules main">
      <Rulebooks />
    </div>
  </Page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import useBase from "./base";
import Page, { MenuItemType } from "../components/Page.vue";
import Rulebooks from "../components/Rulebooks.vue";


export default defineComponent({
  name: "Rules", 
  components: {
    Page,
    Rulebooks
  },
  setup() {
    useBase();
    const selectedType = MenuItemType.RULES;

  return {
      selectedType,
    };
  }

});
</script>