import {Range} from "../utils/range";
import {SegmentedRange} from "../utils/segmented-range";
import type {SupplyCard} from "../dominion/supply-card";
import {SupplyDivision} from "./supply-division";
import {getRandomInts} from "../utils/rand";

export abstract class SupplyDivider {
  constructor(readonly count: number) {
  }

  public subdivideDivisions(divisions: SupplyDivision[]): SupplyDivision[] {
    const newDivisions: SupplyDivision[] = [];
    const countsPerDivision = this.getRandomizedCountsPerDivision(divisions);

    for (let i = 0; i < divisions.length; i++) {
      const division = divisions[i];
      const remainingDivisionTotalCount = division.totalCount - countsPerDivision[i];

      if (remainingDivisionTotalCount > 0) {
        const remainingCards = this.getRemainingCards(division);
        const remainingDivision =
            new SupplyDivision(remainingCards, [], [], remainingDivisionTotalCount, new Map());
        newDivisions.push(remainingDivision);
      }

      if (countsPerDivision[i] > 0) {
        const satisfyingCards = this.getSatisfyingCards(division);
        const satisfyingDivision =
            new SupplyDivision(satisfyingCards, [], [], countsPerDivision[i], new Map());
        newDivisions.push(satisfyingDivision);
      }
    }
    return newDivisions;
  }

  protected abstract getSatisfyingCards(division: SupplyDivision): SupplyCard[];

  protected abstract getRemainingCards(division: SupplyDivision): SupplyCard[];

  private getRandomizedCountsPerDivision(divisions: SupplyDivision[]): number[] {
    const ranges = this.createRangesForDivisions(divisions);
    let sumOfMins = 0;

    const countsPerDivision: number[] = [];
    for (const range of ranges) {
      const minCount = range.start;
      countsPerDivision.push(minCount);
      sumOfMins += minCount;
    }

    if (sumOfMins > this.count) {
      throw new Error("Unable to divide division. Too few remaining cards.");
    }

    const numberToRandomize = this.count - sumOfMins;
    if (numberToRandomize == 0) {
      return countsPerDivision;
    }

    const segmentedRange = this.createSegmentedRangeFromRanges(ranges);
    if (segmentedRange.length < numberToRandomize) {
      throw Error("Unable to divide division. Too few satisfying cards.")
    }
    
    // Allocate the remaining card counts to random divisions. Divisions with more matching
    // cards are more likely to receive the additional cards.
    const randomIndices = getRandomInts(numberToRandomize, segmentedRange.length);
    for (const index of randomIndices) {
      const divisionIndex = segmentedRange.getSegmentForIndex(index);
      countsPerDivision[divisionIndex] += 1;
    }

    return countsPerDivision;
  }

  private createRangesForDivisions(divisions: SupplyDivision[]): Range[] {
    const satisfyingCardsPerDivision = this.getSatisfyingCardsPerDivision(divisions);
    const ranges: Range[] = [];
    for (let i = 0; i < satisfyingCardsPerDivision.length; i++) {
      const cards = satisfyingCardsPerDivision[i];
      const unfilledCount = divisions[i].unfilledCount;
      const remainingCount = divisions[i].availableCards.length - cards.length;
      const min = Math.max(unfilledCount - remainingCount, 0);
      const max = Math.min(unfilledCount, cards.length);
      ranges.push(Range.createFromIndices(min, max));
    }
    return ranges
  }

  private getSatisfyingCardsPerDivision(divisions: SupplyDivision[]): SupplyCard[][] {
    const satisfyingCardsPerDivision: SupplyCard[][] = [];
    for (const division of divisions) {
      satisfyingCardsPerDivision.push(this.getSatisfyingCards(division));
    }
    return satisfyingCardsPerDivision;
  }

  private createSegmentedRangeFromRanges(ranges: Range[]): SegmentedRange {
    const lengths: number[] = [];
    for (const range of ranges) {
      lengths.push(range.length);
    }
    return new SegmentedRange(0, lengths);
  }
}