<template>
  <div class="sidebar">
    <a class="standard-button standard-button--is-primary standard-button--large desktop_randomize-button"
      v-if="!isCondensed"
      @click="handleRandomize"
    >
      {{ randomizeButtonText }}
    </a>
    <div class="sidebar-content filters">
      <div class="sidebar-content-title">Sets</div>
      <div class="sets">
        <div class="set" v-for="set in sets" :key="set.setId">
          <label class="checkbox">
            <input type="checkbox" v-model="selectedSetIds" :id="set.setId" :value="set.setId">
            <span>{{ $t(set.setId) }} 
              <span v-if="FindMultipleVersionSets(set.setId).length !== 0"> -  1st
                <input type="checkbox" v-model="selectedSetIds" :id="(FindMultipleVersionSets(set.setId))[0].idv2" :value="(FindMultipleVersionSets(set.setId))[0].idv2">2nd
              </span>
            </span>
          </label>
        </div>
      </div>
      <div class="clear"></div>
      <div class="sidebar-content-title">Options</div>
      <div class="option">
        <label class="checkbox">
          <input type="checkbox" v-model="requireActionProvider">
          <span>Require +2 Action</span>
        </label>
      </div>
      <div class="option">
        <label class="checkbox">
          <input type="checkbox" v-model="requireCardProvider">
          <span>Require Drawer</span>
        </label>
      </div>
      <div class="option">
        <label class="checkbox">
          <input type="checkbox" v-model="requireBuyProvider">
          <span>Require Buy</span>
        </label>
      </div>
      <div class="option">
        <label class="checkbox">
          <input type="checkbox" v-model="allowAttacks">
          <span>Allow Attacks</span>
        </label>
        <div class="suboption">
          <label class="checkbox" :class="{disable: !allowAttacks}">
            <input type="checkbox" v-model="requireReaction" :disabled="!allowAttacks">
            <span>Require Reaction</span>
          </label>
        </div>
      </div>
      <div class="option">
        <label class="checkbox">
          <input type="checkbox" v-model="requireTrashing">
          <span>Require Trashing</span>
        </label>
      </div>
      <div class="option" v-if="isAlchemySelected">
        <label class="checkbox">
          <input type="checkbox" v-model="isAlchemyRecommendationEnabled">
          <span>3+ Alchemy Cards</span>
        </label>
      </div>
      <div class="option" v-if="isDistributeCostAllowed">
        <label class="checkbox">
          <input type="checkbox" v-model="distributeCost">
          <span>Distribute Cost</span>
        </label>
      </div>
      <div class="option" v-if="isPrioritizeSetAllowed">
        <label class="checkbox">
          <input type="checkbox" v-model="isPrioritizeSetEnabled">
          <span>Prioritize Set</span>
        </label>
        <div class="suboption">
          <select :disabled="!isPrioritizeSetEnabled" v-model="prioritizeSet">
            <option v-if="prioritizeSet == null" :value="null">Choose set...</option>
            <option v-for="setId in selectedSetIds" :value="setId" :key="setId">
              {{ getSetName(setId) }}
            </option>
          </select>
        </div>
      </div>
      <div class="sidebar-content-title">Sort</div>
      <div class="option" v-for="sortOption in sortOptions" :key="sortOption.value">
        <label class="checkbox">
          <input type="radio" name="sortOption" :value="sortOption.value" v-model="selectedSortOption">
          <span>{{ sortOption.display }}</span>
        </label>
      </div>
      <a class="standard-button standard-button--is-primary standard-button--large condensed_randomize-button"
        v-if="isCondensed"
        @click="handleRandomize"
      >
        {{ randomizeButtonText }}
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { UPDATE_SETTINGS } from "../stores/randomizer/mutation-types";
import { DominionSets } from "../dominion/dominion-sets";
import { MultipleVersionSets, HideMultipleVersionSets } from "../dominion/set-id";
import { Getter, State } from "vuex-class";
import { SetId } from "../dominion/set-id";
import { Vue, Component } from "vue-property-decorator";
import { Settings, SettingsParams, SortOption } from "../settings/settings";
import { RandomizerSettings, RandomizerSettingsParams } from "../settings/randomizer-settings";

interface SortOptionParam {
  value: SortOption,
  display: string,
}

