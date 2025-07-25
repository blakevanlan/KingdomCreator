import '../utils/console-utils';
// to allow console.info to be control by Console.info' == 'true' in sessionStorage

import type { Addon, Addons } from "../dominion/addon";
import { Addons_TYPE } from "../dominion/addon";
import { CardSupplyBan } from "./card-supply-ban";
import { CostSupplyBan } from "./cost-supply-ban";
import { CostSupplyDivider } from "./cost-supply-divider";
import { CardType } from "../dominion/card-type";
import { Cards } from "../utils/cards";
import { DominionSet } from "../dominion/dominion-set";
import { DominionSets } from "../dominion/dominion-sets";
import { Event } from "../dominion/event"
import { Kingdom } from "./kingdom";
import { Landmark } from "../dominion/landmark"
import { Metadata as KingdomMetadata } from "./kingdom";
import { Project } from "../dominion/project"
import type { RandomizerOptions } from "./randomizer-options";
import { initializeExcludedCardIds } from './randomizer-options'
import { SetId, SETS_WITH_DUPLICATES } from "../dominion/set-id";
import { SetSupplyBan } from "./set-supply-ban";
import { SetSupplyDivider } from "./set-supply-divider";
import { Supply, Replacements } from "./supply";
import { SupplyBuilder } from "./supply-builder";
import type { SupplyCard } from "../dominion/supply-card";
import { SupplyDivisions } from "./supply-divisions";
import { TypeSupplyBan } from "./type-supply-ban";
import { TypeSupplyRequirement } from "./type-supply-requirement";
import { getRandomInt, getRandomInts, selectRandomN } from "../utils/rand";
import type { Boon } from "../dominion/boon";
import { Way } from "../dominion/way";
import { Ally } from "../dominion/ally";
import { Trait } from "../dominion/trait";
import { Prophecy } from "../dominion/prophecy";
import { DRUID_ID, BOONS_NB_FROM_DRUID } from "./special-need-cards";
import { APPROACHINGARMY_ID, APPROACHINGARMY_CARDTYPE_REQUESTED } from "./special-need-cards";
import { OBELISK_LANDMARK_ID, OBELISK_CARDTYPE_REQUESTED } from "./special-need-cards";
import { MOUSE_WAY_ID, MOUSE_MIN_COST, MOUSE_MAX_COST } from "./special-need-cards";
import { TRAITS_CARDTYPE_POSSIBILITY_1, TRAITS_CARDTYPE_POSSIBILITY_2 } from "./special-need-cards";
import { NUM_CARDS_IN_KINGDOM, MAX_ADDONS_IN_KINGDOM, FORCE_ADDONS_USE, MAX_ADDONS_OF_TYPE } from "../settings/Settings-value";

import { EventTracker, EventType } from "../analytics/follow-activity";

import { getActivePinia } from 'pinia'; // Import Pinia
import { useRandomizerStore } from '../pinia/randomizer-store';

const MAX_RETRIES = 3;

// Alchemy constants.
const MIN_ALCHEMY_CARDS_IN_KINGDOM = 3;
const MAX_ALCHEMY_CARDS_IN_KINGDOM = 5;

// Cost distribution constants.
const HIGH_COST_CUT_OFF = 5;
const MIN_HIGH_CARDS_IN_KINGDOM = 3;
const MAX_HIGH_CARDS_IN_KINGDOM = 5;


// Prioritize set constants.
const NUM_PRIORITIZED_SET = 5;

let SavedSetIds :SetId[] = [];
let ExcludedCardIds : string[] = [];

export class Randomizer {
  static createKingdom(randomizerOptions: RandomizerOptions): Kingdom {
    const supply = this.createSupplyWithRetries(randomizerOptions);
    console.info('[Randomizer - createKingdom]: final supplies selected', supply.supplyCards.map(c=>c.id));
    this.storeSetToUse(randomizerOptions.setIds)
    const addons = this.getAddons(randomizerOptions.setIds);
    console.info('[Randomizer - createKingdom]: radomized addons', addons.events.map(c=>c.id), addons.landmarks.map(c=>c.id), addons.projects.map(c=>c.id), addons.ways.map(c=>c.id), addons.traits.map(c=>c.id));
    const boons = this.getRandomBoons(supply, []);
    const ally = this.getRandomAlly(supply);
    if (ally) addons.allies.push(ally)
    const prophecy = this.getRandomProphecy(supply);
    if (prophecy) addons.prophecies.push(prophecy)
    const adjustedSupplyCards = this.adjustSupplyBasedOnAddons(supply, addons, 
      new Kingdom(0, new Supply([], null, null, null, null, null, null, [], Replacements.empty()),
          [], [], [], [], [], null, null, [], new KingdomMetadata(false, false)));
    const metadata = this.getMetadata(randomizerOptions.setIds);
    return new Kingdom(
      Date.now(),          /* id: number,  */
      adjustedSupplyCards, /* supply: Supply, */
      addons.events,       /* events: Event[], */
      addons.landmarks,    /* landmarks: Landmark[], */
      addons.projects,     /* projects: Project[], */
      addons.ways,         /* ways: Way[], */
      boons,               /* boons: Boon[], */
      ally,                /* ally: Ally | null, */
      prophecy,            /* prophecy: Propehcy | null, */
      addons.traits,       /* Traits: Trait */
      metadata);           /* metadata: Metadata */
  }

