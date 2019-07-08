import {Card} from "./card";
import {DominionSet} from "./dominion-set";
import {Event} from "./event";
import {Landmark} from "./landmark";
import {Project} from "./project";
import {SetId} from "./set-id";
import {SupplyCard} from "./supply-card";

declare global {
  interface Window { DominionSets: any; }
}

export class DominionSets {

  static readonly sets: {[key in SetId]?: DominionSet} = DominionSets.createSets();
  static readonly cards: {[index: string]: Card} = DominionSets.createCardMap();

  public static getAllSets(): DominionSet[] {
    const sets: DominionSet[] = [];
    const setIds = Object.keys(DominionSets.sets);
    for (let setId of setIds) {
      sets.push(DominionSets.sets[setId as SetId]);
    }
    return sets;
  }

  public static getAllSupplyCards(): SupplyCard[] {
    let supplyCards: SupplyCard[] = [];
    const sets = DominionSets.getAllSets();
    for (let set of sets) {
      supplyCards = supplyCards.concat(set.supplyCards);
    }
    return supplyCards;
  }

  public static getSetById(setId: SetId): DominionSet {
    return DominionSets.sets[setId];
  }

  public static getCardById(cardId: string): Card {
    const card = DominionSets.cards[cardId];
    if (!card) {
      throw new Error(`Unknown card id: {$cardId}`);
    }
    return card;
  }

  public static getSupplyCardById(cardId: string): SupplyCard {
    const card = DominionSets.getCardById(cardId);
    if (!(card instanceof SupplyCard)) {
      throw new Error(`Card id ({$cardId}) does not refer to a supply card`);
    }
    return card;
  }

  public static getEventById(cardId: string): Event {
    const card = DominionSets.getCardById(cardId);
    if (!(card instanceof Event)) {
      throw new Error(`Card id ({$cardId}) does not refer to an event`);
    }
    return card;
  }

  public static getLandmarkById(cardId: string): Landmark {
    const card = DominionSets.getCardById(cardId);
    if (!(card instanceof Landmark)) {
      throw new Error(`Card id ({$cardId}) does not refer to a landmark`);
    }
    return card;
  }

  public static getProjectById(cardId: string): Project {
    const card = DominionSets.getCardById(cardId);
    if (!(card instanceof Project)) {
      throw new Error(`Card id ({$cardId}) does not refer to a project`);
    }
    return card;
  }

  private static createSets() {
    const setIds = Object.keys(window.DominionSets) as SetId[];
    const sets: {[key in SetId]?: DominionSet} = {};
    for (let setId of setIds) {
      sets[setId] = DominionSet.fromJson(window.DominionSets[setId]);
    }
    return sets;
  }

  private static createCardMap() {
    const cards: {[index: string]: Card} = {};
    const setIds = Object.keys(DominionSets.sets);
    for (let setId of setIds) {
      const set = DominionSets.sets[setId as SetId];
      const cardsFromSet: Card[] = 
          (set.supplyCards as Card[]).concat(set.events, set.landmarks, set.projects);
      for (let card of cardsFromSet) {
        cards[card.id] = card;
        if (!cards[card.shortId]) {
          cards[card.shortId] = card;
        }
      }
    }
    return cards;
  }

  private static createSupplyCardList() {
    const supplyCards: SupplyCard[] = [];
    const setIds = Object.keys(DominionSets.sets);
  }
}
