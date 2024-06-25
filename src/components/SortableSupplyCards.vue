<template>
  <div>
    <GridLayout :items="supplyCardsWithBaneFerrymanMouseWay" :number-of-columns="numberOfColumns" :is-vertical="true"
      class="sortable-supply-cards" :class="{ 'kingdom-supply--is-enlarged': isEnlarged }">
      <template v-slot:default="slotProps">
        <FlippingCard :card="slotProps.item" :is-vertical="true" @front-visible="handleSupplyCardFrontVisible"
          @flipping-to-back="handleSupplyCardFlippingToBack">
          <template v-slot:highlight-content>
            <div v-if="!isBaneCard(slotProps.item)"
              class="standard-button standard-button--is-primary standard-button--light-border"
              @click.stop="handleSpecify(slotProps.item)">
              Specify
            </div>
          </template>
          <!--<BaneCardCover v-if="isBane(slotProps.item)" />-->
          <BaneCardCover isType="Bane" v-if="isBaneCard(slotProps.item)" />
          <BaneCardCover isType="Ferryman" v-if="isFerrymanCard(slotProps.item)" />
          <BaneCardCover isType="Obelisk" v-if="isObeliskCard(slotProps.item)" />
          <BaneCardCover isType="MouseWay" v-if="isMouseWayCard(slotProps.item)" />
          <BaneCardCover :is-type="traitsTitle(0)" v-if="isTraitsCard(slotProps.item, 0)" />
          <BaneCardCover :is-type="traitsTitle(1)" v-if="isTraitsCard(slotProps.item, 1)" />
        </FlippingCard>
      </template>
    </GridLayout>
  </div>
</template>

<script lang="ts">
/* import Vue, typescript */
import { defineComponent, ref, computed, onMounted, watch, nextTick } from 'vue';
import { useI18n } from "vue-i18n";
import gsap, { Sine } from "gsap";

/* import Dominion Objects and type*/
import type { SupplyCard } from "../dominion/supply-card";

import type { Coordinate } from "../utils/coordinate";
import { SupplyCardSorter } from "../utils/supply-card-sorter";

/* imoprt store  */
import { usei18nStore } from "../pinia/i18n-store";
import { useRandomizerStore } from "../pinia/randomizer-store";
import { useWindowStore } from "../pinia/window-store";

/* import Components */
import BaneCardCover from "./BaneCardCover.vue";
import FlippingCard from "./FlippingCard.vue";
import GridLayout from "./GridLayout.vue";

interface MoveDescriptor {
  elementIndex: number;
  newVisualIndex: number;
}

const ANIMATION_DURATION_SEC = 0.6;
const WINDOW_RESIZE_DELAY_MSEC = 300;


