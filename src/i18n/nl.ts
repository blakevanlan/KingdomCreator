import * as Cards from "./messages/cards.nl.json";
import * as Common from "./messages/common.nl.json";
import * as Languages from "./messages/languages.nl.json";
import * as PageIndex from "./messages/page-index.nl.json";
import * as PageRules from "./messages/page-rules.nl.json";
import * as PageSets from "./messages/page-sets.nl.json";
import * as Sets from "./messages/sets.nl.json";

export const messages = {
  ...(Cards as any).default,
  ...(Common as any).default,
  ...(Languages as any).default,
  ...(PageIndex as any).default,
  ...(PageRules as any).default,
  ...(PageSets as any).default,
  ...(Sets as any).default,
}
