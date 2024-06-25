<template>
  <span v-if="addons.length == 0"></span>
  <span v-else-if="addons.length == 1">
    {{ $t(addons[0]) }}
  </span>
  <i18n-t scope="global" v-else-if="addons.length >= 2" :keypath="addonFormat" tag="span">
    <template v-slot:one>
      {{ $t(addons[0]) }}
    </template>
    <template v-slot:two>
      {{ $t(addons[1]) }}
    </template>
    <template v-if="addons.length >= 3" v-slot:three>
      {{ $t(addons[2]) }}
    </template>
    <template v-if="addons.length >= 4" v-slot:four>
      {{ $t(addons[3]) }}
    </template>
    <template v-if="addons.length >= 5" v-slot:five>
      {{ $t(addons[4]) }}
    </template>
  </i18n-t>
</template>

<script lang="ts">
/* import Vue, typescript */
import { defineComponent, computed } from "vue";
import { useI18n } from "vue-i18n";
import type { PropType } from "vue";

/* import Dominion Objects and type*/
/* import store  */
/* import Components */

export default defineComponent({
  name: "AddonTitle",
  props: {
    hasEvents: {
      type: Boolean as PropType<Boolean>,
      required: true,
    },
    hasLandmarks: {
      type: Boolean as PropType<Boolean>,
      required: true,
    },
    hasProjects: {
      type: Boolean as PropType<Boolean>,
      required: true,
    },
    hasWays: {
      type: Boolean as PropType<Boolean>,
      required: true,
    },
    hasTraits: {
      type: Boolean as PropType<Boolean>,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n();
    const addons = computed(() => {
      const addons = [];
      if (props.hasEvents) addons.push("addon_events");
      if (props.hasLandmarks) addons.push("addon_landmarks");
      if (props.hasProjects) addons.push("addon_projects");
      if (props.hasWays) addons.push("addon_ways");
      if (props.hasTraits) addons.push("addon_traits");
      return addons;
    });

    const addonFormat = computed(() => {
      switch (addons.value.length) {
        case 2:
          return "addon_description_format_2";
        case 3:
          return "addon_description_format_3";
        case 4:
          return "addon_description_format_4";
        case 5:
          return "addon_description_format_5";
        default:
          return "null";
      }
    });
    return {
      addons,
      addonFormat
    };
  },
})
</script>
