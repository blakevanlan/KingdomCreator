<template>
  <Page :subtitle="$t('sets_page_subtitle')" :selectedType="selectedType">
    <div class="content">
      <BoxesSidebar />
      <div class="main cardMain">
        <!-- <card-online-editor-component :set="set" v-if="true" /> -->
        <card-online-page-component :set="set" v-if="true" />
        <card-online-page-landscape-component :set="set" v-if="true" />
        <card-online-page-othercard-component :set="set" v-if="true" />
      </div>
    </div>
  </Page>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import useBase from "./base";
import Page, { MenuItemType } from "../components/Page.vue";


// import CardOnlineEditorComponent from "../components/card-online-editor.vue";
import CardOnlinePageComponent from "../components/card-online-page.vue";
import CardOnlinePageLandscapeComponent from "../components/card-online-page-landscape.vue";
import CardOnlinePageOthercardComponent from "../components/card-online-page-othercard.vue";
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
    "card-online-page-component": CardOnlinePageComponent,
    "card-online-page-landscape-component": CardOnlinePageLandscapeComponent,
    "card-online-page-othercard-component": CardOnlinePageOthercardComponent
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
