import {Cards} from "../utils/cards";
import {SupplyBan} from "./supply-ban";
import {SupplyCard} from "../dominion/supply-card";

export class CardSupplyBan implements SupplyBan {
  constructor(readonly cardIds: string[]) {
  }

  getBannedCards(cards: SupplyCard[]): SupplyCard[] {
    return cards.filter(Cards.filterByIncludedIds(this.cardIds));
  }
}
