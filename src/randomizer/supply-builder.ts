import {Cards} from "../utils/cards";
import {SegmentedRange} from "../utils/segmented-range";
import {SupplyCard} from "../dominion/supply-card";
import {SupplyBan} from "./supply-ban";
import {SupplyCorrection} from "./supply-correction";
import {SupplyDivider} from "./supply-divider";
import {SupplyDivision} from "./supply-division";
import {SupplyRequirement} from "./supply-requirement";
import {Supply, Replacements} from "./supply";
import {getRandomInt} from "../utils/rand";
import { SupplyDivisions } from "./supply-divisions";

export class SupplyBuilder {
  private dividers: SupplyDivider[] = [];
  private requirements: SupplyRequirement[] = [];
  private bans: SupplyBan[] = [];
  private corrections: SupplyCorrection[] = [];
  constructor(private readonly cards: SupplyCard[]) {
  }

  addDivider(divider: SupplyDivider) {
    this.dividers.push(divider);
  }

  addRequirement(requirement: SupplyRequirement) {
    this.requirements.push(requirement);
  }

  addBan(ban: SupplyBan) {
    this.bans.push(ban);
  }

  addCorrection(correction: SupplyCorrection) {
    this.corrections.push(correction);
  }

  createUnfilledDivisions(existingCards: SupplyCard[]): SupplyDivision[] {
    let division = new SupplyDivision(this.cards, [], [], 10, new Map());
    division = this.prepareDivisionForBanning(division, existingCards);
    division = SupplyDivisions.applyBans(division, this.bans);
    division = this.addExistingCardsAsAvailable(division, existingCards);
    let divisions = SupplyDivisions.applyDividers([division], this.dividers);
    divisions = this.applyExistingCards(divisions, existingCards);
    return divisions;
  }

  createSupply(existingCards: SupplyCard[]) {
    let divisions = this.createUnfilledDivisions(existingCards);
    divisions = this.applyRequirements(divisions);
    divisions = SupplyDivisions.applyCorrections(divisions, this.corrections);
    divisions = SupplyDivisions.fillDivisions(divisions);
    return this.gatherCardsIntoSupply(divisions);
  }

  clone() {
    const clone = new SupplyBuilder(this.cards);
    clone.dividers = this.dividers;
    clone.requirements = this.requirements;
    clone.bans = this.bans;
    clone.corrections = this.corrections;
    return clone;
  }

  private prepareDivisionForBanning(division: SupplyDivision, existingCards: SupplyCard[]) {
    // Prepare the division for banning by reducing the number of cards needed in the division
    // to account for the existing cards that will be added after banning.
    return division.createDivisionWithTotalCount(division.totalCount - existingCards.length);
  }

  private applyRequirements(divisions: SupplyDivision[]): SupplyDivision[] {
    divisions = divisions.concat();
    const orderedRequirements = this.orderRequirementsForDivisions(divisions);
    for (let requirement of orderedRequirements) {
      if (requirement.isSatisfied(divisions)) {
        continue;
      }

      const segmentedRange = this.getSegmentedRangeForRequirement(requirement, divisions);
      if (!segmentedRange.length) {
        throw new Error(`Unable to satisfy requirement: ${requirement}.`);
      }

      // Select a random division to lock in a required card.
      const divisionIndex = segmentedRange.getRandomSegmentIndex();
      const cards = requirement.getSatisfyingCardsFromDivisions([divisions[divisionIndex]]);
      while (true) {
        const randomIndex = getRandomInt(0, cards.length);
        const selectedCard = cards[randomIndex];
        cards.splice(randomIndex, 1);

        // Check if the selected card is allowed by the corrections.
        if (this.allowLockedCard(divisions, selectedCard)) {
          divisions[divisionIndex] = 
              divisions[divisionIndex].createDivisionByLockingCard(selectedCard.id, cards);
          break;
        }

        if (!cards.length) {
          throw new Error(`Unable to satisfy requirement: ${requirement}.`);
        }
      }
    }

    return divisions;
  }

  private addExistingCardsAsAvailable(division: SupplyDivision, existingCards: SupplyCard[]) {
    // Add the existing cards as available to allow divisions to be intelligently divided. 
    const availableCardIds = Cards.extractIds(division.availableCards);
    const cardsToAdd = [];
    for (let card of existingCards) {
      if (availableCardIds.indexOf(card.id) == -1) {
        cardsToAdd.push(card);
      }
    }

    // Reinflate the total number of cards in the division by the number of existing cards since
    // the total was reduced in preparation for banning. See #prepareDivisionForBanning.
    return new SupplyDivision(
        division.availableCards.concat(cardsToAdd), division.lockedCards,
        division.selectedCards, division.totalCount + existingCards.length, division.replacements);
  }

