import type { DominionSet } from '@/dominion/dominion-set';


interface genericCardTypes {
  cardType: string;
  title: string;
}

export const OTHER_CARD_TYPES: genericCardTypes[] = [
  { cardType: "Knight", title: "Supply Cards - Knights" }, /* dark Ages */
  { cardType: "Castle", title: "Supply Cards - Castles" }, /* empires */
  { cardType: "Basic Cards Treasure", title: "Basic Cards" },
  { cardType: "Basic Cards Victory", title: "Basic Cards" },
  { cardType: "Basic Cards", title: "Basic Cards" },
  { cardType: "Ruins", title: "Basic Cards - Ruins" }, /* dark Ages */
  { cardType: "Shelter", title: "Basic Cards - Shelters" }, /* dark Ages */
  { cardType: "Non-Supply Cards", title: "Non-Supply Cards" },
  { cardType: "Split Cards", title: "Supply Cards Split Piles" },
  { cardType: "Travellers Page", title: "Supply Cards - Travellers - Page Progression" }, /* adventures */
  { cardType: "Travellers Peasant", title: "Supply Cards - Travellers - Peasant Progression" }, /* adventures */
  { cardType: "Prize", title: "Non-Supply Cards" },
  { cardType: "Heirloom", title: "Non-Supply Cards - Heirlooms" }, /*nocturne */
  { cardType: "Loot", title: "Loot Cards" },
  { cardType: "version", title: "Multiples versions of Cards" },

];

export const OTHER_CARD_TYPES_HORIZONTAL: genericCardTypes[] = [
  { cardType: "Hexes", title: "Hexes" }, /*nocturne */
  { cardType: "States", title: "States" }, /*nocturne */
  { cardType: "Artifacts", title: "Artifacts" }, /* Renaissance */
];

export const OTHER_CARD_TYPES_MAT_HORIZONTAL: genericCardTypes[] = [
  { cardType: "Mat Horizontal", title: "Mat included in box" },
];

export const OTHER_CARD_TYPES_MAT: genericCardTypes[] = [
  { cardType: "Mat Vertical", title: "Mat included in box" },
];

export const OTHER_CARD_TYPES_MAT_SQUARE: genericCardTypes[] = [
  { cardType: "Mat Square", title: "Mat included in box" },
  { cardType: "advToken", title: "Tokens included in box" },
  { cardType: "Tokens", title: "Tokens included in box" },
];


export const getOtherCards = (set: DominionSet, typeRequested: string) => {
  return set.otherCards.filter((card) => ((card.type).includes(typeRequested)));
};

