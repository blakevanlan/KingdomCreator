import {Boon} from "../dominion/boon";
import {Event} from "../dominion/event";
import {Landmark} from "../dominion/landmark";
import {Project} from "../dominion/project";
import {Supply} from "../randomizer/supply";
import {Way} from "../dominion/way";
import {Ally} from "../dominion/ally";
import {Trait} from "../dominion/trait";

export class Kingdom {
  constructor(
      readonly id: number,
      readonly supply: Supply,
      readonly events: Event[],
      readonly landmarks: Landmark[],
      readonly projects: Project[],
      readonly ways: Way[],
      readonly boons: Boon[],
      readonly ally: Ally | null,
      readonly traits: Trait[],
      readonly metadata: Metadata) {
  }

  static empty() {
    return new Kingdom(
      0, Supply.empty(), [], [], [], [], [], null, [], new Metadata(false, false));
  }
}

export class Metadata {
  constructor(
      readonly useColonies: boolean, 
      readonly useShelters: boolean) {
  }
}

