import {Card} from "./card"
import {Event} from "./event"
import {Landmark} from "./landmark"
import {Project} from "./project"
import {SetId} from "./set-id"

export class DominionKingdom {
  constructor(
    readonly name: string,
    readonly setIds: SetId[],
    readonly supplyIds: string[],
    readonly eventIds: string[],
    readonly landmarkIds: string[],
    readonly projectIds: string[],
    readonly metadata: Metadata) {
  }

  public static fromJson(json: any) {
    return new DominionKingdom(
        json["id"],
        json["name"],
        json["supply"] || [],
        json["events"] || [],
        json["landmarks"] || [],
        json["projects"] || [],
        Metadata.fromJson(json["metadata"]));
  }
}

export class Metadata {
  constructor(readonly useColonies: boolean, readonly useShelters: boolean) {
  }

  public static fromJson(json: any) {
    return new Metadata(
        json["colonies"],
        json["shelters"]);
  }
}