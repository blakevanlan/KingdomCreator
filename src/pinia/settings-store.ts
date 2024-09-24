// Pinia Store
import { defineStore } from 'pinia';
import type { SetId } from '../dominion/set-id';


export interface SettingsState {
  isUsingCustomDesksize: boolean, 
  KingdomNb: number,
  AddonsNb: number,
  forceAddonsUse: boolean,
  EventsMax: number,
  LandmarksMax: number,
  ProjectsMax: number,
  WaysMax: number,
  TraitsMax: number,

  isUsingOnlyOwnedsets: boolean,
  ownedSets : SetId[],
};

export const useSettingsStore = defineStore(
  'settingsStore', {
  state: () => ({
    isUsingCustomDesksize: false, 
    KingdomNb: 10,
    AddonsNb: 2,
    forceAddonsUse: false,
    EventsMax: 2,
    LandmarksMax: 2,
    ProjectsMax: 2,
    WaysMax: 2,
    TraitsMax: 2,
    isUsingOnlyOwnedsets: false,
    ownedSets: [] as SetId[]
  }),
  persist: true,
  actions: {
    updateSettings(newState: Partial<SettingsState>) {
      // Update multiple properties efficiently using object spread
      this.$patch((state) => {
        Object.assign(state, newState);
      });
    },
  }
});
