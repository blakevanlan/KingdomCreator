<template>
  <static-rule-component
    :class="set"
    :is-vertical="isVertical"
    :rule="rule"
  >
  </static-rule-component>
</template>

<script lang="ts">
import { RuleBook } from "../dominion/rule";
import { Vue, Component, Prop } from "vue-property-decorator";
import { getRuleImageUrl } from "../utils/images";
import StaticRuleComponent from "./static-rule.vue";
import CardSetDescriptionComponent from "./card-set-description.vue";



@Component
export default class StaticRuleWithSetComponent extends Vue {
  constructor() {
    super({
      components: {
        "static-rule-component": StaticRuleComponent,
        "card-set-description-component": CardSetDescriptionComponent,
      }
    });
  }
  @Prop() readonly rule!: RuleBook;
  
  get isVertical() {
    return "isVertical";
  }

  get cardImageUrl() {
    return getRuleImageUrl(this.rule.img);
  }

  get set() {
    return "BaseSet";
  }
  
  get rulename() {
    return this.rule.name;
  }
}
Vue.component("static-rule-with-set-component", StaticRuleWithSetComponent);
</script>