  static storeSetToUse(sets : SetId []) {
    SavedSetIds = sets;
    ExcludedCardIds = initializeExcludedCardIds(SavedSetIds, []);
  }
  static excludedCardIds() : string[] {
    return ExcludedCardIds
  }
  static setsToUse() : DominionSet[] {
    if(!SavedSetIds.length) {
      const activePinia = getActivePinia();
      if (activePinia) {
        // Pinia store is initialized
        const randomizerStore = useRandomizerStore();
        this.storeSetToUse(randomizerStore.settings.selectedSets)
      } else
        this.storeSetToUse(DominionSets.getAllSetsIds())
    }
    return Cards.filterSetsByAllowedSetIds(DominionSets.getAllSets(), SavedSetIds);
  }

  static createSupplySafe(randomizerOptions: RandomizerOptions): Supply | null {
    try {
      return this.createSupplyWithRetries(randomizerOptions);
    } catch (error) {
      if (typeof error === 'object' && error !== null) {
        console.log(`Failed to create supply: \n${error.toString()}`);
        EventTracker.trackError(EventType.RANDOMIZE_MULTIPLE_SUPPLY, { message: error.toString() });
        alert(`Failed to create supply: \n${error.toString()}`)
      }
      else
        console.log(`Failed to create supply: \n error is not an object`);
      return null;
    }
  }

  static createSupplyWithRetries(randomizerOptions: RandomizerOptions): Supply {
    let retries = MAX_RETRIES;
    let localError:string [] = []
    while (retries > 0) {
      try {
        return this.createSupply(randomizerOptions);
      } catch (error) {
        if (typeof error === 'object' && error !== null) {
          //console.log(`Error when trying to select cards: \n${error.toString()}`);
          if (!localError.includes(error.toString()))
            localError.push(error.toString())
        }
        else
          console.log(`Error when trying to select cards: \n error is not an object`);
        retries -= 1;
      }
    }
    if (localError.length) 
      throw new Error(`Failed to create Supply that satisfied all requirements: \n${localError.join("\n")}`);
    throw new Error("Failed to create Supply that satisfied all requirements.");
  }

