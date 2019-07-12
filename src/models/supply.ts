import {SetId} from "../dominion/set-id";
import {SupplyBuilder} from "../randomizer/supply-builder";
import {SupplyCard} from "../dominion/supply-card";

export class Supply {
  constructor(readonly cards: SupplyCard[], readonly metadata: Metadata | null) {
  }
}

export class Metadata {
  constructor(
      readonly builder: SupplyBuilder,
      readonly prioritizedSetId: SetId | null,
      readonly numberOfAlchemyCardsInUse: number,
      readonly numberOfHighCostCardsInUse: number) {
  }
}
