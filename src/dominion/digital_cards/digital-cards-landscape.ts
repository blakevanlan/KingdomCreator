import type { DigitalCard } from "./digital-cards-type"

let Temp_CardsList:DigitalCard[] = [];

import { Cards_list_adventures } from "./digital-cards-landscape - Adventures"
Temp_CardsList = Temp_CardsList.concat(Cards_list_adventures); 

import { Cards_list_empires } from "./digital-cards-landscape - Empires"
Temp_CardsList = Temp_CardsList.concat(Cards_list_empires);

import { Cards_list_nocturne } from "./digital-cards-landscape - Nocturne"
Temp_CardsList = Temp_CardsList.concat(Cards_list_nocturne); 

import { Cards_list_renaissance } from "./digital-cards-landscape - Renaissance"
Temp_CardsList = Temp_CardsList.concat(Cards_list_renaissance);

import { Cards_list_promo } from "./digital-cards-landscape - Promo"
Temp_CardsList = Temp_CardsList.concat(Cards_list_promo);

import { Cards_list_menagerie } from "./digital-cards-landscape - Menagerie"
Temp_CardsList = Temp_CardsList.concat(Cards_list_menagerie);

import { Cards_list_allies } from "./digital-cards-landscape - Allies"
Temp_CardsList = Temp_CardsList.concat(Cards_list_allies);

export const Cards_list:DigitalCard[]= Temp_CardsList