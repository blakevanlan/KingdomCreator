import { Settings, SettingsParams } from "../../settings/settings";
import { loadSettings, saveSettings } from "../../settings/settings-manager";
import { DominionSets } from "../../dominion/dominion-sets";
import { Kingdom } from "../../models/kingdom";
import { Selection, SelectionParams } from "./selection";
import { actions } from "./actions";
import { serializeKingdom } from "../../randomizer/serializer";
import { getMessageForAddonsDescription } from "../../utils/messages";
import { Addon } from "../../dominion/addon";

const MIN_SETS_FOR_PRIORITIZE_OPTION = 3;
const MIN_CARDS_FOR_DISTRIBUTE_COST = 24;

export interface State {
  kingdom: Kingdom;
  selection: Selection;
  settings: Settings;
}

export interface Getters {
  isDistributeCostAllowed: boolean;
  isPrioritizeSetAllowed: boolean;
  randomizeButtonText: string;
  addons: Addon[];
  hasAddons: boolean;
  canHaveAddons: boolean;
  addonSummary: string;
}

export const randomizerStore = {
  state: {
    kingdom: Kingdom.empty(),
    selection: Selection.empty(),
    settings: loadSettings()
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
      return "Randomize!";
    },
    addons: (state: State) => {
      return (state.kingdom.events as Addon[]).concat(
        state.kingdom.landmarks as Addon[], 
        state.kingdom.projects as Addon[]);
    },
    hasAddons: (state: State, getters: Getters) => {
      return getters.addons.length > 0;
    },
    canHaveAddons: (state: State, getters: Getters) => {
      return getters.addonSummary.length > 0;
    },
    addonSummary: (state: State) => {
      let hasEvents = false;
      let hasLandmarks = false;
      let hasProjects = false;
      for (let setId of state.settings.selectedSets) {
        const set = DominionSets.getSetById(setId);
        hasEvents = hasEvents || set.events.length > 0;
        hasLandmarks = hasLandmarks || set.landmarks.length > 0;
        hasProjects = hasProjects || set.projects.length > 0;
      }
      return getMessageForAddonsDescription(
          hasEvents, hasLandmarks, hasProjects);
    },
  },
  mutations: {
    UPDATE_KINGDOM (state: State, kingdom: Kingdom) {
      state.kingdom = kingdom;
      const url = new URL(location.href);
      url.search = serializeKingdom(kingdom);
      history.replaceState({}, "", url.href);
    },
    CLEAR_SELECTION (state: State) {
      state.selection = Selection.empty();
    },
    UPDATE_SELECTION (state: State, selection: SelectionParams) {
      state.selection = state.selection.withParams(selection);
    },
    UPDATE_SETTINGS (state: State, settings: SettingsParams) {
      state.settings = state.settings.withParams(settings);
      saveSettings(state.settings);
    },
  },
  actions: actions
};
