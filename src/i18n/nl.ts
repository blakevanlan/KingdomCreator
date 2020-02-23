import * as Cards from "./messages/cards.nl.json";
import * as Languages from "./messages/languages.nl.json";
import * as PageIndex from "./messages/page-index.nl.json";
import * as Sets from "./messages/sets.nl.json";

export const messages = {
  ...(Cards as any).default,
  ...(Languages as any).default,
  ...(PageIndex as any).default,
  ...(Sets as any).default,
}
