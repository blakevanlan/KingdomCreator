import type {Addon} from "./addon"
import {Cost} from "./cost"
import type {SetId} from "./set-id"

export class Prophecy implements Addon {
  constructor(
    readonly id: string,
    readonly shortId: string,
    readonly setId: SetId,
    readonly name: string,
    readonly orderstring: string,
    readonly cost: Cost) {
  }

  public static fromJson(json: any) {
    return new Prophecy(
      json["id"],
      json["shortId"],
      json["setId"],
      json["name"],
      json["orderstring"] || "",
      new Cost(0, 0, 0));
  }
}
