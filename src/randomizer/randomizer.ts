
// import {SupplyCard} from "../dominion/supply-card";
// import {SupplyBan} from "./supply-ban";
// import {SupplyCorrection} from "./supply-correction";
// import {SupplyDivider} from "./supply-divider";
// import {SupplyRequirement} from "./supply-requirement";

import {CardSupplyBan} from "./card-supply-ban";
import {Cards} from "../utils/cards";
import {CostSupplyBan} from "./cost-supply-ban";
import {CostSupplyDivider} from "./cost-supply-divider";
import {DominionSets} from "../dominion/dominion-sets";
import {Kingdom} from "../models/kingdom";
import {Metadata as KingdomMetadata} from "../models/kingdom";
import {Metadata as SupplyMetadata} from "../models/supply";
import {RandomizerOptions} from "./randomizer-options";
import {ReactionSupplyCorrection} from "./reaction-supply-correction";
import {SetSupplyBan} from "./set-supply-ban";
import {SetSupplyDivider} from "./set-supply-divider";
import {Supply} from "../models/supply";
import {SupplyBuilder} from "./supply-builder";
import {SupplyDivisions} from "./supply-divisions";
import {TypeSupplyBan} from "./type-supply-ban";
import {TypeSupplyRequirement} from "./type-supply-requirement";
import {getRandomInt} from "../utils/rand";

const SETS_WITH_DUPLICATES = {
  'baseset2': 'baseset',
  'intrigue2': 'intrigue'
};

const MAX_RETRIES = 3;

const NUM_CARDS_IN_KINGDOM = 10;

// Alchemy constants.
const MIN_ALCHEMY_CARDS_IN_KINGDOM = 3;
const MAX_ALCHEMY_CARDS_IN_KINGDOM = 5;

// Cost distribution constants
const HIGH_COST_CUT_OFF = 5;
const MIN_HIGH_CARDS_IN_KINGDOM = 3;
const MAX_HIGH_CARDS_IN_KINGDOM = 5;

// Addon constants.
const MAX_ADDONS_IN_KINGDOM = 2;

const NUM_PRIORITIZED_SET = 5;

export class Randomizer {
  static createKingdom(randomizerOptions: RandomizerOptions): Kingdom {
    const supply = createSupplyWithRetries(randomizerOptions);
    const addons = getAddons(randomizerOptions.setIds, [], []);
    const metadata = getMetadata(randomizerOptions.setIds);
    return new Kingdom(supply, addons.events, addons.landmarks, addons.projects, metadata);
  }

  static createSupplySafe(randomizerOptions: RandomizerOptions): Supply | null; {
    try {
      return createSupplyWithRetries(randomizerOptions);
    } catch (error) {
      console.log(`Failed to create supply: \n${error.toString()}`);
      return null;
    }
  }

  static createSupplyWithRetries(randomizerOptions: RandomizerOptions): Supply {
    let retries = MAX_RETRIES;
    while (retries > 0) {
      try {
        return createSupply(randomizerOptions);
      } catch (error) {
        console.log(`Error when trying to select cards: \n${error.toString()}`);
        retries -= 1;
      }
    }
    throw new Error("Failed to select cards that satisfied all requirements.");
  }

