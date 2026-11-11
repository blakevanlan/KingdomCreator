// Pinia Store
import { defineStore } from 'pinia';

import type { SettingsParams } from '@/settings/settings';
import { loadSettings, saveSettings } from '@/settings/settings-manager';
import { Selection } from './selection';
import type { SelectionParams } from './selection';
import { CardType } from '@/dominion/card-type';
import { RandomizerOptionsBuilder } from '@/randomizer/randomizer-options';
import { Cards } from '@/utils/cards';
import { Kingdom } from '@/randomizer/kingdom';
import { Supply } from '@/randomizer/supply';
import { DominionSets } from '@/dominion/dominion-sets';
import { SupplyCard } from '@/dominion/supply-card';
import type { Addon, Addons } from '@/dominion/addon';
import { getAddonTypeFromId, getAllowedAddonTypes } from '@/dominion/addon';

import { SetId } from '@/dominion/set-id';
import { CostType } from '@/dominion/cost-type';
import { Boon } from '@/dominion/boon';
import { Ally } from '@/dominion/ally';
import { Prophecy } from '@/dominion/prophecy';
import { Randomizer } from '@/randomizer/randomizer';

import { EventTracker } from '@/analytics/follow-activity';
import { EventType } from '@/analytics/follow-activity';
import type { randomizerStoreState } from './randomizer-actions';
import * as rA from './randomizer-actions'; // rA for randomizerActions
import { NUM_CARDS_IN_KINGDOM, FORCE_ADDONS_USE, MAX_ADDONS_IN_KINGDOM, MAX_ADDONS_OF_TYPE, RANDOMIZATION_CONSTRAINT_USE } from '@/settings/Settings-value';
import { Addons_TYPE } from '@/dominion/addon';
import { useSettingsStore } from './settings-store';

const MIN_SETS_FOR_PRIORITIZE_OPTION = rA.MIN_SETS_FOR_PRIORITIZE_OPTION;
const MIN_CARDS_FOR_DISTRIBUTE_COST = rA.MIN_CARDS_FOR_DISTRIBUTE_COST;

export interface RandomizeSupplyCardParams {
  selectedSetId: SetId | null;
  selectedCardType: CardType | null;
  selectedCostTypes: CostType[];
}

