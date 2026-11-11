<template>
  <Page :subtitle="$t('history_page_subtitle')" :selectedType="selectedType">
    <div class="content main">
      <div class="sets-description">{{$t("history_page_description")}}</div>
      <HistoryView />
    </div>
  </Page>
</template>

<script lang="ts">
/* import Vue, typescript */
import { defineComponent } from 'vue';
/* import Components */
import Page, { MenuItemType } from '@/components/Page.vue';
import HistoryView from '@/components/history/HistoryView.vue';

import useBase from './base';

export default defineComponent({
  name: "History", 
  components: {
    Page,
    HistoryView
  },
  setup() {
    useBase();
    const selectedType = MenuItemType.HISTORY;

  return {
      selectedType,
    };
  }

});
</script>