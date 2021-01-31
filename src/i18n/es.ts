import * as Cards from "./messages/cards.es.json";
import * as Common from "./messages/common.es.json";
import * as Languages from "./messages/languages.es.json";
import * as PageIndex from "./messages/page-index.es.json";
import * as PageRules from "./messages/page-rules.es.json";
import * as PageSets from "./messages/page-sets.es.json";
import * as Sets from "./messages/sets.es.json";

export const messages = {
  ...(Cards as any).default,
  ...(Common as any).default,
  ...(Languages as any).default,
  ...(PageIndex as any).default,
  ...(PageRules as any).default,
  ...(PageSets as any).default,
  ...(Sets as any).default,
}
