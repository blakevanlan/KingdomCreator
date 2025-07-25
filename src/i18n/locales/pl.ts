import * as Common from "./messages/pl/common.pl.json";
import * as Sets from "./messages/pl/sets.pl.json";

import * as Languages from "./messages/pl/languages.pl.json";
import * as PageIndex from "./messages/pl/page-index.pl.json";
import * as PageRules from "./messages/pl/page-rules.pl.json";
import * as PageSets from "./messages/pl/page-sets.pl.json";
import * as PageBoxes from "./messages/pl/page-boxes.pl.json";
import * as PageSearch from "./messages/pl/page-search.pl.json";
import * as PageSettings from "./messages/pl/page-settings.pl.json";


//import * as Cards from "./messages/pl/cards.pl.json";

import * as Cards_Adventures from "./messages/pl/cards/cards.pl.adventures.json";
import * as Cards_Alchemy from "./messages/pl/cards/cards.pl.alchemy.json";
import * as Cards_Allies from "./messages/pl/cards/cards.pl.allies.json";
import * as Cards_Baseset from "./messages/pl/cards/cards.pl.baseset.json";
import * as Cards_Cornucopia from "./messages/pl/cards/cards.pl.cornucopia.json";
import * as Cards_Darkages from "./messages/pl/cards/cards.pl.darkages.json";
import * as Cards_Empires from "./messages/pl/cards/cards.pl.empires.json";
import * as Cards_Guilds from "./messages/pl/cards/cards.pl.guilds.json";
import * as Cards_Hinterlands from "./messages/pl/cards/cards.pl.hinterlands.json";
import * as Cards_Intrigue from "./messages/pl/cards/cards.pl.intrigue.json";
import * as Cards_Menagerie from "./messages/pl/cards/cards.pl.menagerie.json";
import * as Cards_Nocturne from "./messages/pl/cards/cards.pl.nocturne.json";
import * as Cards_Plunder from "./messages/pl/cards/cards.pl.promos.json";
import * as Cards_Promos from "./messages/pl/cards/cards.pl.plunder.json";
import * as Cards_Prosperity from "./messages/pl/cards/cards.pl.prosperity.json";
import * as Cards_Renaissance from "./messages/pl/cards/cards.pl.renaissance.json";
import * as Cards_Risingsun from "./messages/pl/cards/cards.pl.risingsun.json";
import * as Cards_Seaside from "./messages/pl/cards/cards.pl.seaside.json";

export default {
  ...(Common as any).default,
  ...(Sets as any).default,

  ...(Languages as any).default, 
  ...(PageIndex as any).default,
  ...(PageRules as any).default,
  ...(PageSets as any).default,
  ...(PageBoxes as any).default,
  ...(PageSearch as any).default,
  ...(PageSettings as any).default,
/*
  ...(Cards as any).default,
*/

  ...(Cards_Adventures as any).default,
  ...(Cards_Alchemy as any).default,
  ...(Cards_Allies as any).default,
  ...(Cards_Baseset as any).default,
  ...(Cards_Cornucopia as any).default,
  ...(Cards_Darkages as any).default,
  ...(Cards_Empires as any).default,
  ...(Cards_Guilds as any).default,
  ...(Cards_Hinterlands as any).default,
  ...(Cards_Intrigue as any).default,
  ...(Cards_Menagerie as any).default,
  ...(Cards_Nocturne as any).default,
  ...(Cards_Plunder as any).default,
  ...(Cards_Promos as any).default,
  ...(Cards_Prosperity as any).default,
  ...(Cards_Renaissance as any).default,
  ...(Cards_Risingsun as any).default,
  ...(Cards_Seaside as any).default

}

