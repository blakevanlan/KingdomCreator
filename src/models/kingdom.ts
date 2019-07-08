import {Supply} from "./supply"

export class Kingdom {
    constructor(
        readonly supply: Supply,
        readonly events: Event[],
        readonly landmarks: Landmark[],
        readonly projects: Projects[],
        readonly metadata: Metadata) {
    }
}

export class Metadata {
  constructor(readonly useColonies: boolean, readonly useShelters: boolean) {
  }
}
