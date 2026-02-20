<template>
  <div>
    <Page :subtitle="$t('boxes_page_subtitle')" :selectedType="selectedType">
      <div class="content">
        <BoxesSidebar />
        <div class="main">
          <div class="sets-description">{{$t("boxes_page_description")}}</div>
          <div class="kingdoms">
		  <!-- Box content -->
            <PresetBoxcontent />
          </div>
        </div>
      </div>
    </Page>
    <EnlargeButton />
  </div>
</template>

<script lang="ts">
  /* import Vue, typescript */
import { defineComponent } from 'vue';

/* import Components */
import Page, { MenuItemType } from '@/components/Page.vue';
import EnlargeButton from '@/components/EnlargeButton.vue';
import PresetBoxcontent from '@/components/boxes/Boxes-PresetBoxcontent.vue';
import BoxesSidebar from '@/components/boxes/BoxesSidebar.vue';

import useBase from './base';

export default defineComponent({
  name: "Boxes", 
  components: {
    Page,
    PresetBoxcontent,
    BoxesSidebar,
    EnlargeButton
  },
  setup() {
    useBase();
    const selectedType = MenuItemType.BOXES;

  return {
      selectedType,
    };
  }

});
</script>
