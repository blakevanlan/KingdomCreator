import {Cards} from "../utils/cards";
import {CostType} from "../dominion/cost-type";
import {SetId} from "../dominion/setid";
import {SupplyBan} from "./supply-ban";
import {SupplyCard} from "../dominion/supply-card";

export class SetSupplyBan implements SupplyBan {
  constructor(readonly setIds: SetId[]) {
  }

  getBannedCards(cards: SupplyCard[]): SupplyCard[] {
    return cards.filter(Cards.filterByIncludedSetIds(this.setIds));
  }
}
