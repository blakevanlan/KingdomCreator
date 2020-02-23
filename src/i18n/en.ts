import { DominionSets } from "../dominion/dominion-sets";
import * as Languages from "./messages/languages.en.json";
import * as PageIndex from "./messages/page-index.en.json";

function createCardMessages(): {[index: string]: string} {
  const messages: {[index: string]: string} = {};
  for (let card of DominionSets.getAllCards()) {
    messages[card.id] = card.name;
  }
  return messages;
}

function createSetMessages(): {[index: string]: string} {
  const messages: {[index: string]: string} = {};
  for (let set of DominionSets.getAllSets()) {
    messages[set.setId] = set.name;
  }
  return messages;
}

export default {
  ...createCardMessages(),
  ...createSetMessages(),
  ...(Languages as any).default,
  ...(PageIndex as any).default,
}
