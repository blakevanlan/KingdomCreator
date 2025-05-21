import type { DigitalCard } from "../digital-cards-type"

let Temp_CardsList:DigitalCard[] = [];

import { Cards_list_Adventures } from "./French/digital-cards-landscape - Adventures"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Adventures); 

import { Cards_list_Empires } from "./French/digital-cards-landscape - Empires"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Empires);

import { Cards_list_Nocturne } from "./French/digital-cards-landscape - Nocturne"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Nocturne); 

import { Cards_list_Renaissance } from "./French/digital-cards-landscape - Renaissance"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Renaissance);

import { Cards_list_Promo } from "./French/digital-cards-landscape - Promo"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Promo);

import { Cards_list_Menagerie } from "./French/digital-cards-landscape - Menagerie"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Menagerie);

import { Cards_list_Allies } from "./French/digital-cards-landscape - Allies"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Allies);

import { Cards_list_Plunder } from "./French/digital-cards-landscape - Plunder"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Plunder);

import { Cards_list_Risingsun } from "./French/digital-cards-landscape - Risingsun"
Temp_CardsList = Temp_CardsList.concat(Cards_list_Risingsun);

export const Cards_list:DigitalCard[]= Temp_CardsList