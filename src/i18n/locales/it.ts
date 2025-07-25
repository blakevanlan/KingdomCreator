import * as Common from "./messages/it/common.it.json";
import * as Sets from "./messages/it/sets.it.json";

import * as Languages from "./messages/it/languages.it.json";
import * as PageIndex from "./messages/it/page-index.it.json";
import * as PageRules from "./messages/it/page-rules.it.json";
import * as PageSets from "./messages/it/page-sets.it.json";
import * as PageBoxes from "./messages/it/page-boxes.it.json";
import * as PageSearch from "./messages/it/page-search.it.json";
import * as PageSettings from "./messages/it/page-settings.it.json";


//import * as Cards from "./messages/it/cards.it.json";

import * as Cards_Adventures from "./messages/it/cards/cards.it.adventures.json";
import * as Cards_Alchemy from "./messages/it/cards/cards.it.alchemy.json";
import * as Cards_Allies from "./messages/it/cards/cards.it.allies.json";
import * as Cards_Baseset from "./messages/it/cards/cards.it.baseset.json";
import * as Cards_Cornucopia from "./messages/it/cards/cards.it.cornucopia.json";
import * as Cards_Darkages from "./messages/it/cards/cards.it.darkages.json";
import * as Cards_Empires from "./messages/it/cards/cards.it.empires.json";
import * as Cards_Guilds from "./messages/it/cards/cards.it.guilds.json";
import * as Cards_Hinterlands from "./messages/it/cards/cards.it.hinterlands.json";
import * as Cards_Intrigue from "./messages/it/cards/cards.it.intrigue.json";
import * as Cards_Menagerie from "./messages/it/cards/cards.it.menagerie.json";
import * as Cards_Nocturne from "./messages/it/cards/cards.it.nocturne.json";
import * as Cards_Plunder from "./messages/it/cards/cards.it.promos.json";
import * as Cards_Promos from "./messages/it/cards/cards.it.plunder.json";
import * as Cards_Prosperity from "./messages/it/cards/cards.it.prosperity.json";
import * as Cards_Renaissance from "./messages/it/cards/cards.it.renaissance.json";
import * as Cards_Risingsun from "./messages/it/cards/cards.it.risingsun.json";
import * as Cards_Seaside from "./messages/it/cards/cards.it.seaside.json";

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

