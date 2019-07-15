import {Boon} from "./boon";
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

  public static convertToSetId(stringSetId: string) {
    const setId = this.convertToSetIdSafe(stringSetId);
    if (!setId) {
      throw new Error(`Unknown set ID: ${setId}`);
    }
    return setId;
  }

  public static convertToSetIdSafe(stringSetId: string): SetId | null {
    const setIds = Object.keys(SetId);
    for (let setId of setIds) {
      if (SetId[setId as keyof typeof SetId] == stringSetId) {
        return stringSetId as SetId;
      }
    }
    return null;
  }

  public static getAllSets(): DominionSet[] {
    const sets: DominionSet[] = [];
    const setIds = Object.keys(DominionSets.sets);
    for (let setId of setIds) {
      sets.push(DominionSets.sets[setId as SetId] as DominionSet);
    }
    return sets;
  }

  public static getSetById(setId: SetId): DominionSet {
    return DominionSets.sets[setId] as DominionSet;
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

  public static getBoonById(cardId: string): Boon {
    const card = DominionSets.getCardById(cardId);
    if (!(card instanceof Boon)) {
      throw new Error(`Card id ({$cardId}) does not refer to a boon`);
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
      const set = DominionSets.sets[setId as SetId] as DominionSet;
      const cardsFromSet: Card[] = 
          (set.supplyCards as Card[]).concat(set.events, set.landmarks, set.projects, set.boons);
      for (let card of cardsFromSet) {
        cards[card.id] = card;
        if (!cards[card.shortId]) {
          cards[card.shortId] = card;
        }
      }
    }
    return cards;
  }
}
