import {Range} from './range';
import {getRandomInt} from './rand';

export class SegmentedRange extends Range {
  constructor(start: number, readonly segmentLengths: number[]) {
    super(start, segmentLengths.reduce((a, v) => a + v, 0));
  }

  getSegmentForIndex(index: number): number {
    let segmentEnd = 0;
    for (let i = 0; i < this.segmentLengths.length; i++) {
      const segmentLength = this.segmentLengths[i]; // Store in a local variable
      if (segmentLength !== undefined) {
        segmentEnd += segmentLength; // TypeScript knows segmentLength is defined
      }
      if (index < segmentEnd) {
        return i;
      }
    }
    return -1;
  }

  getRandomSegmentIndex(): number {
    const rangeIndex = getRandomInt(0, this.length);
    return this.getSegmentForIndex(rangeIndex);
  }
}
