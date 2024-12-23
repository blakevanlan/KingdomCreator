import {Boon} from "../dominion/boon";
import type {Card} from "../dominion/card";
import type {CardType} from "../dominion/card-type";
import type {CostType} from "../dominion/cost-type";
import type {DominionSet} from "../dominion/dominion-set"
import {Event} from "../dominion/event";
import {Landmark} from "../dominion/landmark";
import {Project} from "../dominion/project";
import type {SetId} from "../dominion/set-id";
import {SupplyCard} from "../dominion/supply-card";
import {Way} from "../dominion/way";
import {Ally} from "../dominion/ally";
import {Trait} from "../dominion/trait";
import {Prophecy} from "../dominion/prophecy";

export class Cards {

  static getAllCardsFromSets(sets: DominionSet[]): Card[] {
    let cards: Card[] = [];
    for (const set of sets) {
      cards = cards.concat(Cards.getAllCardsFromSet(set));
    }
    return cards;
  }

  static getAllCardsFromSet(set: DominionSet): Card[] {
    return (set.supplyCards as Card[]).concat(
        (set.events as Card[]),
        (set.landmarks as Card[]),
        (set.projects as Card[]),
        (set.ways as Card[]),
        (set.boons as Card[]),
        (set.allies as Card[]), 
        (set.traits as Card[]), 
        (set.prophecies as Card[]), 
        );
  }

  static getAllSupplyCards(cards: Card[]): SupplyCard[] {
    return Cards.getCardsOfType<SupplyCard>(cards, SupplyCard);
  }

  static getAllEvents(cards: Card[]): Event[] {
    return Cards.getCardsOfType<Event>(cards, Event);
  }
  
  static getAllLandmarks(cards: Card[]): Landmark[] {
    return Cards.getCardsOfType<Landmark>(cards, Landmark);
  }

  static getAllProjects(cards: Card[]): Project[] {
    return Cards.getCardsOfType<Project>(cards, Project);
  }
  
  static getAllWays(cards: Card[]): Way[] {
    return Cards.getCardsOfType<Way>(cards, Way);
  }
  
  static getAllAllies(cards: Card[]): Ally[] {
    return Cards.getCardsOfType<Ally>(cards, Ally);
  }

  static getAllTraits(cards: Card[]): Trait[] {
    return Cards.getCardsOfType<Trait>(cards, Trait);
  }

  static getAllProphecies(cards: Card[]): Prophecy[] {
    return Cards.getCardsOfType<Prophecy>(cards, Prophecy);
  }

  static getAllBoons(cards: Card[]): Boon[] {
    return Cards.getCardsOfType<Boon>(cards, Boon);
  }

  private static getCardsOfType<T extends Card>(cards: Card[], constructor: Function): T[] {
    const typedCards: T[] = [];
    for (const card of cards) {
      if (card instanceof constructor) {
        typedCards.push(card as T);
      }
    }
    return typedCards;
  }

  static extractIds<T extends Card>(cards: T[]): string[] {
    return cards.map((card) => card.id);
  }

  static unionCards<T extends Card>(a: T[], b: T[]): T[] {
    const excludingB = a.filter(Cards.filterByExcludedIds(Cards.extractIds(b)));
    return excludingB.concat(b);
  }

  static difference<T extends Card>(a: T[], b: T[]): T[] {
    const ids = new Set(this.extractIds(b));
    return a.filter(a => !ids.has(a.id))
  }

  static intersection<T extends Card>(a: T[], b: T[]): T[] {
    const ids = new Set(this.extractIds(b));
    return a.filter(a => ids.has(a.id));
  }

  static findCardById<T extends Card>(cards: T[], id: string): T | null {
    for (const card of cards) {
      if (card.id == id) {
        return card;
      }
    }
    return null;
  }

  static filterSetsByAllowedSetIds(sets: DominionSet[], allowedSetIds: SetId[]) {
    const filteredSets: DominionSet[] = [];
    for (const set of sets) {
      if (allowedSetIds.indexOf(set.setId) != -1) {
        filteredSets.push(set);
      }
    }
    return filteredSets;
  }

  static filterByIncludedSetIds<T extends Card>(includeSetIds: SetId[]): (card: T) => boolean {
    return (card) => includeSetIds.indexOf(card.setId) != -1;
  }

  static filterByExcludedSetIds<T extends Card>(excludeSetIds: SetId[]): (card: T) => boolean {
    return (card) => excludeSetIds.indexOf(card.setId) == -1;
  }

  static filterByIncludedIds<T extends Card>(includeIds: string[]): (card: T) => boolean {
    return (card) => includeIds.indexOf(card.id) != -1;
  }

  static filterByExcludedIds<T extends Card>(excludeIds: string[]): (card: T) => boolean {
    return (card) => excludeIds.indexOf(card.id) == -1;
  }

  static filterByAllowedTypes(allowedTypes: CardType[]): (card: SupplyCard) => boolean {
    return (card) => {
      for (const allowedType of allowedTypes) {
        if (card.isOfType(allowedType)) {
          return true;
        }
      }
      return false;
    };
  }

  static filterByExcludedTypes(excludedTypes: CardType[]): (card: SupplyCard) => boolean {
    return (card) => {
      for (const excludedType of excludedTypes) {
        if (card.isOfType(excludedType)) {
          return false;
        }
      }
      return true;
    };
  }

  static filterByRequiredType(requiredType: CardType | null): (card: SupplyCard) => boolean {
    return (card) => {
      return requiredType ? card.isOfType(requiredType) : true;
    };
  }

  static filterByAllowedCosts(allowedCosts: CostType[]): (card: SupplyCard) => boolean {
    return (card) => allowedCosts.indexOf(card.cost.getType()) != -1;
  }

  static filterByExcludedCosts(excludedCosts: CostType[]): (card: SupplyCard) => boolean {
    return (card) => excludedCosts.indexOf(card.cost.getType()) == -1;
  }
}
