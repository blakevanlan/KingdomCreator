<template>
  <div class="ad-banner">
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class AdBanner extends Vue {
}
Vue.component("ad-banner-component", AdBanner);
</script>

<style>
.ad-banner {
  margin: 42px 0 12px 0;
}

@media (max-width: 750px) {
  .ad-banner {
    margin-left: 4px;
    margin-right: 4px;
  }
}
</style>