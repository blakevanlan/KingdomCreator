import {Card} from "./card"
import {CardType} from "./card-type"
import {Cost} from "./cost"
import {SetId} from "./set-id"

export class SupplyCard implements Card {
  constructor(
    readonly id: string,
    readonly shortId: string,
    readonly setId: SetId,
    readonly name: string,
    readonly cost: Cost,
    readonly isAction: boolean,
    readonly isActionSupplier: boolean,
    readonly isAttack: boolean,
    readonly isBuySupplier: boolean,
    readonly isDrawer: boolean,
    readonly isDoom: boolean,
    readonly isDuration: boolean,
    readonly isFate: boolean,
    readonly isLiaison: boolean,
    readonly isMultiDrawer: boolean,
    readonly isNight: boolean,
    readonly isReaction: boolean,
    readonly isReserve: boolean,
    readonly isTrashing: boolean,
    readonly isTreasure: boolean,
    readonly isVictory: boolean) {
  }

  public isOfType(cardType: CardType) {
    switch (cardType) {
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
      case CardType.LIAISON:
        return this.isLiaison;
      case CardType.MULTI_DRAWER:
        return this.isMultiDrawer
      case CardType.NIGHT:
        return this.isNight;
      case CardType.REACTION:
        return this.isReaction;
      case CardType.RESERVE:
        return this.isReserve;
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

  public static fromJson(json: any) {
    return new SupplyCard(
      json["id"],
      json["shortId"],
      json["setId"],
      json["name"],
      Cost.fromJson(json["cost"]),
      json["isAction"] || false,
      json["isActionSupplier"] || false,
      json["isAttack"] || false,
      json["isBuySupplier"] || false,
      json["isDrawer"] || false,
      json["isDoom"] || false,
      json["isDuration"] || false,
      json["isFate"] || false,
      json["isLiaison"] || false,
      json["isMultiDrawer"] || false,
      json["isNight"] || false,
      json["isReaction"] || false,
      json["isReserve"] || false,
      json["isTrashing"] || false,
      json["isTreasure"] || false,
      json["isVictory"] || false)
  }
}
