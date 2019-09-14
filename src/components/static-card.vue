<template>
  <div class="static-card" :class="{isVertical: isVertical}">
    <img class="static-card__img" :src="cardImageUrl" :key="cardImageUrl" />
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class StaticCardComponent extends Vue {
  @Prop() readonly cardImageUrl!: string | null;
  @Prop() readonly isVertical!: boolean;
}
Vue.component("static-card-component", StaticCardComponent);
</script>

<style>
.static-card,
.static-card__img {
  height: 100%;
  position: absolute;
  top: 0;
  width: 100%;
}
</style>