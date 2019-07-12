import {Event} from "../dominion/event";
import {Landmark} from "../dominion/landmark";
import {Project} from "../dominion/project";
import {Supply} from "./supply"

export class Kingdom {
    constructor(
        readonly supply: Supply,
        readonly events: Event[],
        readonly landmarks: Landmark[],
        readonly projects: Project[],
        readonly metadata: Metadata) {
    }
}

export class Metadata {
  constructor(readonly useColonies: boolean, readonly useShelters: boolean) {
  }
}
