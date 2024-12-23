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
import { defineComponent } from 'vue';
import useBase from "./base";
import Page, { MenuItemType } from "../components/Page.vue";
import DeskSizeSettings from "../components/Settings-DeskSizeSettings.vue";
import RandomizeConstraintsSettings from "../components/Settings-RandomizeConstraintsSettings.vue";
import OwnedExpansionsSettings from "../components/Settings-OwnedExpansionsSettings.vue";

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
