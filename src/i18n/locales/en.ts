import { DominionSets } from "../../dominion/dominion-sets";
import * as Common from "./messages/en/common.en.json";
import * as Languages from "./messages/en/languages.en.json";
import * as PageIndex from "./messages/en/page-index.en.json";
import * as PageRules from "./messages/en/page-rules.en.json";
import * as PageBoxes from "./messages/en/page-boxes.en.json";
import * as PageSets from "./messages/en/page-sets.en.json";
import * as PageSearch from "./messages/en/page-search.en.json";
import * as PageSettings from "./messages/en/page-settings.en.json";

function createCardMessages(): {[index: string]: string} {
  const messages: {[index: string]: string} = {};
  for (const card of DominionSets.getAllCards()) {
    messages[card.id] = card.name;
  }
  return messages;
}

function createSetMessages(): {[index: string]: string} {
  const messages: {[index: string]: string} = {};
  for (const set of DominionSets.getAllSets()) {
    messages[set.setId] = set.name;
  }
    
  return messages;
}

export default {
  ...createCardMessages(),
  ...createSetMessages(),
  ...(Common as any).default,
  ...(Languages as any).default,
  ...(PageIndex as any).default,
  ...(PageRules as any).default,
  ...(PageBoxes as any).default,
  ...(PageSets as any).default,
  ...(PageSearch as any).default,
  ...(PageSettings as any).default
};

