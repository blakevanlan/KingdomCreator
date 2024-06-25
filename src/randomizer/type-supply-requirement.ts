import type {CardType} from "../dominion/card-type";
import {Cards} from "../utils/cards";
import type {SupplyCard} from "../dominion/supply-card";
import type {SupplyDivision} from "./supply-division";
import {SupplyRequirement} from "./supply-requirement";

export class TypeSupplyRequirement extends SupplyRequirement {
  constructor(readonly type: CardType, readonly requireNewCard: boolean) {
    super();
  }

  isSatisfied(divisions: SupplyDivision[]): boolean {
    return this.requireNewCard ? false : super.isSatisfied(divisions);
  }

  protected getSatisfyingCards(cards: SupplyCard[]): SupplyCard[] {
    return cards.filter(Cards.filterByRequiredType(this.type));
  }

  toString() {
    return `TypeSupplyRequirement(type=${this.type},requireNewCard=${this.requireNewCard})`;
  }
}
