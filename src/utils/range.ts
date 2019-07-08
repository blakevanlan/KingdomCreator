
export class Range {
   readonly end: number;
   constructor(readonly start: number, readonly length: number) {
      end = start + length;
   }

   public isInRange(index: number) {
      return this.start <= index && index < end;
   }

   public static createFromIndices(start: number, end: number) {
      return new Range(start, end - start);
   }
}
