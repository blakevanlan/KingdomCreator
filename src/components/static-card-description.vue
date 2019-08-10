<template>
  <div class="supply-card__front-set-container">
    <div class="supply-card__front-set-name">{{ description }}</div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class StaticCardDescriptionComponent extends Vue {
  @Prop() readonly description!: string;
}
Vue.component("static-card-description-component", StaticCardDescriptionComponent);
</script>