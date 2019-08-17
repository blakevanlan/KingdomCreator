<template>
  <div class="kingdom-supply" :class=[columnClass]>
    <div class="kingdom-supply_card" v-for="supplyCard in supplyCards">
      <flipping-card-component :card="supplyCard" :is-vertical="false"
        @front-visible="handleSupplyCardFrontVisible"
        @flipping-to-back="handleSupplyCardFlippingToBack"
      >
        <div class="standard-button standard-button--is-primary standard-button--light-border"
          @click.stop="handleSpecify(supplyCard)"
        >
          Specify
        </div>
      </flipping-card-component>
    </div>
    <transition name="fade">
      <card-replacement-component v-if="replacingCard != null"
        :supplyCard="replacingCard"
        :cardPosition="replacementCardPosition"
        :topLeftCoordinate="replacementTopLeftCoordinate"
        @cancel="replacingCard = null"
        @replace="handleReplaceWithSupplyCard"
      />
    </transition>
  </div>
</template>

<script lang="ts">
import CardReplacementComponent from "./card-replacement.vue"
import FlippingCardComponent from "./flipping-card.vue";
import { Addon } from "../dominion/addon";
import { Coordinate } from "../utils/coordinate";
import { SupplyCard } from "../dominion/supply-card";
import { State, Getter } from "vuex-class";
import { Vue, Component, Watch } from "vue-property-decorator";
import { SortOption } from "../settings/settings";
import { Kingdom } from "../randomizer/kingdom";
import { SupplyCardSorter } from "../utils/supply-card-sorter";
import { TweenLite, Sine } from "gsap";
import { Selection } from "../stores/randomizer/selection";
import { REPLACE_SUPPLY_CARD, ReplaceSupplyCardParams } from "../stores/randomizer/action-types";
import { UPDATE_SPECIFYING_REPLACEMENT_SUPPLY_CARD } from "../stores/randomizer/mutation-types";
import { CardPosition } from "./card-replacement.vue";

interface MoveDescriptor {
  elementIndex: number;
  newVisualIndex: number;
}

const ANIMATION_DURATION_SEC = 0.6;
const WINDOW_RESIZE_DELAY_MSEC = 300;

@Component
export default class SortableSupplyCardsComponent extends Vue {
  constructor() {
    super({
      components: {
        "card-replacement-component": CardReplacementComponent,
        "flipping-card-component": FlippingCardComponent
      }
    });
  }
  @State(state => state.randomizer.kingdom) readonly kingdom!: Kingdom;
  @State(state => state.randomizer.settings.sortOption) readonly sortOption!: SortOption;
  @State(state => state.window.width) readonly windowWidth!: number;
  @State(state => state.randomizer.selection) readonly selection!: Selection;
  @Getter("addons") readonly addons!: Addon[];
  @Getter("hasAddons") readonly hasAddons!: boolean;
  @Getter("addonSummary") readonly addonSummary!: string;
  elementIndexMapping = new Map<number, number>();
  kingdomId: number = 0;
  supplyCards: SupplyCard[] = [];
  numberOfSupplyCardsLoading = 0;
  requiresSupplyCardSort = false;
  activeAnimations: Set<TweenLite> = new Set();
  resizeTimerId: number | null = null;
  replacingCard: SupplyCard | null = null;

  mounted() {
    this.updateActiveSupplyCards();
  }

  get numberOfColumns() {
    return this.windowWidth > 450 ? 5 : 4;
  }

  get columnClass() {
    return this.numberOfColumns == 5 ? "five-columns" : "four-columns";
  }

  get replacementCardPosition() {
    if (!this.replacingCard) {
      return CardPosition.CENTER;
    }
    const numberOfColumns = this.numberOfColumns;
    const index = this.getSupplyCardVisualIndex(this.replacingCard);
    if (index == 0 || index == numberOfColumns) {
      return CardPosition.LEFT;
    }
    if (index == numberOfColumns - 1 || index == this.supplyCards.length - 1) {
      return CardPosition.RIGHT;
    }
    return CardPosition.CENTER;
  }

