import {Boon} from "../dominion/boon";
import {Event} from "../dominion/event";
import {Landmark} from "../dominion/landmark";
import {Project} from "../dominion/project";
import {Supply} from "../randomizer/supply"

export class Kingdom {
  constructor(
      readonly id: number,
      readonly supply: Supply,
      readonly banesupply: Supply,
      readonly events: Event[],
      readonly landmarks: Landmark[],
      readonly projects: Project[],
      readonly boons: Boon[],
      readonly metadata: Metadata) {
  }

  static empty() {
    return new Kingdom(
                    0,                /* id: number,  */
                    Supply.empty(),   /* supply: Supply, */
                    Supply.empty(),   /* Banesupply: Supply, */
                    [],               /* events: Event[], */
                    [],               /* landmarks: Landmark[], */
                    [],               /* projects: Project[], */
                    [],               /* boons: Boon[], */
                    new Metadata(false, false));   /* metadata: Metadata */
  }
}

export class Metadata {
  constructor(
      readonly useColonies: boolean, 
      readonly useShelters: boolean) {
  }
}

