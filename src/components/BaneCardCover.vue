<template functional>
  <div class="bane-card-cover">
    <div class="bane-card-cover-text">
      Bane
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component
export default class BaneCardCover extends Vue {
}
</script>

<style>
.bane-card-cover {
  width: 100%;
  height: 100%;
  position: absolute;
  box-sizing: border-box;
  border: 5px solid #b78eca /* curse-color */;
}

.bane-card-cover-text {
  transform: rotate(0.75turn);
  color: white;
  background: #b78eca /* curse-color */;
  position: absolute;
  bottom: 9px;
  right: -17px;
  padding: 6px 12px;
}

@media (max-width: 600px) {
  .bane-card-cover {
    border-width: 3px;
  }
    
  .bane-card-cover-text {
    font-size: 12px;
    right: -13px;
  }
}
</style>