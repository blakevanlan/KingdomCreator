import type {Card} from "./card"
import type {Cost} from "./cost"
import type {Event} from "./event"
import type { Landmark } from "./landmark";
import type { Project } from "./project";
import type { Way } from "./way";
import type { Ally } from "./ally";
import type { Trait } from "./trait";

export interface Addon extends Card {
  readonly name: string;
  readonly cost: Cost;
}

export interface Addons 
{ events: Event[], 
  landmarks: Landmark[], 
  projects: Project[], 
  ways: Way[], 
  allies: Ally[], 
  traits: Trait[]
}
