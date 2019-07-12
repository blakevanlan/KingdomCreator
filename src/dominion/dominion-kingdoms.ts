import {DominionKingdom} from "./dominion-kingdom"
import {SetId} from "./set-id"

declare global {
  interface Window { DominionKingdoms: any; }
}

export class DominionKingdoms {

  static readonly kingdoms:{[key in SetId]?: DominionKingdom} = DominionKingdoms.createKingdoms();

  private static createKingdoms() {
    const setIds = Object.keys(window.DominionKingdoms) as SetId[];
    const sets: {[key in SetId]?: DominionKingdom} = {};
    for (let setId of setIds) {
      sets[setId] = DominionKingdom.fromJson(window.DominionKingdoms[setId]);
    }
    return sets;
  }
}
