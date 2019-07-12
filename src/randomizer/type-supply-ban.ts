import {Cards} from "../utils/cards"
import {CardType} from "../dominion/card-type";
import {SupplyBan} from "./supply-ban"
import {SupplyCard} from "../dominion/supply-card";

export class TypeSupplyBan implements SupplyBan {
  constructor(readonly types: CardType[]) {
  }

  getBannedCards(cards: SupplyCard[]): SupplyCard[] {
    return cards.filter(Cards.filterByAllowedTypes(this.types));
  }
}