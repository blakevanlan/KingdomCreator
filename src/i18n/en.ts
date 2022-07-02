import { DominionSets } from "../dominion/dominion-sets";
import * as Common from "./messages/common.en.json";
import * as Languages from "./messages/languages.en.json";
import * as PageIndex from "./messages/page-index.en.json";
import * as PageRules from "./messages/page-rules.en.json";
import * as PageSets from "./messages/page-sets.en.json";

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
    
  // TODO: Remove once Menagerie & Allies is fully supported.
  messages["menagerie"] = "Menagerie";
  messages["allies"] = "Allies";
  return messages;
}

export default {
  ...createCardMessages(),
  ...createSetMessages(),
  ...(Common as any).default,
  ...(Languages as any).default,
  ...(PageIndex as any).default,
  ...(PageRules as any).default,
  ...(PageSets as any).default,
}
