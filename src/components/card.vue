<template>
  <div class="flip-card supply-card"
      :class="{'show-back': isShowingBack, isVertical: isVertical}"
      @transitionend="handleTransitionEnd">
    <div class="flip-card__content">
      <div class="flip-card__content__front">
        <img class="supply-card__front-img" :src="frontCardImageUrl" :key="card.id"
            @load="handleFrontImageLoaded" />
        <div class="supply-card__front-set-container" v-if="showSetName">
          <div class="supply-card__front-set-name" :class="setClassName">{{ setName }}</div>
        </div>
      </div>
      <div class="flip-card__content__back">
        <img class="supply-card__back-img" :src="backCardImageUrl"
            @load="handleBackImageLoaded" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { DominionSets } from "../dominion/dominion-sets";
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { getCardImageUrl } from "../utils/images";
import { Card } from "../dominion/card";

@Component
export default class CardComponent extends Vue {
  @Prop() readonly card!: Card | null;
  @Prop() readonly isVertical!: boolean;
  isBackLoaded = false;
  isFrontLoaded = false;
  isFlipping = false;

  get isShowingBack() {
    return this.card == null || !this.isBackLoaded || !this.isFrontLoaded;
  }

  get showSetName() {
    return !this.isShowingBack && !this.isFlipping;
  }

  get setClassName() {
    return this.card ? this.card.setId : "";
  }

  get setName() {
    return this.card ? DominionSets.getSetById(this.card.setId).name : "";
  }

  get frontCardImageUrl() {
    return this.card ? getCardImageUrl(this.card.id) : "";
  }

  get backCardImageUrl() {
    return this.isVertical
        ? "/img/cards/backside_blue.jpg"
        : "/img/cards/backside_blue_horizontal.jpg";
  }

  @Watch("isShowingBack")
  onIsShowingBack() {
    this.isFlipping = true;
  }

  handleTransitionEnd() {
    this.isFlipping = false;
  }

  handleFrontImageLoaded() {
    this.isFrontLoaded = true;
  }

  handleBackImageLoaded() {
    this.isBackLoaded = true;
  }
}
Vue.component("card-component", CardComponent);
</script>