<template>
  <div v-if="items.length">
    <div class="Search-layout__title">{{title}}</div> 
    <div class="search-layout-wrapper" :class="{ 'horizontal': !isVertical }">
      <div v-for="item in items" :key="item.id" class="search-layout-item">
        <div class="beforeStaticSet">
          <StaticCardWithSet 
            :card="item" 
            :showOverlay="showOverlay"
            style="position:relative;"/>
        </div>
        <div class="card-details">
          <span class="card-name">{{ $t(item.id) }}</span>
          <span class="card-set">{{ $t(item.setId) }}</span>
          <span class="card-cost">{{ getCostName(item) }}</span>
          <span class="card-types">{{ getCardTypeNames(item) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import type { PropType } from 'vue';
import { ShowOverlayOptions } from '@/utils/resources.ts';
import StaticCardWithSet from '../StaticCardWithSet.vue';

export default defineComponent({
  name: "SearchLayout",
  components: { StaticCardWithSet },
  props: {
    items: { type: Array as PropType<any[]>, required: true },
    title: { type: String, required: true },
    getCostName: { type: Function as PropType<(card: any) => string>, required: true },
    getCardTypeNames: { type: Function as PropType<(card: any) => string>, required: true },
    // On garde isVertical pour savoir si on affiche des cartes Portrait ou Paysage
    isVertical: { type: Boolean, default: true }
  },
  setup(props) {
    return {
      showOverlay: ShowOverlayOptions.CHECK,
    };
  }
});
</script>

<style scoped>
.Search-layout__title {
  margin: 20px 0 15px 0;
  color: #333;
  font-weight: bold;
  font-size: 24px;
}

.search-layout-wrapper {
  display: grid;
  /* Utilisation de minmax : 
     - 160px minimum pour que ça loge sur mobile
     - 1fr pour que les cartes s'étirent et remplissent l'espace
  */
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

/* Pour les éléments horizontaux (Events, Landmarks), on peut élargir le minimum */
.search-layout-wrapper.horizontal {
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}

.search-layout-item {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 8px;
  transition: transform 0.2s;
}

.card-details {
  margin-top: 8px;
  text-align: center;
  font-size: 0.85em;
  display: flex;
  flex-direction: column;
}

.card-name {
  font-weight: bold;
  color: #333;
  font-size: 1em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-set, .card-cost, .card-types {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

</style>