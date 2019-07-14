import {DominionSets} from "../dominion/dominion-sets";
import {SetId} from "../dominion/set-id";

export class RandomizerSettings {
  readonly requireActionProvider: KnockoutObservable<boolean>;
  readonly requireCardProvider: KnockoutObservable<boolean>;
  readonly requireBuyProvider: KnockoutObservable<boolean>;
  readonly allowAttacks: KnockoutObservable<boolean>;
  readonly requireReaction: KnockoutObservable<boolean>;
  readonly requireTrashing: KnockoutObservable<boolean>;
  readonly distributeCost: KnockoutObservable<boolean>;
  readonly prioritizeSet: KnockoutObservable<SetId | null>;

  constructor(
      requireActionProvider: boolean,
      requireCardProvider: boolean,
      requireBuyProvider: boolean,
      allowAttacks: boolean,
      requireReaction: boolean,
      requireTrashing: boolean,
      distributeCost: boolean,
      prioritizeSet: SetId | null) {
    this.requireActionProvider = ko.observable(requireActionProvider);
    this.requireCardProvider = ko.observable(requireCardProvider);
    this.requireBuyProvider = ko.observable(requireBuyProvider);
    this.allowAttacks = ko.observable(allowAttacks);
    this.requireReaction = ko.observable(requireReaction);
    this.requireTrashing = ko.observable(requireTrashing);
    this.distributeCost = ko.observable(distributeCost);
    this.prioritizeSet = ko.observable(prioritizeSet);
  }

  toObject(): any {
    return {
      requireActionProvider: this.requireActionProvider(),
      requireCardProvider: this.requireCardProvider(),
      requireBuyProvider: this.requireBuyProvider(),
      allowAttacks: this.allowAttacks(),
      requireReaction: this.requireReaction(),
      requireTrashing: this.requireTrashing(),
      distributeCost: this.distributeCost(),
      prioritizeSet: this.prioritizeSet(),
    };
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