  get replacementTopLeftCoordinate() {
    if (!this.replacingCard) {
      return {x: 0, y: 0};
    }
    const cardVisualIndex = this.getSupplyCardVisualIndex(this.replacingCard);
    const cardPosition = this.replacementCardPosition;
    const visualIndex = cardPosition == CardPosition.LEFT 
        ? cardVisualIndex
        : cardPosition == CardPosition.CENTER
            ? cardVisualIndex - 1
            : cardVisualIndex - 2;
    return this.getPositionForElementIndex(visualIndex);
  }

  @Watch("kingdom")
  handleKingdomChanged() {
    this.updateActiveSupplyCards();
  }

  @Watch("sortOption")
  handleSortOptionChanged() {
    this.requiresSupplyCardSort = true;
    this.attemptToAnimateSupplyCardSort();
  }

  @Watch("windowWidth")
  handleWindowWidthChanged() {
    this.cancelActiveAnimations();
    this.resetCardPositions();

    // Schedule a reset to happen again after the user finishes resizing the window to catch
    // any cases where the reset happened before the elements were fully positioned.
    if (this.resizeTimerId) {
      clearTimeout(this.resizeTimerId);
    }
    this.resizeTimerId = setTimeout(() => this.resetCardPositions(), WINDOW_RESIZE_DELAY_MSEC)
  }

  handleSpecify(supplyCard: SupplyCard) {
    this.$store.commit(UPDATE_SPECIFYING_REPLACEMENT_SUPPLY_CARD, supplyCard);
  }

  handleSupplyCardFlippingToBack(supplyCard: SupplyCard) {
    this.numberOfSupplyCardsLoading += 1;
  }

  handleSupplyCardFrontVisible(supplyCard: SupplyCard) {
    this.numberOfSupplyCardsLoading -= 1;
    this.attemptToAnimateSupplyCardSort();
  }

  handleReplace(supplyCard: SupplyCard) {
    this.replacingCard = supplyCard;
  }

  handleReplaceWithSupplyCard(supplyCard: SupplyCard) {
    this.$store.dispatch(REPLACE_SUPPLY_CARD, {
      currentSupplyCard: this.replacingCard,
      newSupplyCard: supplyCard
    } as ReplaceSupplyCardParams);
    this.replacingCard = null;
  }

  private updateActiveSupplyCards() {
    if (!this.kingdom) {
      return;
    }
    if (this.kingdomId == this.kingdom.id) {
      this.updateSupplyCards();
      return;
    }
    this.kingdomId = this.kingdom.id;
    const sortedSupplyCards =
        SupplyCardSorter.sort(this.kingdom.supply.supplyCards.concat(), this.sortOption);
    
    // Remap the sorted supply cards to where the elements currently reside.
    const mappedSupplyCards = [];
    for (let i = 0; i < sortedSupplyCards.length; i++) {
      mappedSupplyCards[this.getElementIndex(i)] = sortedSupplyCards[i];
    }
    this.supplyCards = mappedSupplyCards;
  }

  private updateSupplyCards() {
    this.requiresSupplyCardSort = true;
    this.supplyCards = SortableSupplyCardsComponent.replaceSupplyCards(
        this.supplyCards, this.kingdom.supply.supplyCards);
  }

  private attemptToAnimateSupplyCardSort() {
    if (this.numberOfSupplyCardsLoading > 0 || !this.requiresSupplyCardSort) {
      return;
    }
    this.requiresSupplyCardSort = false;
    this.cancelActiveAnimations();
    this.animateSupplyCardSort();
  }

  private resetCardPositions() {
    for (let visualIndex = 0; visualIndex < this.supplyCards.length; visualIndex++) {
      const elementIndex = this.getElementIndex(visualIndex);
      const element = this.getSupplyCardElement(elementIndex);
      const startCoord = this.getPositionForElementIndex(elementIndex);
      const endCoord = this.getPositionForElementIndex(visualIndex);
      const x = endCoord.x - startCoord.x;
      const y = endCoord.y - startCoord.y;
      element.style.transform = `translate(${x}px,${y}px)`;
    }
  }

