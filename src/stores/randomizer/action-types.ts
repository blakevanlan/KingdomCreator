import { SupplyCard } from "../../dominion/supply-card";
import { CostType } from "../../dominion/cost-type";
import { CardType } from "../../dominion/card-type";
import { SetId } from "../../dominion/set-id";

export const LOAD_INITIAL_KINGDOM = "LOAD_INITIAL_KINGDOM";
export const RANDOMIZE = "RANDOMIZE";
export const RANDOMIZE_FULL_KINGDOM = "RANDOMIZE_FULL_KINGDOM";
export const RANDOMIZE_UNDEFINED_ADDON = "RANDOMIZE_UNDEFINED_ADDON";
export const RANDOMIZE_SUPPLY_CARD = "RANDOMIZE_SUPPLY_CARD";
export const REPLACE_SUPPLY_CARD = "REPLACE_SUPPLY_CARD";
export const SELECT_CARD = "SELECT_CARD";
export const UNSELECT_CARD = "UNSELECT_CARD";
export const TOGGLE_CARD_SELECTION = "TOGGLE_CARD_SELECTION";

export interface RandomizeSupplyCardParams {
  selectedSetId: SetId | null;
  selectedCardType: CardType | null;
  selectedCostTypes: CostType[];
}

export interface ReplaceSupplyCardParams {
  currentSupplyCard: SupplyCard;
  newSupplyCard: SupplyCard;
}