@Component
export default class RandomizerSidebar extends Vue {
  @Getter("isCondensed") readonly isCondensed!: boolean;
  @Getter("isDistributeCostAllowed") readonly isDistributeCostAllowed!: boolean;
  @Getter("isPrioritizeSetAllowed") readonly isPrioritizeSetAllowed!: boolean;
  @Getter("isAlchemySelected") readonly isAlchemySelected!: boolean;
  @Getter("randomizeButtonText") readonly randomizeButtonText!: string;
  @State(state => state.randomizer.settings) readonly settings!: Settings;
  @State(state => state.randomizer.settings.randomizerSettings)
      readonly randomizerSettings!: RandomizerSettings;

  get sets() {
    return DominionSets.getAllSets().filter(set => {return (HideMultipleVersionSets.indexOf(set.setId) == -1)});
  }

  get selectedSetIds() {
    return this.settings.selectedSets.concat().sort();
  }
  set selectedSetIds(values: string[]) {
    // Clear the prioritized set if it's no longer selected.
    if (!values.some(x => x == this.prioritizeSet)) {
      this.updateRandomizerSettings({prioritizeSet: null});
    }
    this.$store.commit(UPDATE_SETTINGS, {
      selectedSets: values.map(DominionSets.convertToSetId)
    } as SettingsParams);
  }
  
  FindMultipleVersionSets(setValue: string) {
    return MultipleVersionSets.filter(set => {return (set.id===setValue)})
  }
  get requireActionProvider() {
    return this.randomizerSettings.requireActionProvider;
  }
  set requireActionProvider(value: boolean) {
    this.updateRandomizerSettings({requireActionProvider: value});
  }

  get requireCardProvider() {
    return this.randomizerSettings.requireCardProvider;
  }
  set requireCardProvider(value: boolean) {
    this.updateRandomizerSettings({requireCardProvider: value});
  }
  
  get requireBuyProvider() {
    return this.randomizerSettings.requireBuyProvider;
  }
  set requireBuyProvider(value: boolean) {
    this.updateRandomizerSettings({requireBuyProvider: value});
  }

  get allowAttacks() {
    return this.randomizerSettings.allowAttacks;
  }
  set allowAttacks(value: boolean) {
    this.updateRandomizerSettings({allowAttacks: value});
  }
  
  get requireReaction() {
    return this.randomizerSettings.requireReaction;
  }
  set requireReaction(value: boolean) {
    this.updateRandomizerSettings({requireReaction: value});
  }

  get requireTrashing() {
    return this.randomizerSettings.requireTrashing;
  }
  set requireTrashing(value: boolean) {
    this.updateRandomizerSettings({requireTrashing: value});
  }

  get distributeCost() {
    return this.randomizerSettings.distributeCost;
  }
  set distributeCost(value: boolean) {
    this.updateRandomizerSettings({distributeCost: value});
  }

  get isPrioritizeSetEnabled() {
    return this.randomizerSettings.prioritizeSet != null;
  }
  set isPrioritizeSetEnabled(value: boolean) {
    const setId = value && this.selectedSetIds.length
        ? DominionSets.convertToSetId(this.selectedSetIds.concat().sort()[0])
        : null;
    this.updateRandomizerSettings({prioritizeSet: setId});
  }

  get prioritizeSet() {
    return this.randomizerSettings.prioritizeSet;
  }
  set prioritizeSet(value: SetId | null) {
    this.updateRandomizerSettings({prioritizeSet: value});
  }

  get isAlchemyRecommendationEnabled() {
    return this.randomizerSettings.isAlchemyRecommendationEnabled;
  }
  set isAlchemyRecommendationEnabled(value: boolean) {
    this.updateRandomizerSettings({isAlchemyRecommendationEnabled: value});
  }

  get sortOptions(): SortOptionParam[] {
    return [
      {display: "Set", value: SortOption.SET},
      {display: "Alphabetical", value: SortOption.ALPHABETICAL},
      {display: "Cost", value: SortOption.COST},
    ];
  }

  get selectedSortOption() {
    return this.settings.sortOption;
  }
  set selectedSortOption(sortOption: SortOption) {
    this.$store.commit(UPDATE_SETTINGS, {sortOption: sortOption} as SettingsParams);
  }

  getSetName(setId: SetId) {
    return DominionSets.getSetById(setId).name;
  }

  handleRandomize() {
    this.$emit("randomize")
  }

  private updateRandomizerSettings(params: RandomizerSettingsParams) {
    this.$store.commit(UPDATE_SETTINGS, {
      randomizerSettings: params
    } as SettingsParams);
  }
}
</script>

<style>
.desktop_randomize-button,
.condensed_randomize-button {
  display: block;
  margin: 2px;
}
.condensed_randomize-button {
  margin-top: 12px;
}
</style>