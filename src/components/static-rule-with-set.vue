<template>
  <static-rule-component
    :class="rulename"
    :is-vertical="isVertical"
    :rule="rulename"
  >
  </static-rule-component>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import StaticRuleComponent from "./static-rule.vue";
import CardSetDescriptionComponent from "./card-set-description.vue";
import { DominionSet } from "../dominion/dominion-set";

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
  @Prop() readonly rulefromset!: DominionSet;

  get isVertical() {
    return "isVertical";
  }

  get set() {
    return this.rulefromset;
  }

  get rulename() {
    return this.rulefromset.setId;
  }

}
Vue.component("static-rule-with-set-component", StaticRuleWithSetComponent);
</script>