  static createSupply(randomizerOptions: RandomizerOptions): Supply {
    console.info('[Randomizer - createSupply] Creating supply with options:', randomizerOptions);
    const allSupplyCards =
      Cards.getAllSupplyCards(Cards.getAllCardsFromSets(DominionSets.getAllSets()));
    const allSupplyCardsToUse =
      this.removeDuplicateCards(
        allSupplyCards.filter(Cards.filterByIncludedSetIds(randomizerOptions.setIds)), []);
    console.info('[Randomizer - createSupply] Candidate cards after set filtering:', allSupplyCardsToUse.map(c => c.id));
    let supplyBuilder = new SupplyBuilder(allSupplyCardsToUse);
    // Set the bane card, the ferryman card, the mouseway card , the riverboat card
    //if supplyed in the options and remove it from the pool of 
    // available cards.
    if (randomizerOptions.baneCardId) {
      console.info('[Randomizer - createSupply] Forced bane card:', randomizerOptions.baneCardId);
      supplyBuilder.setBaneCard(
        DominionSets.getSupplyCardById(randomizerOptions.baneCardId));
      supplyBuilder.addBan(new CardSupplyBan([randomizerOptions.baneCardId]));
    }
    if (randomizerOptions.ferrymanCardId) {
      console.info('[Randomizer - createSupply] Forced ferryman card:', randomizerOptions.ferrymanCardId);
      supplyBuilder.setFerrymanCard(
        DominionSets.getSupplyCardById(randomizerOptions.ferrymanCardId));
      supplyBuilder.addBan(new CardSupplyBan([randomizerOptions.ferrymanCardId]));
    }
    if (randomizerOptions.mousewayCardId) {
      console.info('[Randomizer - createSupply] Forced mouseway card:', randomizerOptions.mousewayCardId);
      supplyBuilder.setMousewayCard(
        DominionSets.getSupplyCardById(randomizerOptions.mousewayCardId));
      supplyBuilder.addBan(new CardSupplyBan([randomizerOptions.mousewayCardId]));
    }
    if (randomizerOptions.obeliskCardId) {
      console.info('[Randomizer - createSupply] Forced obelisk card:', randomizerOptions.obeliskCardId);
      supplyBuilder.setObeliskCard(
        DominionSets.getSupplyCardById(randomizerOptions.obeliskCardId));
      supplyBuilder.addBan(new CardSupplyBan([randomizerOptions.obeliskCardId]));
    }
    if (randomizerOptions.riverboatCardId) {
      console.info('[Randomizer - createSupply] Forced riverboat card:', randomizerOptions.riverboatCardId);
      supplyBuilder.setRiverboatCard(
        DominionSets.getSupplyCardById(randomizerOptions.riverboatCardId));
      supplyBuilder.addBan(new CardSupplyBan([randomizerOptions.riverboatCardId]));
    }
    if (randomizerOptions.approachingArmyCardId) {
      console.info('[Randomizer - createSupply] Forced Approaching Army card:', randomizerOptions.approachingArmyCardId);
      supplyBuilder.setApproachningArmyCard(
        DominionSets.getSupplyCardById(randomizerOptions.approachingArmyCardId));
      supplyBuilder.addBan(new CardSupplyBan([randomizerOptions.approachingArmyCardId]));
    }

    // Configure bans.
    if (randomizerOptions.excludeCardIds.length) {
      console.info('[Randomizer - createSupply] Cards to replace:', randomizerOptions.excludeCardIds);
      supplyBuilder.addBan(new CardSupplyBan(randomizerOptions.excludeCardIds));
    }
    if (randomizerOptions.excludeTypes.length) {
      console.info('[Randomizer - createSupply] Excluded types:', randomizerOptions.excludeTypes);
      supplyBuilder.addBan(new TypeSupplyBan(randomizerOptions.excludeTypes));
    }
    if (randomizerOptions.excludeCosts.length) {
      console.info('[Randomizer - createSupply] Excluded costs:', randomizerOptions.excludeCosts);
      supplyBuilder.addBan(new CostSupplyBan(randomizerOptions.excludeCosts));
    }

    // Configure requirements.
    if (randomizerOptions.requireSingleCardOfType) {
      console.info('[Randomizer - createSupply] Requirement: single card of type', randomizerOptions.requireSingleCardOfType);
      supplyBuilder.addRequirement(
        new TypeSupplyRequirement(randomizerOptions.requireSingleCardOfType, true));
    }
    if (randomizerOptions.requireActionProvider) {
      console.info('[Randomizer - createSupply] Requirement: action provider');
      supplyBuilder.addRequirement(new TypeSupplyRequirement(CardType.ACTION_SUPPLIER, false));
    }
    if (randomizerOptions.requireCardProvider) {
      console.info('[Randomizer - createSupply] Requirement: card provider');
      supplyBuilder.addRequirement(new TypeSupplyRequirement(CardType.MULTI_DRAWER, false));
    }
    if (randomizerOptions.requireBuyProvider) {
      console.info('[Randomizer - createSupply] Requirement: buy provider');
      supplyBuilder.addRequirement(new TypeSupplyRequirement(CardType.BUY_SUPPLIER, false));
    }
    if (randomizerOptions.requireTrashing) {
      console.info('[Randomizer - createSupply] Requirement: trashing');
      supplyBuilder.addRequirement(new TypeSupplyRequirement(CardType.TRASHING, false));
    }

    // Configure dividers.
    let remainingCards = NUM_CARDS_IN_KINGDOM();

    if (randomizerOptions.prioritizeSet && randomizerOptions.prioritizeSet != SetId.ALCHEMY) {
      console.info('[Randomizer - createSupply] Prioritized set:', randomizerOptions.prioritizeSet);
      supplyBuilder.addDivider(
        new SetSupplyDivider(randomizerOptions.prioritizeSet, NUM_PRIORITIZED_SET));
      remainingCards -= NUM_PRIORITIZED_SET;
    }

    // Add the Alchemy divider if "+3 Alchemy cards" is selected or
    // if Alchemy set is prioritized or randomly (1 chance out of number of sets)
    if (this.shouldUseAlchemyDivider(randomizerOptions)) {
      // Determine the number of Alchemy cards to use.
      const alchemyCardsToUse = this.getNumberOfAlchemyCardsToUse(randomizerOptions, remainingCards);
      console.info('[Randomizer - createSupply] Using Alchemy divider, number of cards:', alchemyCardsToUse);
      supplyBuilder.addDivider(new SetSupplyDivider(SetId.ALCHEMY, alchemyCardsToUse));
      remainingCards -= alchemyCardsToUse;
    }
    // if not banning all Alchemy cards to respect the recommendation 3 to 5 alchemy cards
    else if (randomizerOptions.setIds.length > 1) {
      console.info('[Randomizer - createSupply] Ban all Alchemy sets');
      supplyBuilder.addBan(new SetSupplyBan([SetId.ALCHEMY]));
    }

    let highCardsInKingdom = -1;
    if (randomizerOptions.distributeCost) {
      highCardsInKingdom =
        getRandomInt(MIN_HIGH_CARDS_IN_KINGDOM, MAX_HIGH_CARDS_IN_KINGDOM);
      console.info('[Randomizer - createSupply] Cost distribution, highCardsInKingdom:', highCardsInKingdom);
      supplyBuilder.addDivider(new CostSupplyDivider(HIGH_COST_CUT_OFF, highCardsInKingdom));
    }

    const existingCards =
      randomizerOptions.includeCardIds.map((id) => DominionSets.getSupplyCardById(id));
    console.info('[Randomizer - createSupply] build Supply With Retries, Cards to keep:', existingCards.map(c => c.id));
    console.info('[Randomizer - createSupply] supplyBuilder:', supplyBuilder);
    let supply = this.buildSupplyWithRetries(supplyBuilder, existingCards);
    console.info('[Randomizer - createSupply] build Supply With Retries, Cards selected:', supply.supplyCards.map(c => c.id).sort());
    // TODO: This is ugly and should ultimately be handled in the supply builder. Perhaps
    // include a rewinding or merging if the divisions become invalid?
    
    if (randomizerOptions.requireReactionIfAttacks) {
      const correctedSupplyBuilder =
        this.correctSupplyBuilderForRequiredReaction(
          supplyBuilder, existingCards, supply.supplyCards);
      if (correctedSupplyBuilder) {
        console.info('[Randomizer - createSupply] Correction: supplyBuilder adjusted for required reaction if attacks.');
        supplyBuilder = correctedSupplyBuilder;
        console.info('[Randomizer - createSupply] Correct Supply for Reaction, Cards to keep:', existingCards.map(c => c.id).sort());
        console.log(supplyBuilder)
        supply = this.buildSupplyWithRetries(supplyBuilder, existingCards);
        console.info('[Randomizer - createSupply] Correct Supply for Reaction, Cards selected:', supply.supplyCards.map(c => c.id).sort());
      }
    }
    return supply;
  }

