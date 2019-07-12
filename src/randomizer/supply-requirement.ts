import {SupplyCard} from "../dominion/supply-card";
import {SupplyDivision} from "./supply-division";

export abstract class SupplyRequirement {

  isSatisfied(divisions: SupplyDivision[]): boolean {
    for (let division of divisions) {
      if (this.getSatisfyingCards(division.lockedAndSelectedCards).length) {
        return true;
      }
    }
    return false;
  }

  getSatisfyingCardsFromDivisions(divisions: SupplyDivision[]): SupplyCard[] {
    let satisfyingCards: SupplyCard[] = [];
    for (let division of divisions) {
      satisfyingCards =
          satisfyingCards.concat(this.getSatisfyingCards(division.availableCards));
    }
    return satisfyingCards;
  }

  protected abstract getSatisfyingCards(cards: SupplyCard[]): SupplyCard[];
}
