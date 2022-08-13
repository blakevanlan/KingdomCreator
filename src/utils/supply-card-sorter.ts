import { SupplyCard } from "../dominion/supply-card";
import { SortOption } from "../settings/settings";
import { I18n } from "../i18n/i18n";

export class SupplyCardSorter {
  
  static sort(supplyCards: SupplyCard[], sortOption: SortOption) {
    return supplyCards.sort((a, b) => this.compare(a, b, sortOption));
  }

  private static compare(a: SupplyCard, b: SupplyCard, sortOption: SortOption) {
    if (sortOption == SortOption.SET && a.setId != b.setId) {
      return a.setId < b.setId ? -1 : 1;
    }
    if (sortOption == SortOption.COST) {
      const costComparison = SupplyCardSorter.compareCosts(a, b);
      if (costComparison != 0) {
        return costComparison;
      }
    }
    return I18n.instance.t(a.id) == I18n.instance.t(b.id) ? 0 : I18n.instance.t(a.id) < I18n.instance.t(b.id) ? -1 : 1;
  }

  private static compareCosts(a: SupplyCard, b: SupplyCard) {
    const costA = SupplyCardSorter.getCostSum(a);
    const costB = SupplyCardSorter.getCostSum(b);
    return costA == costB ? 0 : costA < costB ? -1 : 1;
  }

  private static getCostSum(supplyCard: SupplyCard) {
    return supplyCard.cost.treasure + supplyCard.cost.potion * 0.9 + supplyCard.cost.debt;
  }
}