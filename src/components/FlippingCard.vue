<template>
  <div class="flip-card" :class="{ isVertical: isVertical }">
    <div class="flip-card__content" :style="{ transform: `rotateY(${rotationDegrees}deg)` }">
      <div class="flip-card__content__front" @click.stop="handleClick">
        <img class="flip-card__img" v-if="activeCard" :src="frontCardImageUrl" :key="activeCard ? activeCard.id : ''"
          @load="handleFrontImageLoaded" @error="incaseoferror" />
        <div class="flip-card__front-details">
          <slot></slot>
          <CardOverlay v-if="activeCard" :card="activeCard" />
        </div>
        <transition name="fade">
          <div class="flip-card__front-highlight" v-if="showHighlight">
            <slot name="highlight-content"></slot>
          </div>
        </transition>
      </div>
      <div class="flip-card__content__back" @click.stop="handleCardBackClick">
        <img class="flip-card__img" :src="backCardImageUrl" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/* import Vue, typescript */
import { defineComponent, watch, computed, ref, onMounted } from "vue";
import type { PropType } from "vue";
import gsap, { Sine } from "gsap";

/* import Dominion Objects and type*/
import { DominionSets } from "../dominion/dominion-sets";
import type { Card } from "../dominion/card";

import { getCardImageUrl, incaseofImgerror } from "../utils/resources";

/* imoprt store  */
import { usei18nStore } from "../pinia/i18n-store";
import { useRandomizerStore } from "../pinia/randomizer-store";
import type { Selection } from "../pinia/selection";

/* import Components */
import CardOverlay from "./CardOverlay.vue";

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

export default defineComponent({
  name: "FlippingCard",
  components: {
    CardOverlay
  },
  props: {
    card: {
      type: Object as PropType<Card>,
      default: null,
    },
    isVertical: {
      type: Boolean,
      default: false,
    },
    onCardBackClick: {
      type: Function,
      default: null,
    },
  },
  setup(props,  { emit }) {
    const randomizerStore = useRandomizerStore();
    const i18nStore = usei18nStore();
    const selection = computed(():Selection =>{ return randomizerStore.selection});
    const language = computed(()=>{return i18nStore.language});

    const activeCard= ref<Card>(props.card);
    const cardState = ref(CardState.BACK_VISIBLE);
    const animationParams = ref<AnimationParams>({ rotation: 0});
    const isFrontLoaded = ref(false);
    let activeAnimation : any = null;

    const rotationDegrees = computed(() => 180 * (1 - animationParams.value.rotation));
    const showHighlight = computed(() => { 
      return cardState.value == CardState.FRONT_VISIBLE && activeCard.value && (selection.value.contains(activeCard.value.id))
    });
    const frontCardImageUrl = computed(() => activeCard.value ? getCardImageUrl(activeCard.value.id, language.value) : "");
    const backCardImageUrl = props.isVertical ? "./img/cards/backside_blue.jpg" : "./img/cards/backside_blue_horizontal.jpg";



    const handleCardChanged = () =>{
      updateCardState();
    }
    watch(props, handleCardChanged)
    // no watch on specific value of a props, but on all of it.

    const handleCardStateChanged = () =>{
      switch (cardState.value) {
        case CardState.FLIPPING_TO_BACK:
          emit("flipping-to-back", activeCard.value);
          break;
        case CardState.FRONT_VISIBLE:
          emit("front-visible", activeCard.value);
          break;
        default:
          break;
      }
      updateCardState();
    }
    watch(cardState, handleCardStateChanged)

    onMounted(() => {
      updateCardState();
    });


    const handleFrontImageLoaded = () => {
      isFrontLoaded.value = true;
      updateCardState();
    }

    const incaseoferror = (ev: any) => {
      incaseofImgerror(ev)
    }

    const handleClick = () => {
      if (activeCard.value) {
        randomizerStore.TOGGLE_CARD_SELECTION(activeCard.value.id);
      }
    }

    const handleCardBackClick = () => {
      if (props.onCardBackClick) {
        props.onCardBackClick();
      }
    }

    const isActiveCardOutdated = () =>{
      const LocalcardId = props.card ? props.card.id : "";
      const LocalactiveCardId = activeCard.value ? activeCard.value.id : "";
      return LocalcardId != LocalactiveCardId;
    };

    const updateCardState = () =>{
      const ValueisActiveCardOutdated = isActiveCardOutdated();
      switch (cardState.value) {
        case CardState.BACK_VISIBLE:
          if (ValueisActiveCardOutdated) {
            updateActiveCard();
          }
          if (isFrontLoaded.value) {
            flipToFront();
          }
          break;
        case CardState.FRONT_VISIBLE:
          if (ValueisActiveCardOutdated) {
            flipToBack();
          }
          break;
        default:
          break;
      }
    }

    const updateActiveCard = () => {
      isFrontLoaded.value = false;
      activeCard.value = props.card;
    };

    const flipToBack = () => {
      cardState.value = CardState.FLIPPING_TO_BACK;
      animateToRotation(0);
    }

    const flipToFront = () => {
      cardState.value = CardState.FLIPPING_TO_FRONT;
      animateToRotation(1);
    }

    const animateToRotation = (rotation: number) => {
      activeAnimation = gsap.to(animationParams.value, 
                { duration: ANIMATION_DURATION_SEC, 
                  rotation: rotation,
                  ease: Sine.easeInOut,
                  onComplete: () => handleAnimationEnd()
                });
    }

    const handleAnimationEnd = () => {
      activeAnimation = null;
      cardState.value = cardState.value == CardState.FLIPPING_TO_BACK
        ? CardState.BACK_VISIBLE
        : CardState.FRONT_VISIBLE;
    }

    return {
      activeCard,
      rotationDegrees,
      showHighlight,
      frontCardImageUrl,
      backCardImageUrl,
      handleFrontImageLoaded,
      incaseoferror,
      handleClick,
      handleCardBackClick
    }
  }
});
</script>

<style scoped>
.flip-card {
  background-color: transparent;
  cursor: pointer;
  -webkit-perspective: 1000;
  perspective: 1000;
  ;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
  pointer-events: all;
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.flip-card__content {
  position: relative;
  width: 100%;
  height: 100%;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
  z-index: 1;
}

.flip-card__content__front,
.flip-card__content__back {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.flip-card__content__front {
  cursor: pointer;
}

.flip-card__content__back {
  transform: rotateY(180deg);
}

.flip-card__img {
  position: absolute;
  height: 100%;
  width: 100%;
}

.flip-card__front-details {
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  position: absolute;
  width: 100%;
}

.flip-card__front-highlight {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  border: 2px solid highlight-blue;
  background: rgba(2, 119, 158, 0.65);
  cursor: pointer;
  z-index: 5;
}
</style>
