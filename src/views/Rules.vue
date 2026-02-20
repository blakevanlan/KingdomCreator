<template>
  <Page :subtitle="$t('rules_page_subtitle')" :selectedType="selectedType">
    <div class="contentRules main">
      <Rulebooks />
    </div>
  </Page>
</template>

<script lang="ts">
/* import Vue, typescript */
import { defineComponent } from 'vue';
/* import Components */
import Page, { MenuItemType } from '@/components/Page.vue';
import Rulebooks from '@/components/rules/Rulebooks.vue';

import useBase from './base';

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