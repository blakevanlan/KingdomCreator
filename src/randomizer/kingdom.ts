import type { Boon } from "../dominion/boon";
import type { Event } from "../dominion/event";
import type { Landmark } from "../dominion/landmark";
import type { Project } from "../dominion/project";
import type { Way } from "../dominion/way";
import type { Ally } from "../dominion/ally";
import type { Trait } from "../dominion/trait";
import type { Prophecy } from "../dominion/prophecy";
import { Supply } from "../randomizer/supply";
import { YOUNG_WITCH_IDS, FERRYMAN_IDS, OBELISK_LANDMARK_ID, MOUSE_WAY_ID, RIVERBOAT_IDS, APPROACHINGARMY_ID } from "./special-need-cards";
import { DominionSets } from "../dominion/dominion-sets";
import { NUM_CARDS_IN_KINGDOM } from "../settings/Settings-value";

export class Kingdom {
  constructor(
    readonly id: number,
    readonly supply: Supply,
    readonly events: Event[],
    readonly landmarks: Landmark[],
    readonly projects: Project[],
    readonly ways: Way[],
    readonly boons: Boon[],
    readonly ally: Ally | null,
    readonly prophecy: Prophecy | null,
    readonly traits: Trait[],
    readonly metadata: Metadata) {
  }

  static empty() {
    return new Kingdom(
      0,                /* id: number,  */
      Supply.empty(),   /* supply: Supply, containing baneCard, ferrymanCard, obeliskCard, mouseWay, riverboat, Traits[] */
      [],               /* events: Event[], */
      [],               /* landmarks: Landmark[], */
      [],               /* projects: Project[], */
      [],               /* ways: Way[], */
      [],               /* boons: Boon[], */
      null,             /* ally: Ally|null, */
      null,             /* prophecy: Prophecy|null*/
      [],               /* traits: Trait[]*/
      new Metadata(false, false));   /* metadata: Metadata */
  }

  public isKingdomValid() {
        if (this.supply.supplyCards.length != NUM_CARDS_IN_KINGDOM()) return false;
    // test if cards are only allowed cards
    //console.log(initializeExcludedCardIds(setIds, []);

    // test if addons are only allowed cards
    if (this.supply.supplyCards.some(card => YOUNG_WITCH_IDS.includes(card.id))) {
      if (this.supply.baneCard == null) return false;
    } else {
      if (this.supply.baneCard != null) return false;
    }
    if (this.supply.supplyCards.some(card => FERRYMAN_IDS.includes(card.id))) {
      if (this.supply.ferrymanCard == null) return false;
    } else {
      if (this.supply.ferrymanCard != null) return false;
    }
    if (this.landmarks.includes(DominionSets.getLandmarkById(OBELISK_LANDMARK_ID))) {
      if (this.supply.obeliskCard == null) return false;
    } else {
      if (this.supply.obeliskCard != null) return false;
    }
    if (this.ways.includes(DominionSets.getWayById(MOUSE_WAY_ID))) {
      if (this.supply.mouseWay == null) return false;
    } else {
      if (this.supply.mouseWay != null) return false;
    }
    if (this.supply.supplyCards.some(card => RIVERBOAT_IDS.includes(card.id))) {
      if (this.supply.riverboatCard == null) return false;
    } else {
      if (this.supply.riverboatCard != null) return false;
    }
    if (this.prophecy == DominionSets.getLandmarkById(APPROACHINGARMY_ID)) {
      if (this.supply.approachingArmyCard == null) return false;
    } else {
      if (this.supply.approachingArmyCard != null) return false;
    }
    if (this.traits.length >0 ) {
      if (this.supply.traitsSupply.length != this.traits.length) return false;
    }
    return true;
  }
}

export class Metadata {
  constructor(
    readonly useColonies: boolean,
    readonly useShelters: boolean) {
  }
}

