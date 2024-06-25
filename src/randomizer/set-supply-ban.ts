import {Cards} from "../utils/cards";
import type {SetId} from "../dominion/set-id";
import type {SupplyBan} from "./supply-ban";
import type {SupplyCard} from "../dominion/supply-card";

export class SetSupplyBan implements SupplyBan {
  constructor(readonly setIds: SetId[]) {
  }

  getBannedCards(cards: SupplyCard[]): SupplyCard[] {
    return cards.filter(Cards.filterByIncludedSetIds(this.setIds));
  }
}