  private static getAddons(setIds: SetId[]): Addons {
    const setsToUse = Cards.filterSetsByAllowedSetIds(DominionSets.getAllSets(), setIds);
    // ajout des exclusions/
    const excludedCardIds = initializeExcludedCardIds(setIds, []);
    const cards = this.removeDuplicateCards(Cards.getAllCardsFromSets(setsToUse)
        .filter(card => !excludedCardIds.includes(card.id)) as SupplyCard[],[]);
    if (FORCE_ADDONS_USE()) {
        console.info('[Randomizer - getAddons] Cards candidate - FORCE_ADDONS_USE:', (cards.filter(card => (card instanceof Event)||(card instanceof Landmark)||
            (card instanceof Project)||(card instanceof Way)||(card instanceof Trait))).map(c => c.id));
    } else {
        console.info('[Randomizer - getAddons] Cards candidate:', (cards).map(c => c.id));
    }
    const selectedCards = FORCE_ADDONS_USE() ? 
        this.selectRandomCards(cards.filter(card => (card instanceof Event)||(card instanceof Landmark)||
        (card instanceof Project)||(card instanceof Way)||(card instanceof Trait)), 2*MAX_ADDONS_IN_KINGDOM())
        : this.selectRandomCards(cards, 2*NUM_CARDS_IN_KINGDOM());
    console.info('[Randomizer - getAddons] Selected cards:', selectedCards.map(c => c.id));
    const selectedEvents: Event[] = [];
    const selectedLandmarks: Landmark[] = [];
    const selectedProjects: Project[] = [];
    const selectedWays: Way[] = [];
    const selectedAllies: Ally[] = [];
    const selectedTraits: Trait[] = [];
    const selectedProphecies: Prophecy[] = [];

    for (const card of selectedCards) {
      if (card instanceof Event) {
        if (selectedEvents.length < MAX_ADDONS_OF_TYPE(Addons_TYPE.EVENT)) selectedEvents.push(card);
      } else if (card instanceof Landmark) {
        if (selectedLandmarks.length < MAX_ADDONS_OF_TYPE(Addons_TYPE.LANDMARK)) selectedLandmarks.push(card);
      } else if (card instanceof Project) {
        if (selectedProjects.length < MAX_ADDONS_OF_TYPE(Addons_TYPE.PROJECT)) selectedProjects.push(card);
      } else if (card instanceof Way) {
        if (selectedWays.length < MAX_ADDONS_OF_TYPE(Addons_TYPE.WAY)) selectedWays.push(card);
      } else if (card instanceof Trait) {
        if (selectedTraits.length < MAX_ADDONS_OF_TYPE(Addons_TYPE.TRAIT)) selectedTraits.push(card)
      } 
      // Stop once the maximum number of addons has been reached.
      const addonCount = selectedEvents.length
        + selectedLandmarks.length
        + selectedProjects.length
        + selectedWays.length
        //  + selectedAllies.length
        + selectedTraits.length;
      if (addonCount >= MAX_ADDONS_IN_KINGDOM()) {
        console.info('[Randomizer - getAddons] Reached maximum number of addons:', addonCount);
        break;
      }
    }

    console.info("[Randomizer - getAddons] Final Addon Cards selected:", 
                  selectedEvents.map(c=>c.id), 
                  selectedLandmarks.map(c=>c.id), 
                  selectedProjects.map(c=>c.id), 
                  selectedWays.map(c=>c.id), 
                  selectedTraits.map(c=>c.id))

    return {
      events: selectedEvents,
      landmarks: selectedLandmarks,
      projects: selectedProjects,
      ways: selectedWays,
      allies: selectedAllies,
      prophecies: selectedProphecies,
      traits: selectedTraits,
    };
  }

