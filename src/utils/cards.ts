import {Card} from "../dominion/card";
import {CardType} from "../dominion/card-type";
import {CostType} from "../dominion/cost-type";
import {DominionSet} from "../dominion/dominion-set"
import {Event} from "../dominion/event";
import {Landmark} from "../dominion/landmark";
import {Project} from "../dominion/project";
import {SetId} from "../dominion/set-id";
import {SupplyCard} from "../dominion/supply-card";

export class Cards {

  public static extractIds<T extends Card>(cards: T[]): string[] {
    const ids: string[] = [];
    return cards.map((card) => card.id);
  }

  public static unionCards<T extends Card>(a: T[], b: T[]): T[] {
    const excludingB = a.filter(Cards.filterByExcludedIds(Cards.extractIds(b)));
    return excludingB.concat(b);
  }

  public static findCardById<T extends Card>(cards: T[], id: string): T | null {
    for (let card of cards) {
      if (card.id == id) {
        return card;
      }
    }
    return null;
  }

  public static filterSetsByAllowedSetIds(sets: DominionSet[], allowedSetIds: SetId[]) {
    const filteredSets: DominionSet[] = [];
    for (let set of sets) {
      if (allowedSetIds.indexOf(set.setId) != -1) {
        filteredSets.push(set);
      }
    }
    return filteredSets;
  }

  public static filterByIncludedSetIds<T extends Card>(includeSetIds: SetId[]): (card: T) => boolean {
    return (card) => includeSetIds.indexOf(card.setId) != -1;
  }

  public static filterByExcludedSetIds<T extends Card>(excludeSetIds: SetId[]): (card: T) => boolean {
    return (card) => excludeSetIds.indexOf(card.setId) == -1;
  }

  public static filterByIncludedIds<T extends Card>(includeIds: string[]): (card: T) => boolean {
    return (card) => includeIds.indexOf(card.id) != -1;
  }

  public static filterByExcludedIds<T extends Card>(excludeIds: string[]): (card: T) => boolean {
    return (card) => excludeIds.indexOf(card.id) == -1;
  }

  public static filterByAllowedTypes(allowedTypes: CardType[]): (card: SupplyCard) => boolean {
    return (card) => {
      for (let allowedType of allowedTypes) {
        if (card.isOfType(allowedType)) {
          return true;
        }
      }
      return false;
    };
  }

  public static filterByExcludedTypes(excludedTypes: CardType[]): (card: SupplyCard) => boolean {
    return (card) => {
      for (let excludedType of excludedTypes) {
        if (card.isOfType(excludedType)) {
          return false;
        }
      }
      return true;
    };
  }

  public static filterByRequiredType(requiredType: CardType | null): (card: SupplyCard) => boolean {
    return (card) => {
      return requiredType ? card.isOfType(requiredType) : true;
    };
  }

  public static filterByAllowedCosts(allowedCosts: CostType[]): (card: SupplyCard) => boolean {
    return (card) => allowedCosts.indexOf(card.cost.getType()) != -1;
  }

  public static filterByExcludedCosts(excludedCosts: CostType[]): (card: SupplyCard) => boolean {
    return (card) => excludedCosts.indexOf(card.cost.getType()) == -1;
  }
}
