import {CardType} from "../dominion/card-type";
import {Cards} from "../utils/cards";
import {SupplyCard} from "../dominion/supply-card";
import {SupplyDivision} from "./supply-division";

export class SupplyDivisions {
  static getLockedAndSelectedCards(divisions: SupplyDivision[]): SupplyCard[] {
    return SupplyDivisions.getLockedCards(divisions).concat(
        SupplyDivisions.getSelectedCards(divisions))
  }

  static getLockedCards(divisions: SupplyDivision[]): SupplyCard[] {
    let cards: SupplyCard[] = [];
    for (let division of divisions) {
      cards = cards.concat(division.lockedCards);
    }
    return cards;
  }

  static getSelectedCards(divisions: SupplyDivision[]): SupplyCard[] {
    let cards: SupplyCard[] = [];
    for (let division of divisions) {
      cards = cards.concat(division.selectedCards);
    }
    return cards;
  }

  static getAvailableCardsOfType(divisions: SupplyDivision[], cardType: CardType): SupplyCard[] {
    const cardsPerDivision =
        SupplyDivisions.getAvailableCardsOfTypePerDivision(divisions, cardType);
    let availableCards: SupplyCard[] = [];
    for (let cards of cardsPerDivision) {
      availableCards = availableCards.concat(cards);
    }
    return availableCards;
  }

  static getAvailableCardsOfTypePerDivision(
      divisions: SupplyDivision[], cardType: CardType): SupplyCard[][] {
    const cards: SupplyCard[][] = [];
    for (let i = 0; i < divisions.length; i++) {
      const division = divisions[i];
      if (division.selectedCards.length || !division.isFilled) {
        cards.push(division.availableCards.filter(Cards.filterByRequiredType(cardType)))
      } else {
        cards.push([]);
      }
    }
    return cards;
  }
}
