import type {CardType} from "../dominion/card-type";
import type {CostType} from "../dominion/cost-type";
import {SetId} from "../dominion/set-id";

export class RandomizerOptions {
  constructor(
    readonly setIds: SetId[],
    readonly includeCardIds: string[],
    readonly excludeCardIds: string[],
    readonly requireSingleCardOfType: CardType | null,
    readonly excludeTypes: CardType[],
    readonly excludeCosts: CostType[],
    readonly requireActionProvider: boolean,
    readonly requireCardProvider: boolean,
    readonly requireBuyProvider: boolean,
    readonly requireReactionIfAttacks: boolean,
    readonly requireTrashing: boolean,
    readonly distributeCost: boolean,
    readonly prioritizeSet: SetId | null,
    readonly baneCardId: string | null,
    readonly ferrymanCardId: string | null,
    readonly mousewayCardId: string | null,
    readonly obeliskCardId: string | null,
    readonly useAlchemyRecommendation: boolean,) {
  }
}

export class RandomizerOptionsBuilder {
  setIds: SetId[] = [SetId.BASE_SET];
  includeCardIds: string[] = [];
  excludeCardIds: string[] = [];
  requireSingleCardOfType: CardType | null = null;
  excludeTypes: CardType[] =  [];
  excludeCosts: CostType[] = [];
  requireActionProvider: boolean = true;
  requireCardProvider: boolean = false;
  requireBuyProvider: boolean = false;
  requireReactionIfAttacks: boolean = false;
  requireTrashing: boolean = false;
  distributeCost: boolean = false;
  prioritizeSet: SetId | null = null;
  baneCardId: string | null = null;
  ferrymanCardId: string | null = null;
  mousewayCardId: string | null = null;
  obeliskCardId: string | null = null;
  useAlchemyRecommendation = true;

  setSetIds(setIds: SetId[]) {
    this.setIds = setIds;
    return this;
  }

  setIncludeCardIds(includeCardIds: string[]) {
    this.includeCardIds = includeCardIds ;
    return this;
  }

  setExcludeCardIds(excludeCardIds: string[]) {
    this.excludeCardIds = excludeCardIds;
    return this;
  }

  setRequireSingleCardOfType(requireSingleCardOfType: CardType | null) {
    this.requireSingleCardOfType = requireSingleCardOfType;
    return this;
  }

  setExcludeTypes(excludeTypes: CardType[]) {
    this.excludeTypes = excludeTypes;
    return this;
  }

  setExcludeCosts(excludeCosts: CostType[]) {
    this.excludeCosts = excludeCosts;
    return this;
  }

  setRequireActionProvider(requireActionProvider: boolean) {
    this.requireActionProvider = requireActionProvider;
    return this;
  }

  setRequireCardProvider(requireCardProvider: boolean) {
    this.requireCardProvider = requireCardProvider;
    return this;
  }


  setRequireBuyProvider(requireBuyProvider: boolean) {
    this.requireBuyProvider = requireBuyProvider;
    return this;
  }

  setRequireReactionIfAttacks(requireReactionIfAttacks: boolean) {
    this.requireReactionIfAttacks = requireReactionIfAttacks;
    return this;
  }

  setRequireTrashing(requireTrashing: boolean) {
    this.requireTrashing = requireTrashing;
    return this;
  }

  setDistributeCost(distributeCost: boolean) {
    this.distributeCost = distributeCost;
    return this;
  }

  setPrioritizeSet(prioritizeSet: SetId | null) {
    this.prioritizeSet = prioritizeSet;
    return this;
  }

  setBaneCardId(baneCardId: string | null) {
    this.baneCardId = baneCardId;
    return this;
  }

  setFerrymanCardId(ferrymanCardId: string | null) {
    this.ferrymanCardId = ferrymanCardId;
    return this;
  }

  setMousewayCardId(mousewayCardId: string | null) {
    this.mousewayCardId = mousewayCardId;
    return this;
  }

  setObeliskCardId(obeliskCardId: string | null) {
    this.obeliskCardId = obeliskCardId;
    return this;
  }

  setUseAlchemyRecommendation(useAlchemyRecommendation: boolean) {
    this.useAlchemyRecommendation = useAlchemyRecommendation;
    return this;
  }

  build() {
    return new RandomizerOptions(
        this.setIds,
        this.includeCardIds,
        this.excludeCardIds,
        this.requireSingleCardOfType,
        this.excludeTypes,
        this.excludeCosts,
        this.requireActionProvider,
        this.requireCardProvider,
        this.requireBuyProvider,
        this.requireReactionIfAttacks,
        this.requireTrashing,
        this.distributeCost,
        this.prioritizeSet,
        this.baneCardId,
        this.ferrymanCardId,
        this.mousewayCardId,
        this.obeliskCardId,
        this.useAlchemyRecommendation);
  }
}