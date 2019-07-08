import {Addon} from "./addon"
import {Cost} from "./cost"
import {SetId} from "./set-id"

export class Event implements Addon {
  constructor(
    readonly id: string,
    readonly shortId: string,
    readonly setId: SetId,
    readonly name: string,
    readonly cost: Cost,
    readonly isActionSupplier: boolean,
    readonly isBuySupplier: boolean,
    readonly isDrawer: boolean,
    readonly isReaction: boolean,
    readonly isTrashing: boolean) {
  }

  public static fromJson(json: any) {
    return new Event(
      json["id"],
      json["shortId"],
      json["setId"],
      json["name"],
      Cost.fromJson(json["cost"]),
      json["isActionSupplier"] || false,
      json["isBuySupplier"] || false,
      json["isDrawer"] || false,
      json["isReaction"] || false,
      json["isTrashing"] || false);
  }
}
