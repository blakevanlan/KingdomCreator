import type { DigitalCard } from "./digital-cards-type"

let Temp_CardsList:DigitalCard[] = [];

import { Cards_list_Adventures } from "./digital-cards-landscape - Adventures"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Adventures); 

import { Cards_list_Empires } from "./digital-cards-landscape - Empires"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Empires);

import { Cards_list_Nocturne } from "./digital-cards-landscape - Nocturne"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Nocturne); 

import { Cards_list_Renaissance } from "./digital-cards-landscape - Renaissance"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Renaissance);

import { Cards_list_Promo } from "./digital-cards-landscape - Promo"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Promo);

import { Cards_list_Menagerie } from "./digital-cards-landscape - Menagerie"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Menagerie);

import { Cards_list_Allies } from "./digital-cards-landscape - Allies"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Allies);

export const Cards_list:DigitalCard[]= Temp_CardsList