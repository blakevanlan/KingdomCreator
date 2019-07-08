import {Card} from "./card"
import {Cost} from "./cost"

export interface Addon extends Card {
  readonly name: string;
  readonly cost: Cost;
}
