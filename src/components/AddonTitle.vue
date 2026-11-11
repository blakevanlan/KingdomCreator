<template>
  <span v-if="addons.length === 0"></span>
  <span v-else-if="addons.length === 1">
    {{ $t(addons[0]) }}
  </span>

  <i18n-t v-else scope="global" :keypath="addonFormat" tag="span">
    <template v-for="(addonKey, index) in addons" :key="index" v-slot:[getSlotName(index)]>
      {{ $t(addonKey) }}
    </template>
  </i18n-t>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

// On centralise la liste des types d'addons pour pouvoir boucler dessus facilement
const ADDON_TYPES = [
  { prop: 'hasEvents', key: 'addon_events' },
  { prop: 'hasLandmarks', key: 'addon_landmarks' },
  { prop: 'hasProjects', key: 'addon_projects' },
  { prop: 'hasWays', key: 'addon_ways' },
  { prop: 'hasTraits', key: 'addon_traits' },
  { prop: 'hasAlly', key: 'addon_ally' },
  { prop: 'hasProphecy', key: 'addon_prophecy' },
  // Pour ajouter un nouvel addon à l'avenir, il suffira d'ajouter une ligne ici !
] as const;

// Tableau pour convertir un index (0, 1, 2...) en nom de slot écrit (one, two, three...)
const SLOT_NAMES = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

export default defineComponent({
  name: "AddonTitle",
  props: {
    hasEvents:    { type: Boolean, default: false },
    hasLandmarks: { type: Boolean, default: false },
    hasProjects:  { type: Boolean, default: false },
    hasWays:      { type: Boolean, default: false },
    hasTraits:    { type: Boolean, default: false },
    hasAlly:      { type: Boolean, default: false },
    hasProphecy:  { type: Boolean, default: false }
  },
  setup(props) {
    // Génération dynamique du tableau d'addons actifs
    const addons = computed<string[]>(() => {
      return ADDON_TYPES
        .filter(item => props[item.prop as keyof typeof props])
        .map(item => item.key);
    });

    // Plus besoin de switch/case ! La clé de traduction s'adapte au nombre d'éléments
    const addonFormat = computed(() => {
      return addons.value.length >= 2 
        ? `addon_description_format_${addons.value.length}` 
        : 'null';
    });

    // Convertit l'index numérique en nom de slot pour i18n-t
    const getSlotName = (index: number): string => {
      return SLOT_NAMES[index] || `slot_${index}`;
    };

    return {
      addons,
      addonFormat,
      getSlotName
    };
  },
})
</script>