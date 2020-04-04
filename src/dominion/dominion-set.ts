import {Boon} from "./boon";
import {SupplyCard} from "./supply-card";
import {Event} from "./event";
import {Landmark} from "./landmark";
import {Project} from "./project";
import {SetId} from "./set-id";
import {Way} from "./way";

export class DominionSet {
  constructor(
    readonly setId: SetId,
    readonly name: string,
    readonly supplyCards: SupplyCard[],
    readonly events: Event[],
    readonly landmarks: Landmark[],
    readonly projects: Project[],
    readonly boons: Boon[],
    readonly ways: Way[]) {
  }

  public static fromJson(json: any) {
    return new DominionSet(
        json["id"],
        json["name"],
        (json["cards"] || []).map(SupplyCard.fromJson),
        (json["events"] || []).map(Event.fromJson),
        (json["landmarks"] || []).map(Landmark.fromJson),
        (json["projects"] || []).map(Project.fromJson),
        (json["boons"] || []).map(Boon.fromJson),
        (json["ways"] || []).map(Way.fromJson));
  }
}
