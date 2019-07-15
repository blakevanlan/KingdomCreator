import {Card} from "./card";
import {SetId} from "./set-id";

export class Boon implements Card {
  constructor(
    readonly id: string,
    readonly shortId: string,
    readonly setId: SetId,
    readonly name: string) {
  }

  public static fromJson(json: any) {
    return new Boon(
      json["id"],
      json["shortId"],
      json["setId"],
      json["name"]);
  }
}
