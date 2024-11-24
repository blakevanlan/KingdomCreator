import type { Card} from "../dominion/card";
import { DominionSets} from "../dominion/dominion-sets";
import { Kingdom} from "./kingdom";
import type { SupplyCard} from "../dominion/supply-card";
import { Metadata as KingdomMetadata} from "./kingdom";
import { Supply, Replacements} from "../randomizer/supply";
import { Landmark } from "../dominion/landmark";
import { Way } from "../dominion/way";
import { Trait } from "../dominion/trait";
import { Prophecy } from "../dominion/prophecy";
import { NUM_CARDS_IN_KINGDOM } from "../settings/Settings-value";


export function serializeKingdom(kingdom: Kingdom): {[index: string]: string} {
  const result: {[index: string]: string} = {
    ...serializeMetadata(kingdom.metadata),
    supply: serializeCards(kingdom.supply.supplyCards)
  };
  if (kingdom.supply.baneCard) {
    result.bane = serializeCards([kingdom.supply.baneCard]);
  } 
  if (kingdom.supply.ferrymanCard) {
    result.ferryman = serializeCards([kingdom.supply.ferrymanCard]);
  } 
  if (kingdom.events.length) {
    result.events = serializeCards(kingdom.events);
  }
  if (kingdom.landmarks.length) {
    if (kingdom.supply.obeliskCard) {
      const landmarkToSerialize=[...kingdom.landmarks]
      for (const index in landmarkToSerialize)
      {
        if (landmarkToSerialize[index].id == "empires_landmark_obelisk") {
          landmarkToSerialize[index] = new Landmark(
                landmarkToSerialize[index].id, 
                landmarkToSerialize[index].shortId+"("+kingdom.supply.obeliskCard.shortId+")",
                landmarkToSerialize[index].setId,
                landmarkToSerialize[index].name,
                landmarkToSerialize[index].orderstring,
                landmarkToSerialize[index].cost)
        }
      }
      result.landmarks = serializeCards(landmarkToSerialize);
    } else {
      result.landmarks = serializeCards(kingdom.landmarks);
    }
  }
  if (kingdom.projects.length) {
    result.projects = serializeCards(kingdom.projects);
  }
  if (kingdom.boons.length) {
    result.boons = serializeCards(kingdom.boons);
  }
  if (kingdom.ways.length) {
    if (kingdom.supply.mouseWay) {
      const wayToSerialize=[...kingdom.ways]
      for (const index in wayToSerialize)
      {
        if (wayToSerialize[index].id == "menagerie_way_wayofthemouse") {
          wayToSerialize[index] = new Way(
            wayToSerialize[index].id, 
            wayToSerialize[index].shortId+"("+kingdom.supply.mouseWay.shortId+")",
            wayToSerialize[index].setId,
            wayToSerialize[index].name,
            wayToSerialize[index].orderstring,
            wayToSerialize[index].cost)
        }
      }
      result.ways = serializeCards(wayToSerialize);
    } else {
      result.ways = serializeCards(kingdom.ways);
    }
  }
  if (kingdom.ally) {
    result.ally = serializeCards([kingdom.ally]);
  }
  if (kingdom.prophecy) {
    result.prophecy= serializeCards([kingdom.prophecy]);
  }
  if (kingdom.traits.length) {
    const traitToSerialize=[...kingdom.traits]
    for (const index in traitToSerialize)
    {
      traitToSerialize[index] = new Trait(
        traitToSerialize[index].id, 
        traitToSerialize[index].shortId+"("+kingdom.supply.traitsSupply[index].shortId+")",
        traitToSerialize[index].setId,
        traitToSerialize[index].name,
        traitToSerialize[index].orderstring,
        traitToSerialize[index].cost)
    } 
    result.traits = serializeCards(traitToSerialize);
    // pour chaque (traits, index), creer traiToSerialze 
    // avec id = trait.id
    // shortId = trait.shortId + "(" + kingdom.supply.traitsupply[index] + ")"
    // setId = trait.setId
    // name = trait.name
    // orderstring = trait.orderstring
    // cost = trait.cost
    // ajouter traitToSerialize dans result.traits
  }

  /*
      lang=en&
      supply=coven,youngwitch,gatekeeper,ferryman,huntinglodge,livery,mastermind,paddock,stockpile,supplies
      &bane=hamlet
      &ferryman=village
      &events=populate
      &landmarks=obelisk(coven)
      //&obeliskCard=coven
      &ways=wayofthemouse(menagerie)
      //&mouseWayCard=menagerie
      &traits=poor(gatekeeper),rich(livery)
  */
  return result;
}

