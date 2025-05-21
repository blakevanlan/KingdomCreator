import type {Card} from "./card"
import {CardType} from "./card-type"
import {Cost} from "./cost"
import {SetId} from "./set-id"

export class SupplyCard implements Card {
  constructor(
    readonly id: string,
    readonly shortId: string,
    readonly setId: SetId,
    readonly name: string,
    readonly orderstring: string,
    readonly cost: Cost,
      // base game 
    readonly isAction: boolean,
    readonly isActionSupplier: boolean,
    readonly isTerminal: boolean,
    readonly isAttack: boolean,
    readonly isTreasure: boolean,
    readonly isVictory: boolean,
    readonly isBuySupplier: boolean,
    readonly isDrawer: boolean,
    readonly isMultiDrawer: boolean,
    readonly isReaction: boolean,
    readonly isTrashing: boolean,

    // Seaside
    readonly isDuration: boolean,

    // Adventures
    readonly isReserve: boolean,
    readonly isTraveller: boolean,

    // Empires
    readonly isGathering: boolean,

    // Nocturne
    readonly isFate: boolean,
    readonly isDoom: boolean,
    readonly isNight: boolean,

    // Renaissance
    readonly isArtifactSupplier: boolean,
    readonly isVillageSupplier: boolean,

    // Allies
    readonly isLiaison: boolean,
    readonly isCover: boolean,

    // Rising sun
    readonly isOmen: boolean,
    readonly isShadow: boolean,

    // Promos
    readonly isCommand: boolean
    ) { }

  public isOfType(cardType: CardType) {
    switch (cardType) {

  // Base Game
      case CardType.ACTION:
        return this.isAction;
      case CardType.ACTION_SUPPLIER:
        return this.isActionSupplier;
      case CardType.TERMINAL:
        return this.isTerminal;
      case CardType.ATTACK:
        return this.isAttack;
      case CardType.TREASURE:
        return this.isTreasure;
      case CardType.VICTORY:
        return this.isVictory;
      case CardType.BUY_SUPPLIER:
        return this.isBuySupplier;
      case CardType.DRAWER:
        return this.isDrawer;
      case CardType.MULTI_DRAWER:
        return this.isMultiDrawer;
      case CardType.REACTION:
        return this.isReaction;
      case CardType.TRASHING:
        return this.isTrashing;

  // Seaside
      case CardType.DURATION:
        return this.isDuration;

  // Nocturne
      case CardType.NIGHT:
        return this.isNight;
      case CardType.DOOM:
        return this.isDoom;
      case CardType.FATE:
        return this.isFate;

  // Adventures
      case CardType.RESERVE:
        return this.isReserve;
      case CardType.TRAVELLER:
        return this.isTraveller;

  // Empires
      case CardType.GATHERING:
        return this.isGathering;

  // Renaissance
      case CardType.ARTIFACT_SUPPLIER:
        return this.isArtifactSupplier;
      case CardType.VILLAGE_SUPPLIER:
        return this.isVillageSupplier;

  // Allies
      case CardType.LIAISON:
        return this.isLiaison;
      case CardType.COVER:
        return this.isCover;

  // Rising Sun
    case CardType.OMEN:
      return this.isOmen;
    case CardType.SHADOW:
      return this.isShadow;
  // Promps
      case CardType.COMMAND:
        return this.isCommand;
      
      default:
        throw new Error(`Unknown card type: ${cardType}`);
    }
  }

  public static from(data: Partial<SupplyCard>):SupplyCard {
    return new SupplyCard(
      data.id ?? "",
      data.shortId ?? "",
      data.setId ?? SetId.TO_FORCE_RELOAD,
      data.name ?? "",
      data.orderstring ?? "",
      data.cost ?? new Cost(0,0,0), // ou une valeur par défaut

  // Base Game
      data.isAction ?? false,
      data.isActionSupplier ?? false,
      data.isTerminal ?? false,
      data.isAttack ?? false,
      data.isTreasure ?? false,
      data.isVictory ?? false,
      data.isBuySupplier ?? false,
      data.isDrawer ?? false,
      data.isMultiDrawer ?? false,
      data.isReaction ?? false,
      data.isTrashing ?? false,

  // Seaside
      data.isDuration ?? false,
  
  // Adventure
      data.isReserve ?? false,
      data.isTraveller ?? false,
      data.isGathering ?? false,
  
  // Nocturne
      data.isFate ?? false,
      data.isDoom ?? false,
      data.isNight ?? false,
  
  // Renaissance
      data.isArtifactSupplier ?? false,
      data.isVillageSupplier ?? false,
  
  // Allies
      data.isLiaison ?? false,
      data.isCover ?? false,
  
  // Rising Sun
      data.isOmen ?? false,
      data.isShadow ?? false,
  
  // Promo
      data.isCommand ?? false
    );
  }

  public static fromJson(json: any) {
    return new SupplyCard(
      json["id"],
      json["shortId"],
      json["setId"],
      json["name"],
      json["orderstring"] || "",
      Cost.fromJson(json["cost"]),
  // base game
      json["isAction"] || false,
      json["isActionSupplier"] || false,
      json["isTerminal"] || false,
      json["isAttack"] || false,
      json["isTreasure"] || false,
      json["isVictory"] || false,
      json["isBuySupplier"] || false,
      json["isDrawer"] || false,
      json["isMultiDrawer"] || false,
      json["isReaction"] || false,
      json["isTrashing"] || false,

  // Seaside
      json["isDuration"] || false,

  //Adventures
      json["isReserve"] || false,
      json["isTraveller"] || false,

  // Empires
      json["isGathering"] || false,

  //Nocturne
      json["isFate"] || false,
      json["isDoom"] || false,
      json["isNight"] || false,

  // Renaissance
      json["isArtifactSupplier"] || false,
      json["isVillageSupplier"] || false,

  // Allies
      json["isLiaison"] || false,
      json["isCover"] || false,

  // Allies
      json["isOmen"] || false,
      json["isShadow"] || false,
      
  // Promos
      json["isCommand"] || false,

    )
  }
}
