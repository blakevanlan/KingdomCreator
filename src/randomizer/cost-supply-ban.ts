import {Cards} from "../utils/cards";
import {CostType} from "../dominion/cost-type";
import {SupplyBan} from "./supply-ban";
import {SupplyCard} from "../dominion/supply-card";

export class CostSupplyBan implements SupplyBan {
  constructor(readonly costTypes: CostType[]) {
  }

  getBannedCards(cards: SupplyCard[]): SupplyCard[] {
    return cards.filter(Cards.filterByAllowedCosts(this.costTypes));
  }
}
