import {Cards} from "../utils/cards";
import {SetId} from "../dominion/set-id"
import {SupplyDivider} from "./supply-divider";

class SetSupplyDivider extends SupplyDivider {
  constructor(readonly setId: SetId, count: number) {
  }

  protected abstract getSatisfyingCards(division: SupplyDivision): SupplyCard[] {
     return division.availableCards.filter(Cards.filterByIncludedSetIds([this.setId]));
  }

  protected abstract getRemainingCards(division: SupplyDivision): SupplyCard[] {
    return division.availableCards.filter(Cards.filterByExcludedSetIds([this.setId]));
  }
}