import * as Cards from "./messages/cards.de.json";
import * as Languages from "./messages/languages.de.json";
import * as PageIndex from "./messages/page-index.de.json";
import * as Sets from "./messages/sets.de.json";

export const messages = {
  ...(Cards as any).default,
  ...(Languages as any).default,
  ...(PageIndex as any).default,
  ...(Sets as any).default,
}