import {SupplyCard} from "../dominion/supply-card";
import {SupplyDivision} from "./supply-division";

export interface SupplyCorrection {
  isSatisfied(divisions: SupplyDivision[]): boolean;

  allowLockedCard(divisions: SupplyDivision[], card: SupplyCard): boolean;

  correctDivisions(divisions: SupplyDivision[]): SupplyDivision[];
}