  static getRandomAddons(setIds: SetId[], excludeIds: string[], numberOfAddons: number): Addon[] {
    const addons = this.getAddonsFromSets(setIds, excludeIds);
    return this.selectRandomCards(addons, numberOfAddons);
  }

  static getAddonsFromSets(setIds: SetId[], excludeIds: string[]): Addon[] {
    const setsToUse = Cards.filterSetsByAllowedSetIds(DominionSets.getAllSets(), setIds);
    const cards = Cards.getAllCardsFromSets(setsToUse).filter(Cards.filterByExcludedIds(excludeIds));
    const events = Cards.getAllEvents(cards) as Addon[];
    const landmarks = Cards.getAllLandmarks(cards) as Addon[];
    const projects = Cards.getAllProjects(cards) as Addon[];
    const ways = Cards.getAllWays(cards) as Addon[];
    //const allies = Cards.getAllAllies(cards) as Addon[];
    const traits = Cards.getAllTraits(cards) as Addon[];
    //const prophecies = Cards.getAllProphecies(cards) as Addon[];

    //return events.concat(landmarks, projects, ways, allies, prophecies, traits);
    return events.concat(landmarks, projects, ways, traits);
  }

  static getRandomBoons(supply: Supply, keepBoons: Boon[]) {
    if (!supply.supplyCards.some((s) => s.id == DRUID_ID)) {
      return [];
    }
    const excludeIds = Cards.extractIds(keepBoons);
    const cards = Cards.getAllCardsFromSets(this.setsToUse())
        .filter(card => !this.excludedCardIds().includes(card.id)); 
    const boons = Cards.getAllBoons(cards).filter(Cards.filterByExcludedIds(excludeIds));
    return selectRandomN(boons, BOONS_NB_FROM_DRUID - excludeIds.length).concat(keepBoons);
  }

  static getRandomAlly(supply: Supply, skipAllyId: string | null = null): Ally | null {
    if (supply.supplyCards.every((s) => !s.isLiaison)) {
      return null;
    }
    const cards = Cards.getAllCardsFromSets(this.setsToUse())
        .filter(card => !this.excludedCardIds().includes(card.id)); 
    const allies = Cards.getAllAllies(cards).filter(Cards.filterByExcludedIds(skipAllyId ? [skipAllyId] : []));
    return selectRandomN(allies, 1)[0];
  }

