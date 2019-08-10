<template>
  <div class="supply-card" :class="{isVertical: isVertical}">
    <img class="supply-card__front-img" :src="cardImageUrl" :key="cardImageUrl" />
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class StaticCardComponent extends Vue {
  @Prop() readonly cardImageUrl!: string | null;
  @Prop() readonly description!: string;
  @Prop() readonly isVertical!: boolean;
  
  get showDescription() {
    return !!this.description;
  }
}
Vue.component("static-card-component", StaticCardComponent);
</script>