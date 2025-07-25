import * as Common from "./messages/es/common.es.json";
import * as Sets from "./messages/es/sets.es.json";

import * as Languages from "./messages/es/languages.es.json";
import * as PageIndex from "./messages/es/page-index.es.json";
import * as PageRules from "./messages/es/page-rules.es.json";
import * as PageSets from "./messages/es/page-sets.es.json";
import * as PageBoxes from "./messages/es/page-boxes.es.json";
import * as PageSearch from "./messages/es/page-search.es.json";
import * as PageSettings from "./messages/es/page-settings.es.json";


//import * as Cards from "./messages/es/cards.es.json";

import * as Cards_Adventures from "./messages/es/cards/cards.es.adventures.json";
import * as Cards_Alchemy from "./messages/es/cards/cards.es.alchemy.json";
import * as Cards_Allies from "./messages/es/cards/cards.es.allies.json";
import * as Cards_Baseset from "./messages/es/cards/cards.es.baseset.json";
import * as Cards_Cornucopia from "./messages/es/cards/cards.es.cornucopia.json";
import * as Cards_Darkages from "./messages/es/cards/cards.es.darkages.json";
import * as Cards_Empires from "./messages/es/cards/cards.es.empires.json";
import * as Cards_Guilds from "./messages/es/cards/cards.es.guilds.json";
import * as Cards_Hinterlands from "./messages/es/cards/cards.es.hinterlands.json";
import * as Cards_Intrigue from "./messages/es/cards/cards.es.intrigue.json";
import * as Cards_Menagerie from "./messages/es/cards/cards.es.menagerie.json";
import * as Cards_Nocturne from "./messages/es/cards/cards.es.nocturne.json";
import * as Cards_Plunder from "./messages/es/cards/cards.es.plunder.json";
import * as Cards_Promos from "./messages/es/cards/cards.es.promos.json";
import * as Cards_Prosperity from "./messages/es/cards/cards.es.prosperity.json";
import * as Cards_Renaissance from "./messages/es/cards/cards.es.renaissance.json";
import * as Cards_Risingsun from "./messages/es/cards/cards.es.risingsun.json";
import * as Cards_Seaside from "./messages/es/cards/cards.es.seaside.json";

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