export default defineComponent({
  name: 'SortableSupplyCards',
  components: {
    GridLayout,
    FlippingCard,
    BaneCardCover,
  },
  setup() {
    const { t } = useI18n()
    const windowStore = useWindowStore();
    const randomizerStore = useRandomizerStore();
    const i18nStore = usei18nStore();

    const kingdom = computed(() => randomizerStore.kingdom);
    const sortOption = computed(() => randomizerStore.settings.sortOption);
    const selection = computed(() => randomizerStore.selection);
    const HasFullScreenRequested = computed(() => randomizerStore.isFullScreen);
    const language = computed(() => i18nStore.language);
    const windowWidth = computed(() => windowStore.width);
    const isEnlarged = computed(() => windowStore.isEnlarged);


    let elementIndexMapping = new Map<number, number>();
    let kingdomId: number = -1;
    const supplyCards = ref<SupplyCard[]>([])

    let numberOfSupplyCardsLoading = 0;
    let requiresSupplyCardSort = false;
    let activeAnimations: Set<any> = new Set();
    let resizeTimerId: ReturnType<typeof setTimeout> | null = null;
    let replacingCard: SupplyCard | null = null;

    onMounted(() => {
      supplyCards.value = kingdom.value.supply.supplyCards;
      updateActiveSupplyCards();
    });

    const numberOfColumns = computed(() => {
      return isEnlarged.value ? 2 : windowWidth.value > 450 ? 5 : 4;
    });

    const supplyCardsWithBaneFerrymanMouseWay = computed(() => {
      //const cards =  SupplyCardSorter.sort(this.supplyCards.concat() as SupplyCard[], this.sortOption, this.$t.bind(this));
      const cards = supplyCards.value.concat();
      if (kingdom.value.supply.baneCard) {
        cards.push(kingdom.value.supply.baneCard);
      }
      if (kingdom.value.supply.ferrymanCard) {
        cards.push(kingdom.value.supply.ferrymanCard);
      }
      if (kingdom.value.supply.mouseWay) {
        cards.push(kingdom.value.supply.mouseWay);
      }
      return cards;
    });

    const handleKingdomChanged = () => {
      updateActiveSupplyCards();
    }
    watch(kingdom, handleKingdomChanged)

    const handleSortOptionChanged = () => {
      requiresSupplyCardSort = true;
      attemptToAnimateSupplyCardSort();
    }
    watch(sortOption, handleSortOptionChanged)

    const handlelanguagenChanged = () => {
      requiresSupplyCardSort = true;
      attemptToAnimateSupplyCardSort();
    }
    watch(language, handlelanguagenChanged)

    const handleHasFullScreenRequested = () => {
      cancelActiveAnimations();
      resetCardPositions();
    }
    watch(HasFullScreenRequested, handleHasFullScreenRequested)

    const handleWindowWidthChanged = () => {
      cancelActiveAnimations();
      resetCardPositions();
      // Schedule a reset to happen again after the user finishes resizing the window to catch
      // any cases where the reset happened before the elements were fully positioned.
      if (resizeTimerId) {
        clearTimeout(resizeTimerId);
      }
      resizeTimerId = setTimeout(() => resetCardPositions(), WINDOW_RESIZE_DELAY_MSEC)
    }
    watch(windowWidth, handleWindowWidthChanged)

    const handleNumberOfColumnsChanged = () => {
      nextTick(() => resetCardPositions());
    }
    watch(numberOfColumns, handleNumberOfColumnsChanged)

    const isBaneCard = (supplyCard: SupplyCard) => {
      return kingdom.value.supply.baneCard &&
        kingdom.value.supply.baneCard.id == supplyCard.id;
    }
    const isFerrymanCard = (supplyCard: SupplyCard) => {
      return kingdom.value.supply.ferrymanCard &&
        kingdom.value.supply.ferrymanCard.id == supplyCard.id;
    };
    const isObeliskCard = (supplyCard: SupplyCard) => {
      return kingdom.value.supply.obeliskCard &&
        kingdom.value.supply.obeliskCard.id == supplyCard.id;
    }
    const isMouseWayCard = (supplyCard: SupplyCard) => {
      return kingdom.value.supply.mouseWay &&
        kingdom.value.supply.mouseWay.id == supplyCard.id;
    }

    const isTraitsCard = (supplyCard: SupplyCard, index: number) => {
      return kingdom.value.supply.traitsSupply[index]  &&
      kingdom.value.supply.traitsSupply[index].id == supplyCard.id;
    }

    const traitsTitle = (index: number) => {
      return "trait#"+ kingdom.value.traits[index].id;
    }

    const handleSpecify = (supplyCard: SupplyCard) => {
      randomizerStore.UPDATE_SPECIFYING_REPLACEMENT_SUPPLY_CARD(supplyCard);
    }
    const handleSupplyCardFlippingToBack = (supplyCard: SupplyCard) => {
      numberOfSupplyCardsLoading += 1;
    }

    const handleSupplyCardFrontVisible = (supplyCard: SupplyCard) => {
      numberOfSupplyCardsLoading -= 1;
      attemptToAnimateSupplyCardSort();
    }

    const handleReplace = (supplyCard: SupplyCard) => {
      replacingCard = supplyCard;
    }

    const updateActiveSupplyCards = () => {
      if (!kingdom.value) {
        return;
      }
      if (kingdomId == kingdom.value.id && kingdomId != 0) {
        updateSupplyCards();
        return;
      }
      kingdomId = kingdom.value.id;
      const sortedSupplyCards =
        SupplyCardSorter.sort(kingdom.value.supply.supplyCards.concat(), sortOption.value, t);

      // Remap the sorted supply cards to where the elements currently reside.
      const mappedSupplyCards = [];
      for (let i = 0; i < sortedSupplyCards.length; i++) {
        mappedSupplyCards[getElementIndex(i)] = sortedSupplyCards[i];
      }
      supplyCards.value = mappedSupplyCards;
    }

    const updateSupplyCards = () => {
      requiresSupplyCardSort = true;
      supplyCards.value = replaceSupplyCards(
        supplyCards.value, kingdom.value.supply.supplyCards);
    }

    const attemptToAnimateSupplyCardSort = () => {
      if (numberOfSupplyCardsLoading > 0 || !requiresSupplyCardSort) {
        return;
      }
      requiresSupplyCardSort = false;
      cancelActiveAnimations();
      animateSupplyCardSort();
    }

    const resetCardPositions = () => {
      for (let visualIndex = 0; visualIndex < supplyCards.value.length; visualIndex++) {
        const elementIndex = getElementIndex(visualIndex);
        const element = getSupplyCardElement(elementIndex);
        const startCoord = getPositionForElementIndex(elementIndex);
        const endCoord = getPositionForElementIndex(visualIndex);
        const x = endCoord.x - startCoord.x;
        const y = endCoord.y - startCoord.y;
        // element.style.transform = `translate(${x}px,${y}px)`;
        const activeAnimation =
          gsap.to(element, {
            duration: ANIMATION_DURATION_SEC,
            // transform: `translate(${x}px,${y}px)`,
            x: x, // just use x/y instead of transform because they're faster and more clear
            y: y, // transform because they're faster and more clear
            ease: Sine.easeInOut,
            onComplete: function () {
              activeAnimation.kill
              return;
            }
          });
      }
    }

    const cancelActiveAnimations = () => {
      for (const animation of activeAnimations) {
        animation.kill();
      }
      activeAnimations.clear();
    }


    const animateSupplyCardSort = () => {
      const sortedCards = SupplyCardSorter.sort(supplyCards.value.concat(), sortOption.value, t);
      const descriptors = createMoveDescriptors(sortedCards);
      const newMapping: Map<number, number> = new Map();

      for (let descriptor of descriptors) {
        const element = getSupplyCardElement(descriptor.elementIndex);
        const startCoord = getPositionForElementIndex(descriptor.elementIndex);
        const endCoord = getPositionForElementIndex(descriptor.newVisualIndex);
        const x = endCoord.x - startCoord.x;
        const y = endCoord.y - startCoord.y;
        let activeAnimation =
          gsap.to(element, {
            duration: ANIMATION_DURATION_SEC,
            // transform: `translate(${x}px,${y}px)`,
            x: x, // just use x/y instead of transform because they're faster and more clear
            y: y, // transform because they're faster and more clear
            ease: Sine.easeInOut,
            onComplete: function () {
              activeAnimation.kill
              return;
            }
          });

        activeAnimations.add(activeAnimation);
        newMapping.set(descriptor.newVisualIndex, descriptor.elementIndex);
        
      }
      elementIndexMapping = newMapping;
    }

    const createMoveDescriptors = (sortedSupplyCards: SupplyCard[]) => {
      const cardIds = supplyCards.value.map((card) => card.id);
      const descriptors: MoveDescriptor[] = [];
      for (let newVisualIndex = 0; newVisualIndex < sortedSupplyCards.length; newVisualIndex++) {
        descriptors.push({
          newVisualIndex: newVisualIndex,
          elementIndex: cardIds.indexOf(sortedSupplyCards[newVisualIndex].id),
        });
      }
      return descriptors;
    }

    const getPositionForElementIndex = (index: number): Coordinate => {
      const container = getSupplyCardContainers()[index];
      return { x: container.offsetLeft, y: container.offsetTop };
    }

    const getSupplyCardElement = (index: number) => {
      return getSupplyCardContainers()[index].firstElementChild! as HTMLElement;
    }

    const getSupplyCardContainers = () => {
      return document.querySelectorAll(".grid-layout_item") as NodeListOf<HTMLElement>;
    }

    const getElementIndex = (visualIndex: number) => {
      return elementIndexMapping.has(visualIndex)
        ? elementIndexMapping.get(visualIndex)!
        : visualIndex;
    }

    const replaceSupplyCards = (oldSupplyCards: SupplyCard[], newSupplyCards: SupplyCard[]) => {
      const supplyCards: SupplyCard[] = [];
      const supplyCardsToAdd = getSupplyCardsToAdd(oldSupplyCards, newSupplyCards);
      const oldIds = getOldIds(oldSupplyCards, newSupplyCards);
      let supplyCardsToAddIndex = 0;
      for (let i = 0; i < oldSupplyCards.length; i++) {
        const supplyCard = oldSupplyCards[i];
        if (oldIds.has(supplyCard.id)) {
          supplyCards.push(supplyCardsToAdd[supplyCardsToAddIndex]);
          supplyCardsToAddIndex += 1;
        } else {
          supplyCards.push(supplyCard);
        }
      }
      return supplyCards;
    }

    const getSupplyCardsToAdd = (oldSupplyCards: SupplyCard[], newSupplyCards: SupplyCard[]) => {
      const existingIds = new Set(oldSupplyCards.map((card) => card.id));
      return newSupplyCards.filter((card) => !existingIds.has(card.id));
    }

    const getOldIds = (oldSupplyCards: SupplyCard[], newSupplyCards: SupplyCard[]) => {
      const newIds = new Set(newSupplyCards.map((card) => card.id));
      return new Set(oldSupplyCards.filter((card) => !newIds.has(card.id)).map((card) => card.id));
    }
    return {
      supplyCardsWithBaneFerrymanMouseWay,
      numberOfColumns,
      isEnlarged,
      handleSupplyCardFrontVisible,
      handleSupplyCardFlippingToBack,
      isBaneCard,
      isFerrymanCard,
      isObeliskCard,
      isMouseWayCard,
      isTraitsCard,
      traitsTitle,
      handleSpecify
    }
  }
})
</script>

<style scoped>
.kingdom-supply--is-enlarged .card-set-description .card-description {
  font-size: 16px !important;
}

.sortable-supply-card-copy-button {
  margin-top: 0px;
}
</style>
