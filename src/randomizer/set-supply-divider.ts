import {Cards} from "../utils/cards";
import {SetId} from "../dominion/set-id"
import {SupplyCard} from "../dominion/supply-card";
import {SupplyDivider} from "./supply-divider";
import {SupplyDivision} from "./supply-division";

export class SetSupplyDivider extends SupplyDivider {
  constructor(readonly setId: SetId, count: number) {
    super(count);
  }

  protected getSatisfyingCards(division: SupplyDivision): SupplyCard[] {
     return division.availableCards.filter(Cards.filterByIncludedSetIds([this.setId]));
  }

  protected getRemainingCards(division: SupplyDivision): SupplyCard[] {
    return division.availableCards.filter(Cards.filterByExcludedSetIds([this.setId]));
  }
}