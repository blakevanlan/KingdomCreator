import {Cards} from "../utils/cards"
import {SupplyCard} from "../dominion/supply-card"

export class SupplyDivision {
  readonly lockedAndSelectedCards: SupplyCard[];
  readonly unfilledCount: number;
  readonly isFilled: boolean;
  constructor(
      readonly availableCards: SupplyCard[],
      readonly lockedCards: SupplyCard[],
      readonly selectedCards: SupplyCard[],
      readonly totalCount: number) {
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

  public createDivisionByRemovingCards(cardIds: string[]) {
    const availableCards = this.availableCards.filter(Cards.filterByExcludedIds(cardIds));
    const selectedCards = this.selectedCards.filter(Cards.filterByExcludedIds(cardIds));
    return new SupplyDivision(availableCards, this.lockedCards, selectedCards, this.totalCount);
  }

  public createDivisionByLockingCard(cardId: string) {
    let lockedCard = Cards.findCardById(this.availableCards, cardId);
    if (lockedCard) {
      const cards = this.availableCards.filter(Cards.filterByExcludedIds([cardId]));
      return new SupplyDivision(
          cards, this.lockedCards.concat(lockedCard), this.selectedCards, this.totalCount);
    }

    lockedCard = Cards.findCardById(this.selectedCards, cardId);
    if (lockedCard) {
      const cards = this.selectedCards.filter(Cards.filterByExcludedIds([cardId]));
      return new SupplyDivision(
          this.availableCards, this.lockedCards.concat(lockedCard), cards, this.totalCount);
    }

    throw new Error(`Can't lock card: ${cardId}. Not found in available or selected cards.`)
  }

  public createDivisionBySelectingCard(cardId: string) {
    const selectedCard = Cards.findCardById(this.availableCards, cardId);
    if (!selectedCard) {
      throw Error(`Can't select card: ${cardId}. Not found in available cards.`);
    }
    const cards = this.availableCards.filter(Cards.filterByExcludedIds([cardId]));
    return new SupplyDivision(
        cards, this.lockedCards, this.selectedCards.concat(selectedCard), this.totalCount);
  }

  public createDivisionWithTotalCount(totalCount: number) {
    return new SupplyDivision(
      this.availableCards, this.lockedCards, this.selectedCards, totalCount);
  }
}