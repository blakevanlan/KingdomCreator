import {SetId} from "./set-id"

export class Supply {
  constructor(readonly cards: Card[], readonly metadata: Metadata | null) {
  }
}

export class Metadata {
  constructor(
      builder: Builder,
      prioritizedSetId: SetId,
      numberOfAlchemyCardsInUse: number,
      numberOfHighCostCardsInUse: number) {
  }
}
