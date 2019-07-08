import {CardType} from "../dominion/card-type";
import {Cards} from "../utils/cards";
import {SupplyCard} from "../dominion/supply-card";
import {SupplyDivision} from "../supply-division";
import {SupplyRequirement} from "../dominion/supply-requirement";

export class TypeSupplyRequirement extends SupplyRequirement {
  constructor(readonly type: CardType, readonly requireNewCard: boolean) {
  }

  isSatisfied(divisions: SupplyDivision): boolean {
    return this.requireNewCard ? false : super(divisions);
  }

  protected getSatisfyingCards(cards: SupplyCard[]): SupplyCard[] {
    return cards.filter(Cards.filterByRequiredType(this.type));

  toString() {
    return `TypeSupplyRequirement(type=${this.type},requireNewCard=${this.requireNewCard})`;
  }
}
