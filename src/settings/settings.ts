import {DominionSets} from "../dominion/dominion-sets";
import {RandomizerSettings} from "./randomizer-settings";
import {SetId} from "../dominion/set-id";

export enum SortOption {
  SET = "set",
  ALPHABETICAL = "alpha",
  COST = "cost",
}

export class Settings {
  readonly selectedSets: KnockoutObservableArray<SetId>;
  readonly sortOption: KnockoutObservable<SortOption>;
  readonly randomizerSettings: KnockoutObservable<RandomizerSettings>;

  constructor(
      selectedSets: SetId[],
      sortOption: SortOption,
      randomizerSettings: RandomizerSettings) {
    this.selectedSets = ko.observableArray(selectedSets);
    this.sortOption = ko.observable(sortOption);
    this.randomizerSettings = ko.observable(randomizerSettings);
  }

  toObject(): any {
    return {
      sets: Settings.serializeSets(this.selectedSets()),
      sortOption: this.sortOption(),
      randomizerSettings: this.randomizerSettings().toObject(),
    };
  }

  static createFromObject(data: any) {
    return new Settings(
      this.deserializeSets(data),
      this.deserailizeSort(data),
      RandomizerSettings.createFromObject(
          data.randomizerSettings ? data.randomizerSettings : data));
  }

  private static serializeSets(sets: SetId[]): string {
    if (sets.length) {
      return sets.join(",");
    }
    return SetId.BASE_SET;
  }

  private static deserializeSets(data: any): SetId[] {
    if (data.sets && typeof data.sets == "string") {
      const setIds = data.sets.split(",");
      if (setIds.length && setIds[0].length) {
        const realSetIds: SetId[] = [];
        for (let setId of setIds) {
          const realSetId = DominionSets.convertToSetIdSafe(setId);
          if (realSetId) {
            realSetIds.push(realSetId);
          }
        }
        return realSetIds;
      }
    }
    return [SetId.BASE_SET];
  }

  private static deserailizeSort(data: any): SortOption {
    if (data.sortOption) {
      const keys = Object.keys(SortOption);
      for (let key of keys) {
        if (data.sortOption == SortOption[key as any]) {
          return data.sortOption as SortOption;
        }
      }
      return SortOption.SET;
    }
    if (!!data.sortAlphabetically) {
      return SortOption.ALPHABETICAL;
    }
    return SortOption.SET;
  }
}
