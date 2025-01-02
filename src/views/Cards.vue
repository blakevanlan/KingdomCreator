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
import { computed, defineComponent } from 'vue';
import useBase from "./base";
import Page, { MenuItemType } from "../components/Page.vue";


// import CardOnlineEditorComponent from "../components/card-online-editor.vue";
import CardOnlinePageComponent from "../components/CardOnlinePageComponent.vue";
import CardOnlinePageLandscapeComponent from "../components/CardOnlinePageLandscapeComponent.vue";
import CardOnlinePageOthercardComponent from "../components/CardOnlinePageOthercardComponent.vue";
import BoxesSidebar from "../components/BoxesSidebar.vue";
import { DominionSets } from "../dominion/dominion-sets";
import type { DominionSet } from "../dominion/dominion-set";
import { useSetsStore } from "../pinia/sets-store";

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
