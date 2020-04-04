import {Addon} from "./addon"
import {Cost} from "./cost"
import {SetId} from "./set-id"

export class Landmark implements Addon {
  constructor(
    readonly id: string,
    readonly shortId: string,
    readonly setId: SetId,
    readonly name: string,
    readonly cost: Cost) {
  }

  public static fromJson(json: any) {
    return new Landmark(
      json["id"],
      json["shortId"],
      json["setId"],
      json["name"],
      new Cost(0, 0, 0));
  }
}
