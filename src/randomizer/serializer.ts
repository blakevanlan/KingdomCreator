import {Card} from "../dominion/card";
import {DominionSets} from "../dominion/dominion-sets";
import {Kingdom} from "./kingdom";
import {SupplyCard} from "../dominion/supply-card";
import {Metadata as KingdomMetadata} from "./kingdom";
import {Supply, Replacements} from "../randomizer/supply";

export function serializeKingdom(kingdom: Kingdom): {[index: string]: string} {
  const result: {[index: string]: string} = {
    ...serializeMetadata(kingdom.metadata),
    supply: serializeCards(kingdom.supply.supplyCards)
  };
  if (kingdom.supply.baneCard) {
    result.bane = serializeCards([kingdom.supply.baneCard]);
  } 
  if (kingdom.events.length) {
    result.events = serializeCards(kingdom.events);
  }
  if (kingdom.landmarks.length) {
    result.landmarks = serializeCards(kingdom.landmarks);
  }
  if (kingdom.projects.length) {
    result.projects = serializeCards(kingdom.projects);
  }
  if (kingdom.boons.length) {
    result.boons = serializeCards(kingdom.boons);
  }
  return result;
}

export function deserializeKingdom(serializedKingdom: any): Kingdom | null {
  const serializedSupply = serializedKingdom.supply || serializedKingdom.cards;
  const supplyIds = parseCommaSeparatedValues(serializedSupply)

  // Only use the deserialized kingdom if the supply exists.
  if (!supplyIds || !supplyIds.length) {
    return null;
  }

  const baneIds = parseCommaSeparatedValues(serializedKingdom.bane) || [];
  const eventIds = parseCommaSeparatedValues(serializedKingdom.events) || [];
  const landmarkIds = parseCommaSeparatedValues(serializedKingdom.landmarks) || [];
  const projectIds = parseCommaSeparatedValues(serializedKingdom.projects) || [];
  const boonIds = parseCommaSeparatedValues(serializedKingdom.boons) || [];
  
  const supplyCards = findByIds(supplyIds, DominionSets.getSupplyCardById).slice(0, 10);
  let baneCard: SupplyCard | null = null;
  if (baneIds.length) {
     baneCard = findByIds(baneIds, DominionSets.getSupplyCardById)[0] || null;
  }
  const events = findByIds(eventIds, DominionSets.getEventById).slice(0, 2);
  const landmarks =
      findByIds(landmarkIds, DominionSets.getLandmarkById).slice(0, Math.max(0, 2 - events.length));
  const projects = 
      findByIds(projectIds, DominionSets.getProjectById)
          .slice(0, Math.max(0, 2 - events.length - landmarks.length));
  const boons = findByIds(boonIds, DominionSets.getBoonById).slice(0, 3);
  const supply = new Supply(supplyCards, baneCard, Replacements.empty());

  return new Kingdom(
    Date.now(),
    supply,
    events,
    landmarks,
    projects,
    boons,
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

function findByIds<T>(ids: string[], lookupFn: (id: string) => T): T[] {
  const results = [];
  for (let id of ids) {
    try {
      results.push(lookupFn(id));
    } catch (e) {
      // Silently catch failed lookups.
    }
  }
  return results;
} 

function parseCommaSeparatedValues(value: string | null): string[] | null {
  return value ? value.split(",") : null;
}

function parseBoolean(value: string | null): boolean {
  return value == "1" || value == "true";
}