  static getRandomProphecy(supply: Supply, skipProphecyId: string | null = null): Prophecy | null {
    if (supply.supplyCards.every((s) => !s.isOmen)) { 
      return null;
    }
    const cards = Cards.getAllCardsFromSets(this.setsToUse())
        .filter(card => !this.excludedCardIds().includes(card.id)); 
    const prophecies = Cards.getAllProphecies(cards).filter(Cards.filterByExcludedIds(skipProphecyId ? [skipProphecyId] : []));
    return selectRandomN(prophecies, 1)[0];
  }

  static getMetadata(setIds: SetId[]) {
    const setsToUse = Cards.filterSetsByAllowedSetIds(DominionSets.getAllSets(), setIds);
    const useColonies = this.shouldUseSpecialtyCardFromSet([SetId.PROSPERITY, SetId.PROSPERITY_2, SetId.PROSPERITY_2_ADD], setsToUse);
    const useShelters = this.shouldUseSpecialtyCardFromSet([SetId.DARK_AGES], setsToUse);
    return new KingdomMetadata(useColonies, useShelters);
  }

  static adjustSupplyBasedOnAddons(supply: Supply, Localaddons :Addons, oldkingdom: Kingdom) {
    // to add obeliskCard
    let calculatedObeliskCard = null;
    if (Localaddons.landmarks.some(landmark => DominionSets.getLandmarkById(OBELISK_LANDMARK_ID).id === landmark.id)) {
      if (!supply.obeliskCard) {
        const onlyActionSupply = supply.supplyCards.filter(card => card.isOfType(OBELISK_CARDTYPE_REQUESTED));
        calculatedObeliskCard = this.selectRandomCards(onlyActionSupply, 1)[0]
      } else {
        calculatedObeliskCard=supply.obeliskCard
      }
    }

    // to add mouseWayCard
    let calculatedmouseWayCard = null;
    let localReplacements = supply.replacements;
    if (Localaddons.ways.some(way => DominionSets.getWayById(MOUSE_WAY_ID).id === way.id)) {
      if(!supply.mouseWay) {
        const candidateCards = supply.replacements
          .getReplacementsForId(supply.supplyCards[0].id)
          .filter(card => {
            return card.cost.debt == 0 &&
              card.cost.potion == 0 &&
              card.cost.treasure <= MOUSE_MAX_COST &&
              card.cost.treasure >= MOUSE_MIN_COST;
          });
        const randomIndex = Math.floor(Math.random() * candidateCards.length);
        if (candidateCards.length != 0) {
          calculatedmouseWayCard = candidateCards[randomIndex];
          localReplacements = new Replacements(Replacements.createReplacementByRemoveCards(supply.replacements.replacements, [calculatedmouseWayCard.id]));
        }
      } else {
        calculatedmouseWayCard = supply.mouseWay
      }
    }

    // to add traits Supply
    let calculatedTraitsSupplyCard:SupplyCard[]= []
    let onlyTraitsPossibleSupplies = supply.supplyCards
        .filter(card => (card as SupplyCard).isOfType(TRAITS_CARDTYPE_POSSIBILITY_1) || (card as SupplyCard).isOfType(TRAITS_CARDTYPE_POSSIBILITY_2))
        .filter(card => { return !oldkingdom.supply.traitsSupply.some(trait => trait.id === card.id)});
        // remove supply for already mapped for trait
    if (Localaddons.traits.length > 0) {
      for (const trait of Localaddons.traits) {
        const index = oldkingdom.traits.findIndex((oldtrait) => oldtrait.id === trait.id);
        if (index>=0) {
          // trait unchanged
          if (supply.supplyCards.some(card => card.id === oldkingdom.supply.traitsSupply[index].id)) {
            calculatedTraitsSupplyCard.push(oldkingdom.supply.traitsSupply[index]);
          } else {
            const randomTraitCard = this.selectRandomCards(onlyTraitsPossibleSupplies, 1)[0];
            calculatedTraitsSupplyCard.push(randomTraitCard);
            onlyTraitsPossibleSupplies = onlyTraitsPossibleSupplies.filter((card) => card != randomTraitCard);
            }
        } else {
          const randomTraitCard = this.selectRandomCards(onlyTraitsPossibleSupplies, 1)[0];
          calculatedTraitsSupplyCard.push(randomTraitCard);
          onlyTraitsPossibleSupplies = onlyTraitsPossibleSupplies.filter((card) => card != randomTraitCard);
        }
      }
    }

    // add ATTACK if approachingArmy prophecy is included
    let calculateApproachingArmyCard = null;
    if (Localaddons.prophecies.some(prophecy => DominionSets.getProphecyById(APPROACHINGARMY_ID).id === prophecy.id)) {     
      if (!supply.approachingArmyCard) {
        const candidateCards = [...new Set(Array.from(supply.replacements.replacements.values()).flatMap(cards => cards))]
            .filter(card => !supply.supplyCards.some(supplyCard => supplyCard.id === card.id) 
                    && card.id != supply.baneCard?.id 
                    && card.id != supply.riverboatCard?.id )
            .filter(card => card.isOfType(APPROACHINGARMY_CARDTYPE_REQUESTED))
        // console.log(candidateCards)
        // ugly by definition if No APPROACHINGARMY_CARDTYPE_REQUESTED present
        const randomIndex = Math.floor(Math.random() * candidateCards.length);
        calculateApproachingArmyCard  = candidateCards[randomIndex]
      } else 
        calculateApproachingArmyCard = supply.approachingArmyCard;
    }
    
    const NewSupply = new Supply(
      supply.supplyCards,             /* supply Cards */
      supply.baneCard,                /* bane if needed */
      supply.ferrymanCard,            /* ferryman carrd to add if needed */
      calculatedObeliskCard,          /* obeliskCard if needed */
      calculatedmouseWayCard,         /* mouseWayCard if needed */
      supply.riverboatCard,           /* riverboatCard if needed */
      calculateApproachingArmyCard,     /* approachingArmyCard if needed */
      calculatedTraitsSupplyCard,     /* supply for traits */
      localReplacements
    )
    return NewSupply
  }

