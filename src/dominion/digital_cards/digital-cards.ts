import type { DigitalCard } from "./digital-cards-type"
let Temp_CardsList:DigitalCard[] = [];

import { Cards_list_Baseset } from "./Manual/French/digital-cards - Baseset"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Baseset);

import { Cards_list_Intrigue } from "./Manual/French/digital-cards - Intrigue"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Intrigue);

import { Cards_list_Seaside } from "./Manual/French/digital-cards - Seaside"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Seaside);

import { Cards_list_Alchemy } from "./Manual/French/digital-cards - Alchemy"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Alchemy);

import { Cards_list_Prosperity } from "./Manual/French/digital-cards - Prosperity"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Prosperity);

import { Cards_list_Cornucopia } from "./Manual/French/digital-cards - Cornucopia"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Cornucopia);

import { Cards_list_Hinterlands } from "./Manual/French/digital-cards - Hinterlands"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Hinterlands);

import { Cards_list_Darkages } from "./Manual/French/digital-cards - Darkages"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Darkages);

import { Cards_list_Adventures } from "./Manual/French/digital-cards - Adventures"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Adventures);

import { Cards_list_Empires } from "./Manual/French/digital-cards - Empires"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Empires);

import { Cards_list_Nocturne } from "./Manual/French/digital-cards - Nocturne"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Nocturne);

import { Cards_list_Renaissance } from "./Manual/French/digital-cards - Renaissance"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Renaissance);

import { Cards_list_Promo } from "./Manual/French/digital-cards - Promo"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Promo);

import { Cards_list_Menagerie } from "./Manual/French/digital-cards - Menagerie"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Menagerie);

import { Cards_list_Allies } from "./Manual/French/digital-cards - Allies"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Allies);

import { Cards_list_Guilds } from "./Manual/French/digital-cards - Guilds"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Guilds);

import { Cards_list_Guildscornucopia } from "./Manual/French/digital-cards - Guildscornucopia"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Guildscornucopia);

import { Cards_list_Plunder } from "./Manual/French/digital-cards - Plunder"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Plunder);

import { Cards_list_Risingsun } from "./Manual/French/digital-cards - Risingsun"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Risingsun);

import { Cards_list as Temp_CardsList_Landscape } from "./Manual/digital-cards-landscape"

export const Cards_list:DigitalCard[]= Temp_CardsList

export const Cards_list_Landsacpe:DigitalCard[]= Temp_CardsList_Landscape