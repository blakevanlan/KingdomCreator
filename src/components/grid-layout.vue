<template>
  <div class="grid-layout" :class="columnClasses">
      <div class="grid-layout_item" :class="shape" v-for="item in items">
        <slot :item="item"></slot>
      </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

export enum Shape {
  CARD = "grid-layout_item--card",
  SQUARE = "grid-layout_item--square",
}

@Component
export default class GridLayoutComponent extends Vue {
  @Prop() readonly items!: any[];
  @Prop() readonly numberOfColumns!: number;
  @Prop() readonly isVertical!: boolean;
  @Prop({ default: Shape.CARD }) readonly shape!: Shape;

  get columnClasses() {
    const columnClasses = ["", "one-column", "two-columns", "three-columns", "four-columns", "five-columns"];
    const directionClass = this.isVertical ? "grid-layout--vertical" : "grid-layout--horizontal";
    return [columnClasses[this.numberOfColumns], directionClass];
  }
}
Vue.component("grid-layout-component", GridLayoutComponent);
</script>

<style>
.grid-layout {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  position: relative;
}

.grid-layout_item {
  pointer-events: none;
  position: relative;
}

/**
 * Shape layouts. 
 * The padding-bottom is 'flex-basis * card height / card width'.
 */
.grid-layout--vertical.five-columns .grid-layout_item--card {
  flex-basis: 19.5%;
  padding-bottom: 31.16%; /* 19.5 * (473 / 296) */
  margin: 0.25%;
}

.grid-layout--vertical.four-columns .grid-layout_item--card {
  flex-basis: 24.2%;
  padding-bottom: 38.67%; /*  24.2 * (473 / 296) */
  margin: 0.4%;
}

.grid-layout--vertical.three-columns .grid-layout_item--card {
  flex-basis: 31.73333%;
  padding-bottom: 50.709%; /* 31.73333 * (473 / 296) */
  margin: 0.8%;
}

.grid-layout--vertical.two-columns .grid-layout_item--card {
  flex-basis: 48%;
  padding-bottom: 76.703%; /*  48 * (473 / 296) */
  margin: 1%;
}

/* Horizontal layout */
.grid-layout--horizontal.three-columns .grid-layout_item--card {
  flex-basis: 30%;
  padding-bottom: 18.77%; /* 30 * (296 / 473) */
  margin: 0.25%;
}

.grid-layout--horizontal.three-columns .grid-layout_item--card:nth-child(3n) {
  margin-right: 0;
}

.grid-layout--horizontal.two-columns .grid-layout_item--card {
  flex-basis: 49.25%;
  padding-bottom: 28.32%; /* 45.25 * (296 / 473) */
  margin: 0.25%;
}

.grid-layout--horizontal.one-column .grid-layout_item {
  flex-basis: 99.8%;
  padding-bottom: 62.454%; /* 99.8 * (296 / 473) */
  margin: 0 0.1% 4px 0.1%;
}

.three-columns .grid-layout_item--square {
  flex-basis: 31.73333%;
  padding-bottom: 31.73333%; /* 31.73333 * (500 / 500) */
  margin: 0.8%;
}

.two-columns .grid-layout_item--square {
  flex-basis: 48%;
  padding-bottom: 48%;; /* 48 * (500 / 500) */
  margin: 1%;
}

.one-column .grid-layout_item--square {
  flex-direction: column;
  flex-basis: 95%;
  padding-bottom: 95%;; /* 49.25 * (500 / 500) */
  margin: 2%;
}

</style>
