import * as Cards from "./messages/cards.fr.json";
import * as Common from "./messages/common.fr.json";
import * as Languages from "./messages/languages.fr.json";
import * as PageIndex from "./messages/page-index.fr.json";
import * as PageRules from "./messages/page-rules.fr.json";
import * as PageSets from "./messages/page-sets.fr.json";
import * as Sets from "./messages/sets.fr.json";

export const messages = {
  ...(Cards as any).default,
  ...(Common as any).default,
  ...(Languages as any).default,
  ...(PageIndex as any).default,
  ...(PageRules as any).default,
  ...(PageSets as any).default,
  ...(Sets as any).default,
}
