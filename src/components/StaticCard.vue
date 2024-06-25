<template>
  <div class="static-card" :class="{isVertical: isVertical}">
    <img class="static-card__img" :src="cardImageUrl" :key="cardImageUrl" @error="incaseoferror"/>
    <slot></slot>
  </div>
</template>

<script lang="ts">
/* import Vue, typescript */
import { defineComponent } from "vue";

/* import Dominion Objects and type*/
import { incaseofImgerror } from '../utils/resources';

/* import store  */
/* import Components */

export default defineComponent({
  props: {
    cardImageUrl: {
      type: String,
      default: null,
    },
    isVertical: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const incaseoferror = (ev:any) => { incaseofImgerror(ev); };

    return {
      incaseoferror,
    };
  },
});
</script>

<style scoped>
.static-card {
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.static-card,
.static-card__img {
  height: 100%;
  position: absolute;
  top: 0;
  width: 100%;
}
</style>