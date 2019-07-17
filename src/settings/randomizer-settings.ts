import {DominionSets} from "../dominion/dominion-sets";
import {SetId} from "../dominion/set-id";

export interface RandomizerSettingsParams {
  requireActionProvider?: boolean;
  requireCardProvider?: boolean;
  requireBuyProvider?: boolean;
  allowAttacks?: boolean;
  requireReaction?: boolean;
  requireTrashing?: boolean;
  distributeCost?: boolean;
  prioritizeSet?: SetId | null;
}

export class RandomizerSettings implements RandomizerSettingsParams {
  constructor(
      readonly requireActionProvider: boolean,
      readonly requireCardProvider: boolean,
      readonly requireBuyProvider: boolean,
      readonly allowAttacks: boolean,
      readonly requireReaction: boolean,
      readonly requireTrashing: boolean,
      readonly distributeCost: boolean,
      readonly prioritizeSet: SetId | null) {
  }

  withParams(params: RandomizerSettingsParams) {
    return new RandomizerSettings(
        params.requireActionProvider !== undefined ? params.requireActionProvider : this.requireActionProvider,
        params.requireCardProvider !== undefined ? params.requireCardProvider : this.requireCardProvider,
        params.requireBuyProvider !== undefined ? params.requireBuyProvider : this.requireBuyProvider,
        params.allowAttacks !== undefined ? params.allowAttacks : this.allowAttacks,
        params.requireReaction !== undefined ? params.requireReaction : this.requireReaction,
        params.requireTrashing !== undefined ? params.requireTrashing : this.requireTrashing,
        params.distributeCost !== undefined ? params.distributeCost : this.distributeCost,
        params.prioritizeSet !== undefined ? params.prioritizeSet : this.prioritizeSet);
  }

  static createFromObject(data: any) {
    return new RandomizerSettings(
        data.requireActionProvider != null ? !!data.requireActionProvider : true,
        data.requireCardProvider != null ? !!data.requireCardProvider : false,
        !!data.requireBuyProvider,
        data.allowAttacks != null ? !!data.allowAttacks : true,
        !!data.requireReaction,
        !!data.requireTrashing,
        !!data.distributeCost,
        DominionSets.convertToSetIdSafe(data.prioritizeSet));
  }
}