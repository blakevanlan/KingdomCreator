import {Addon} from "../dominion/addon";
import {CardSupplyBan} from "./card-supply-ban";
import {CostSupplyBan} from "./cost-supply-ban";
import {CostSupplyDivider} from "./cost-supply-divider";
import {CardType} from "../dominion/card-type";
import {Cards} from "../utils/cards";
import {DominionSet} from "../dominion/dominion-set";
import {DominionSets} from "../dominion/dominion-sets";
import {Event} from "../dominion/event"
import {Kingdom} from "./kingdom";
import {Landmark} from "../dominion/landmark"
import {Metadata as KingdomMetadata} from "./kingdom";
import {Project} from "../dominion/project"
import {RandomizerOptions} from "./randomizer-options";
import {SetId} from "../dominion/set-id";
import {SetSupplyBan} from "./set-supply-ban";
import {SetSupplyDivider} from "./set-supply-divider";
import {Supply} from "./supply";
import {SupplyBuilder} from "./supply-builder";
import {SupplyCard} from "../dominion/supply-card";
import {SupplyDivisions} from "./supply-divisions";
import {TypeSupplyBan} from "./type-supply-ban";
import {TypeSupplyRequirement} from "./type-supply-requirement";
import {getRandomInt, getRandomInts, selectRandomN} from "../utils/rand";
import {Boon} from "../dominion/boon";
import {Way} from "../dominion/way";
import {Ally} from "../dominion/ally";

const SETS_WITH_DUPLICATES: {[index: string]: string} = {
  'baseset': 'baseset2',
  'intrigue': 'intrigue2',
  'seaside': 'seaside2',
  'prosperity': 'prosperity2',
  'hinterlands': 'hinterlands2'
};
const MAX_RETRIES = 3;
const NUM_CARDS_IN_KINGDOM = 10;

// Alchemy constants.
const MIN_ALCHEMY_CARDS_IN_KINGDOM = 3;
const MAX_ALCHEMY_CARDS_IN_KINGDOM = 5;

// Cost distribution constants.
const HIGH_COST_CUT_OFF = 5;
const MIN_HIGH_CARDS_IN_KINGDOM = 3;
const MAX_HIGH_CARDS_IN_KINGDOM = 5;

// Addon constants.
const MAX_ADDONS_IN_KINGDOM = 2;

// Prioritize set constants.
const NUM_PRIORITIZED_SET = 5;

export class Randomizer {
  static createKingdom(randomizerOptions: RandomizerOptions): Kingdom {
    const supply = this.createSupplyWithRetries(randomizerOptions);
    const addons = this.getAddons(randomizerOptions.setIds);
    const boons = this.getRandomBoons(supply, []);
    const ally = this.getRandomAlly(supply);
    const metadata = this.getMetadata(randomizerOptions.setIds);
    return new Kingdom(
      Date.now(),
      supply,
      addons.events,
      addons.landmarks,
      addons.projects,
      addons.ways,
      boons,
      ally,
      metadata);
  }

  static createSupplySafe(randomizerOptions: RandomizerOptions): Supply | null {
    try {
      return this.createSupplyWithRetries(randomizerOptions);
    } catch (error) {
      if (typeof error === 'object' && error !== null)
        console.log(`Failed to create supply: \n${error.toString()}`);
      else
        console.log(`Failed to create supply: \n error is not an object`);
      return null;
    }
  }

  static createSupplyWithRetries(randomizerOptions: RandomizerOptions): Supply {
    let retries = MAX_RETRIES;
    while (retries > 0) {
      try {
        return this.createSupply(randomizerOptions);
      } catch (error) {
         if (typeof error === 'object' && error !== null)
            console.log(`Error when trying to select cards: \n${error.toString()}`);
          else
            console.log(`Error when trying to select cards: \n error is not an object`);
        retries -= 1;
      }
    }
    throw new Error("Failed to select cards that satisfied all requirements.");
  }

