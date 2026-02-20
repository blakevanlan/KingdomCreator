<template>
  <Page :subtitle="$t('settings_page_subtitle')" :selectedType="selectedType">
    <div class="content main settings">
      <DeskSizeSettings />
      <OwnedExpansionsSettings />
      <RandomizeConstraintsSettings />
    </div>
  </Page>
</template>


<script lang="ts">
/* import Vue, typescript */
import { defineComponent } from 'vue';

/* import Components */
import Page, { MenuItemType } from '@/components/Page.vue';
import DeskSizeSettings from '@/components/settings/Settings-DeskSizeSettings.vue';
import RandomizeConstraintsSettings from '@/components/settings/Settings-RandomizeConstraintsSettings.vue';
import OwnedExpansionsSettings from '@/components/settings/Settings-OwnedExpansionsSettings.vue';

import useBase from './base';

export default defineComponent({
  name: "Settings",
  components: {
    Page,
    OwnedExpansionsSettings,
    RandomizeConstraintsSettings,
    DeskSizeSettings,
  },
  setup() {
    useBase();
    const selectedType = MenuItemType.SETTINGS;
    const buildType = process.env.NODE_ENV 
  
    return {
      buildType,
      selectedType,
    };
  }
});
</script>

<style scoped>

.settings {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
</style>
