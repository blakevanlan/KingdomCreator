<template>
  <div class="ad-banner">
    <div class="ad-text">
      Interested in advertising here?
    </div>
    <a href="https://forms.gle/eE3HnhrVvjWrbCLS8"
      class="standard-button standard-button--is-primary standard-button--small"
    >
      Get in touch!
    </a>
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
  align-items: center;
  background: rgba(2, 119, 158, 0.1);
  border: 1px solid rgba(2, 119, 158, 0.7);
  border-radius: 8px;
  color: rgba(2, 119, 158, 1);
  display: flex;
  flex-direction: row;
  font-family: 'Alegreya Sans', sans-serif;
  font-size: 16px;
  font-weight: 300;
  justify-content: space-between;
  margin: 42px 12px 12px 0;
  padding: 8px 12px;
}

@media (max-width: 750px) {
  .ad-banner {
    margin-left: 12px;
  }
}

.link {

}

</style>