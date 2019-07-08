import {Cards} from "../utils/cards"
import {CardType} from "../dominion/card-type";
import {SupplyBan} from "./supply-ban"

export class TypeSupplyBan implements SupplyBan {
  constructor(readonly types: CardType[]) {
  }

  getBannedCards(cards: SupplyCard[]): SupplyCard[] {
    return cards.filter(Cards.filterByAllowedTypes(this.types));
  }
}