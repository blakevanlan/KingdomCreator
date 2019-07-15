import {DominionKingdom} from "./dominion-kingdom"
import {SetId} from "./set-id"

interface DominionContentKingdoms {
  kingdoms: any[];
}

declare global {
  interface Window {
    DominionKingdoms: {[key in SetId]: DominionContentKingdoms};
  }
}

export class DominionKingdoms {

  static readonly kingdoms:{[key in SetId]?: DominionKingdom[]} = DominionKingdoms.createKingdoms();

  private static createKingdoms() {
    const setIds = Object.keys(window.DominionKingdoms) as SetId[];
    const sets: {[key in SetId]?: DominionKingdom[]} = {};
    for (let setId of setIds) {
      const kingdoms = window.DominionKingdoms[setId].kingdoms;
      sets[setId] = kingdoms.map((json: any) => DominionKingdom.fromJson(json));
    }
    return sets;
  }
}