export function deserializeKingdom(serializedKingdom: any, selectedSets: string[]): Kingdom | null {
  const serializedSupply = serializedKingdom.supply || serializedKingdom.cards;
  const supplyIds = parseCommaSeparatedValues(serializedSupply)

  // Only use the deserialized kingdom if the supply exists.
  if (!supplyIds || !supplyIds.length) {
    return null;
  }

  const baneIds = parseCommaSeparatedValues(serializedKingdom.bane) || [];
  const ferrymanIds = parseCommaSeparatedValues(serializedKingdom.ferryman) || [];
  const eventIds = parseCommaSeparatedValues(serializedKingdom.events) || [];
  // const  landmarkIds = parseCommaSeparatedValues(serializedKingdom.landmarks) || [];
  const [obeliskCardIds, landmarkIds] = extractStringParenthesis(parseCommaSeparatedValues(serializedKingdom.landmarks) || [])
  const projectIds = parseCommaSeparatedValues(serializedKingdom.projects) || [];
  const boonIds = parseCommaSeparatedValues(serializedKingdom.boons) || [];
  // const wayIds = parseCommaSeparatedValues(serializedKingdom.ways) || [];
  const [mouseWayCardIds, wayIds] = extractStringParenthesis(parseCommaSeparatedValues(serializedKingdom.ways) || [])
  const allyIds = parseCommaSeparatedValues(serializedKingdom.ally) || [];
  const prophecyIds = parseCommaSeparatedValues(serializedKingdom.prophecy) || [];
  const traitIds = parseCommaSeparatedValues(serializedKingdom.traits) || [];
  
  const supplyCards = findByIds(supplyIds, DominionSets.getSupplyCardById, "", selectedSets).slice(0, NUM_CARDS_IN_KINGDOM());
  let baneCard: SupplyCard | null = null;
  if (baneIds.length) {
     baneCard = findByIds(baneIds, DominionSets.getSupplyCardById, "", selectedSets)[0] || null;
  }
  let ferrymanCard: SupplyCard | null = null;
  if (ferrymanIds.length) {
     ferrymanCard = findByIds(ferrymanIds, DominionSets.getSupplyCardById, "", selectedSets)[0] || null;
  }
  const events = 
      findByIds(eventIds, DominionSets.getEventById, "event_", selectedSets)
          //.slice(0, 2);
  const landmarks = 
      findByIds(landmarkIds, DominionSets.getLandmarkById, "landmark_", selectedSets)
          //.slice(0, Math.max(0, 2 - events.length));
  let obeliskCard: SupplyCard | null = null;
  if (obeliskCardIds.length) {
    obeliskCard = findByIds(obeliskCardIds, DominionSets.getSupplyCardById, "", selectedSets)[0] || null;
 }
  const projects = 
      findByIds(projectIds, DominionSets.getProjectById, "project_", selectedSets)
  const ways = 
      findByIds(wayIds, DominionSets.getWayById, "way_", selectedSets)
  let mouseWayCard: SupplyCard | null = null;
  if (mouseWayCardIds.length) {
    mouseWayCard = findByIds(mouseWayCardIds, DominionSets.getSupplyCardById, "", selectedSets)[0] || null;
  }

  const traits =  /* transform pious(masterpiece) => pious */
      findByIds(traitIds.map((traitId) => traitId.replace(/\(.*\)/,''))
        , DominionSets.getTraitById, "trait_", selectedSets)
  const traitssupplyIds = traitIds.map((traitId) => { const match = traitId.match(/\((.*?)\)/);
      return match ? match[1] : ''; });

  const traitSupplyCards = /* transform pious(masterpiece) => masterpiece */
      findByIds(traitssupplyIds, DominionSets.getSupplyCardById, "", selectedSets)

  const allies = findByIds(allyIds, DominionSets.getAllyById, "ally_", selectedSets).slice(0, 1);
  const prophecies = findByIds(prophecyIds, DominionSets.getProphecyById, "prophecy_", selectedSets).slice(0, 1);
  const boons = findByIds(boonIds, DominionSets.getBoonById, "boon_", selectedSets).slice(0, 3);
  const supply = new Supply(supplyCards, baneCard, ferrymanCard, obeliskCard, mouseWayCard, traitSupplyCards, Replacements.empty());

  return new Kingdom(
               Date.now(),                                /* id: number,  */
               supply,                                    /* supply: Supply, */
               events,                                    /* events: Event[], */
               landmarks,                                 /* landmarks: Landmark[], */
               projects,                                  /* projects: Project[], */
               ways,                                      /* ways: Way[], */
               boons,                                     /* boons: Boon[], */
               allies[0] || null,                         /* ally: Ally | null */
               prophecies[0] || null,                     /* prophecy: Prophecy| null */
               traits,                                    /* traits: Trait[] */
       deserializeMetadata(serializedKingdom)
  );
}

