<template>
  <div class="static-rule" :class="{isVertical: isVertical}">
	<a class="rulebook" target="_rulebookDominion" :href="PdfURL">
	  <img class="static-rule__img" :src="cardImageUrl" :key="cardImageUrl" />
	</a>
	<!--
	<a class="rulebook" target="_rulebookDominion" :href="PdfURL">{{ RuleName }}</a>
	-->
	<slot></slot>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { RuleBook } from "../dominion/rule";
import { getRuleImageUrl } from "../utils/images";

@Component
export default class StaticRuleComponent extends Vue {
  @Prop() readonly isVertical!: boolean;
  @Prop() readonly rule!: RuleBook;
  
  get RuleName() {
    return this.rule.name
  }
  
  get PdfURL () {
	return "/rules/" + this.rule.url
  }

  get cardImageUrl() {
    return getRuleImageUrl(this.rule.img);
  }
  
}
Vue.component("static-rule-component", StaticRuleComponent);
</script>

<style>
.static-rule,
.static-rule__img {
  height: auto;
  position: absolute;
  top: 0;
  width: 100%;
  pointer-events: all;
}

.card-layout_card {
  padding-bottom:0%;
}
</style>