<template>
  <div class="card-layout" :class="columnClasses">
      <div class="card-layout_card" :class="shape" v-for="item in items">
        <slot :item="item"></slot>
      </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class CardLayoutComponent extends Vue {
  @Prop() readonly items!: any[];
  @Prop() readonly numberOfColumns!: number;
  @Prop() readonly isVertical!: boolean;
  @Prop() readonly shape!: string;

  get columnClasses() {
    const columnClasses = ["", "one-column", "two-columns", "three-columns", "four-columns", "five-columns"];
    const classes = [columnClasses[this.numberOfColumns]];
    if (!this.isVertical) {
      classes.push("card-layout--horizontal");
    }
    return classes;
  }
}
Vue.component("card-layout-component", CardLayoutComponent);
</script>

<style>
.card-layout {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  position: relative;
}

.card-layout_card {
  pointer-events: none;
  position: relative;
}


/* Shape is Card */
    /* Vertical layout */
      /* padding-bottom is flex-basis * card height / card width */
    .five-columns .card-layout_card {
      flex-basis: 19.5%;
      padding-bottom: 31.16%; /* 19.5 * (473 / 296) */
      margin: 0.25%;
    }
    
    .four-columns .card-layout_card {
      flex-basis: 24.2%;
      padding-bottom: 38.67%; /*  24.2 * (473 / 296) */
      margin: 0.4%;
    }
    
    .three-columns .card-layout_card {
      flex-basis: 31.73333%;
      padding-bottom: 50.709%; /* 31.73333 * (473 / 296) */
      margin: 0.8%;
    }
    
    .two-columns .card-layout_card {
      flex-basis: 48%;
      padding-bottom: 76.703%; /*  48 * (473 / 296) */
      margin: 1%;
    }
    
    /* Horizontal layout */
    .card-layout--horizontal.three-columns .card-layout_card {
      flex-basis: 30%;
      padding-bottom: 18.77%; /* 30 * (296 / 473) */
      margin: 0.25%;
    }
    
    .card-layout--horizontal.three-columns .card-layout_card:nth-child(3n) {
      margin-right: 0;
    }
    
    .card-layout--horizontal.two-columns .card-layout_card {
      flex-basis: 49.25%;
      padding-bottom: 28.32%; /* 45.25 * (296 / 473) */
      margin: 0.25%;
    }
    
    .card-layout--horizontal.one-column .card-layout_card {
      flex-basis: 99.8%;
      padding-bottom: 62.454%; /* 99.8 * (296 / 473) */
      margin: 0 0.1% 4px 0.1%;
    }

/* Square layout */
.three-columns .square {
  flex-basis: 31.73333%;
  padding-bottom: 31.73333%; /* 31.73333 * (500 / 500) */
  margin: 0.8%;
}

.two-columns .square {
  flex-basis: 48%;
  padding-bottom: 48%;; /* 48 * (500 / 500) */
  margin: 1%;
}

.one-column .square {
  flex-direction: column;
  flex-basis: 95%;
  padding-bottom: 95%;; /* 49.25 * (500 / 500) */
  margin: 2%;
}

</style>
