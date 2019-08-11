<template>
  <div class="card-replacement__container">
    <div class="card-replacement__content" :style="contentStyle">
      <div class="kingdom-supply_card" v-for="card in visibleSupplyCards" :key="card.id">
        <static-card-component :cardImageUrl="getCardImageUrl(card.id)">
          <div class="card-replacement__button-container">
            <div class="card-replacement__button"
              v-if="card == supplyCard"
              @click.stop="$emit('cancel')"
            >
              Cancel
            </div>
            <div class="card-replacement__button" v-else @click.stop="$emit('replace', card)">
              Replace
            </div>
          </div>
        </static-card-component>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { SupplyCard } from "../dominion/supply-card";
import { State } from "vuex-class";
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { Coordinate } from "../utils/coordinate";
import { getCardImageUrl } from "../utils/images";
import { getRandomInts } from "../utils/rand";
import { Supply } from "../randomizer/supply";

export enum CardPosition {
  LEFT = "left",
  CENTER = "center",
  RIGHT = "right"
}

@Component
export default class CardReplacementComponent extends Vue {
  @Prop() readonly supplyCard!: SupplyCard | null;
  @Prop() readonly topLeftCoordinate!: Coordinate;
  @Prop() readonly cardPosition!: CardPosition;
  @State(state => state.randomizer.kingdom.supply) readonly supply!: Supply;
  visibleSupplyCards: SupplyCard[] = [];

  mounted() {
    this.handleSupplyCardChanged();
  }

  get contentStyle() {
    return `left: ${this.topLeftCoordinate.x}px; top: ${this.topLeftCoordinate.y};`
  }

  @Watch("supplyCard")
  handleSupplyCardChanged() {
    if (!this.supplyCard) {
      this.visibleSupplyCards = [];
      return;
    }
    const options = this.supply.replacements.getReplacementsForId(this.supplyCard.id);
    const indices = getRandomInts(Math.min(options.length, 2), options.length);
    const selectedOptions = options.filter((_, index) => indices.has(index));
    const visibleSupplyCards = [this.supplyCard];
    if (selectedOptions.length) {
      visibleSupplyCards.push(selectedOptions[0]);
    }
    if (selectedOptions.length > 1) {
      visibleSupplyCards.unshift(selectedOptions[1]);
    }
    this.visibleSupplyCards = visibleSupplyCards;    
  }

  getCardImageUrl = getCardImageUrl
}
Vue.component("card-replacement-component", CardReplacementComponent);
</script>

<style>
.card-replacement__container {
  position: absolute;
  background: rgba(255, 255, 255, 0.75);
  height: 100%;
  left: 0;
  top: 0;
  width: 100%;
  z-index: 100;
}
.card-replacement__container.fade-enter-active,
.card-replacement__container.fade-leave-active {
  transition: opacity .3s;
}
.card-replacement__container.fade-enter,
.card-replacement__container.fade-leave-to {
  opacity: 0;
}

.card-replacement__content {
  position: absolute;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  width: 100%;
}

.five-columns .card-replacement__content {
  margin: -0.25% 0 0 -0.25%;
}
.four-columns .card-replacement__content {
  margin: -0.4% 0 0 -0.4%;
}
.three-columns .card-replacement__content {
  margin: -0.8% 0 0 -0.8%;
}

.card-replacement__content::before {
  background: rgb(2,119,158);
  bottom: -3px;
  box-shadow: 0 0 30px rgb(2,119,158);
  content: '';
  left: -3px;
  position: absolute;
  top: -3px;
}
.five-columns .card-replacement__content::before {
  width: calc(60% + 6px);
}
.four-columns .card-replacement__content::before {
  width: calc(75% + 6px);
}
.three-columns .card-replacement__content::before {
  width: calc(100% + 6px);
}


.card-replacement__content .kingdom-supply_card {
  position: relative;
}

.card-replacement__content .supply-card {
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-replacement__button-container {
  
}

.card-replacement__button {
  background: rgb(2, 119, 158);
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #ddd;
  padding: 6px 12px;
  position: relative;
  margin: 12px 0;
  box-shadow: 0 2px 2px rgba(0, 0, 0, .20);
  overflow: hidden;
  outline: none;
}
.card-replacement__button:hover::before,
.card-replacement__button:focus::before {
  content: '';
  position: absolute;
  background: rgba(255, 255, 255, 0.25);
  height: 100%;
  left: 0;
  top: 0;
  width: 100%;
}
.card-replacement__button:active {
  box-shadow: none;
  transform: translate(0, 1px)
}

</style>
