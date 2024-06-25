import {Cards} from "../utils/cards"
import type {CardType} from "../dominion/card-type";
import type {SupplyBan} from "./supply-ban"
import type {SupplyCard} from "../dominion/supply-card";

export class TypeSupplyBan implements SupplyBan {
  constructor(readonly types: CardType[]) {
  }

  getBannedCards(cards: SupplyCard[]): SupplyCard[] {
    return cards.filter(Cards.filterByAllowedTypes(this.types));
  }
}