  private cancelActiveAnimations() {
    for (let animation of this.activeAnimations) {
      animation.kill();
    }
    this.activeAnimations.clear();
  }

  private animateSupplyCardSort() {
    const sortedCards = SupplyCardSorter.sort(this.supplyCards.concat(), this.sortOption);
    const descriptors = this.createMoveDescriptors(sortedCards);
    const newMapping: Map<number, number> = new Map();

    for (let descriptor of descriptors) {
      const element = this.getSupplyCardElement(descriptor.elementIndex);
      const startCoord = this.getPositionForElementIndex(descriptor.elementIndex);
      const endCoord = this.getPositionForElementIndex(descriptor.newVisualIndex);
      const x = endCoord.x - startCoord.x;
      const y = endCoord.y - startCoord.y;
      const tweenLite =
          TweenLite.to(element, ANIMATION_DURATION_SEC, {
            transform: `translate(${x}px,${y}px)`,
            ease: Sine.easeInOut,
            onComplete: () => this.activeAnimations.delete(tweenLite),
          });
      this.activeAnimations.add(tweenLite);
      newMapping.set(descriptor.newVisualIndex, descriptor.elementIndex);
    }
    this.elementIndexMapping = newMapping;
  }

  private createMoveDescriptors(sortedSupplyCards: SupplyCard[]) {
    const cardIds = this.supplyCards.map((card) => card.id);
    const descriptors: MoveDescriptor[] = [];
    for (let newVisualIndex = 0; newVisualIndex < sortedSupplyCards.length; newVisualIndex++) {
      descriptors.push({
        newVisualIndex: newVisualIndex,
        elementIndex: cardIds.indexOf(sortedSupplyCards[newVisualIndex].id),
      });
    }
    return descriptors;
  }

  private getPositionForElementIndex(index: number): Coordinate {
    const container = this.getSupplyCardContainers()[index];
    return {x: container.offsetLeft, y: container.offsetTop};
  }

  private getSupplyCardElement(index: number) {
    return this.getSupplyCardContainers()[index].firstChild! as HTMLElement;
  }

  private getSupplyCardContainers() {
    return this.$el.querySelectorAll(".kingdom-supply_card") as NodeListOf<HTMLElement>;
  }

  private getSupplyCardVisualIndex(supplyCard: SupplyCard) {
    return this.getVisualIndex(this.supplyCards.indexOf(supplyCard));
  }

  private getElementIndex(visualIndex: number) {
    return this.elementIndexMapping.has(visualIndex) 
        ? this.elementIndexMapping.get(visualIndex)!
        : visualIndex;
  }

  private getVisualIndex(elementIndex: number) {
    const keys = this.elementIndexMapping.keys();
    for (let key of keys) {
      if (this.elementIndexMapping.get(key) == elementIndex) {
        return key;
      }
    }
    return elementIndex;
  }


  private static replaceSupplyCards(oldSupplyCards: SupplyCard[], newSupplyCards: SupplyCard[]) {
    const supplyCards: SupplyCard[] = [];
    const supplyCardsToAdd = SortableSupplyCardsComponent.getSupplyCardsToAdd(oldSupplyCards, newSupplyCards);
    const oldIds = SortableSupplyCardsComponent.getOldIds(oldSupplyCards, newSupplyCards);
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

  private static getSupplyCardsToAdd(oldSupplyCards: SupplyCard[], newSupplyCards: SupplyCard[]) {
    const existingIds = new Set(oldSupplyCards.map((card) => card.id));
    return newSupplyCards.filter((card) => !existingIds.has(card.id));
  }

  private static getOldIds(oldSupplyCards: SupplyCard[], newSupplyCards: SupplyCard[]) {
    const newIds = new Set(newSupplyCards.map((card) => card.id));
    return new Set(oldSupplyCards.filter((card) => !newIds.has(card.id)).map((card) => card.id));
  }
}
Vue.component("sortable-supply-cards-component", SortableSupplyCardsComponent);
</script>

<style scoped>
.kingdom-supply {
  position: relative
}
.kingdom-supply_card {
  pointer-events: none;
}
.supply-card {
  pointer-events: all;
}
</style>
