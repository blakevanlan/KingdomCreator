import { EventTracker } from "../analytics/follow-activity";
import { EventType } from "../analytics/follow-activity";
import type { Settings } from "../settings/settings";
import { CardType } from "../dominion/card-type";
import { RandomizerOptionsBuilder } from "../randomizer/randomizer-options";
import { Randomizer } from "../randomizer/randomizer";
import type { Kingdom } from "../randomizer/kingdom";
import type { Card } from "../dominion/card";
import type { Supply } from "../randomizer/supply";
import { DominionSets } from "../dominion/dominion-sets";
import type { SupplyCard } from "../dominion/supply-card";
import type { Addon } from "../dominion/addon";
import type { Selection } from "./selection";

export const MIN_SETS_FOR_PRIORITIZE_OPTION = 3;
export const MIN_CARDS_FOR_DISTRIBUTE_COST = 24;

export interface randomizerStoreState {
  kingdom: Kingdom;
  selection: Selection;
  settings: Settings;
  specifyingReplacementSupplyCard: SupplyCard | null ;
  isFullScreen: boolean;
}

export function randomizeSelectedCards(context: randomizerStoreState): Supply | null {
  //console.log("randomizeSelectedCards")
  //console.log(context)
  const excludeCardIds = getSelectedSupplyCards(context).map((card) => card.id);
  const isBaneSelected = isBaneCardSelected(context);
  const isFerrymanSelected = isFerrymanCardSelected(context);
  const isMousewaySelected = isMousewayCardSelected(context);
  const isObeliskSelected = isObeliskCardSelected(context);
  // handle special case where bane, ferryman, obeliskCard, mousewayCard is selected
  if (isBaneSelected) {
    excludeCardIds.push(context.kingdom.supply.baneCard?.id ?? "");
  }
  if (isFerrymanSelected) {
    excludeCardIds.push(context.kingdom.supply.ferrymanCard?.id ?? "");
  }
  if (isMousewaySelected) {
    excludeCardIds.push(context.kingdom.supply.mouseWay?.id ?? "");
  }
  if (isObeliskSelected) {
    excludeCardIds.push(context.kingdom.supply.obeliskCard?.id ?? "");
  }
  const optionsBuilder = createRandomizerOptionsBuilder(context)
      .setSetIds(getSelectedSetIds(context))
      .setIncludeCardIds(getUnselectedSupplyCards(context).map((card) => card.id))
      .setExcludeCardIds(excludeCardIds)
      .setExcludeTypes(getExcludeTypes(context))

  if (!isBaneSelected && context.kingdom.supply.baneCard) {
    optionsBuilder.setBaneCardId(context.kingdom.supply.baneCard?.id ?? false)
  }
  if (!isFerrymanSelected && context.kingdom.supply.ferrymanCard) {
    optionsBuilder.setFerrymanCardId(context.kingdom.supply.ferrymanCard?.id ?? false)
  }
  if (!isMousewaySelected && context.kingdom.supply.mouseWay) {
    optionsBuilder.setMousewayCardId(context.kingdom.supply.mouseWay?.id ?? false)
  }
  if (!isObeliskSelected && context.kingdom.supply.obeliskCard) {
    optionsBuilder.setObeliskCardId(context.kingdom.supply.obeliskCard?.id ?? false)
  }
  const supply = Randomizer.createSupplySafe(optionsBuilder.build());
  if (supply) {
    EventTracker.trackEvent(EventType.RANDOMIZE_MULTIPLE);
  } else {
    EventTracker.trackError(EventType.RANDOMIZE_MULTIPLE);
  }
  return supply;
}

export function randomizeSelectedAddons(context: randomizerStoreState) {
  const newAddonsCount = getSelectedEvents(context).length
      + getSelectedLandmarks(context).length
      + getSelectedProjects(context).length
      + getSelectedWays(context).length
      + getSelectedTraits(context).length;
  const addonIds = getAddons(context).map((addon) => addon.id);
  EventTracker.trackEvent(EventType.RANDOMIZE_EVENTS_AND_LANDMARKS);
  return Randomizer.getRandomAddons(getSelectedSetIds(context), addonIds, newAddonsCount);
}

export function randomizeUndefinedAddon(context: randomizerStoreState) {
  const addonIds = getAddons(context).map((addon) => addon.id);
  EventTracker.trackEvent(EventType.RANDOMIZE_EVENTS_AND_LANDMARKS);
  return Randomizer.getRandomAddons(getSelectedSetIds(context), addonIds, 1);
}

export function randomizeSelectedBoons(context: randomizerStoreState, supply: Supply) {
  if (getSelectedBoons(context).length) {
    EventTracker.trackEvent(EventType.RANDOMIZE_BOONS);
  }
  return Randomizer.getRandomBoons(supply, getUnselectedBoons(context));
}

export function randomizeSelectedAlly(context: randomizerStoreState, supply: Supply) {
  if (supply.supplyCards.every((s) => !s.isLiaison)) {
      return null;
  }
  const selectedAlly = getSelectedAlly(context);
  if (!selectedAlly.length) {
    const unselectedAlly = getUnselectedAlly(context);
    if (unselectedAlly !== null) return unselectedAlly
    return Randomizer.getRandomAlly(supply)
  }
  console.log('RANDOMIZE_ALLY')
  EventTracker.trackEvent(EventType.RANDOMIZE_ALLY);
  return Randomizer.getRandomAlly(supply, selectedAlly[0].id);
}

export function isDistributeCostAllowed (context: randomizerStoreState) {
  const cardCount = context.settings.selectedSets
      .map(DominionSets.getSetById)
      .map((set) => set.supplyCards.length)
      .reduce((acc, value) => acc + value, 0);
  return cardCount >= MIN_CARDS_FOR_DISTRIBUTE_COST;
}