  createSupply(randomizerOptions: RandomizerOptions) {
    const setsToUse = 
        Cards.filterSetsByAllowedSetIds(DominionSets.getAllSets(), randomizerOptions.getSetIds());
    let cardsToUse =
        Cards.filterByIncludedSetIds(DominionSets.getAllSupplyCards(), randomizerOptions.getSetIds();
    cardsToUse = removeDuplicateCards(cardsToUse, randomizerOptions.includeCardIds);

    supplyBuilder = new SupplyBuilder(cardsToUse)

    // Configure bans.
    if randomizerOptions.getExcludeCardIds().length
      supplyBuilder.addBan(new CardSupplyBan(randomizerOptions.getExcludeCardIds()))

    if randomizerOptions.getExcludeTypes().length
      supplyBuilder.addBan(new TypeSupplyBan(randomizerOptions.getExcludeTypes()))

    if randomizerOptions.getExcludeCosts().length
      supplyBuilder.addBan(new CostSupplyBan(randomizerOptions.getExcludeCosts()))

    // Configure requirements.
    if (randomizerOptions.getRequireSingleCardOfType() and
        randomizerOptions.getRequireSingleCardOfType() != CardType.NONE)
      supplyBuilder.addRequirement(
          new TypeSupplyRequirement(randomizerOptions.getRequireSingleCardOfType(), true))

    if randomizerOptions.getRequireActionProvider()
      supplyBuilder.addRequirement(new TypeSupplyRequirement(CardType.ACTION_SUPPLIER, false))

    if randomizerOptions.getRequireCardProvider()
      supplyBuilder.addRequirement(new TypeSupplyRequirement(CardType.MULTI_DRAWER, false))         

    if randomizerOptions.getRequireBuyProvider()
      supplyBuilder.addRequirement(new TypeSupplyRequirement(CardType.BUY_SUPPLIER, false))

    if randomizerOptions.getRequireTrashing()
      supplyBuilder.addRequirement(new TypeSupplyRequirement(CardType.TRASHING, false))

    // Configure dividers.
    remainingCards = NUM_CARDS_IN_KINGDOM

    if (randomizerOptions.getPrioritizeSet() and
        randomizerOptions.getPrioritizeSet() != SetId.ALCHEMY)
      supplyBuilder.addDivider(
          new SetSupplyDivider(randomizerOptions.getPrioritizeSet(), NUM_PRIORITIZED_SET))
      remainingCards -= NUM_PRIORITIZED_SET

    if shouldUseAlchemyDivider(randomizerOptions)
      alchemyCardsToUse = getNumberOfAlchemyCardsToUse(randomizerOptions, remainingCards)
      supplyBuilder.addDivider(new SetSupplyDivider(SetId.ALCHEMY, alchemyCardsToUse))
      remainingCards -= alchemyCardsToUse
    else if randomizerOptions.getSetIds().length > 1
      // Only ban all of the Alchemy cards when Alchemy isn't the only set selected.
      supplyBuilder.addBan(new SetSupplyBan([SetId.ALCHEMY]))

    if randomizerOptions.getDistributeCost()
      highCardsInKingdom = 
          RandUtil.getRandomInt(MIN_HIGH_CARDS_IN_KINGDOM, MAX_HIGH_CARDS_IN_KINGDOM)
      supplyBuilder.addDivider(new CostSupplyDivider(HIGH_COST_CUT_OFF, highCardsInKingdom))

    existingCards =
        allCards.filter(CardUtil.filterByIncludedIds(randomizerOptions.getIncludeCardIds()))
    selectedCards = createSupplyCardsWithRetries(supplyBuilder, existingCards)

    if randomizerOptions.getRequireReactionIfAttacks()
      correctedSupplyBuilder =
          correctSupplyBuilderForRequiredReaction(supplyBuilder, existingCards, selectedCards)
      if correctedSupplyBuilder
        supplyBuilder = correctedSupplyBuilder
        selectedCards = createSupplyCardsWithRetries(supplyBuilder, existingCards)

    metadata = new Supply.Metadata(
      supplyBuilder,
      randomizerOptions.getPrioritizeSet() or null,
      alchemyCardsToUse or null,
      highCardsInKingdom or null)

    return new Supply(selectedCards, metadata)

  getAddons(allSets, setIds, excludeIds, excludeLandmarkIds) ->
    setsToUse = CardUtil.filterSetsByAllowedSetIds(allSets, setIds)
    cards = Util.flattenSetsForProperty(setsToUse, 'cards')
    addonCards = cards.concat(getAddonsFromSets(allSets, setIds, []))

    selectedCards = selectRandomCards(addonCards, NUM_CARDS_IN_KINGDOM)
    selectedEvents = []
    selectedLandmarks = []
    selectedProjects = []
    for card in selectedCards
      if CardUtil.isEvent(card)
        selectedEvents.push(card)
      else if CardUtil.isLandmark(card)
        selectedLandmarks.push(card)
      else if CardUtil.isProject(card)
        selectedProjects.push(card)
      if selectedEvents.length + selectedLandmarks.length + selectedProjects >= MAX_ADDONS_IN_KINGDOM
        break

    return {
      events: selectedEvents
      landmarks: selectedLandmarks
      projects: selectedProjects
    }

  getRandomAddons(allSets, setIds, excludeIds, numberOfAddons) ->
    addons = getAddonsFromSets(allSets, setIds, excludeIds)
    return selectRandomCards(addons, numberOfAddons)

  getAddonsFromSets(allSets, setIds, excludeIds) ->
    setsToUse = CardUtil.filterSetsByAllowedSetIds(allSets, setIds)
    events = Util.flattenSetsForProperty(setsToUse, 'events')
    landmarks = Util.flattenSetsForProperty(setsToUse, 'landmarks')
    projects = Util.flattenSetsForProperty(setsToUse, 'projects')
    return events.concat(landmarks, projects).filter(CardUtil.filterByExcludedIds(excludeIds))

  getMetadata(allSets, setIds) ->
    setsToUse = CardUtil.filterSetsByAllowedSetIds(allSets, setIds)
    useColonies = shouldUseSpecialtyCardFromSet(SetId.PROSPERITY, setsToUse)
    useShelters = shouldUseSpecialtyCardFromSet(SetId.DARK_AGES, setsToUse)
    return new Kingdom.Metadata(useColonies, useShelters)

  shouldUseSpecialtyCardFromSet(setId, setsBeingUsed) ->
    index = CardUtil.extractIds(setsBeingUsed).indexOf(setId)
    return false if index == -1
    numberOfSpecialtySetCards = setsBeingUsed[index].cards.length
    numberOfCardsBeingUsed = 0
    for set in setsBeingUsed
      numberOfCardsBeingUsed += set.cards.length
    index = RandUtil.getRandomInt(0, numberOfCardsBeingUsed)
    return index < numberOfSpecialtySetCards

  selectRandomCards(cards, numberToSelect) ->
    randomIndexes = RandUtil.getRandomInts(numberToSelect, cards.length)
    selectedCards = cards[index] for index in randomIndexes)
    return selectedCards

  shouldUseAlchemyDivider(randomizerOptions: RandomizerOptions) {
    // Don't use the divider if Alchemy is the only selected set.
    if randomizerOptions.getSetIds().length == 1
      return false 

    if randomizerOptions.getPrioritizeSet() == SetId.ALCHEMY
      return true

    if randomizerOptions.getSetIds().indexOf(SetId.ALCHEMY) == -1
      return false

    if randomizerOptions.getSetIds().length < 3
      return true

    useRandomly = !RandUtil.getRandomInt(0, randomizerOptions.getSetIds().length)
    return useRandomly

  correctSupplyBuilderForRequiredReactiosupplyBuilder, existingCards, selectedCards) ->
    // Check if the selected cards either have no attacks or have a reaction.
    if selectedCards.filter(CardUtil.filterByRequiredType(CardType.REACTION)).length
      return null

    if !selectedCards.filter(CardUtil.filterByRequiredType(CardType.ATTACK)).length
      return null

    supplyBuilder = supplyBuilder.clone()
    divisions = supplyBuilder.createUnfilledDivisions(existingCards)
    reactions = SupplyDivisions.getAvailableCardsOfType(divisions, CardType.REACTION)
    
    if reactions.length
      // Add a requirement for a reaction.
      supplyBuilder.addRequirement(new TypeSupplyRequirement(CardType.REACTION, false))
      return supplyBuilder

    // Ban attacks since there are no available reactions.
    supplyBuilder.addBan(new TypeSupplyBan(CardType.ATTACK))
    return supplyBuilder

  createSupplyCardsWithRetries(supplyBuilder, existingCards) ->
    retries = MAX_RETRIES
    while retries > 0
      try 
        return supplyBuilder.createSupply(existingCards)
      catch error
        console.log("Error when trying to select cards: \n" + error.toString())
        retries -= 1

    throw Error('Failed to select cards that satisfied all requirements.')      

  getNumberOfAlchemyCardsToUse(randomizerOptions, remainingCards) ->
    min = MIN_ALCHEMY_CARDS_IN_KINGDOM
    max = MAX_ALCHEMY_CARDS_IN_KINGDOM

    if randomizerOptions.getPrioritizeSet() == SetId.ALCHEMY
      min = Math.max(min, NUM_PRIORITIZED_SET)
      max = Math.max(max, MAX_ALCHEMY_CARDS_IN_KINGDOM)

    return RandUtil.getRandomInt(min, Math.min(max, remainingCards))

  private static removeDuplicateCards(cards: SupplyCard[], requiredCardIds: string[]) {
    // Removes duplicate cards (cards appearing in multiple sets); keep setA's version.
    // Cards to keep = (A - [B required as A]) + (B - ([A as B] - B required))
    const keys = Object.keys(SETS_WITH_DUPLICATES);
    for (let setA of keys) {
      const setB = SETS_WITH_DUPLICATES[setA];
      const setACards = cards.filter(Cards.filterByIncludedSetIds([setA]));
      const setBCards = cards.filter(Cards.filterByIncludedSetIds([setB]));

      // B to exclude = ([A as B] - B required))
      const setACardIdsAsSetB = replaceSetIdForCards(setACards, setB);
      const setBRequiredCards = setBCards.filter(Cards.filterByIncludedIds(requiredCardIds));
      const setBCardIdsToExclude = removeIds(setACardIdsAsSetB, Cards.extractIds(setBRequiredCards));

      // B to include = (B - B to exclude)
      const setBCardIdsToInclude = removeIds(Cards.extractIds(setBCards), setBCardIdsToExclude);

      // A to include = (A - [B required as A])
      const setBRequiredCardIdsAsSetA = replaceSetIdForCards(setBRequiredCards, setA);
      const setACardIdsToInclude = removeIds(Cards.extractIds(setACards), setBRequiredCardIdsAsSetA);

      const setACardsToExclude = removeIds(Cards.extractIds(setACards), setACardIdsToInclude);
      const setBCardsToExclude = removeIds(Cards.extractIds(setBCards), setBCardIdsToInclude);

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
    for (card of cards) {
      cardIds.push(replaceSetIdInCardId(card.id, newSetId: string));
    }
    return cardIds;
  }

  private static replaceSetIdInCardId(cardId: string, newSetId: string) {
    return newSetId + '_' + cardId.split('_')[1];
  }
}

window.Randomizer = {
  createKingdom: createKingdom
  createSupply: createSupply
  createSupplyWithRetries: createSupplyWithRetries
  createSupplySafe: createSupplySafe
  getAddons: getAddons
  getRandomAddons: getRandomAddons
}
