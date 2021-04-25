
abstract class SupplyDivider {
  final int _count;

  Iterable<SupplyDivision> subdivideDivisions(Iterable<SupplyDivision> divisions) {
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
    for (let range of ranges) {
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
    for (let index of randomIndices) {
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
    for (let division of divisions) {
      satisfyingCardsPerDivision.push(this.getSatisfyingCards(division));
    }
    return satisfyingCardsPerDivision;
  }

  private createSegmentedRangeFromRanges(ranges: Range[]): SegmentedRange {
    const lengths: number[] = [];
    for (let range of ranges) {
      lengths.push(range.length);
    }
    return new SegmentedRange(0, lengths);
  }
}