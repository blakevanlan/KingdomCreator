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
import { DominionSets } from '@/dominion/dominion-sets';
import { SupplyCard } from '@/dominion/supply-card';
import type { Addon, Addons } from '@/dominion/addon';

import { SetId } from '@/dominion/set-id';
import { CostType } from '@/dominion/cost-type';
import { Boon } from '@/dominion/boon';
import { Ally } from '@/dominion/ally';
import { Randomizer } from '@/randomizer/randomizer';

import { EventTracker } from '@/analytics/follow-activity';
import { EventType } from '@/analytics/follow-activity';
import type { randomizerStoreState } from './randomizer-actions';
import * as rA from './randomizer-actions'; // rA for randomizerActions
import { NUM_CARDS_IN_KINGDOM, FORCE_ADDONS_USE, MAX_ADDONS_IN_KINGDOM, MAX_ADDONS_OF_TYPE } from '@/settings/Settings-value';
import { Addons_TYPE } from '@/dominion/addon';


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
    UPDATE_KINGDOM(kingdom: Kingdom) {
      console.log(new Date().toLocaleTimeString(), "UPDATE_KINGDOM", kingdom)
      EventTracker.trackEvent(EventType.UPDATE_KINGDOM, kingdom)
      this.kingdom = kingdom;
    },
    CLEAR_SELECTION() {
      this.selection = Selection.empty();
      this.specifyingReplacementSupplyCard = (null as any) as SupplyCard;
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
    UPDATE_FULLSCREEN_RANDOMIZER(isFullScreenState: boolean) {
      this.isFullScreen = isFullScreenState;
    },
    LOAD_INITIAL_KINGDOM(initialKingdom: Kingdom | null) {
      console.log(new Date().toLocaleTimeString(), 'LOAD_INITIAL_KINGDOM ', initialKingdom)
      if (initialKingdom) {
        console.log("kingdom is valid : ", NUM_CARDS_IN_KINGDOM())

        // Use the kingdom as-is if it contains the correct number of supply cards.
        //if (initialKingdom.supply.supplyCards.length == 10) {
        if (initialKingdom.supply.supplyCards.length == NUM_CARDS_IN_KINGDOM()
            && initialKingdom.isKingdomValidForAddons()) {
          console.log("kingdom is valid : ", NUM_CARDS_IN_KINGDOM())
          EventTracker.trackEvent(EventType.LOAD_FULL_KINGDOM_FROM_URL);
          this.UPDATE_KINGDOM(initialKingdom);
          return;
        }
        if (initialKingdom.supply.supplyCards.length != NUM_CARDS_IN_KINGDOM()) {
          console.log ("kingdom is not valid ", initialKingdom.supply.supplyCards.length, NUM_CARDS_IN_KINGDOM())
        }
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
        const supply = Randomizer.createSupplySafe(options);
        //console.log(supply)
        
        let addonsForAdjustement ={ 
          events: initialKingdom.events, landmarks: initialKingdom.landmarks, 
          projects: initialKingdom.projects, ways: initialKingdom.ways, 
          allies: [], prophecies: [], traits: initialKingdom.traits
        } as unknown as Addons;

        const enforceAndFillAddons = (actualAddons: Addons) : Addons => {

          // enforce per-type caps
          actualAddons.events = actualAddons.events.slice(0, MAX_ADDONS_OF_TYPE(Addons_TYPE.EVENT));
          actualAddons.landmarks = actualAddons.landmarks.slice(0, MAX_ADDONS_OF_TYPE(Addons_TYPE.LANDMARK));
          actualAddons.projects = actualAddons.projects.slice(0, MAX_ADDONS_OF_TYPE(Addons_TYPE.PROJECT));
          actualAddons.ways = actualAddons.ways.slice(0, MAX_ADDONS_OF_TYPE(Addons_TYPE.WAY));
          actualAddons.traits = actualAddons.traits.slice(0, MAX_ADDONS_OF_TYPE(Addons_TYPE.TRAIT));

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
          EventTracker.trackEvent(EventType.LOAD_PARTIAL_KINGDOM_FROM_URL);
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
console.log("adjustedSupplyCards", addonsForAdjustement)
            kingdom = new Kingdom(
              Date.now(), adjustedSupplyCards, addonsForAdjustement.events, addonsForAdjustement.landmarks,
              addonsForAdjustement.projects, addonsForAdjustement.ways, initialKingdom.boons,
              initialKingdom.ally, initialKingdom.prophecy, addonsForAdjustement.traits, initialKingdom.metadata);
          }
          //console.log("LOAD_PARTIAL_KINGDOM_FROM_URL", kingdom)
          this.CLEAR_SELECTION();
          this.UPDATE_KINGDOM(kingdom);
          return;
        } else {
          EventTracker.trackError(EventType.LOAD_PARTIAL_KINGDOM_FROM_URL);
          //console.log("Error : LOAD_PARTIAL_KINGDOM_FROM_URL - no supplyCards selected")
        }
      }
      // Do a full randomize since we failed to retrieve a kingdom from the URL.
      // clean selection in 
      EventTracker.trackEvent(EventType.RANDOMIZE);
      this.RANDOMIZE();
    },
    RANDOMIZE() {
      console.log(new Date().toLocaleTimeString(), 'RANDOMIZE')
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
      EventTracker.trackEvent(EventType.RANDOMIZE);
      const kingdom = new Kingdom(
        this.kingdom.id, adjustedSupplyCards, newEvents, newLandmarks, newProjects,
        newWays, newBoons, newAlly, newProphecy, newTraits, this.kingdom.metadata);
      this.CLEAR_SELECTION();
      this.UPDATE_KINGDOM(kingdom);
    },

    RANDOMIZE_FULL_KINGDOM() {
      console.log(new Date().toLocaleTimeString(), 'RANDOMIZE_FULL_KINGDOM')
      EventTracker.trackEvent(EventType.RANDOMIZE_FULL_KINGDOM);

      const setIds = rA.getSelectedSetIds(this);
      if (!setIds.length) {
        EventTracker.trackError(EventType.RANDOMIZE_FULL_KINGDOM);
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
        EventTracker.trackEvent(EventType.RANDOMIZE_FULL_KINGDOM);
        const kingdom = Randomizer.createKingdom(options);
        //console.log("RANDOMIZE_FULL_KINGDOM", kingdom)
        this.CLEAR_SELECTION();
        this.UPDATE_KINGDOM(kingdom);
      } catch (error) {
        console.log("Error : RANDOMIZE_FULL_KINGDOM - error generating kingdom")
        if (typeof error === 'object' && error !== null) {
          console.log(`Failed to create supply: \n${error.toString()}`);
          EventTracker.trackError(EventType.RANDOMIZE_FULL_KINGDOM, { message: error.toString() });
          alert(`Failed to create supply: \n${error.toString()}`)
        } else
          console.log(`Failed to create supply: \n error is not an object`);
          EventTracker.trackError(EventType.RANDOMIZE_FULL_KINGDOM)
      }
    },

    RANDOMIZE_SUPPLY_CARD(params: RandomizeSupplyCardParams) {
      console.log(new Date().toLocaleTimeString(), 'RANDOMIZE_SUPPLY_CARD')
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
        .setBaneCardId(this.kingdom.supply.baneCard ? this.kingdom.supply.baneCard.id : null)
        .setObeliskCardId(this.kingdom.supply.obeliskCard ? this.kingdom.supply.obeliskCard.id : null)
        .setFerrymanCardId(this.kingdom.supply.ferrymanCard ? this.kingdom.supply.ferrymanCard.id : null)
        .setMousewayCardId(this.kingdom.supply.mouseWay ? this.kingdom.supply.mouseWay.id : null)
        .setRiverboatCardId(this.kingdom.supply.riverboatCard ? this.kingdom.supply.riverboatCard.id : null)
        .setApproachingArmyCardId(this.kingdom.supply.approachingArmyCard ? this.kingdom.supply.approachingArmyCard.id : null);

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
   
      const supply = Randomizer.createSupplySafe(optionsBuilder.build());

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
        this.UPDATE_KINGDOM(kingdom);
        EventTracker.trackEvent(EventType.RANDOMIZE_SINGLE);
      } else {
        EventTracker.trackError(EventType.RANDOMIZE_SINGLE);
      }
    },
    RANDOMIZE_UNDEFINED_ADDON() {
      console.log(new Date().toLocaleTimeString(), 'RANDOMIZE_UNDEFINED_ADDON')
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
      this.UPDATE_KINGDOM(kingdom);
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