  static createSupply(randomizerOptions: RandomizerOptions): Supply {
    const allSupplyCards =
        Cards.getAllSupplyCards(Cards.getAllCardsFromSets(DominionSets.getAllSets()));
    const allSupplyCardsToUse =
        this.removeDuplicateCards(
            allSupplyCards.filter(Cards.filterByIncludedSetIds(randomizerOptions.setIds)), []);
    
    let supplyBuilder = new SupplyBuilder(allSupplyCardsToUse);

    // Set the bane card if supplyed in the options and remove it from the pool of 
    // available cards.
    if (randomizerOptions.baneCardId) {
      supplyBuilder.setBaneCard(
        DominionSets.getSupplyCardById(randomizerOptions.baneCardId));
      supplyBuilder.addBan(new CardSupplyBan([randomizerOptions.baneCardId]));
    }

    // Configure bans.
    if (randomizerOptions.excludeCardIds.length) {
      supplyBuilder.addBan(new CardSupplyBan(randomizerOptions.excludeCardIds));
    }
    if (randomizerOptions.excludeTypes.length) {
      supplyBuilder.addBan(new TypeSupplyBan(randomizerOptions.excludeTypes));
    }
    if (randomizerOptions.excludeCosts.length) {
      supplyBuilder.addBan(new CostSupplyBan(randomizerOptions.excludeCosts));
    }

    // Configure requirements.
    if (randomizerOptions.requireSingleCardOfType) {
      supplyBuilder.addRequirement(
          new TypeSupplyRequirement(randomizerOptions.requireSingleCardOfType, true));
    }
    if (randomizerOptions.requireActionProvider) {
      supplyBuilder.addRequirement(new TypeSupplyRequirement(CardType.ACTION_SUPPLIER, false));
    }
    if (randomizerOptions.requireCardProvider) {
      supplyBuilder.addRequirement(new TypeSupplyRequirement(CardType.MULTI_DRAWER, false));         
    }
    if (randomizerOptions.requireBuyProvider) {
      supplyBuilder.addRequirement(new TypeSupplyRequirement(CardType.BUY_SUPPLIER, false));
    }
    if (randomizerOptions.requireTrashing) {
      supplyBuilder.addRequirement(new TypeSupplyRequirement(CardType.TRASHING, false));
    }

    // Configure dividers.
    let remainingCards = NUM_CARDS_IN_KINGDOM;

    if (randomizerOptions.prioritizeSet && randomizerOptions.prioritizeSet != SetId.ALCHEMY) {
      supplyBuilder.addDivider(
          new SetSupplyDivider(randomizerOptions.prioritizeSet, NUM_PRIORITIZED_SET));
      remainingCards -= NUM_PRIORITIZED_SET;
    }

    if (randomizerOptions.useAlchemyRecommendation) {
      if (this.shouldUseAlchemyDivider(randomizerOptions)) {
        const alchemyCardsToUse = this.getNumberOfAlchemyCardsToUse(randomizerOptions, remainingCards);
        supplyBuilder.addDivider(new SetSupplyDivider(SetId.ALCHEMY, alchemyCardsToUse));
        remainingCards -= alchemyCardsToUse;
      } else if (randomizerOptions.setIds.length > 1) {
        // Only ban all of the Alchemy cards when Alchemy isn't the only set selected.
        supplyBuilder.addBan(new SetSupplyBan([SetId.ALCHEMY]));
      }
    }

    let highCardsInKingdom = -1;
    if (randomizerOptions.distributeCost) {
      highCardsInKingdom = 
          getRandomInt(MIN_HIGH_CARDS_IN_KINGDOM, MAX_HIGH_CARDS_IN_KINGDOM);
      supplyBuilder.addDivider(new CostSupplyDivider(HIGH_COST_CUT_OFF, highCardsInKingdom));
    }

    const existingCards =
        randomizerOptions.includeCardIds.map((id) => DominionSets.getSupplyCardById(id));
    let supply = this.buildSupplyWithRetries(supplyBuilder, existingCards);

    // TODO: This is ugly and should ultimately be handled in the supply builder. Perhaps
    // include a rewinding or merging if the divisions become invalid?
    if (randomizerOptions.requireReactionIfAttacks) {
      const correctedSupplyBuilder =
          this.correctSupplyBuilderForRequiredReaction(
              supplyBuilder, existingCards, supply.supplyCards);
      if (correctedSupplyBuilder) {
        supplyBuilder = correctedSupplyBuilder;
        supply = this.buildSupplyWithRetries(supplyBuilder, existingCards);
      }
    }
    
    return supply;
  }

