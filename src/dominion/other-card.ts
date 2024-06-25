import type {Card} from "./card"
import type {SetId} from "./set-id"
import {Cost} from "./cost"

import {CardType} from "./card-type"

export class OtherCard implements Card {
  constructor(
    readonly id: string,
    readonly shortId: string,
    readonly setId: SetId,
    readonly name: string,
    readonly orderstring: string,
    readonly type: string,
    readonly cost: Cost,
    readonly isTrashing: boolean,
    readonly isTreasure: boolean,
    readonly isVictory: boolean) {
  }

  public static fromJson(json: any) {
   if ( typeof json["cost"] === 'undefined' ) {
     return new OtherCard(
        json["id"],
        json["shortId"],
        json["setId"],
        json["name"],
        json["orderstring"] || "",
        json["type"],
        new Cost(0,0,0),
        json["isTrashing"] || false,
        json["isTreasure"] || false,
        json["isVictory"] || false);
  }

    return new OtherCard(
      json["id"],
      json["shortId"],
      json["setId"],
      json["name"],
      json["orderstring"] || "",
      json["type"],
      Cost.fromJson(json["cost"]),
      json["isTrashing"] || false,
      json["isTreasure"] || false,
      json["isVictory"] || false);
  }
  
  public isOfType(cardType: CardType) {
    switch (cardType) {
/*
      case CardType.ACTION:
        return this.isAction;
      case CardType.ACTION_SUPPLIER:
        return this.isActionSupplier;
      case CardType.ATTACK:
        return this.isAttack
      case CardType.BUY_SUPPLIER:
        return this.isBuySupplier
      case CardType.DRAWER:
        return this.isDrawer
      case CardType.DOOM:
        return this.isDoom
      case CardType.DURATION:
        return this.isDuration
      case CardType.FATE:
        return this.isFate;
      case CardType.MULTI_DRAWER:
        return this.isMultiDrawer
      case CardType.NIGHT:
        return this.isNight;
      case CardType.REACTION:
        return this.isReaction;
      case CardType.RESERVE:
        return this.isReserve;
*/
      case CardType.TRASHING:
        return this.isTrashing;
      case CardType.TREASURE:
        return this.isTreasure;
      case CardType.VICTORY:
        return this.isVictory;

      default:
        throw new Error(`Unknown card type: ${cardType}`);
    }
  }
}
