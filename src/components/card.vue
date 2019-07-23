<template>
  <div class="flip-card supply-card"
      :class="{isVertical: isVertical}">
    <div class="flip-card__content" :style="{transform: `rotateY(${rotationDegrees}deg)`}">
      <div class="flip-card__content__front" @click.stop="handleClick">
        <img class="supply-card__front-img" v-if="activeCard" :src="frontCardImageUrl"
            :key="activeCard ? activeCard.id : ''"
            @load="handleFrontImageLoaded" />
        <transition name="fade">
          <div class="supply-card__front-set-container" v-if="showSetName">
            <div class="supply-card__front-set-name" :class="setClassName">{{ setName }}</div>
          </div>
        </transition>
        <div class="supply-card__front-highlight" v-if="showHighlight"></div>
      </div>
      <div class="flip-card__content__back">
        <img class="supply-card__back-img" :src="backCardImageUrl" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { DominionSets } from "../dominion/dominion-sets";
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { State } from "vuex-class";
import { getCardImageUrl } from "../utils/images";
import { Card } from "../dominion/card";
import { TweenLite, Sine } from "gsap";
import { Selection } from "../stores/randomizer/selection";
import { TOGGLE_CARD_SELECTION } from "../stores/randomizer/action-types";

enum CardState {
  FLIPPING_TO_BACK,
  BACK_VISIBLE,
  FLIPPING_TO_FRONT,
  FRONT_VISIBLE,
}

interface AnimationParams {
  rotation: number; /* 0=back, 1=front */
}

const ANIMATION_DURATION_SEC = 0.4;

@Component
export default class CardComponent extends Vue {
  @Prop() readonly card!: Card | null;
  @Prop() readonly isVertical!: boolean;
  @State(state => state.randomizer.selection) readonly selection!: Selection;
  activeCard: Card | null = null;
  cardState = CardState.BACK_VISIBLE;
  animationParams: AnimationParams = {rotation: 0};
  isFrontLoaded = false;
  activeAnimation: TweenLite | null = null;

  mounted() {
    this.updateCardState();
  }

  get rotationDegrees() {
    return 180 * (1 - this.animationParams.rotation);
  }

  get showSetName() {
    return this.cardState == CardState.FRONT_VISIBLE;
  }

  get setClassName() {
    return this.activeCard ? this.activeCard.setId : "";
  }

  get setName() {
    return this.activeCard ? DominionSets.getSetById(this.activeCard.setId).name : "";
  }

  get showHighlight() {
    return this.cardState == CardState.FRONT_VISIBLE
        && this.activeCard && this.selection.contains(this.activeCard.id);
  }

  get frontCardImageUrl() {
    return this.activeCard ? getCardImageUrl(this.activeCard.id) : "";
  }

  get backCardImageUrl() {
    return this.isVertical
        ? "/img/cards/backside_blue_horizontal.jpg"
        : "/img/cards/backside_blue.jpg";
  }

  @Watch("card")
  handleCardChanged() {
    this.updateCardState();
  }

  @Watch("cardState")
  handleCardStateChanged() {
    switch (this.cardState) {
      case CardState.FLIPPING_TO_BACK:
        this.$emit("flipping-to-back", this.activeCard);
        break;
      case CardState.FRONT_VISIBLE:
        this.$emit("front-visible", this.activeCard);
        break;
      default:
        break;
    }
    this.updateCardState();
  }

  handleFrontImageLoaded() {
    this.isFrontLoaded = true;
    this.updateCardState();
  }

  handleClick() {
    if (this.activeCard) {
      this.$store.dispatch(TOGGLE_CARD_SELECTION, this.activeCard.id);
    }
  }

  updateCardState() {
    const isActiveCardOutdated = this.isActiveCardOutdated();
    switch (this.cardState) {
      case CardState.BACK_VISIBLE:
        if (isActiveCardOutdated) {
          this.updateActiveCard();
        }
        if (this.isFrontLoaded) {
          this.flipToFront();
        }
        break;
      case CardState.FRONT_VISIBLE:
        if (isActiveCardOutdated) {
          this.flipToBack();
        }
        break;
      default:
        break;
    }
  }

  isActiveCardOutdated() {
    const cardId = this.card ? this.card.id : "";
    const activeCard = this.activeCard ? this.activeCard.id : "";
    return cardId != activeCard;
  }

  updateActiveCard() {
    this.isFrontLoaded = false;
    this.activeCard = this.card;
  }

  flipToBack() {
    this.cardState = CardState.FLIPPING_TO_BACK;
    this.animateToRotation(0);
  }

  flipToFront() {
    this.cardState = CardState.FLIPPING_TO_FRONT;
    this.animateToRotation(1);
  }

  animateToRotation(rotation: number) {
    this.activeAnimation = TweenLite.to(this.animationParams, ANIMATION_DURATION_SEC, {
      rotation: rotation,
      ease: Sine.easeInOut,
      onComplete: () => this.handleAnimationEnd(),
    });
  }

  handleAnimationEnd() {
    this.activeAnimation = null;
    this.cardState = this.cardState == CardState.FLIPPING_TO_BACK
        ? CardState.BACK_VISIBLE
        : CardState.FRONT_VISIBLE;
  }

  cancelAnimation() {
    if (this.activeAnimation) {
      this.activeAnimation.kill();
      this.activeAnimation = null;
    }
  }

  forceCardState(cardState: CardState) {
    if (!(this.cardState == CardState.FRONT_VISIBLE || this.cardState == CardState.BACK_VISIBLE)) {
      throw new Error(`Expected FRONT_VISIBLE or BACK_VISIBLE. Received: {$cardState}`);
    }
    this.cancelAnimation();
    this.cardState = cardState;
    this.animationParams.rotation = this.cardState == CardState.FRONT_VISIBLE ? 1 : 0;
  }
}
Vue.component("card-component", CardComponent);
</script>