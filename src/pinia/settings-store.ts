// Pinia Store
import { defineStore } from 'pinia';
import type { SetId } from '../dominion/set-id';

interface SetConstraints {
  isSelected: boolean;
  minCards: number | undefined;
  maxCards: number | undefined;
  excludedCards: string[];
}

export interface SettingsState {
  isUsingCustomDesksize: boolean, 
  KingdomNb: number,
  AddonsNb: number,
  forceAddonsUse: boolean,
  addonMax: {
    Events: number;
    Landmarks: number;
    Projects: number;
    Ways: number;
    Traits: number;
  };
  isUsingOnlyOwnedsets: boolean,
  ownedSets : SetId[],
  useConstraintOnRandomization: boolean,
  setConstraints: { [setId: string]: SetConstraints },
  //excludedCardsBySet: { [setId: string]: string[] }
};

export const useSettingsStore = defineStore(
  'settingsStore', 
  {
  state: () => ({
    isUsingCustomDesksize: false, 
    KingdomNb: 10,
    AddonsNb: 2,
    forceAddonsUse: false,
    addonMax: {
      Events: 2,
      Landmarks: 2,
      Projects: 2,
      Ways: 2,
      Traits: 2
    },
    isUsingOnlyOwnedsets: false,
    ownedSets: [] as SetId[],
    useConstraintOnRandomization: false,
    setConstraints: {} as { [setId: string]: SetConstraints }
  }),
  persist: true,
  actions: {
    updateSettings(newState: Partial<SettingsState>) {
      // Update multiple properties efficiently using object spread
      this.$patch((state) => {
        Object.assign(state, newState);
      });
    },
    setSetConstraints(setId: SetId, constraints: Partial<SetConstraints>) {
      if (!constraints.isSelected && 
        constraints.minCards === undefined && 
        constraints.maxCards === undefined && 
        (!constraints.excludedCards || constraints.excludedCards.length === 0)) {
      // Si l'extension n'est pas sélectionnée et tous les champs sont vides/undefined, supprimons l'entrée
        delete this.setConstraints[setId];
      } else {
        if (!this.setConstraints[setId]) {
          this.setConstraints[setId] = {
            isSelected: false,
          minCards: undefined,
          maxCards: undefined,
          excludedCards: [],
          };
        }
      this.setConstraints[setId] = { ...this.setConstraints[setId], ...constraints };
      }
    },
    getSetConstraints(setId: SetId): SetConstraints | undefined {
      return this.setConstraints[setId];
    },
  }
});
