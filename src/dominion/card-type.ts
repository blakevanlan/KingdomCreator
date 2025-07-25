export enum CardType {
  // bsse game
  ACTION = "isAction",
  ACTION_SUPPLIER = "isActionSupplier",
  TERMINAL = "isTerminal",
  ATTACK = "isAttack",
  TREASURE = "isTreasure",
  VICTORY = "isVictory",
  BUY_SUPPLIER = "isBuySupplier",
  DRAWER = "isDrawer",
  MULTI_DRAWER = "isMultiDrawer",
  REACTION = "isReaction",
  TRASHING = "isTrashing",

  // Seaside
  DURATION = "isDuration",

// Adventures
  RESERVE = "isReserve",
  TRAVELLER = "isTraveller",

  // Empires
  GATHERING = "isGathering",

  // Nocturne
  FATE = "isFate",
  DOOM = "isDoom",
  NIGHT = "isNight",

  // Renaissance
  ARTIFACT_SUPPLIER = "isArtifactSupplier",
  VILLAGE_SUPPLIER = "isVillageSupplier",

  // Allies
  LIAISON = "isLiaison",
  COVER = "isCover",

  // Rising sun
  OMEN = "isOmen",
  SHADOW = "isShadow",

  // Promos
  COMMAND = "isCommand"
}

import type { VisibleType } from "./card";

export const VISIBLE_CARD_TYPES: VisibleType<CardType>[] = [
  { type: CardType.ACTION, name: "Action" },
  { type: CardType.ACTION_SUPPLIER, name: "+2 Actions" },
  { type: CardType.DRAWER, name: "+ Cards" },
  { type: CardType.BUY_SUPPLIER, name: "+1 Buy" },
  { type: CardType.ATTACK, name: "Attack" },
  { type: CardType.DURATION, name: "Duration" },
  { type: CardType.REACTION, name: "Reaction" },
  { type: CardType.RESERVE, name: "Reserve" },
  { type: CardType.TRASHING, name: "Trashing" },
  { type: CardType.TREASURE, name: "Treasure" },
  { type: CardType.VICTORY, name: "Victory" },
  { type: CardType.TRAVELLER, name: "Traveller" },      // Adventures
  { type: CardType.GATHERING, name: "Gatherer" },       // Empires
  { type: CardType.FATE, name: "Fate" },                // Nocturne
  { type: CardType.DOOM, name: "Doom" },
  { type: CardType.NIGHT, name: "Night" },
  { type: CardType.ARTIFACT_SUPPLIER, name: "Artifact" }, // Renaissance
  { type: CardType.VILLAGE_SUPPLIER, name: "Villager" },
  { type: CardType.LIAISON, name: "Liaison" },          // Allies
  { type: CardType.OMEN, name: "Omen" },          // Rising Sun
  { type: CardType.SHADOW, name: "Shadow"},
  { type: CardType.COMMAND, name: "Command"},     // Promo
];

