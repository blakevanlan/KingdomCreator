import {SupplyCard} from "../dominion/supply-card";

export class Supply {
  constructor(
      readonly supplyCards: SupplyCard[],
      readonly replacements: Replacements) {
  }

  static empty() {
    return new Supply([], Replacements.empty());
  }
}

export class Replacements {
  constructor(readonly replacements: Map<string, SupplyCard[]>) {
  }

  getReplacementsForId(supplyCardId: string) {
    return this.replacements.has(supplyCardId) ? this.replacements.get(supplyCardId)! : [];
  }

  static empty() {
    return new Replacements(new Map());
  }
}