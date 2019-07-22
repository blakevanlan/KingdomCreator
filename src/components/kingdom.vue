<template>
  <div class="main">
    <div class="kingdom-supply" :class=[columnClass]>
      <div class="kingdom-supply_card" v-for="(supplyCard, index) in supplyCards"
          @click.stop="handleClick(index)">
        <card-component :card="supplyCard" :is-vertical="false"
            @front-visible="handleSupplyCardFrontVisible"
            @flipping-to-back="handleSupplyCardFlippingToBack" />
      </div>
      <div class="clear"></div>
    </div>
    <div class="addons-header" v-if="hasAddons">
      {{ addonSummary }}  
    </div>
    <div class="addons">
      <div class="kingdom-addon_card" v-for="addon in addons">
        <card-component :card="addon" :is-vertical="false" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import CardComponent from "./card.vue";
import { Addon } from "../dominion/addon";
import { SupplyCard } from "../dominion/supply-card";
import { State, Getter } from "vuex-class";
import { Vue, Component, Watch } from "vue-property-decorator";
import { SortOption } from "../settings/settings";
import { Kingdom } from "../models/kingdom";
import { SupplyCardSorter } from "../utils/supply-card-sorter";
import { TweenLite, Sine } from "gsap";
import { Selection } from "../stores/randomizer/selection";
import { TOGGLE_CARD_SELECTION } from "../stores/randomizer/action-types";

interface Coordinate {
  x: number;
  y: number;
}

interface MoveDescriptor {
  elementIndex: number;
  newVisualIndex: number;
}


const ANIMATION_DURATION_SEC = 0.6;

@Component
export default class KingdomComponent extends Vue {
  constructor() {
    super({components: {"card-component": CardComponent}});
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
  activeAnimations: (TweenLite | null)[] = [];

  mounted() {
    this.updateActiveKingdom();
  }

  get columnClass() {
    return this.windowWidth > 450 ? "five-columns" : "four-columns";
  }

  @Watch("kingdom")
  handleKingdomChanged() {
    this.updateActiveKingdom();
  }

  @Watch("sortOption")
  handleSortOptionChanged() {
    this.requiresSupplyCardSort = true;
    this.attemptToAnimateSupplyCardSort();
  }

  handleSupplyCardFlippingToBack(supplyCard: SupplyCard) {
    this.numberOfSupplyCardsLoading += 1;
  }

  handleSupplyCardFrontVisible(supplyCard: SupplyCard) {
    this.numberOfSupplyCardsLoading -= 1;
    this.attemptToAnimateSupplyCardSort();
  }

  // Handle clicks on the card container element that might actually be mapped
  // to a different card due to sorting. This is necessary because the container
  // will actually be above the card elements in some cases.
  handleClick(index: number) {
    const supplyCard = this.supplyCards[this.getElementIndex(index)];
    this.$store.dispatch(TOGGLE_CARD_SELECTION, supplyCard.id);
  }

  private updateActiveKingdom() {
    if (!this.kingdom) {
      return;
    }
    if (this.kingdomId == this.kingdom.id) {
      this.updateExistingKingdom();
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

  private updateExistingKingdom() {
    this.requiresSupplyCardSort = true;
    this.supplyCards = KingdomComponent.replaceSupplyCards(
        this.supplyCards, this.kingdom.supply.supplyCards);
  }

  private attemptToAnimateSupplyCardSort() {
    if (this.numberOfSupplyCardsLoading > 0 || !this.requiresSupplyCardSort) {
      return;
    }
    this.requiresSupplyCardSort = false;
    this.animateSupplyCardSort();
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
      this.activeAnimations[descriptor.elementIndex] =
          TweenLite.to(element, ANIMATION_DURATION_SEC, {
            transform: `translate(${x}px,${y}px)`,
            ease: Sine.easeInOut,
            onComplete: () => this.handleSortAnimationEnd(descriptor),
          });
      newMapping.set(descriptor.newVisualIndex, descriptor.elementIndex);
    }
    this.elementIndexMapping = newMapping;
  }

  private handleSortAnimationEnd(descriptor: MoveDescriptor) {
    this.activeAnimations[descriptor.elementIndex] = null;
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
    return this.getSupplyCardContainers()[index].firstChild;
  }

  private getSupplyCardContainers() {
    return this.$el.querySelectorAll(".kingdom-supply_card") as NodeListOf<HTMLElement>;
  }

  private getElementIndex(visualIndex: number) {
    return this.elementIndexMapping.has(visualIndex) 
        ? this.elementIndexMapping.get(visualIndex)!
        : visualIndex;
  }

  private static replaceSupplyCards(oldSupplyCards: SupplyCard[], newSupplyCards: SupplyCard[]) {
    const supplyCards: SupplyCard[] = [];
    const supplyCardsToAdd = KingdomComponent.getSupplyCardsToAdd(oldSupplyCards, newSupplyCards);
    const oldIds = KingdomComponent.getOldIds(oldSupplyCards, newSupplyCards);
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
Vue.component("kingdom-component", KingdomComponent);
</script>