import * as Common from "./messages/fr/common.fr.json";
import * as Sets from "./messages/fr/sets.fr.json";

import * as Languages from "./messages/fr/languages.fr.json";
import * as PageIndex from "./messages/fr/page-index.fr.json";
import * as PageRules from "./messages/fr/page-rules.fr.json";
import * as PageSets from "./messages/fr/page-sets.fr.json";
import * as PageBoxes from "./messages/fr/page-boxes.fr.json";
import * as PageSearch from "./messages/fr/page-search.fr.json";
import * as PageSettings from "./messages/fr/page-settings.fr.json";


//import * as Cards from "./messages/fr/cards.fr.json";

import * as Cards_Adventures from "./messages/fr/cards/cards.fr.adventures.json";
import * as Cards_Alchemy from "./messages/fr/cards/cards.fr.alchemy.json";
import * as Cards_Allies from "./messages/fr/cards/cards.fr.allies.json";
import * as Cards_Baseset from "./messages/fr/cards/cards.fr.baseset.json";
import * as Cards_Cornucopia from "./messages/fr/cards/cards.fr.cornucopia.json";
import * as Cards_Darkages from "./messages/fr/cards/cards.fr.darkages.json";
import * as Cards_Empires from "./messages/fr/cards/cards.fr.empires.json";
import * as Cards_Guilds from "./messages/fr/cards/cards.fr.guilds.json";
import * as Cards_Hinterlands from "./messages/fr/cards/cards.fr.hinterlands.json";
import * as Cards_Intrigue from "./messages/fr/cards/cards.fr.intrigue.json";
import * as Cards_Menagerie from "./messages/fr/cards/cards.fr.menagerie.json";
import * as Cards_Nocturne from "./messages/fr/cards/cards.fr.nocturne.json";
import * as Cards_Plunder from "./messages/fr/cards/cards.fr.plunder.json";
import * as Cards_Promos from "./messages/fr/cards/cards.fr.promos.json";
import * as Cards_Prosperity from "./messages/fr/cards/cards.fr.prosperity.json";
import * as Cards_Renaissance from "./messages/fr/cards/cards.fr.renaissance.json";
import * as Cards_Risingsun from "./messages/fr/cards/cards.fr.risingsun.json";
import * as Cards_Seaside from "./messages/fr/cards/cards.fr.seaside.json";

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
