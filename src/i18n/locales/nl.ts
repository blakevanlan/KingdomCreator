import * as Common from "./messages/nl/common.nl.json";
import * as Sets from "./messages/nl/sets.nl.json";

import * as Languages from "./messages/nl/languages.nl.json";
import * as PageIndex from "./messages/nl/page-index.nl.json";
import * as PageRules from "./messages/nl/page-rules.nl.json";
import * as PageSets from "./messages/nl/page-sets.nl.json";
import * as PageBoxes from "./messages/nl/page-boxes.nl.json";
import * as PageSearch from "./messages/nl/page-search.nl.json";
import * as PageSettings from "./messages/nl/page-settings.nl.json";

//import * as Cards from "./messages/nl/cards.nl.json";

import * as Cards_Adventures from "./messages/nl/cards/cards.nl.adventures.json";
import * as Cards_Alchemy from "./messages/nl/cards/cards.nl.alchemy.json";
import * as Cards_Allies from "./messages/nl/cards/cards.nl.allies.json";
import * as Cards_Baseset from "./messages/nl/cards/cards.nl.baseset.json";
import * as Cards_Cornucopia from "./messages/nl/cards/cards.nl.cornucopia.json";
import * as Cards_Darkages from "./messages/nl/cards/cards.nl.darkages.json";
import * as Cards_Empires from "./messages/nl/cards/cards.nl.empires.json";
import * as Cards_Guilds from "./messages/nl/cards/cards.nl.guilds.json";
import * as Cards_Hinterlands from "./messages/nl/cards/cards.nl.hinterlands.json";
import * as Cards_Intrigue from "./messages/nl/cards/cards.nl.intrigue.json";
import * as Cards_Menagerie from "./messages/nl/cards/cards.nl.menagerie.json";
import * as Cards_Nocturne from "./messages/nl/cards/cards.nl.nocturne.json";
import * as Cards_Plunder from "./messages/nl/cards/cards.nl.plunder.json";
import * as Cards_Promos from "./messages/nl/cards/cards.nl.promos.json";
import * as Cards_Prosperity from "./messages/nl/cards/cards.nl.prosperity.json";
import * as Cards_Renaissance from "./messages/nl/cards/cards.nl.renaissance.json";
import * as Cards_Risingsun from "./messages/nl/cards/cards.nl.risingsun.json";
import * as Cards_Seaside from "./messages/nl/cards/cards.nl.seaside.json";

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
