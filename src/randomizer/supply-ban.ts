import {SupplyCard} from "../dominion/supply-card";

export interface SupplyBan {
  getBannedCards(cards: SupplyCard[]): SupplyCard[];
}