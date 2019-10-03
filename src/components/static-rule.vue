<template>
  <div class="static-rule" :class="{isVertical: isVertical}">
    <a class="rulebook" target="_rulebookDominion" :href="RulebookUrl">
      <img class="static-rule__img" :src="SetImageUrl" :key="SetImageUrl"/>
    </a>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { getSetImageUrl, getRulebookUrl } from "../utils/resources";

@Component
export default class StaticRuleComponent extends Vue {
  @Prop() readonly isVertical!: boolean;
  @Prop() readonly rule!: string;
  
  get RuleName() {
    return this.rule
  }
  
  get RulebookUrl () {
    return getRulebookUrl(this.rule);
  }

  get SetImageUrl () {
    return getSetImageUrl(this.rule);
  }
  
}
Vue.component("static-rule-component", StaticRuleComponent);
</script>

<style>
.static-rule,
.static-rule__img {
  position: absolute;
  top: 0;
  object-fit: contain;
  height: 100%;
  width: 100%;
  pointer-events: all;
}

.card-layout_card {
  padding-bottom:0%;
}

</style>