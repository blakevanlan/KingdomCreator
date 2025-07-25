export enum CostType {
  TREASURE_2_OR_LESS = "treasure2",
  TREASURE_3 = "treasure3",
  TREASURE_4 = "treasure4",
  TREASURE_5 = "treasure5",
  TREASURE_6 = "treasure6",
  TREASURE_7 = "treasure7",
  TREASURE_8_OR_MORE = "treasure8",
  WITH_POTION = "withPotion",
  WITH_DEBT = "withDebt",
}

import type { VisibleType } from "./card";

export const VISIBLE_COSTS: VisibleType<CostType>[] = [
  { type: CostType.TREASURE_2_OR_LESS, name: "0-2" },
  { type: CostType.TREASURE_3, name: "3" },
  { type: CostType.TREASURE_4, name: "4" },
  { type: CostType.TREASURE_5, name: "5" },
  { type: CostType.TREASURE_6, name: "6" },
  { type: CostType.TREASURE_7, name: "7" },
  { type: CostType.TREASURE_8_OR_MORE, name: "8+" },
  { type: CostType.WITH_POTION, name: "Potion" },
  { type: CostType.WITH_DEBT, name: "Debt" },
];