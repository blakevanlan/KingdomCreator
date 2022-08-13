import { SupplyCard } from "../dominion/supply-card";
import { SortOption } from "../settings/settings";
import { TranslateResult } from "vue-i18n";

export class SupplyCardSorter {
  
  static sort(supplyCards: SupplyCard[], sortOption: SortOption, translator: (id: string) => TranslateResult) {
    return supplyCards.sort((a, b) => this.compare(a, b, sortOption, translator));
  }

  private static compare(a: SupplyCard, b: SupplyCard, sortOption: SortOption, translator: (id: string) => TranslateResult) {
    if (sortOption == SortOption.SET && a.setId != b.setId) {
      return a.setId < b.setId ? -1 : 1;
    }
    if (sortOption == SortOption.COST) {
      const costComparison = SupplyCardSorter.compareCosts(a, b);
      if (costComparison != 0) {
        return costComparison;
      }
    }
    return translator(a.id) == translator(b.id) ? 0 : translator(a.id) < translator(b.id) ? -1 : 1;
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