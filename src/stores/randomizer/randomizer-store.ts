import { Settings, SettingsParams } from "../../settings/settings";
import { loadSettings, saveSettings } from "../../settings/settings-manager";
import { DominionSets } from "../../dominion/dominion-sets";
import { Kingdom } from "../../randomizer/kingdom";
import { SupplyCard } from "../../dominion/supply-card";
import { Selection, SelectionParams } from "./selection";
import { actions } from "./actions";
import { Addon } from "../../dominion/addon";

const MIN_SETS_FOR_PRIORITIZE_OPTION = 3;
const MIN_CARDS_FOR_DISTRIBUTE_COST = 24;

export interface State {
  kingdom: Kingdom;
  selection: Selection;
  settings: Settings;
  specifyingReplacementSupplyCard: SupplyCard | null;
}

export interface Getters {
  isDistributeCostAllowed: boolean;
  isPrioritizeSetAllowed: boolean;
  randomizeButtonText: string;
  addons: Addon[];
  hasAddons: boolean;
  canHaveEvents: boolean;
  canHaveLandmarks: boolean;
  canHaveProjects: boolean;
  canHaveWays: boolean;
  canHaveAddons: boolean;
  addonSummary: string;
}

export const randomizerStore = {
  state: {
    kingdom: Kingdom.empty(),
    selection: Selection.empty(),
    settings: loadSettings(), 
    specifyingReplacementSupplyCard: null,
  } as State,
  getters: {
    isDistributeCostAllowed: (state: State) => {
      const cardCount = state.settings.selectedSets
          .map(DominionSets.getSetById)
          .map((set) => set.supplyCards.length)
          .reduce((acc, value) => acc + value, 0);
      return cardCount >= MIN_CARDS_FOR_DISTRIBUTE_COST;
    },
    isPrioritizeSetAllowed: (state: State) => {
      return state.settings.selectedSets.length >= MIN_SETS_FOR_PRIORITIZE_OPTION;
    },
    randomizeButtonText: (state: State) => {
      return state.selection.isEmpty() ? "Randomize!" : "Replace!";
    },
    addons: (state: State) => {
      return (state.kingdom.events as Addon[]).concat(
        state.kingdom.landmarks as Addon[], 
        state.kingdom.projects as Addon[],
        state.kingdom.ways as Addon[]);
    },
    hasAddons: (state: State, getters: Getters) => {
      return getters.addons.length > 0;
    },
    canHaveEvents: (state: State, getters: Getters) => {
      for (let setId of state.settings.selectedSets) {
        if (DominionSets.getSetById(setId).events.length) {
          return true;
        }
      }
      return false;
    },
    canHaveLandmarks: (state: State, getters: Getters) => {
      for (let setId of state.settings.selectedSets) {
        if (DominionSets.getSetById(setId).landmarks.length) {
          return true;
        }
      }
      return false;
    },
    canHaveProjects: (state: State) => {
      for (let setId of state.settings.selectedSets) {
        if (DominionSets.getSetById(setId).projects.length) {
          return true;
        }
      }
      return false;
    },
    canHaveWays: (state: State) => {
      for (let setId of state.settings.selectedSets) {
        if (DominionSets.getSetById(setId).ways.length) {
          return true;
        }
      }
      return false;
    },
    canHaveAddons: (state: State, getters: Getters) => {
      return getters.canHaveEvents
        || getters.canHaveLandmarks
        || getters.canHaveProjects
        || getters.canHaveWays;
    }
  },
  mutations: {
    UPDATE_KINGDOM (state: State, kingdom: Kingdom) {
      state.kingdom = kingdom;
    },
    CLEAR_SELECTION (state: State) {
      state.selection = Selection.empty();
      state.specifyingReplacementSupplyCard = null;
    },
    UPDATE_SELECTION (state: State, selection: SelectionParams) {
      state.selection = state.selection.withParams(selection);
    },
    UPDATE_SETTINGS (state: State, settings: SettingsParams) {
      state.settings = state.settings.withParams(settings);
      saveSettings(state.settings);
    },
    UPDATE_SPECIFYING_REPLACEMENT_SUPPLY_CARD (state: State, supplyCard: SupplyCard) {
      state.specifyingReplacementSupplyCard = supplyCard;
    },
    CLEAR_SPECIFYING_REPLACEMENT_SUPPLY_CARD (state: State) {
      state.specifyingReplacementSupplyCard = null;
    },
  },
  actions: actions
};
