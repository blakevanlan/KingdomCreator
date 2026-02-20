<template>
  <Page :subtitle="$t('search_cards_page_subtitle')"  :selectedType="selectedType">
    <div class="content">
      <div class="sets-description">{{$t("search_page_description")}}</div>
        <SearchFilters />
      <SearchResultsDisplay />
    </div>
  </Page>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import useBase from './base';
import Page, { MenuItemType } from '../components/Page.vue';
import SearchFilters from '../components/search/SearchFilters.vue'; 
import SearchResultsDisplay from '../components/search/SearchResultsDisplay.vue';

// Dominion Objects and types

export default defineComponent({
  name: "SearchCards",
  components: {
    Page,
    SearchFilters,
    SearchResultsDisplay,
  },
  setup() {
    useBase();
    const selectedType = MenuItemType.SEARCHCARDS;

  return {
      selectedType,
    };
  }

});
</script>

