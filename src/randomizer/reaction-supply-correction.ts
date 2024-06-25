import {CardType} from "../dominion/card-type";
import {Cards} from "../utils/cards";
import {SegmentedRange} from "../utils/segmented-range";
import type {SupplyCard} from "../dominion/supply-card";
import type {SupplyCorrection} from "./supply-correction";
import type {SupplyDivision} from "./supply-division";
import {SupplyDivisions} from "./supply-divisions";
import {getRandomInt} from "../utils/rand";

export class ReactionSupplyCorrection implements SupplyCorrection {

  isSatisfied(divisions: SupplyDivision[]): boolean {
    const selectedCards = SupplyDivisions.getLockedAndSelectedCards(divisions);
    if (this.hasReaction(selectedCards)) {
      return true;
    }

    // Correction is not satisfied if there are locked attacks without any reactions.
    if (selectedCards.filter(Cards.filterByRequiredType(CardType.ATTACK)).length) {
      return false;
    }

    // Correction is unsatisfied if there are available attacks and satisfied otherwise.
    const attacks = SupplyDivisions.getAvailableCardsOfType(divisions, CardType.ATTACK);
    return attacks.length == 0;
  }

  allowLockedCard(divisions: SupplyDivision[], card: SupplyCard): boolean {
    if (!card.isAttack) {
      return true;
    }
    if (this.hasReaction(SupplyDivisions.getLockedAndSelectedCards(divisions))) {
      return true;
    }

    const availableReactionsPerDivision =
        SupplyDivisions.getAvailableCardsOfTypePerDivision(divisions, CardType.REACTION);
    let totalReactions = 0;
    for (const reactions of availableReactionsPerDivision) {
      totalReactions += reactions.length;
    }

    if (totalReactions < 1) {
      return false;
    }

    const divisionContainingCard = this.getDivisionContainingCard(divisions, card);

    for (let i = 0; i < divisions.length; i++) {
      const division = divisions[i];
      if (division == divisionContainingCard) {
        if (division.unfilledCount >= 2 && availableReactionsPerDivision[i].length > 0) {
          // Allow the attack because the division with the attack also has available
          // reactions and enough spots for one.
          return true;
        }
      } else {
        if (!division.isFilled && availableReactionsPerDivision[i].length > 0) {
          // Another division is unfilled with available reactions.
          return true;
        }
      }
    }

    // There are no unfilled spots for the reaction.
    return false;
  }

  correctDivisions(divisions: SupplyDivision[]): SupplyDivision[] {
    const lockedCards = SupplyDivisions.getLockedCards(divisions);
    const lockedCardsHasAttack = 
        lockedCards.filter(Cards.filterByRequiredType(CardType.ATTACK)).length > 0;
    const hasAvailableReactions = this.hasAvailableReactions(divisions);

    if (lockedCardsHasAttack && hasAvailableReactions) {
      return this.lockRandomCardOfType(divisions, CardType.REACTION);
    }

    if (lockedCardsHasAttack && !hasAvailableReactions) {
      throw new Error("Attack is locked but no reactions available.");
    }

    if (!hasAvailableReactions || !this.checkIfAttacksShouldBeIncluded(divisions)) {
      return this.removeAttacksFromAvailableCards(divisions);
    }

    const newDivisions = this.lockRandomCardOfType(divisions, CardType.REACTION);
    return this.lockRandomCardOfType(newDivisions, CardType.ATTACK);
  }

  private removeAttacksFromAvailableCards(divisions: SupplyDivision[]) {
    const newDivisions: SupplyDivision[] = [];
    for (const division of divisions) {
      const attackCards =
          division.availableCards.filter(Cards.filterByRequiredType(CardType.ATTACK));
      newDivisions.push(
          division.createDivisionByRemovingCards(Cards.extractIds(attackCards)));
    }
    return newDivisions;
  }

  private checkIfAttacksShouldBeIncluded(divisions: SupplyDivision[]): boolean {
    const divisionsWithReaction = this.lockRandomCardOfType(divisions, CardType.REACTION);
    const filledDivisions = this.fillDivisions(divisionsWithReaction);
    const cards = SupplyDivisions.getLockedAndSelectedCards(filledDivisions);
    return cards.filter(Cards.filterByRequiredType(CardType.ATTACK)).length > 0;
  }

  private fillDivisions(divisions: SupplyDivision[]) {
    const results: SupplyDivision[] = []
    for (let division of divisions) {
      while (!division.isFilled) {
        const selectedCard = this.getRandomCard(division.availableCards);
        division = division.createDivisionBySelectingCard(selectedCard.id);
      }
      results.push(division);
    }
    return results;
  }

  private lockRandomCardOfType(divisions: SupplyDivision[], cardType: CardType) {
    const newDivisions = divisions.concat();
    const availableCardsPerDivision =
        SupplyDivisions.getAvailableCardsOfTypePerDivision(newDivisions, cardType);
    const counts: number[] = [];
    for (const cards of availableCardsPerDivision) {
      counts.push(cards.length);
    }
    const segmentedRange = new SegmentedRange(0, counts);
    const divisionIndex = segmentedRange.getRandomSegmentIndex();
    const cardToLock = this.getRandomCard(availableCardsPerDivision[divisionIndex]);
    newDivisions[divisionIndex] =
        newDivisions[divisionIndex].createDivisionByLockingCard(cardToLock.id);
    return newDivisions;
  }

  private hasAvailableReactions(divisions: SupplyDivision[]) {
    const availableReactions =
        SupplyDivisions.getAvailableCardsOfType(divisions, CardType.REACTION);
    return availableReactions.length > 0;
  }

  private getDivisionContainingCard(divisions: SupplyDivision[], card: SupplyCard) {
    for (const division of divisions) {
      const allCards = division.lockedAndSelectedCards.concat(division.availableCards);
      if (allCards.filter(Cards.filterByIncludedIds([card.id])).length) {
        return division;
      }
    }
    throw new Error(`Card not found in any of the divisions: ${card.id}`);
  }

  private getRandomCard(cards: SupplyCard[]) {
    return cards[getRandomInt(0, cards.length)];
  }

  private hasReaction(cards: SupplyCard[]): boolean {
    return cards.filter(Cards.filterByRequiredType(CardType.REACTION)).length > 0;
  }
}