function serializeCards<T extends Card>(cards: T[]): string {
  if (!cards.length) {
    return "";
  }
  return cards.map((card) => card.shortId).sort().join(",");
}

function serializeMetadata(metadata: KingdomMetadata): {[index: string]: string} {
  const result: {[index: string]: string} = {};
  if (metadata.useColonies) {
    result.colonies = "1";
  }
  if (metadata.useShelters) {
    result.shelters = "1";
  }
  return result;
}

function deserializeMetadata(serializedKingdom: any): KingdomMetadata {
  return new KingdomMetadata(
    parseBoolean(serializedKingdom.colonies),
    parseBoolean(serializedKingdom.shelters)
  );
}

function findByIds<T>(ids: string[], lookupFn: (id: string) => T, ext?: string, filteredSet?: string[])  : T[] {
  const results = [];
  let launch2ndRequest= true
  if (typeof filteredSet !== 'undefined' ) {
    for (const id of ids) {
      try {
        launch2ndRequest=true
        for (const set of filteredSet) {
          try {
            results.push(lookupFn(set+'_'+ ext + id));
            launch2ndRequest=false
            break;
          } catch (e) {
            // Silently catch failed lookups of 'set'_'id'
          }
        }
        // this is to handle multiple version of sets
        if (launch2ndRequest) {
          try {
            results.push(lookupFn(id));
          } catch (e) {
            // Silently catch failed lookups.
          }
        }
      } catch (e) {
        // Silently catch failed lookups for 'id'
      }
    }
  } else {
    for (const id of ids) {
      try {
        results.push(lookupFn(id));
      } catch (e) {
        // Silently catch failed lookups.
      }
    }
  }
  return results;
} 

function parseCommaSeparatedValues(value: any | null): string[] | null {
  if (typeof value === "string" ) return value ? value.split(",") : null;
  return null;
}

function parseBoolean(value: string | null): boolean {
  return value == "1" || value == "true";
}

function extractStringParenthesis(arr: string[]): [string [], string[]] {
  const array1: string[] = [];
  const array2: string[] = [];
  for (let str of arr) {
    const match = str.match(/^(.*?)\((.*?)\)$/); // recherche la chaine entre ()
    if (match) {
      array1.push(match[2]); // ajoute la cha�ne entre () � l'array1
      array2.push(match[1]); // ajoute la cha�ne avant () � l'array2
    } else {
      array2.push(str); // sinon ajoute la string � l'array2
    }
  }
  return [array1, array2];
}