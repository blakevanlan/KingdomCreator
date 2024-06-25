import {Cards} from "../utils/cards"
import type {SupplyCard} from "../dominion/supply-card"
import { Replacements } from "./supply";

export class SupplyDivision {
  readonly lockedAndSelectedCards: SupplyCard[];
  readonly unfilledCount: number;
  readonly isFilled: boolean;
  constructor(
      readonly availableCards: SupplyCard[],
      readonly lockedCards: SupplyCard[],
      readonly selectedCards: SupplyCard[],
      readonly totalCount: number,
      readonly replacements: Map<string, SupplyCard[]>) {
    this.lockedAndSelectedCards = lockedCards.concat(selectedCards);
    this.unfilledCount = totalCount - this.lockedAndSelectedCards.length;
    this.isFilled = this.lockedAndSelectedCards.length >= totalCount;

    if (this.lockedAndSelectedCards.length > totalCount) {
      throw new Error(
          "Cannot create a division with more locked and selected cards than the total count.")
    }
    if (availableCards.length + lockedCards.length + selectedCards.length < totalCount) {
      throw new Error(
        "Cannot create an unfilled division without enough available cards to fill it.")
    }
  }

  public getReplacements(id: string) {
    return this.replacements.has(id) ? this.replacements.get(id)! : [];
  }

  public createDivisionByRemovingCards(cardIds: string[]) {
    const availableCards = this.availableCards.filter(Cards.filterByExcludedIds(cardIds));
    const selectedCards = this.selectedCards.filter(Cards.filterByExcludedIds(cardIds));
    return new SupplyDivision(
        availableCards, this.lockedCards, selectedCards, this.totalCount,
        Replacements.createReplacementByRemoveCards(this.replacements, cardIds));
  }

  public createDivisionByLockingCard(cardId: string, replacements: SupplyCard[] = []) {
    const newReplacements = Replacements.createReplacementByRemoveCards(this.replacements, [cardId]);
    newReplacements.set(cardId, replacements.concat());
    let lockedCard = Cards.findCardById(this.availableCards, cardId);
    if (lockedCard) {
      const cards = this.availableCards.filter(Cards.filterByExcludedIds([cardId]));
      return new SupplyDivision(
          cards, this.lockedCards.concat(lockedCard), this.selectedCards, this.totalCount,
          newReplacements);
    }

    lockedCard = Cards.findCardById(this.selectedCards, cardId);
    if (lockedCard) {
      const cards = this.selectedCards.filter(Cards.filterByExcludedIds([cardId]));
      return new SupplyDivision(
          this.availableCards, this.lockedCards.concat(lockedCard), cards, this.totalCount,
          newReplacements);
    }

    throw new Error(`Can't lock card: ${cardId}. Not found in available or selected cards.`)
  }

  public createDivisionBySelectingCard(cardId: string, replacements: SupplyCard[] = []) {
    const newReplacements = Replacements.createReplacementByRemoveCards(this.replacements, [cardId]);
    newReplacements.set(cardId, replacements.concat());
    const selectedCard = Cards.findCardById(this.availableCards, cardId);
    if (!selectedCard) {
      throw Error(`Can't select card: ${cardId}. Not found in available cards.`);
    }
    const cards = this.availableCards.filter(Cards.filterByExcludedIds([cardId]));
    return new SupplyDivision(
        cards, this.lockedCards, this.selectedCards.concat(selectedCard), this.totalCount,
        newReplacements);
  }

  public createDivisionWithTotalCount(totalCount: number) {
    return new SupplyDivision(
      this.availableCards, this.lockedCards, this.selectedCards, totalCount, this.replacements);
  }
}