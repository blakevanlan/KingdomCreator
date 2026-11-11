import { defineStore } from 'pinia';
import type { SetId } from '@/dominion/set-id';
import type { CardType } from '@/dominion/card-type';
import type { CostType } from '@/dominion/cost-type';
import { SortOption } from '@/settings/settings';

export interface SearchState {
  searchName: string;
  selectedSetIds: SetId[];
  selectedCardTypes: CardType[];
  selectedCostTypes: CostType[];
  selectedSortOption: string;
}

export const useSearchStore = defineStore(
    'searchStore', 
  {
  state: (): SearchState => ({
    searchName: '',
    selectedSetIds: [],
    selectedCardTypes: [],
    selectedCostTypes: [],
    selectedSortOption: SortOption.ALPHABETICAL,
  }),
  persist: true,
});
