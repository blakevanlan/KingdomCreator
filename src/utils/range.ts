
export class Range {
   readonly end: number;
   constructor(readonly start: number, readonly length: number) {
      this.end = start + length;
   }

   public isInRange(index: number) {
      return this.start <= index && index < this.end;
   }

   public static createFromIndices(start: number, end: number) {
      return new Range(start, end - start);
   }
}
