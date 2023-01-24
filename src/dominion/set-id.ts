export enum SetId {
  ADVENTURES = "adventures",
  ALCHEMY = "alchemy",
  ALLIES = "allies",
  BASE_SET = "baseset",
  BASE_SET_2 = "baseset2",
  CORNUCOPIA = "cornucopia",
  DARK_AGES = "darkages",
  EMPIRES = "empires",
  GUILDS = "guilds",
  GUILDSCONUCOPIA = "guildscornucopia",
  HINTERLANDS = "hinterlands",
  HINTERLANDS_2 = "hinterlands2",
  INTRIGUE = "intrigue",
  INTRIGUE_2 = "intrigue2",
  MENAGERIE = "menagerie",
  NOCTURNE = "nocturne",
  PLUNDER = "plunder",
  PROMOS = "promos",
  PROSPERITY = "prosperity",
  PROSPERITY_2 = "prosperity2",
  RENAISSANCE = "renaissance",
  SEASIDE = "seaside",
  SEASIDE_2 = "seaside2",
}
export interface VersionOfSet {
    readonly id: SetId,
    readonly idv2: SetId
};

export const MultipleVersionSets:VersionOfSet[]= [
{ id: SetId.BASE_SET,    idv2: SetId.BASE_SET_2 },
{ id: SetId.INTRIGUE,    idv2: SetId.INTRIGUE_2 },
{ id: SetId.SEASIDE,     idv2: SetId.SEASIDE_2 },
{ id: SetId.PROSPERITY,  idv2: SetId.PROSPERITY_2 },
{ id: SetId.HINTERLANDS, idv2: SetId.HINTERLANDS_2 }
];

export const HideMultipleVersionSets = [
      SetId.BASE_SET_2, 
      SetId.INTRIGUE_2,
      SetId.SEASIDE_2,
      SetId.PROSPERITY_2,
      SetId.HINTERLANDS_2,
];