import {Card} from "../dominion/card";
import {DominionSets} from "../dominion/dominion-sets";
import {Kingdom} from "../models/kingdom";
import {Metadata as KingdomMetadata} from "../models/kingdom";
import {Supply} from "../models/supply";

export function serializeKingdom(kingdom: Kingdom): string {
  const result: string[] = [];
  result.push(serializeCards("supply", kingdom.supply.supplyCards));
  if (kingdom.events.length) {
    result.push(serializeCards("events", kingdom.events));
  }
  if (kingdom.landmarks.length) {
    result.push(serializeCards("landmarks", kingdom.landmarks));
  }
  if (kingdom.projects.length) {
    result.push(serializeCards("projects", kingdom.projects));
  }
  const serializedMetadata = serializeMetadata(kingdom.metadata);
  if (serializedMetadata.length) {
    result.push(serializedMetadata) 
  }
  return result.join("&");
}

export function deserializeKingdom(serializedKingdom: string): Kingdom | null {
  let supplyIds = parseNamedCommaSeparatedParameter("supply", serializedKingdom);

  // The supply cards used to be serialized under the cards parameter, check if the old parameter
  // name is being used.
  if (!supplyIds) {
    supplyIds = parseNamedCommaSeparatedParameter("cards", serializedKingdom) || [];
  }

  // Only use the deserialized kingdom if the supply exists.
  if (!supplyIds.length) {
    return null;
  }

  const eventIds = parseNamedCommaSeparatedParameter("events", serializedKingdom) || [];
  const landmarkIds = parseNamedCommaSeparatedParameter("landmarks", serializedKingdom) || [];
  const projectIds = parseNamedCommaSeparatedParameter("projects", serializedKingdom) || [];
  
  const supplyCards = findByIds(supplyIds, DominionSets.getSupplyCardById).slice(0, 10);
  const events = findByIds(eventIds, DominionSets.getEventById).slice(0, 2);
  const landmarks =
      findByIds(landmarkIds, DominionSets.getLandmarkById).slice(0, Math.max(0, 2 - events.length));
  const projects = 
      findByIds(projectIds, DominionSets.getProjectById)
          .slice(0, Math.max(0, 2 - events.length - landmarks.length));
  const supply = new Supply(supplyCards, null);

  return new Kingdom(
      Date.now(), supply, events, landmarks, projects, deserializeMetadata(serializedKingdom));
}

function serializeCards<T extends Card>(identifier: string, cards: T[]): string {
  if (!cards.length) {
    return "";
  }
  const ids = cards.map((card) => card.shortId).sort().join(",");
  return `${identifier}=${ids}`;
}

function serializeMetadata(metadata: KingdomMetadata): string {
  const result: string[] = [];
  if (metadata.useColonies) {
    result.push("colonies=1");
  }
  if (metadata.useShelters) {
    result.push("shelters=1");
  }
  return result.join("&");
}

function deserializeMetadata(serializedKingdom: string): KingdomMetadata {
  return new KingdomMetadata(
      parseNamedBooleanParameter("colonies", serializedKingdom),
      parseNamedBooleanParameter("shelters", serializedKingdom));
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

function parseNamedCommaSeparatedParameter(
    parameter: string, serializedKingdom: string): string[] | null {
  const value = parseNamedParameter(parameter, serializedKingdom);
  return value ? value.split(",") : null;
}

function parseNamedBooleanParameter(parameter: string, serializedKingdom: string): boolean {
  const value = parseNamedParameter(parameter, serializedKingdom);
  return value == "1" || value == "true";
}

function parseNamedParameter(parameter: string, serializedKingdom: string): string | null {
  const regex = new RegExp(`${parameter}=([\\w,]+)`);
  const matches = regex.exec(serializedKingdom);
  return matches && matches[1] ? matches[1] : null;
}
