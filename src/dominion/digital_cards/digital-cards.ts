import type { DigitalCard } from "./digital-cards-type"
let Temp_CardsList:DigitalCard[] = [];

import { Cards_list_Baseset, Cards_list_Baseset2 } from "./digital-cards - Baseset"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Baseset, Cards_list_Baseset2);

import { Cards_list_Intrigue, Cards_list_Intrigue2 } from "./digital-cards - Intrigue"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Intrigue, Cards_list_Intrigue2);

import { Cards_list_Seaside } from "./digital-cards - Seaside"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Seaside);

import { Cards_list_Alchemy } from "./digital-cards - Alchemy"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Alchemy);

import { Cards_list_Prosperity } from "./digital-cards - Prosperity"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Prosperity);

import { Cards_list_Cornucopia } from "./digital-cards - Cornucopia"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Cornucopia);

import { Cards_list_Hinterlands } from "./digital-cards - Hinterlands"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Hinterlands);

import { Cards_list_Darkages } from "./digital-cards - Darkages"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Darkages);

import { Cards_list_Guilds } from "./digital-cards - Guilds"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Guilds);

import { Cards_list_Adventures } from "./digital-cards - Adventures"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Adventures);

import { Cards_list_Empires } from "./digital-cards - Empires"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Empires);

import { Cards_list_Nocturne } from "./digital-cards - Nocturne"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Nocturne);

import { Cards_list_Renaissance } from "./digital-cards - Renaissance"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Renaissance);

import { Cards_list_Promo } from "./digital-cards - Promo"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Promo);

import { Cards_list_Menagerie } from "./digital-cards - Menagerie"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Menagerie);

import { Cards_list_Allies } from "./digital-cards - Allies"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Allies);

export const Cards_list:DigitalCard[]= Temp_CardsList