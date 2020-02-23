<template>
  <div class="static-card" :class="{isVertical: isVertical}">
    <img class="static-card__img" :src="cardImageUrl" :key="cardImageUrl" />
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class StaticCard extends Vue {
  @Prop() readonly cardImageUrl!: string | null;
  @Prop() readonly isVertical!: boolean;
}
</script>

<style>
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