import type {Addon} from "./addon"
import {Cost} from "./cost"
import type {SetId} from "./set-id"

export class Event implements Addon {
  constructor(
    readonly id: string,
    readonly shortId: string,
    readonly setId: SetId,
    readonly name: string,
    readonly orderstring: string,
    readonly cost: Cost,
    readonly isActionSupplier: boolean,
    readonly isBuySupplier: boolean,
    readonly isDrawer: boolean,
    readonly isReaction: boolean,
    readonly isTrashing: boolean) {
  }

  public static fromJson(json: any) {
   if ( typeof json["cost"] === 'undefined' ) {
      return new Event(
        json["id"],
        json["shortId"],
        json["setId"],
        json["name"],
        json["orderstring"] || "",
        new Cost(0,0,0),
        json["isActionSupplier"] || false,
        json["isBuySupplier"] || false,
        json["isDrawer"] || false,
        json["isReaction"] || false,
        json["isTrashing"] || false);
   }

    return new Event(
      json["id"],
      json["shortId"],
      json["setId"],
      json["name"],
      json["orderstring"] || "",
      Cost.fromJson(json["cost"]),
      json["isActionSupplier"] || false,
      json["isBuySupplier"] || false,
      json["isDrawer"] || false,
      json["isReaction"] || false,
      json["isTrashing"] || false);
  }
}
