import {DominionKingdom} from "./dominion-kingdom"
import type {SetId} from "./set-id"

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
    for (const setId of setIds) {
      const kingdoms = window.DominionKingdoms[setId].kingdoms;
      sets[setId] = kingdoms.map((json: any) => DominionKingdom.fromJson(json));
    }
    return sets;
  }

  public static getAllKingdoms(): DominionKingdom[] {
    let Kingdoms:DominionKingdom[]= []
    const setIds = Object.keys(DominionKingdoms.kingdoms);
    for (const setId of setIds) {
      Kingdoms = Kingdoms.concat((DominionKingdoms.kingdoms[setId as SetId] as DominionKingdom[]))
         .filter((kingdom, index, self) => index === self.findIndex((t) => (t.name === kingdom.name)))
    }
    return Kingdoms;
  }

  public static getAllSets(): SetId[] {
    const setIds:SetId[] = (Object.keys(DominionKingdoms.kingdoms) as SetId[]).sort((n1,n2) => {
      if (n1 > n2) { return 1; }
      if (n1 < n2) { return -1;}
      return 0;
      });
    return setIds;
  }
}
