import {DominionSets} from "../dominion/dominion-sets";
import {RandomizerSettings, RandomizerSettingsParams} from "./randomizer-settings";
import {SetId} from "../dominion/set-id";

export enum SortOption {
  SET = "set",
  ALPHABETICAL = "alpha",
  COST = "cost",
}

export interface SettingsParams {
  selectedSets?: SetId[];
  sortOption?: SortOption;
  randomizerSettings?: RandomizerSettingsParams;
}

export class Settings implements SettingsParams {
  constructor(
      readonly selectedSets: SetId[],
      readonly sortOption: SortOption,
      readonly randomizerSettings: RandomizerSettings) {
  }

  withParams(params: SettingsParams) {
    return new Settings(
        params.selectedSets != undefined ? params.selectedSets : this.selectedSets,
        params.sortOption != undefined ? params.sortOption : this.sortOption,
        params.randomizerSettings != undefined
            ? this.randomizerSettings.withParams(params.randomizerSettings)
            : this.randomizerSettings);
  }

  static createFromObject(data: any) {
    return new Settings(
        this.deserializeSets(data),
        this.deserailizeSort(data),
        RandomizerSettings.createFromObject(
            data.randomizerSettings ? data.randomizerSettings : data));
  }

  private static deserializeSets(data: any): SetId[] {
    const setsFromData: string | string[] = data.selectedSets || data.sets;
    if (!setsFromData) {
      return [SetId.BASE_SET];
    }
    const stringSetIds: string[] = typeof setsFromData == "string"
        ? setsFromData.split(",")
        : setsFromData;
    const setIds: SetId[] = [];
    for (let stringSetId of stringSetIds) {
      const setId = DominionSets.convertToSetIdSafe(stringSetId);
      if (setId) {
        setIds.push(setId);
      }
    }
    return setIds.length ? setIds : [SetId.BASE_SET];
  }

  private static deserailizeSort(data: any): SortOption {
    if (data.sortOption) {
      const keys = Object.keys(SortOption);
      for (let key of keys) {
        if (data.sortOption == SortOption[key as keyof typeof SortOption]) {
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
