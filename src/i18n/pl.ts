import * as Cards from "./messages/cards.pl.json";
import * as Common from "./messages/common.pl.json";
import * as Languages from "./messages/languages.pl.json";
import * as PageIndex from "./messages/page-index.pl.json";
import * as PageRules from "./messages/page-rules.pl.json";
import * as PageSets from "./messages/page-sets.pl.json";
import * as Sets from "./messages/sets.pl.json";

export const messages = {
  ...(Cards as any).default,
  ...(Common as any).default,
  ...(Languages as any).default,
  ...(PageIndex as any).default,
  ...(PageRules as any).default,
  ...(PageSets as any).default,
  ...(Sets as any).default,
}
