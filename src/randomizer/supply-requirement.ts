import type {SupplyCard} from "../dominion/supply-card";
import type {SupplyDivision} from "./supply-division";

export abstract class SupplyRequirement {

  isSatisfied(divisions: SupplyDivision[]): boolean {
    for (const division of divisions) {
      if (this.getSatisfyingCards(division.lockedAndSelectedCards).length) {
        return true;
      }
    }
    return false;
  }

  getSatisfyingCardsFromDivisions(divisions: SupplyDivision[]): SupplyCard[] {
    let satisfyingCards: SupplyCard[] = [];
    for (const division of divisions) {
      satisfyingCards =
          satisfyingCards.concat(this.getSatisfyingCards(division.availableCards));
    }
    return satisfyingCards;
  }

  protected abstract getSatisfyingCards(cards: SupplyCard[]): SupplyCard[];
}