  private static getAddons(setIds: SetId[]):
      {events: Event[], landmarks: Landmark[], projects: Project[], ways: Way[], allies: Ally[]} {
    const setsToUse = Cards.filterSetsByAllowedSetIds(DominionSets.getAllSets(), setIds);
    const cards = Cards.getAllCardsFromSets(setsToUse);
    const selectedCards = this.selectRandomCards(cards, NUM_CARDS_IN_KINGDOM);
    const selectedEvents: Event[] = [];
    const selectedLandmarks: Landmark[] = [];
    const selectedProjects: Project[] = [];
    const selectedWays: Way[] = [];
    const selectedAllies: Ally[] = [];

    for (let card of selectedCards) {
      if (card instanceof Event) {
        selectedEvents.push(card);
      } else if (card instanceof Landmark) {
        selectedLandmarks.push(card);
      } else if (card instanceof Project) {
        selectedProjects.push(card);
      } else if (card instanceof Way) {
        selectedWays.push(card);
      } else if (card instanceof Ally) {
        selectedAllies.push(card);
      }
      // Stop once the maximum number of addons has been reached.
      const addonCount = selectedEvents.length
        + selectedLandmarks.length
        + selectedProjects.length
        + selectedWays.length
        + selectedAllies.length;
      if (addonCount >= MAX_ADDONS_IN_KINGDOM) {
        break;
      }
    }
    return {
      events: selectedEvents,
      landmarks: selectedLandmarks,
      projects: selectedProjects,
      ways: selectedWays,
      allies: selectedAllies,
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
    const allies = Cards.getAllAllies(cards) as Addon[];
    return events.concat(landmarks, projects, ways, allies);
  }

  static getRandomBoons(supply: Supply, keepBoons: Boon[]) {
    if (!supply.supplyCards.some((s) => s.id == "nocturne_druid")) {
      return [];
    }
    const excludeIds = Cards.extractIds(keepBoons);
    const cards = Cards.getAllCardsFromSets(DominionSets.getAllSets());
    const boons = Cards.getAllBoons(cards).filter(Cards.filterByExcludedIds(excludeIds));
    return selectRandomN(boons, 3 - excludeIds.length).concat(keepBoons);
  }

  static getRandomAlly(supply: Supply, skipAllyId: string | null = null): Ally | null {
    if (supply.supplyCards.every((s) => !s.isLiaison)) {
      return null;
    }
    const cards = Cards.getAllCardsFromSets(DominionSets.getAllSets());
    const allies = Cards.getAllAllies(cards).filter(Cards.filterByExcludedIds(skipAllyId ? [skipAllyId] : []));
    return selectRandomN(allies, 1)[0];
  }

  static getMetadata(setIds: SetId[]) {
    const setsToUse = Cards.filterSetsByAllowedSetIds(DominionSets.getAllSets(), setIds);
    const useColonies = this.shouldUseSpecialtyCardFromSet(SetId.PROSPERITY, setsToUse);
    const useShelters = this.shouldUseSpecialtyCardFromSet(SetId.DARK_AGES, setsToUse);
    return new KingdomMetadata(useColonies, useShelters);
  }

  private static shouldUseSpecialtyCardFromSet(setId: SetId, setsBeingUsed: DominionSet[]) {
    const index = setsBeingUsed.map((set) => set.setId).indexOf(setId);
    if (index == -1) {
      return false;
    }
    const numberOfSpecialtySetCards = setsBeingUsed[index].supplyCards.length;
    let numberOfCardsBeingUsed = 0;
    for (let set of setsBeingUsed) {
      numberOfCardsBeingUsed += set.supplyCards.length;
    }
    const randomIndex = getRandomInt(0, numberOfCardsBeingUsed);
    return randomIndex < numberOfSpecialtySetCards;
  }

  private static selectRandomCards<T>(cards: T[], numberToSelect: number): T[] {
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
    if (randomizerOptions.setIds.length < 3) {
      return true;
    }
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
    while (retries > 0) {
      try {
        return supplyBuilder.createSupply(existingCards);
      } catch (error) {
          if (typeof error === 'object' && error !== null) 
            console.log(`Error when trying to select cards: \n${error.toString()}`);
          else
            console.log(`Error when trying to select cards: \n error is not an object`);
        retries -= 1;
      }
    }
    throw new Error("Failed to select cards that satisfied all requirements.");
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

  private static removeDuplicateCards(cards: SupplyCard[], requiredCardIds: string[]) {
    // Removes duplicate cards (cards appearing in multiple sets); keep setA's version.
    // Cards to keep = (A - [B required as A]) + (B - ([A as B] - B required))
    const keys = Object.keys(SETS_WITH_DUPLICATES);
    for (let key of keys) {
      const setA = key as SetId;
      const setB = SETS_WITH_DUPLICATES[key] as SetId;
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
    for (let card of cards) {
      cardIds.push(this.replaceSetIdInCardId(card.id, newSetId));
    }
    return cardIds;
  }

  private static replaceSetIdInCardId(cardId: string, newSetId: string) {
    return newSetId + '_' + cardId.split('_')[1];
  }
}
