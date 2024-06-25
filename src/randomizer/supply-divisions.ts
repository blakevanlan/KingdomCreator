import type {CardType} from "../dominion/card-type";
import {Cards} from "../utils/cards";
import type {SupplyCard} from "../dominion/supply-card";
import type { SupplyDivision } from "./supply-division";
import type { SupplyDivider } from "./supply-divider";
import type { SupplyBan } from "./supply-ban";
import type { SupplyCorrection } from "./supply-correction";
import { selectRandom } from "../utils/rand";

export class SupplyDivisions {
  static getLockedAndSelectedCards(divisions: SupplyDivision[]): SupplyCard[] {
    return SupplyDivisions.getLockedCards(divisions).concat(
        SupplyDivisions.getSelectedCards(divisions))
  }

  static getLockedCards(divisions: SupplyDivision[]): SupplyCard[] {
    let cards: SupplyCard[] = [];
    for (const division of divisions) {
      cards = cards.concat(division.lockedCards);
    }
    return cards;
  }

  static getSelectedCards(divisions: SupplyDivision[]): SupplyCard[] {
    let cards: SupplyCard[] = [];
    for (const division of divisions) {
      cards = cards.concat(division.selectedCards);
    }
    return cards;
  }

  static getAvailableCards(divisions: SupplyDivision[]): SupplyCard[] {
    let availableCards: SupplyCard[] = [];
    for (const division of divisions) {
      availableCards = availableCards.concat(division.availableCards);
    }
    return availableCards;
  }

  static getAvailableCardsOfType(divisions: SupplyDivision[], cardType: CardType): SupplyCard[] {
    const cardsPerDivision =
        SupplyDivisions.getAvailableCardsOfTypePerDivision(divisions, cardType);
    let availableCards: SupplyCard[] = [];
    for (const cards of cardsPerDivision) {
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

  static applyBans(division: SupplyDivision, bans: SupplyBan[]) {
    for (const ban of bans) {
      const bannedCards = ban.getBannedCards(division.availableCards)
      division = division.createDivisionByRemovingCards(Cards.extractIds(bannedCards));
    }
    return division;
  }

  static applyDividers(divisions: SupplyDivision[], dividers: SupplyDivider[]) {
    for (const divider of dividers) {
      divisions = divider.subdivideDivisions(divisions);
    }
    return divisions;
  }

  static applyCorrections(divisions: SupplyDivision[], corrections: SupplyCorrection[]) {
    for (const correction of corrections) {
      if (!correction.isSatisfied(divisions)) {
        divisions = correction.correctDivisions(divisions);
      }
    }
    return divisions;
  }

  static fillDivisions(divisions: SupplyDivision[]): SupplyDivision[] {
    const results: SupplyDivision[] = [];
    
    for (let division of divisions) {
      while (!division.isFilled) {
        const selectedCard = selectRandom(division.availableCards);
        division = division.createDivisionBySelectingCard(selectedCard.id, division.availableCards);
      }
      results.push(division);
    }
    return results;
  }
}
