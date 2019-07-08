import {SupplyDivider} from "./supply-divider";
import {Cards} from "../utils/cards";
import {SupplyCard} from "../dominion/supply-card";

const DEBT_COST_VALUE = 1
const POTION_COST_VALUE = 2
const TREASURE_COST_VALUE = 1

export class CostSupplyDivider extends SupplyDivider {
  constructor(readonly highCostCutOff: number, numberOfHighCostCards: number) {
    super(numberOfHighCostCards)
  }

  protected getSatisfyingCards(division): SupplyCard[] {
    return division.availableCards.filter(@isSatisfyingCard)
  }

  protected getRemainingCards(division): SupplyCard[] {
    return division.availableCards.filter(@isRemainingCard)
  }

  private isSatisfyingCard(card: SupplyCard): boolean {
    const costValue = @getCost(card);
    return costValue >= this.highCostCutOff;
  }

  private isRemainingCard(card: SupplyCard): boolean {
    const costValue = @getCost(card);
    return costValue < this.highCostCutOff;
  }

  private getCost(card: SupplyCard): number {
    const debtValue = card.cost.debt * DEBT_COST_VALUE;
    const potionValue = card.cost.potion * POTION_COST_VALUE;
    const treasureValue = card.cost.treasure * TREASURE_COST_VALUE;
    return debtValue + potionValue + treasureValue;
  }
}