export function isPrioritizeSetAllowed(context: randomizerStoreState) {
  return context.settings.selectedSets.length >= MIN_SETS_FOR_PRIORITIZE_OPTION;
}

export function createRandomizerOptionsBuilder(context: randomizerStoreState) {
  const randomizerSettings = context.settings.randomizerSettings;
  return new RandomizerOptionsBuilder()
      .setRequireActionProvider(randomizerSettings.requireActionProvider)
      .setRequireBuyProvider(randomizerSettings.requireBuyProvider)
      .setRequireTrashing(randomizerSettings.requireTrashing)
      .setRequireReactionIfAttacks(randomizerSettings.requireReaction)
      .setUseAlchemyRecommendation(randomizerSettings.isAlchemyRecommendationEnabled)
      .setDistributeCost(
          isDistributeCostAllowed(context) && 
          randomizerSettings.distributeCost)
      .setPrioritizeSet(
          isPrioritizeSetAllowed(context)
              ? randomizerSettings.prioritizeSet
              : null);
}

export function getCardsToExclude(context: randomizerStoreState) {
  // Only exclude cards when at least 3 sets are selected and no sets are prioritized.
  if (context.settings.randomizerSettings.prioritizeSet) {
    return [];
  } 
  const setIds = getSelectedSetIds(context);
  return setIds.length >= 3
      ? getSelectedSupplyCards(context).map((card) => card.id)
      : [];
}

export function getAddons(context: randomizerStoreState) {
  const kingdom = context.kingdom;
  return (kingdom.events as Addon[])
      .concat(
        kingdom.landmarks as Addon[], 
        kingdom.projects as Addon[],
        kingdom.ways as Addon[],
        kingdom.traits as Addon[],
      );
}

export function getSelectedSetIds(context: randomizerStoreState) {
  return context.settings.selectedSets;
}

export function getExcludeTypes(context: randomizerStoreState): CardType[] {
  return context.settings.randomizerSettings.allowAttacks ? [] : [CardType.ATTACK];
}

export function getSelectedSupplyCards(context: randomizerStoreState) {
  return getSelected(context, context.kingdom.supply.getSupplyCardsWithBaneandOthers());
}

export function getUnselectedSupplyCards(context: randomizerStoreState) {
  const selection = context.selection;
  const cards = context.kingdom.supply.supplyCards;
  return cards.filter((card) => !selection.contains(card.id));
}

export function getSelectedEvents(context: randomizerStoreState) {
  return getSelected(context, context.kingdom.events);
}

export function getSelectedLandmarks(context: randomizerStoreState) {
  return getSelected(context, context.kingdom.landmarks);
}

export function getSelectedProjects(context: randomizerStoreState) {
  return getSelected(context, context.kingdom.projects);
}

export function getSelectedWays(context: randomizerStoreState) {
  return getSelected(context, context.kingdom.ways);
}

export function getSelectedBoons(context: randomizerStoreState) {
  return getSelected(context, context.kingdom.boons);
}

export function getSelectedTraits(context: randomizerStoreState) {
  return getSelected(context, context.kingdom.traits);
}

export function getSelectedAlly(context: randomizerStoreState) {
  return getSelected(context, context.kingdom.ally ? [context.kingdom.ally] : []);
}

export function getSelected<T extends Card>(context: randomizerStoreState, cards: T[]) {
  const selection = context.selection;
  return cards.filter((card) => selection.contains(card.id));
}

export function getUnselectedEvents(context: randomizerStoreState) {
  return getUnselected(context, context.kingdom.events);
}

export function getUnselectedLandmarks(context: randomizerStoreState) {
  return getUnselected(context, context.kingdom.landmarks);
}

export function getUnselectedProjects(context: randomizerStoreState) {
  return getUnselected(context, context.kingdom.projects);
}

export function getUnselectedWays(context: randomizerStoreState) {
  return getUnselected(context, context.kingdom.ways);
}

export function getUnselectedTraits(context: randomizerStoreState) {
  return getUnselected(context, context.kingdom.traits);
}

export function getUnselectedAlly(context: randomizerStoreState) {
  const unselected = getUnselected(context, context.kingdom.ally ? [context.kingdom.ally] : []);
  return unselected.length ? unselected[0] : null;
}

export function getUnselectedBoons(context: randomizerStoreState) {
  return getUnselected(context, context.kingdom.boons);
}

export function getUnselected<T extends Card>(context: randomizerStoreState, cards: T[]) {
  const selection = context.selection;
  return cards.filter((card) => !selection.contains(card.id));
}

export function isBaneCardSelected(context: randomizerStoreState) {
  const selection = context.selection;
  const baneCard = context.kingdom.supply.baneCard;
  return Boolean(baneCard && selection.contains(baneCard.id));
}

export function isFerrymanCardSelected(context: randomizerStoreState) {
  const selection = context.selection;
  const ferrymanCard = context.kingdom.supply.ferrymanCard;
  return Boolean(ferrymanCard && selection.contains(ferrymanCard.id));
}

export function isMousewayCardSelected(context: randomizerStoreState) {
  const selection = context.selection;
  const mousewayCard = context.kingdom.supply.mouseWay;
  return Boolean(mousewayCard && selection.contains(mousewayCard.id));
}

export function isObeliskCardSelected(context: randomizerStoreState) {
  const selection = context.selection;
  const obeliskCard = context.kingdom.supply.obeliskCard;
  return Boolean(obeliskCard && selection.contains(obeliskCard.id));
}