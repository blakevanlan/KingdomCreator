import type {SupplyCard} from "../dominion/supply-card";
import { Cards } from "../utils/cards";

export class Supply {
  constructor(
      readonly supplyCards: SupplyCard[],
      readonly baneCard: SupplyCard | null,
      readonly ferrymanCard: SupplyCard | null,
      readonly obeliskCard: SupplyCard | null,
      readonly mouseWay: SupplyCard | null,
      readonly traitsSupply: SupplyCard[],
      readonly replacements: Replacements) {
    if (supplyCards.length > 10) {
      throw new Error("Unable to create supply with more than 10 cards.");
    }
  }

  getSupplyCardsWithBaneandOthers() {
    const cards = this.supplyCards.concat();
    if (this.baneCard) {
      cards.push(this.baneCard);
    }
    if (this.ferrymanCard) {
      cards.push(this.ferrymanCard);
    }
    if (this.mouseWay) {
      cards.push(this.mouseWay);
    }
    return cards;
  }

  static empty() {
    return new Supply([], null, null, null, null, [], Replacements.empty());
  }
}

export class Replacements {
  constructor(readonly replacements: Map<string, SupplyCard[]>) {
  }

  getReplacementsForId(supplyCardId: string) {
    return this.replacements.has(supplyCardId) ? this.replacements.get(supplyCardId)! : [];
  }

  static empty() {
    return new Replacements(new Map());
  }
  
  static createReplacementByRemoveCards(replacements: Map<string, SupplyCard[]>, cardIds: string[]) {
    const newReplacements: Map<string, SupplyCard[]> = new Map();
    for (const id of replacements.keys()) {
      newReplacements.set(id, replacements.get(id)?.filter(Cards.filterByExcludedIds(cardIds)) ?? []);
    }
    return newReplacements;
  }
}