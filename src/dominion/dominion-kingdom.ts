import {SetId} from "./set-id"

export class DominionKingdom {
  constructor(
    readonly name: string,
    readonly setIds: SetId[],
    readonly supplyIds: string[],
    readonly baneCardId: string | null,
    readonly eventIds: string[],
    readonly landmarkIds: string[],
    readonly projectIds: string[],
    readonly boonIds: string[],
    readonly wayIds: string[],
    readonly metadata: Metadata) {
  }

  public static fromJson(json: any) {
    return new DominionKingdom(
        json["name"],
        json["sets"],
        json["supply"] || [],
        json["bane"] || null,
        json["events"] || [],
        json["landmarks"] || [],
        json["projects"] || [],
        json["boons"] || [],
        json["ways"] || [],
        Metadata.fromJson(json["metadata"]));
  }
}

export class Metadata {
  constructor(
    readonly useColonies: boolean,
    readonly useShelters: boolean
  ) {
  }

  public static fromJson(json: any | null) {
    return new Metadata(
        json ? json["colonies"] : false,
        json ? json["shelters"] : false);
  }
}