  private applyExistingCards(divisions: SupplyDivision[], existingCards: SupplyCard[]) {
    divisions = divisions.concat();

    const cardsForNewDivision: SupplyCard[] = [];
    for (let existingCard of existingCards) {
      const divisionIndex = this.findIndexOfDivisionContainingCardId(divisions, existingCard.id);
      if (divisionIndex == -1) {
        // Collect cards that cannot be fit into a division and apply them afterwards.
        cardsForNewDivision.push(existingCard)
      } else {
        const division = divisions[divisionIndex];
        divisions[divisionIndex] = division.createDivisionByLockingCard(existingCard.id);
      }
    }

    if (!cardsForNewDivision.length) {
      return divisions;
    }

    // Shrink divisions with the most space to make room for the new division.
    for (let i = 0; i < cardsForNewDivision.length; i++) {
      const divisionIndex = this.getIndexOfDivisionWithMostUnfilledCards(divisions);
      const division = divisions[divisionIndex];
      divisions[divisionIndex] = new SupplyDivision(division.availableCards,
          division.lockedCards, division.selectedCards, division.totalCount - 1, division.replacements);
    }

    divisions.push(new SupplyDivision([], cardsForNewDivision, [], cardsForNewDivision.length, new Map()));
    return divisions;
  }

  private gatherCardsIntoSupply(divisions: SupplyDivision[]) {
    const replacements: Map<string, SupplyCard[]> = new Map();
    let cards: SupplyCard[] = [];
    for (let division of divisions) {
      for (let card of division.lockedAndSelectedCards) {
        cards.push(card);
        replacements.set(card.id, division.getReplacements(card.id));
      }
    }
    return new Supply(cards, new Replacements(replacements));
  }

  private orderRequirementsForDivisions(divisions: SupplyDivision[]): SupplyRequirement[] {
    const satsifiedRequirements: SupplyRequirement[] = [];
    const requirementAndCountPairs: {requirement: SupplyRequirement, count: number}[] = [];

    for (let requirement of this.requirements) {
      if (requirement.isSatisfied(divisions)) {
        satsifiedRequirements.push(requirement);
        continue;
      }

      requirementAndCountPairs.push({
        requirement: requirement,
        count: requirement.getSatisfyingCardsFromDivisions(divisions).length
      });
    }
    
    requirementAndCountPairs.sort((a, b) => a.count - b.count);

    const ordered: SupplyRequirement[] = [];
    for (let pair of requirementAndCountPairs) {
      ordered.push(pair.requirement);
    }
    return satsifiedRequirements.concat(ordered);
  }

  private getSegmentedRangeForRequirement(
      requirement: SupplyRequirement, divisions: SupplyDivision[]): SegmentedRange {
    const lengths: number[] = [];
    for (let division of divisions) {
      if (division.isFilled) {
        lengths.push(0);
      } else {
        lengths.push(requirement.getSatisfyingCardsFromDivisions([division]).length);
      }
    }
    return new SegmentedRange(0, lengths);
  }

  private findIndexOfDivisionContainingCardId(
    divisions: SupplyDivision[], cardId: string): number {
    for (let i = 0; i < divisions.length; i++) {
      // Each card should only fit within a single division.
      const division = divisions[i];
      if (!division.isFilled && Cards.findCardById(division.availableCards, cardId)) {
        return i;
      }
    }
    return -1;
  }

  private getIndexOfDivisionWithMostUnfilledCards(divisions: SupplyDivision[]): number {
    let mostUnfilledCards = 0;
    let winningIndex = -1;
    for (let i = 0; i < divisions.length; i++) {
      if (divisions[i].unfilledCount > mostUnfilledCards) {
        mostUnfilledCards = divisions[i].unfilledCount;
        winningIndex = i;
      }
    }
    return winningIndex;
  }

  private allowLockedCard(divisions: SupplyDivision[], card: SupplyCard): boolean {
    for (let correction of this.corrections) {
      if (!correction.allowLockedCard(divisions, card)) {
        return false;
      }
    }
    return true;
  }
}
