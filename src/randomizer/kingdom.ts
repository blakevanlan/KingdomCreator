import {Boon} from "../dominion/boon";
import {Event} from "../dominion/event";
import {Landmark} from "../dominion/landmark";
import {Project} from "../dominion/project";
import {Supply} from "../randomizer/supply";
import {Way} from "../dominion/way";
import {Ally} from "../dominion/ally";

export class Kingdom {
  constructor(
      readonly id: number,
      readonly supply: Supply,
      readonly events: Event[],
      readonly landmarks: Landmark[],
      readonly projects: Project[],
      readonly ways: Way[],
      readonly allies: Ally[],
      readonly boons: Boon[],
      readonly metadata: Metadata) {
  }

  static empty() {
    return new Kingdom(
      0, Supply.empty(), [], [], [], [], [], [], new Metadata(false, false));
  }
}

export class Metadata {
  constructor(
      readonly useColonies: boolean, 
      readonly useShelters: boolean) {
  }
}