  private static shouldUseSpecialtyCardFromSet(setIds: SetId[], setsBeingUsed: DominionSet[]) {
    const indexes = setIds.map((setId) => setsBeingUsed.map((set) => set.setId).indexOf(setId));
    if (indexes.every(element => element == -1)) {
      return false;
    }
    const numberOfSpecialtySetCards = this.removeDuplicateCards(
      indexes
        .filter(val => val !== -1)
        .map((index) => setsBeingUsed[index].supplyCards)
        .reduce((partialSum, a) => partialSum.concat(a), [])
      , []).length
    const numberOfCardsBeingUsed = this.removeDuplicateCards(
      setsBeingUsed
        .map((setBeingUsed) => setBeingUsed.supplyCards)
        .reduce((partialSum, a) => partialSum.concat(a), [])
      , []).length
    const randomIndex = getRandomInt(0, numberOfCardsBeingUsed);
    return randomIndex < numberOfSpecialtySetCards;
  }

  private static selectRandomCards<T>(cards: T[], numberToSelect: number): T[] {
    console.log('[Randomizer] Random selecting',numberToSelect, 'among', cards.length);
    const randomIndices = getRandomInts(numberToSelect, cards.length);
    const selectedCards: T[] = [];
    for (const index of randomIndices) {
      selectedCards.push(cards[index]);
    }
    return selectedCards;
  }

  private static shouldUseAlchemyDivider(randomizerOptions: RandomizerOptions) {
    // Don't use the divider if Alchemy is the only selected set.
    if (randomizerOptions.setIds.length == 1) {
      return false;
    }
    if (randomizerOptions.prioritizeSet == SetId.ALCHEMY) {
      return true;
    }
    if (randomizerOptions.setIds.indexOf(SetId.ALCHEMY) == -1) {
      return false;
    }
    // Now Alchemy Set is selected, but not prioritized.
    
    // If the Alchemy recommendation is enabled, use the divider.
    // This is to respect the recommendation of 3 to 5 Alchemy cards in the kingdom.
    if (randomizerOptions.useAlchemyRecommendation) {
      return true;
    }
    
    if (randomizerOptions.setIds.length < 3) {
      // use the divider if there are less than 3 sets.
      return true;
    }
    // Use the divider randomly if there are at least 3 sets. 
    // Randomly use the divider with a probability of 1 / number of sets.
    const useRandomly = !getRandomInt(0, randomizerOptions.setIds.length);
    return useRandomly;
  }

