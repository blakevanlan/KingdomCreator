<template>
  <span v-if="addons.length == 0"></span>
  <span v-else-if="addons.length == 1">
    {{ $t(addons[0]) }}
  </span>
  <i18n v-else-if="addons.length >= 2" :path="addonFormat" tag="span">
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
  </i18n>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class AddonTitle extends Vue {
  @Prop() readonly hasEvents!: boolean;
  @Prop() readonly hasLandmarks!: boolean;
  @Prop() readonly hasProjects!: boolean;
  @Prop() readonly hasWays!: boolean;

  get addons() {
    const addons = [];
    if (this.hasEvents) addons.push("addon_events");
    if (this.hasLandmarks) addons.push("addon_landmarks");
    if (this.hasProjects) addons.push("addon_projects");
    if (this.hasWays) addons.push("addon_ways");
    return addons;
  }

  get addonFormat() {
    switch (this.addons.length) {
      case 2:
        return "addon_description_format_2";
      case 3:
        return "addon_description_format_3";
      case 4:
        return "addon_description_format_4";
      case 5:
        return "addon_description_format_5";
    }
    return null;
  }
}
</script>