export const useRandomizerStore = defineStore(
  'randomizerStore', 
  {
  state: () => ({
    kingdom: Kingdom.empty(),
    selection: Selection.empty(),
    settings: loadSettings(),
    specifyingReplacementSupplyCard: (null as any) as SupplyCard,
    specifyingReplacementAddon: (null as any) as Addon,
    isFullScreen: false,
  }),
  persist: [{
    storage: localStorage,
    omit: ['selection'],
  } ,
  {
    storage: sessionStorage,
    pick: ['selection'],
  }] ,
  getters: {
    isDistributeCostAllowed: (state: randomizerStoreState) => {
      const cardCount = state.settings.selectedSets
        .map(DominionSets.getSetById)
        .map((set) => set.supplyCards.length)
        .reduce((acc, value) => acc + value, 0);
      return cardCount >= MIN_CARDS_FOR_DISTRIBUTE_COST;
    },
    isPrioritizeSetAllowed: (state: randomizerStoreState) => {
      return state.settings.selectedSets.length >= MIN_SETS_FOR_PRIORITIZE_OPTION;
    },
    isAlchemySelected: (state: randomizerStoreState) => {
      return state.settings.selectedSets.indexOf(SetId.ALCHEMY) != -1;
    },
    randomizeButtonText: (state: randomizerStoreState) => {
      return state.selection.isEmpty() ? "Randomize" : "Replace";
    },
    addons: (state: randomizerStoreState) => {
      return (state.kingdom.events as Addon[]).concat(
        state.kingdom.landmarks as Addon[],
        state.kingdom.projects as Addon[],
        state.kingdom.ways as Addon[],
        state.kingdom.traits as Addon[]
      );
    },
    extendedAddons: (state: randomizerStoreState) => {
      return (state.kingdom.events as Addon[]).concat(
        state.kingdom.landmarks as Addon[],
        state.kingdom.projects as Addon[],
        state.kingdom.ways as Addon[],
        state.kingdom.traits as Addon[],
        state.kingdom.ally ? [state.kingdom.ally] : [] as Addon[],
        state.kingdom.prophecy ? [state.kingdom.prophecy] : [] as Addon[],
        state.kingdom.boons as Addon[]
      );
    },
    canHaveEvents: (state: randomizerStoreState) => {
      if (state.kingdom.events.length > 0) return true;
      for (const setId of state.settings.selectedSets) {
        if (DominionSets.getSetById(setId).events.length) {
          return true;
        }
      }
      return false;
    },
    canHaveLandmarks: (state: randomizerStoreState) => {
      if (state.kingdom.landmarks.length > 0) return true;
      for (const setId of state.settings.selectedSets) {
        if (DominionSets.getSetById(setId).landmarks.length) {
          return true;
        }
      }
      return false;
    },
    canHaveProjects: (state: randomizerStoreState) => {
      if (state.kingdom.projects.length > 0) return true;
      for (const setId of state.settings.selectedSets) {
        if (DominionSets.getSetById(setId).projects.length) {
          return true;
        }
      }
      return false;
    },
    canHaveWays: (state: randomizerStoreState) => {
      if (state.kingdom.ways.length > 0) return true;
      for (const setId of state.settings.selectedSets) {
        if (DominionSets.getSetById(setId).ways.length) {
          return true;
        }
      }
      return false;
    },
    canHaveTraits: (state: randomizerStoreState) => {
      if (state.kingdom.traits.length > 0) return true;
      for (const setId of state.settings.selectedSets) {
        if (DominionSets.getSetById(setId).traits.length) {
          return true;
        }
      }
      return false;
    },
    canHaveAddons() {
      return this.canHaveEvents
        || this.canHaveLandmarks
        || this.canHaveProjects
        || this.canHaveWays
        || this.canHaveTraits;
    },
    hasAddons() {
      return this.addons.length > 0;
    }
  },
  actions: {
    UPDATE_KINGDOM(kingdom: Kingdom, source = 'edit') {
     //(new Date().toLocaleTimeString(), "UPDATE_KINGDOM", kingdom)
      this.kingdom = kingdom;
      EventTracker.trackEvent(EventType.UPDATE_KINGDOM, kingdom);
      const settingsStore = useSettingsStore();
      EventTracker.trackKingdomActivity(kingdom, source, {
        selectedSets: [...this.settings.selectedSets],
        sortOption: this.settings.sortOption,
        randomizerSettings: { ...this.settings.randomizerSettings },
        appSettings: {
          isUsingCustomDesksize: settingsStore.isUsingCustomDesksize,
          KingdomNb: settingsStore.KingdomNb,
          AddonsNb: settingsStore.AddonsNb,
          forceAddonsUse: settingsStore.forceAddonsUse,
          addonMax: { ...settingsStore.addonMax },
          isUsingOnlyOwnedsets: settingsStore.isUsingOnlyOwnedsets,
          ownedSets: [...settingsStore.ownedSets],
          useConstraintOnRandomization: settingsStore.useConstraintOnRandomization,
          setConstraints: settingsStore.setConstraints,
        },
      });
    },
    CLEAR_SELECTION() {
      this.selection = Selection.empty();
      this.specifyingReplacementSupplyCard = (null as any) as SupplyCard;
      this.specifyingReplacementAddon = (null as any) as Addon;
    },
    UPDATE_SELECTION(selection: SelectionParams) {
      this.selection = this.selection.withParams(selection);
    },
    UPDATE_SETTINGS(settings: SettingsParams) {
      this.settings = this.settings.withParams(settings);
      saveSettings(this.settings);
    },
    UPDATE_SPECIFYING_REPLACEMENT_SUPPLY_CARD(supplyCard: SupplyCard) {
      this.specifyingReplacementSupplyCard = supplyCard;
    },
    CLEAR_SPECIFYING_REPLACEMENT_SUPPLY_CARD() {
      this.specifyingReplacementSupplyCard = (null as any) as SupplyCard;
    },
    UPDATE_SPECIFYING_REPLACEMENT_ADDON(addon: Addon) {
      this.specifyingReplacementAddon = addon;
    },
    CLEAR_SPECIFYING_REPLACEMENT_ADDON() {
      this.specifyingReplacementAddon = (null as any) as Addon;
    },
    UPDATE_FULLSCREEN_RANDOMIZER(isFullScreenState: boolean) {
      this.isFullScreen = isFullScreenState;
    },
    LOAD_INITIAL_KINGDOM(initialKingdom: Kingdom | null, source = 'shared_url') {
      //console.log(new Date().toLocaleTimeString(), 'LOAD_INITIAL_KINGDOM ', initialKingdom)
      //EventTracker.trackEvent(EventType.LOAD_INITIAL_KINGDOM);
      if (initialKingdom) {
        // Use the kingdom as-is if it contains the correct number of supply cards.
        //if (initialKingdom.supply.supplyCards.length == 10) {
        if (initialKingdom.supply.supplyCards.length == NUM_CARDS_IN_KINGDOM()
            && initialKingdom.isKingdomValidForAddons()) {
          //console.log("kingdom is valid : ", NUM_CARDS_IN_KINGDOM())
          if (source !== 'play_again') {
            EventTracker.trackEvent(EventType.LOAD_FULL_KINGDOM_FROM_URL, initialKingdom);
          }
          this.UPDATE_KINGDOM(initialKingdom, source);
          return;
        }
        // if (initialKingdom.supply.supplyCards.length != NUM_CARDS_IN_KINGDOM()) {
        //   console.log ("kingdom is not valid ", initialKingdom.supply.supplyCards.length, NUM_CARDS_IN_KINGDOM())
        // }
        if (!initialKingdom.isKingdomValidForAddons()) {
          console.log ("kingdom is not valid for addons", initialKingdom.events.map(e => e.id), 
            initialKingdom.landmarks.map(l => l.id), initialKingdom.projects.map(p => p.id), 
            initialKingdom.ways.map(w => w.id), initialKingdom.traits.map(t => t.id))
        }

        // Randomize the rest of the set if there are less than 10 cards.
        // test if all cards are allowed
        const options =
          rA.createRandomizerOptionsBuilder(this)
            .setSetIds(rA.getSelectedSetIds(this))
            .setExcludeTypes(rA.getExcludeTypes(this))
            .setIncludeCardIds(Cards.extractIds(initialKingdom.supply.supplyCards))
            .build();
        //console.log(options)
        const supply = Randomizer.createSupplySafe(options, rA.randomizationTrackingData(this));
        //console.log(supply)
        
        let addonsForAdjustement ={ 
          events: initialKingdom.events ?? [], landmarks: initialKingdom.landmarks ?? [], 
          projects: initialKingdom.projects ?? [], ways: initialKingdom.ways ?? [], 
          allies: [], prophecies: [], traits: initialKingdom.traits ?? []
        } as unknown as Addons;
        //console.log("addonsForAdjustement", addonsForAdjustement)
        const enforceAndFillAddons = (actualAddons: Addons) : Addons => {
          // enforce per-type caps
          //console.log("enforceAndFillAddons", actualAddons)
          actualAddons.events = (actualAddons.events ?? []).slice(0, MAX_ADDONS_OF_TYPE(Addons_TYPE.EVENT));
          actualAddons.landmarks = (actualAddons.landmarks ?? []).slice(0, MAX_ADDONS_OF_TYPE(Addons_TYPE.LANDMARK));
          actualAddons.projects = (actualAddons.projects ?? []).slice(0, MAX_ADDONS_OF_TYPE(Addons_TYPE.PROJECT));
          actualAddons.ways = (actualAddons.ways ?? []).slice(0, MAX_ADDONS_OF_TYPE(Addons_TYPE.WAY));
          actualAddons.traits = (actualAddons.traits ?? []).slice(0, MAX_ADDONS_OF_TYPE(Addons_TYPE.TRAIT));
          actualAddons.allies = actualAddons.allies ?? [];
          actualAddons.prophecies = actualAddons.prophecies ?? [];
          
          // enforce total max
          let maxAddonsInKingdom = MAX_ADDONS_IN_KINGDOM();
          let total = actualAddons.events.length + actualAddons.landmarks.length + actualAddons.projects.length + actualAddons.ways.length + actualAddons.traits.length + actualAddons.allies.length + actualAddons.prophecies.length;
          if (total > maxAddonsInKingdom) {
            // trim in this order until within limit (least-impactful first)
            const order: (keyof Addons)[] = ['traits','ways','projects','landmarks','events'];
            for (const key of order) {
              while ((actualAddons as any)[key].length > 0 && total > maxAddonsInKingdom) {
                (actualAddons as any)[key].pop();
                total--;
              }
              if (total <= maxAddonsInKingdom) break;
            }
          }

          // Try to fill missing addons (inspired by randomizeSelectedAddons loop)
          if (FORCE_ADDONS_USE() || total < maxAddonsInKingdom) {
            const setIds = rA.getSelectedSetIds(this);

            // start with currently known addon ids to avoid duplicates
            let previousComplementarySelectedIds: string[] = Cards.extractIds(
              (initialKingdom.events as any[])
                .concat(initialKingdom.landmarks as any[])
                .concat(initialKingdom.projects as any[])
                .concat(initialKingdom.ways as any[])
                .concat(initialKingdom.traits as any[])
            );
            let safetyNet = 0;
            if (!FORCE_ADDONS_USE()) safetyNet = 49; // one-pass behavior when not forced
            while (safetyNet < 50) {
              safetyNet++;
              const complementarySelectedCards = Randomizer.getRandomAddons(setIds, previousComplementarySelectedIds, NUM_CARDS_IN_KINGDOM());
              for (const card of complementarySelectedCards) {
                if (total >= maxAddonsInKingdom) break;
                const typeName = card.constructor.name;
                if (typeName == Addons_TYPE.EVENT) {
                  if (actualAddons.events.length < MAX_ADDONS_OF_TYPE(Addons_TYPE.EVENT)) {
                    if (!actualAddons.events.find((x:any)=>x.id===card.id)) { actualAddons.events.push(card as any); total++; }
                  }
                } else if (typeName == Addons_TYPE.LANDMARK) {
                  if (actualAddons.landmarks.length < MAX_ADDONS_OF_TYPE(Addons_TYPE.LANDMARK)) {
                    if (!actualAddons.landmarks.find((x:any)=>x.id===card.id)) { actualAddons.landmarks.push(card as any); total++; }
                  }
                } else if (typeName == Addons_TYPE.PROJECT) {
                  if (actualAddons.projects.length < MAX_ADDONS_OF_TYPE(Addons_TYPE.PROJECT)) {
                    if (!actualAddons.projects.find((x:any)=>x.id===card.id)) { actualAddons.projects.push(card as any); total++; }
                  }
                } else if (typeName == Addons_TYPE.WAY) {
                  if (actualAddons.ways.length < MAX_ADDONS_OF_TYPE(Addons_TYPE.WAY)) {
                    if (!actualAddons.ways.find((x:any)=>x.id===card.id)) { actualAddons.ways.push(card as any); total++; }
                  }
                } else if (typeName == Addons_TYPE.TRAIT) {
                  if (actualAddons.traits.length < MAX_ADDONS_OF_TYPE(Addons_TYPE.TRAIT)) {
                    if (!actualAddons.traits.find((x:any)=>x.id===card.id)) { actualAddons.traits.push(card as any); total++; }
                  }
                }
                if (total >= maxAddonsInKingdom) break;
              }

              if (FORCE_ADDONS_USE()) {
                if (total >= maxAddonsInKingdom) {
                  break;
                } else {
                  previousComplementarySelectedIds = [
                    ...previousComplementarySelectedIds,
                    ...complementarySelectedCards.map(card => card.id)
                  ];
                }
              } else {
                break; // only one pass when not forced
              }
            }
          } 
          return actualAddons;
        };
        if (supply) {
          if (source !== 'play_again') {
            EventTracker.trackEvent(EventType.LOAD_PARTIAL_KINGDOM_FROM_URL);
          }
          let kingdom
          if (initialKingdom.events.length + initialKingdom.landmarks.length +
            initialKingdom.projects.length + initialKingdom.ways.length +
            initialKingdom.traits.length == 0 ) {
            const Tempkingdom = Randomizer.createKingdom(options);
            let addonslength = 0
            const regeneratedEvents = initialKingdom.events.concat(Tempkingdom.events).slice(0, 2);
            addonslength += regeneratedEvents.length
            const regeneratedLandmarks = initialKingdom.landmarks.concat(Tempkingdom.landmarks).slice(0, Math.max(0, 2 - addonslength));
            addonslength += regeneratedLandmarks.length
            const regeneratedProjects = initialKingdom.projects.concat(Tempkingdom.projects).slice(0, Math.max(0, 2 - addonslength));
            addonslength += regeneratedProjects.length
            const regeneratedWays = initialKingdom.ways.concat(Tempkingdom.ways).slice(0, Math.max(0, 2 - addonslength));
            addonslength += regeneratedWays.length
            const regeneratedTraits = initialKingdom.traits.concat(Tempkingdom.traits).slice(0, Math.max(0, 2 - addonslength));
            addonslength += regeneratedTraits.length

            addonsForAdjustement ={ 
              events: regeneratedEvents, landmarks: regeneratedLandmarks, 
              projects: regeneratedProjects, ways: regeneratedWays, 
              allies: [], prophecy: [], traits: regeneratedTraits
            } as unknown as Addons;
            //console.log("work needed", addonsForAdjustement)
            addonsForAdjustement = enforceAndFillAddons(addonsForAdjustement);
            // keep regenerated lists in sync with enforced addons
            const finalEvents = addonsForAdjustement.events;
            const finalLandmarks = addonsForAdjustement.landmarks;
            const finalProjects = addonsForAdjustement.projects;
            const finalWays = addonsForAdjustement.ways;
            const finalTraits = addonsForAdjustement.traits;

            const regeneratedAdjustedSupplyCards = Randomizer.adjustSupplyBasedOnAddons(supply, addonsForAdjustement, initialKingdom);

            kingdom = new Kingdom(
              Date.now(), regeneratedAdjustedSupplyCards, finalEvents, finalLandmarks,
              finalProjects, finalWays, initialKingdom.boons,
              initialKingdom.ally, initialKingdom.prophecy, finalTraits, initialKingdom.metadata);
          } else {
            //console.log("work needed 2", addonsForAdjustement)
            addonsForAdjustement = enforceAndFillAddons(addonsForAdjustement);
            const adjustedSupplyCards = Randomizer.adjustSupplyBasedOnAddons(supply, addonsForAdjustement, initialKingdom );
            //console.log("adjustedSupplyCards", addonsForAdjustement)
            kingdom = new Kingdom(
              Date.now(), adjustedSupplyCards, addonsForAdjustement.events, addonsForAdjustement.landmarks,
              addonsForAdjustement.projects, addonsForAdjustement.ways, initialKingdom.boons,
              initialKingdom.ally, initialKingdom.prophecy, addonsForAdjustement.traits, initialKingdom.metadata);
          }
          //console.log("LOAD_PARTIAL_KINGDOM_FROM_URL", kingdom)
          this.CLEAR_SELECTION();
          this.UPDATE_KINGDOM(
            kingdom,
            source === 'play_again' ? 'play_again' : 'shared_url_partial'
          );
          return;
        } else {
          EventTracker.trackError(EventType.LOAD_PARTIAL_KINGDOM_FROM_URL);
          //console.log("Error : LOAD_PARTIAL_KINGDOM_FROM_URL - no supplyCards selected")
        }
      }
      // Do a full randomize since we failed to retrieve a kingdom from the URL.
      // clean selection in 
      EventTracker.trackEvent(EventType.LOAD_INITIAL_RANDOMIZE, rA.randomizationTrackingData(this));
      this.RANDOMIZE();
    },
    RANDOMIZE() {
      //console.log(new Date().toLocaleTimeString(), 'RANDOMIZE')
      //console.log(this.kingdom)
      if (this.selection.isEmpty()) {
        this.RANDOMIZE_FULL_KINGDOM();
        return;
      }
      const selectedSupplyCards = rA.getSelectedSupplyCards(this);
      const oldSupply = this.kingdom.supply;
      let newSupply = oldSupply
      if (selectedSupplyCards.length >0) {
        //console.log("RANDOMIZE SupplyCards selected", selectedSupplyCards)
        newSupply = rA.randomizeSelectedCards(this) || newSupply
      } else { 
        EventTracker.trackEvent(EventType.RANDOMIZE, rA.randomizationTrackingData(this));
        //console.log("RANDOMIZE no SupplyCards selected", selectedSupplyCards)
      }

      const isAddonSelected =
      rA.getSelectedEvents(this).length ||
      rA.getSelectedLandmarks(this).length ||
      rA.getSelectedProjects(this).length ||
      rA.getSelectedWays(this).length ||
      rA.getSelectedTraits(this).length;

      const newAddons = isAddonSelected ? rA.randomizeSelectedAddons(this) : null;
      const newEvents = newAddons
        ? Cards.getAllEvents(newAddons).concat(rA.getUnselectedEvents(this))
        : this.kingdom.events;
      const newLandmarks = newAddons
        ? Cards.getAllLandmarks(newAddons).concat(rA.getUnselectedLandmarks(this))
        : this.kingdom.landmarks;
      const newProjects = newAddons
        ? Cards.getAllProjects(newAddons).concat(rA.getUnselectedProjects(this))
        : this.kingdom.projects;
      const newWays = newAddons
        ? Cards.getAllWays(newAddons).concat(rA.getUnselectedWays(this))
        : this.kingdom.ways;
      const newTraits = newAddons
        ? Cards.getAllTraits(newAddons).concat(rA.getUnselectedTraits(this))
        : this.kingdom.traits;
      const newAlly = rA.randomizeSelectedAlly(this, newSupply) 
      const newProphecy = rA.randomizeSelectedProphecy(this, newSupply);

      const addonsForAdjustement ={ 
        events: newEvents, landmarks: newLandmarks, 
        projects: newProjects, ways: newWays, 
        allies: newAlly ? [newAlly] : [], 
        prophecies: newProphecy ? [newProphecy] : [], 
        traits: newTraits 
      } as unknown as Addons;
      const newBoons = rA.randomizeSelectedBoons(this, newSupply);

      const adjustedSupplyCards = Randomizer.adjustSupplyBasedOnAddons(newSupply, 
            addonsForAdjustement, this.kingdom );
      const kingdom = new Kingdom(
        this.kingdom.id, adjustedSupplyCards, newEvents, newLandmarks, newProjects,
        newWays, newBoons, newAlly, newProphecy, newTraits, this.kingdom.metadata);
      this.CLEAR_SELECTION();
      this.UPDATE_KINGDOM(kingdom, 'random');
    },

    RANDOMIZE_FULL_KINGDOM() {
      //console.log(new Date().toLocaleTimeString(), 'RANDOMIZE_FULL_KINGDOM')
      const trackingData = rA.randomizationTrackingData(this);
      EventTracker.trackEvent(EventType.RANDOMIZE_FULL_KINGDOM, trackingData);

      const setIds = rA.getSelectedSetIds(this);
      if (!setIds.length) {
        EventTracker.trackError(EventType.RANDOMIZE_FULL_KINGDOM, trackingData);
        console.log("Error : RANDOMIZE_FULL_KINGDOM - no set selected")
        // this.settings= loadSettings()
        // console.log("forced FULL", this.settings)
        // this.RANDOMIZE_FULL_KINGDOM()
        /* possibility : randomize sets to generate new kigdoms */
        return;
      }

      const options = rA.createRandomizerOptionsBuilder(this)
        .setSetIds(setIds)
        .setExcludeCardIds(rA.getCardsToExclude(this))
        .setExcludeTypes(rA.getExcludeTypes(this))
        .build();
        //console.log(options)
      try {
        const kingdom = Randomizer.createKingdom(options);
        //console.log("RANDOMIZE_FULL_KINGDOM", kingdom)
        this.CLEAR_SELECTION();
        this.UPDATE_KINGDOM(kingdom, 'randomize_partial');
      } catch (error) {
        console.log("Error : RANDOMIZE_FULL_KINGDOM - error generating kingdom")
        if (typeof error === 'object' && error !== null) {
          console.log(`Failed to create supply: \n${error.toString()}`);
          EventTracker.trackError(EventType.RANDOMIZE_FULL_KINGDOM, {
            ...trackingData,
            message: error.toString(),
          });
          alert(`Failed to create supply: \n${error.toString()}`)
        } else
          console.log(`Failed to create supply: \n error is not an object`);
          EventTracker.trackError(EventType.RANDOMIZE_FULL_KINGDOM, trackingData)
      }
    },

    RANDOMIZE_SUPPLY_CARD(params: RandomizeSupplyCardParams) {
      //console.log(new Date().toLocaleTimeString(), 'RANDOMIZE_SUPPLY_CARD')
      //console.log(params)
      const randomizerSettings = this.settings.randomizerSettings;
      const excludeTypes: CardType[] = [];
      if (params.selectedCardType && !randomizerSettings.allowAttacks) {
        excludeTypes.push(CardType.ATTACK);
      }
      const setIds: SetId[] = params.selectedSetId == null
        ? rA.getSelectedSetIds(this)
        : [params.selectedSetId!];

      const excludeCosts: CostType[] = [];
      for (const key in CostType) {
        if (params.selectedCostTypes.indexOf((CostType as any)[key]) == -1) {
          excludeCosts.push((CostType as any)[key] as CostType);
        }
      }

      const optionsBuilder = new RandomizerOptionsBuilder()
        .setSetIds(setIds)
        .setIncludeCardIds(Cards.extractIds(rA.getUnselectedSupplyCards(this)))
        .setExcludeCardIds(Cards.extractIds(rA.getSelectedSupplyCards(this)))
        .setExcludeTypes(excludeTypes)
        .setExcludeCosts(excludeCosts)
        .setUseAlchemyRecommendation(randomizerSettings.isAlchemyRecommendationEnabled)

      // Preserve special card roles if they are not part of the current selection to be randomized.
      const isBaneSelected = rA.isBaneCardSelected(this);
      const isFerrymanSelected = rA.isFerrymanCardSelected(this);
      const isMousewaySelected = rA.isMousewayCardSelected(this);
      const isObeliskSelected = rA.isObeliskCardSelected(this);
      const isRiverboatSelected = rA.isRiverboatCardSelected(this);
      const isApproachingArmySelected = rA.isApproachingArmyCardSelected(this);

      if (!isBaneSelected && this.kingdom.supply.baneCard) {
        optionsBuilder.setBaneCardId(this.kingdom.supply.baneCard.id);
      }
      if (!isFerrymanSelected && this.kingdom.supply.ferrymanCard) {
        optionsBuilder.setFerrymanCardId(this.kingdom.supply.ferrymanCard.id);
      }
      if (!isMousewaySelected && this.kingdom.supply.mouseWay) {
        optionsBuilder.setMousewayCardId(this.kingdom.supply.mouseWay.id);
      }
      if (!isObeliskSelected && this.kingdom.supply.obeliskCard) {
        optionsBuilder.setObeliskCardId(this.kingdom.supply.obeliskCard.id);
      }
      if (!isRiverboatSelected && this.kingdom.supply.riverboatCard) {
        optionsBuilder.setRiverboatCardId(this.kingdom.supply.riverboatCard.id);
      }
      if (!isApproachingArmySelected && this.kingdom.supply.approachingArmyCard) {
        optionsBuilder.setApproachingArmyCardId(this.kingdom.supply.approachingArmyCard.id);
      }

      // Either set a specific card type or add supply card requirements if one isn't selected.
      if (params.selectedCardType) {
        optionsBuilder.setRequireSingleCardOfType(params.selectedCardType);
      } else {
        optionsBuilder
          .setRequireActionProvider(randomizerSettings.requireActionProvider)
          .setRequireCardProvider(randomizerSettings.requireCardProvider)
          .setRequireBuyProvider(randomizerSettings.requireBuyProvider)
          .setRequireTrashing(randomizerSettings.requireTrashing)
          .setRequireReactionIfAttacks(randomizerSettings.requireReaction)
      }
      //console.log("RANDOMIZE_SUPPLY_CARD optionsBuilder", optionsBuilder)
      const supply = Randomizer.createSupplySafe(optionsBuilder.build(), rA.randomizationTrackingData(this));
      //console.log("RANDOMIZE_SUPPLY_CARD supply", supply)
      if (supply) {
        const oldKingdom = this.kingdom;
        const newAlly = rA.randomizeSelectedAlly(this, supply)
        const newProphecy = rA.randomizeSelectedProphecy(this, supply)
        const addonsForAdjustement ={ 
          events: oldKingdom.events, landmarks: oldKingdom.landmarks, 
          projects: oldKingdom.projects, ways: oldKingdom.ways, 
          allies: newAlly ? [newAlly] : [], 
          prophecies: newProphecy ? [newProphecy] : [], 
          traits:  oldKingdom.traits 
        } as unknown as Addons;
        const adjustedSupplyCards = Randomizer.adjustSupplyBasedOnAddons(supply, 
          addonsForAdjustement, oldKingdom); 
        const kingdom = new Kingdom(
          oldKingdom.id, adjustedSupplyCards, oldKingdom.events, oldKingdom.landmarks, oldKingdom.projects,
          oldKingdom.ways, rA.randomizeSelectedBoons(this, supply),
          newAlly, rA.randomizeSelectedProphecy(this, supply), 
          oldKingdom.traits, oldKingdom.metadata);
        this.CLEAR_SELECTION();
        EventTracker.trackEvent(EventType.RANDOMIZE_SINGLE, rA.randomizationTrackingData(this));
        this.UPDATE_KINGDOM(kingdom, 'randomize_partial');
      } else {
        EventTracker.trackError(EventType.RANDOMIZE_SINGLE, rA.randomizationTrackingData(this));
      }
    },
    REPLACE_SPECIFYING_CARD(selectedCard: SupplyCard) {
      //console.log(new Date().toLocaleTimeString(), 'REPLACE_SPECIFYING_CARD', selectedCard)
      if (!this.specifyingReplacementSupplyCard) return;  
      //console.log(this.specifyingReplacementSupplyCard)

      const oldKingdom = this.kingdom;
      const unselectedCards = rA.getUnselectedSupplyCards(this).filter(c => c.id !== this.specifyingReplacementSupplyCard.id);
      const includeCardIds = Cards.extractIds(unselectedCards).concat(selectedCard.id);

      const options = new RandomizerOptionsBuilder()
        .setSetIds(rA.getSelectedSetIds(this))
        .setIncludeCardIds(includeCardIds)
        .setExcludeCardIds([])
        .setExcludeTypes(rA.getExcludeTypes(this))
        .setUseAlchemyRecommendation(this.settings.randomizerSettings.isAlchemyRecommendationEnabled)
        .build();

      const newSupply = Randomizer.createSupply(options);
      const newAlly = rA.randomizeSelectedAlly(this, newSupply)
      const newProphecy = rA.randomizeSelectedProphecy(this, newSupply)
      const addonsForAdjustement = { 
        events: oldKingdom.events, landmarks: oldKingdom.landmarks, 
        projects: oldKingdom.projects, ways: oldKingdom.ways, 
        allies: newAlly ? [newAlly] : [], 
        prophecies: newProphecy ? [newProphecy] : [], 
        traits:  oldKingdom.traits 
      } as unknown as Addons;
      const adjustedSupplyCards = Randomizer.adjustSupplyBasedOnAddons(newSupply, addonsForAdjustement, oldKingdom);
      const kingdom = new Kingdom(
        oldKingdom.id, adjustedSupplyCards, oldKingdom.events, oldKingdom.landmarks, oldKingdom.projects,
        oldKingdom.ways, rA.randomizeSelectedBoons(this, newSupply),
        newAlly, rA.randomizeSelectedProphecy(this, newSupply), 
        oldKingdom.traits, oldKingdom.metadata);
      this.CLEAR_SELECTION();
      EventTracker.trackEvent(EventType.RANDOMIZE_SINGLE, rA.randomizationTrackingData(this));
      this.UPDATE_KINGDOM(kingdom, 'randomize_partial');
    },
    REPLACE_SPECIFYING_ADDON(selectedAddon: Addon) {
      //console.log(new Date().toLocaleTimeString(), 'REPLACE_SPECIFYING_ADDON', selectedAddon)
      if (!this.specifyingReplacementAddon) return;
      const oldKingdom = this.kingdom;

      const getUnselectedAddons = (list: Addon[]) => list.filter(a => a.id !== this.specifyingReplacementAddon!.id);

      const newEvents = getUnselectedAddons(oldKingdom.events);
      const newLandmarks = getUnselectedAddons(oldKingdom.landmarks);
      const newProjects = getUnselectedAddons(oldKingdom.projects);
      const newWays = getUnselectedAddons(oldKingdom.ways);
      const newTraits = getUnselectedAddons(oldKingdom.traits);
      const newAlly = (oldKingdom.ally && oldKingdom.ally.id === this.specifyingReplacementAddon.id)
        ? null : oldKingdom.ally;
      const newProphecy = (oldKingdom.prophecy && oldKingdom.prophecy.id === this.specifyingReplacementAddon.id)
        ? null : oldKingdom.prophecy;

      const addonList: Addon[] = [...newEvents, ...newLandmarks, ...newProjects, ...newWays, ...newTraits];
      if (newAlly) addonList.push(newAlly);
      if (newProphecy) addonList.push(newProphecy);
      addonList.push(selectedAddon);

      const addonsForAdjustement = { 
        events: Cards.getAllEvents(addonList), 
        landmarks: Cards.getAllLandmarks(addonList), 
        projects: Cards.getAllProjects(addonList), 
        ways: Cards.getAllWays(addonList), 
        allies: Cards.getAllAllies(addonList), 
        prophecies: Cards.getAllProphecies(addonList), 
        traits: Cards.getAllTraits(addonList)
      } as unknown as Addons;

      const adjustedSupplyCards = Randomizer.adjustSupplyBasedOnAddons(oldKingdom.supply, 
        addonsForAdjustement, oldKingdom); 

      const kingdom = new Kingdom(
        oldKingdom.id, adjustedSupplyCards, addonsForAdjustement.events, addonsForAdjustement.landmarks, addonsForAdjustement.projects, addonsForAdjustement.ways, 
        oldKingdom.boons, addonsForAdjustement.allies[0] || null, addonsForAdjustement.prophecies[0] || null, addonsForAdjustement.traits, oldKingdom.metadata);
      this.CLEAR_SELECTION();
      EventTracker.trackEvent(EventType.RANDOMIZE_SINGLE, rA.randomizationTrackingData(this));
      this.UPDATE_KINGDOM(kingdom, 'randomize_partial');
    },
    RANDOMIZE_ADDON(params: { selectedSetId: SetId | null, selectedAddonType: Addons_TYPE | null }) {
      //console.log(new Date().toLocaleTimeString(), 'RANDOMIZE_ADDON', params)
      if (!this.specifyingReplacementAddon) return;

      //console.log("RANDOMIZE_ADDON", this.specifyingReplacementAddon)
      
      const selectedAddonsCount = this.selection.selectedAddonIds.length
/*
        + (this.selection.selectedAllyId ? 1 : 0) 
        + (this.selection.selectedProphecyId ? 1 : 0);
*/

      if (selectedAddonsCount > 0) {
        const newAddons = rA.randomizeSelectedAddons(this, params.selectedSetId, params.selectedAddonType);
        const unselectedAddons = [
          ...rA.getUnselectedEvents(this),
          ...rA.getUnselectedLandmarks(this),
          ...rA.getUnselectedProjects(this),
          ...rA.getUnselectedWays(this),
          ...rA.getUnselectedTraits(this)
        ];
        const unselectedAlly= rA.getUnselectedAlly(this);
        const unselectedProphecy = rA.getUnselectedProphecy(this);
        if (unselectedAlly) unselectedAddons.push(unselectedAlly);
        if (unselectedProphecy) unselectedAddons.push(unselectedProphecy); 
        //console.log("newAddons", newAddons)
        //console.log("unselectedAddons", unselectedAddons)
        const allNewAddons = newAddons.concat(unselectedAddons);
        const addonsForAdjustement = {
          events: Cards.getAllEvents(allNewAddons),
          landmarks: Cards.getAllLandmarks(allNewAddons),
          projects: Cards.getAllProjects(allNewAddons),
          ways: Cards.getAllWays(allNewAddons),
          traits: Cards.getAllTraits(allNewAddons),
          allies: [rA.getUnselectedAlly(this)].filter(Boolean) as Ally[],
          prophecies: [rA.getUnselectedProphecy(this)].filter(Boolean) as Prophecy[]
        } as Addons;

        const adjustedSupply = Randomizer.adjustSupplyBasedOnAddons(this.kingdom.supply, addonsForAdjustement, this.kingdom);
        const kingdom = new Kingdom(
          this.kingdom.id, adjustedSupply, addonsForAdjustement.events, addonsForAdjustement.landmarks, addonsForAdjustement.projects, addonsForAdjustement.ways, this.kingdom.boons, addonsForAdjustement.allies[0] || null, addonsForAdjustement.prophecies[0] || null, addonsForAdjustement.traits, this.kingdom.metadata);
        this.CLEAR_SELECTION();
        this.UPDATE_KINGDOM(kingdom, 'randomize_partial');
        return;
      }

      const setIdsToUse = params.selectedSetId ? [params.selectedSetId] : rA.getSelectedSetIds(this);
      const setsToSearch = setIdsToUse.map(id => DominionSets.getSetById(id));
      
      let availableAddons: Addon[] = [];
      const currentAddonIds = new Set(this.extendedAddons.map(a => a.id));

      const addonType = getAddonTypeFromId(this.specifyingReplacementAddon.id);
      const typesToConsider = params.selectedAddonType ? [params.selectedAddonType] : getAllowedAddonTypes(addonType);

      for (const set of setsToSearch) {
        if (typesToConsider.includes(Addons_TYPE.EVENT) && set.events) availableAddons.push(...set.events);
        if (typesToConsider.includes(Addons_TYPE.LANDMARK) && set.landmarks) availableAddons.push(...set.landmarks);
        if (typesToConsider.includes(Addons_TYPE.PROJECT) && set.projects) availableAddons.push(...set.projects);
        if (typesToConsider.includes(Addons_TYPE.WAY) && set.ways) availableAddons.push(...set.ways);
        if (typesToConsider.includes(Addons_TYPE.TRAIT) && set.traits) availableAddons.push(...set.traits);
        if (typesToConsider.includes(Addons_TYPE.ALLY) && set.allies) availableAddons.push(...set.allies);
        if (typesToConsider.includes(Addons_TYPE.PROPHECY) && set.prophecies) availableAddons.push(...set.prophecies);
        if (typesToConsider.includes(Addons_TYPE.BOON) && set.boons) availableAddons.push(...set.boons);
      }

      let potentialReplacements = availableAddons.filter(card => !currentAddonIds.has(card.id));

      if (RANDOMIZATION_CONSTRAINT_USE()) {
        const excludedCardIds = new Set(
          setIdsToUse.flatMap(setId => {
            const settingsStore = useSettingsStore();
            const constraints = settingsStore.getSetConstraints(setId);
            return (constraints && constraints.isSelected && constraints.excludedCards) ? constraints.excludedCards : [];
          })
        );
        if (excludedCardIds.size > 0) {
          potentialReplacements = potentialReplacements.filter(card => !excludedCardIds.has(card.id));
        }
      }

      if (potentialReplacements.length > 0) {
        const randomCard = potentialReplacements[Math.floor(Math.random() * potentialReplacements.length)];
        this.REPLACE_SPECIFYING_ADDON(randomCard);
      }
    },
    REPLACE_SPECIFYING_BOON(selectedBoon: Boon) {
      //console.log(new Date().toLocaleTimeString(), 'REPLACE_SPECIFYING_BOON')
      //if (!this.specifyingReplacementBoon) return;
      const oldKingdom = this.kingdom;
      //const newBoons = oldKingdom.boons.map(x => x.id === this.specifyingReplacementBoon.id ? selectedBoon : x);
      const newBoons = oldKingdom.boons 
      const kingdom = new Kingdom(
        oldKingdom.id, oldKingdom.supply, oldKingdom.events, oldKingdom.landmarks, oldKingdom.projects,
        oldKingdom.ways, newBoons, oldKingdom.ally, oldKingdom.prophecy, oldKingdom.traits, oldKingdom.metadata);
      this.CLEAR_SELECTION();
      EventTracker.trackEvent(EventType.RANDOMIZE_SINGLE, rA.randomizationTrackingData(this));
      this.UPDATE_KINGDOM(kingdom, 'randomize_partial');
    },
    RANDOMIZE_UNDEFINED_ADDON() {
      //console.log(new Date().toLocaleTimeString(), 'RANDOMIZE_UNDEFINED_ADDON')
      const addons = rA.randomizeUndefinedAddon(this).concat(rA.getAddons(this));
      const kingdom = new Kingdom(
        this.kingdom.id,
        this.kingdom.supply,
        Cards.getAllEvents(addons),
        Cards.getAllLandmarks(addons),
        Cards.getAllProjects(addons),
        Cards.getAllWays(addons),
        this.kingdom.boons,
        this.kingdom.ally,
        this.kingdom.prophecy,
        Cards.getAllTraits(addons),
        this.kingdom.metadata);
      this.UPDATE_KINGDOM(kingdom, 'randomize_partial');
    },
    TOGGLE_CARD_SELECTION(id: string) {
      //console.log('TOGGLE_CARD_SELECTION - ' + id)
      const action = this.selection.contains(id) ? this.UNSELECT_CARD(id) : this.SELECT_CARD(id);
    },
    SELECT_CARD(id: string) {
      //console.log('SELECT_CARD - ' + id)
      if (this.selection.contains(id)) {
        return;
      }
      const selection = this.selection;
      const card = DominionSets.getCardById(id);
      if (card instanceof SupplyCard) {
        this.UPDATE_SELECTION({
          selectedSupplyIds: selection.selectedSupplyIds.concat([id])
        } as SelectionParams);
      } else if (card instanceof Boon) {
        this.UPDATE_SELECTION({
          selectedBoonIds: selection.selectedBoonIds.concat([id])
        } as SelectionParams);
      } else if (card instanceof Ally) {
        this.UPDATE_SELECTION({ selectedAllyId: id });
      } else {
        this.UPDATE_SELECTION({
          selectedAddonIds: selection.selectedAddonIds.concat([id])
        } as SelectionParams);
      }
    },
    UNSELECT_CARD(id: string) {
      //console.log('UNSELECT_CARD - ' + id)
      if (!this.selection.contains(id)) {
        return;
      }
      const selection = this.selection;
      const card = DominionSets.getCardById(id);
      const filterFn = (existingId: string) => existingId != id;
      if (card instanceof SupplyCard) {
        this.UPDATE_SELECTION({
          selectedSupplyIds: selection.selectedSupplyIds.filter(filterFn)
        } as SelectionParams);
      } else if (card instanceof Boon) {
        this.UPDATE_SELECTION({
          selectedBoonIds: selection.selectedBoonIds.filter(filterFn)
        } as SelectionParams);
      } else if (card instanceof Ally) {
        this.UPDATE_SELECTION({ selectedAllyId: null });
      } else {
        this.UPDATE_SELECTION({
          selectedAddonIds: selection.selectedAddonIds.filter(filterFn)
        } as SelectionParams);
      }
    }
  }
});