  private static correctSupplyBuilderForRequiredReaction(
    supplyBuilder: SupplyBuilder, existingCards: SupplyCard[], selectedCards: SupplyCard[])
    : SupplyBuilder | null {
    // Check if the selected cards either have no attacks or have a reaction.
    if (selectedCards.filter(Cards.filterByRequiredType(CardType.REACTION)).length) {
      return null;
    }

    if (!selectedCards.filter(Cards.filterByRequiredType(CardType.ATTACK)).length) {
      return null;
    }

    supplyBuilder = supplyBuilder.clone();
    const divisions = supplyBuilder.createUnfilledDivisions(existingCards);
    const reactions = SupplyDivisions.getAvailableCardsOfType(divisions, CardType.REACTION);

    if (reactions.length) {
      // Add a requirement for a reaction.
      supplyBuilder.addRequirement(new TypeSupplyRequirement(CardType.REACTION, false));
      return supplyBuilder;
    }

    // Ban attacks since there are no available reactions.
    supplyBuilder.addBan(new TypeSupplyBan([CardType.ATTACK]));
    return supplyBuilder;
  }

  private static buildSupplyWithRetries(supplyBuilder: SupplyBuilder, existingCards: SupplyCard[]) {
    let retries = MAX_RETRIES;
    let localError: string[] = [];
    while (retries > 0) {
      try {
        return supplyBuilder.createSupply(existingCards);
      } catch (error) {
        if (typeof error === 'object' && error !== null) {
          //console.log(`Error when trying to select cards: \n${error.toString()}`);
          if (!localError.includes(error.toString()))
            localError.push(error.toString());
        } else 
          console.log(`Error when trying to select cards: \n error is not an object`);
        retries -= 1;
      }
    }
    if (localError.length)
      throw new Error(`Failed to build Supply that satisfied all requirements: \n${localError.join("\n")}`);
    throw new Error("Failed to build Supply that satisfied all requirements.");
  }

  private static getNumberOfAlchemyCardsToUse(
    randomizerOptions: RandomizerOptions, remainingCards: number) {
    let min = MIN_ALCHEMY_CARDS_IN_KINGDOM;
    let max = MAX_ALCHEMY_CARDS_IN_KINGDOM;

    if (randomizerOptions.prioritizeSet == SetId.ALCHEMY) {
      min = Math.max(min, NUM_PRIORITIZED_SET);
      max = Math.max(max, MAX_ALCHEMY_CARDS_IN_KINGDOM);
    }
    return getRandomInt(min, Math.min(max, remainingCards));
  }

  static removeDuplicateCards(cards: SupplyCard[], requiredCardIds: string[]) {
    // Removes duplicate cards (cards appearing in multiple sets); keep setA's version.
    // Cards to keep = (A - [B required as A]) + (B - ([A as B] - B required))
    for (const duplicateSets of SETS_WITH_DUPLICATES) {
      const setA = duplicateSets.id
      const setB = duplicateSets.idv2
      const setACards = cards.filter(Cards.filterByIncludedSetIds([setA]));
      const setBCards = cards.filter(Cards.filterByIncludedSetIds([setB]));

      // B to exclude = ([A as B] - B required))
      const setACardIdsAsSetB = this.replaceSetIdForCards(setACards, setB);
      const setBRequiredCards = setBCards.filter(Cards.filterByIncludedIds(requiredCardIds));
      const setBCardIdsToExclude =
        this.removeIds(setACardIdsAsSetB, Cards.extractIds(setBRequiredCards));

      // B to include = (B - B to exclude)
      const setBCardIdsToInclude =
        this.removeIds(Cards.extractIds(setBCards), setBCardIdsToExclude);

      // A to include = (A - [B required as A])
      const setBRequiredCardIdsAsSetA = this.replaceSetIdForCards(setBRequiredCards, setA);
      const setACardIdsToInclude =
        this.removeIds(Cards.extractIds(setACards), setBRequiredCardIdsAsSetA);

      const setACardsToExclude =
        this.removeIds(Cards.extractIds(setACards), setACardIdsToInclude);
      const setBCardsToExclude =
        this.removeIds(Cards.extractIds(setBCards), setBCardIdsToInclude);

      cards = cards.filter(Cards.filterByExcludedIds(setACardsToExclude));
      cards = cards.filter(Cards.filterByExcludedIds(setBCardsToExclude));
    }
    return cards;
  }

  private static removeIds(ids: string[], idsToRemove: string[]) {
    return ids.filter((id) => idsToRemove.indexOf(id) == -1);
  }

  private static replaceSetIdForCards(cards: SupplyCard[], newSetId: string) {
    const cardIds: string[] = [];
    for (const card of cards) {
      cardIds.push(this.replaceSetIdInCardId(card.id, newSetId));
    }
    return cardIds;
  }

  private static replaceSetIdInCardId(cardId: string, newSetId: string) {
    return newSetId + '_' + cardId.split('_')[1];
  }
}

