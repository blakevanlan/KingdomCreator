import {Cards} from "../utils/cards";
import type {CostType} from "../dominion/cost-type";
import type {SupplyBan} from "./supply-ban";
import type {SupplyCard} from "../dominion/supply-card";

export class CostSupplyBan implements SupplyBan {
  constructor(readonly costTypes: CostType[]) {
  }

  getBannedCards(cards: SupplyCard[]): SupplyCard[] {
    return cards.filter(Cards.filterByAllowedCosts(this.costTypes));
  }
}
