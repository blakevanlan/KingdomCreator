import * as Common from "./messages/de/common.de.json";
import * as Sets from "./messages/de/sets.de.json";

import * as Languages from "./messages/de/languages.de.json";
import * as PageIndex from "./messages/de/page-index.de.json";
import * as PageRules from "./messages/de/page-rules.de.json";
import * as PageSets from "./messages/de/page-sets.de.json";
import * as PageBoxes from "./messages/de/page-boxes.de.json";
import * as PageSearch from "./messages/de/page-search.de.json";
import * as PageSettings from "./messages/de/page-settings.de.json";


//import * as Cards from "./messages/de/cards.de.json";

import * as Cards_Adventures from "./messages/de/cards/cards.de.adventures.json";
import * as Cards_Alchemy from "./messages/de/cards/cards.de.alchemy.json";
import * as Cards_Allies from "./messages/de/cards/cards.de.allies.json";
import * as Cards_Baseset from "./messages/de/cards/cards.de.baseset.json";
import * as Cards_Cornucopia from "./messages/de/cards/cards.de.cornucopia.json";
import * as Cards_Darkages from "./messages/de/cards/cards.de.darkages.json";
import * as Cards_Empires from "./messages/de/cards/cards.de.empires.json";
import * as Cards_Guilds from "./messages/de/cards/cards.de.guilds.json";
import * as Cards_Hinterlands from "./messages/de/cards/cards.de.hinterlands.json";
import * as Cards_Intrigue from "./messages/de/cards/cards.de.intrigue.json";
import * as Cards_Menagerie from "./messages/de/cards/cards.de.menagerie.json";
import * as Cards_Nocturne from "./messages/de/cards/cards.de.nocturne.json";
import * as Cards_Plunder from "./messages/de/cards/cards.de.plunder.json";
import * as Cards_Promos from "./messages/de/cards/cards.de.promos.json";
import * as Cards_Prosperity from "./messages/de/cards/cards.de.prosperity.json";
import * as Cards_Renaissance from "./messages/de/cards/cards.de.renaissance.json";
import * as Cards_Risingsun from "./messages/de/cards/cards.de.risingsun.json";
import * as Cards_Seaside from "./messages/de/cards/cards.de.seaside.json";

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

