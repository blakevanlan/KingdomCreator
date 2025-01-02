import type { SupplyCard } from "../dominion/supply-card";
import { SortOption } from "../settings/settings";
import type { TranslateResult } from 'vue-i18n';

export class SupplyCardSorter {

  static sort(supplyCards: SupplyCard[], sortOption: SortOption, translator: (key: string) => TranslateResult) {
    return supplyCards.sort((a, b) => this.compare(a, b, sortOption, translator));
  }

  private static compare(a: SupplyCard, b: SupplyCard, sortOption: SortOption, translator: (key: string) => TranslateResult) {
    if (sortOption === SortOption.SET && a.setId !== b.setId) {
      return translator(a.setId).localeCompare(translator(b.setId), undefined, { sensitivity: 'base' });
    }
    if (sortOption === SortOption.COST) {
      const costComparison = SupplyCardSorter.compareCosts(a, b);
      if (costComparison !== 0) {
        return costComparison;
      }
    }
    if (sortOption === SortOption.ORDERSTRING) {
      return translator(a.orderstring).localeCompare(translator(b.orderstring), undefined, { sensitivity: 'base' });
    }
    return translator(a.id).localeCompare(translator(b.id), undefined, { sensitivity: 'base' });
  }

  private static compareCosts(a: SupplyCard, b: SupplyCard) {
    const costA = SupplyCardSorter.getCostSum(a);
    const costB = SupplyCardSorter.getCostSum(b);
    return costA === costB ? 0 : costA < costB ? -1 : 1;
  }

  private static getCostSum(supplyCard: SupplyCard) {
    if (supplyCard.constructor.name === "Boon") return 0;
    return supplyCard.cost.treasure + supplyCard.cost.potion * 0.9 + supplyCard.cost.debt;
  }
}
