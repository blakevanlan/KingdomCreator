<template>
  <div class="ad-banner">
    <ins class="adsbygoogle"
      style="display:block"
      data-ad-client="ca-pub-4487860874012172"
      data-ad-slot="9126117537"
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class AdBanner extends Vue {
  mounted() {
    const w = window as any;
    (w.adsbygoogle = w.adsbygoogle || []).push({});
  }
}
</script>

<style>
.ad-banner {
  margin: 30px 0 12px 0;
}

@media (max-width: 750px) {
  .ad-banner {
    margin-left: 4px;
    margin-right: 4px;
  }
}
</style>