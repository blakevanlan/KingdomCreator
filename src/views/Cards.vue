<template>
  <Page :subtitle="$t('sets_page_subtitle')" :selectedType="selectedType">
    <div class="content">
      <BoxesSidebar />
      <div class="main">
        <!-- <card-online-editor-component :set="set" v-if="true" /> -->
        <CardOnlinePageComponent :set="set" v-if="true" />
        <CardOnlinePageLandscapeComponent :set="set" v-if="true" />
        <CardOnlinePageOthercardComponent :set="set" v-if="false" />
      </div>
    </div>
  </Page>
</template>

<script lang="ts">
/* import Vue, typescript */
import { computed, defineComponent } from 'vue';

/* import Dominion Objects and type*/
import { DominionSets } from '@/dominion/dominion-sets';
import type { DominionSet } from '@/dominion/dominion-set';

/* import store  */
import { useSetsStore } from '@/pinia/sets-store';

/* import Components */
import Page, { MenuItemType } from '@/components/Page.vue';
import CardOnlinePageComponent from '@/components/cards/CardOnlinePageComponent.vue';
import CardOnlinePageLandscapeComponent from '@/components/cards/CardOnlinePageLandscapeComponent.vue';
import CardOnlinePageOthercardComponent from '@/components/cards/CardOnlinePageOthercardComponent.vue';
import BoxesSidebar from '@/components/boxes/BoxesSidebar.vue';

import useBase from './base';

export default defineComponent({
  name: "Cards",
  components: {
    Page,
    BoxesSidebar,
    // "card-online-editor-component": CardOnlineEditorComponent,
    CardOnlinePageComponent,
    CardOnlinePageLandscapeComponent,
    CardOnlinePageOthercardComponent
  },
  setup() {
    const setsStore = useSetsStore();

    useBase();
    const selectedType = MenuItemType.CARDS

    const set = computed(() => {
      const setId = setsStore.selectedBoxesSetId;
      return (DominionSets.sets[setId] as DominionSet);
    })

    return {
      selectedType,
      set
    };
  }
})
</script>
