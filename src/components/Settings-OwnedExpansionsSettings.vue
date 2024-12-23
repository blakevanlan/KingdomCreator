<template>
  <div class="OwnedSize">
    <div class="SettingTitle">{{ $t("Owned sets Settings") }}</div>
    <div class="sets-description">{{ $t("settings_subtitle_owned_sets") }}</div>

    <div class="llevel1-div">
      <div class="llevel2-div">
        <SwitchGroup as="div" class="llevel3-Switch switchGroupcss">
          <SwitchLabel>{{ $t("Use Custom Configuration for Set Display") }}</SwitchLabel>
          <Switch as="button" v-model="ownedRestricted" v-slot="{ checked }" :class="ownedRestricted ? 'switch-bg-indigo-600' : 'switch-bg-gray-200'"
            class="relative-switchcss">
            <span class="SwitchSpan" :class="{ 'translate-x-5': checked, 'translate-x-0': !checked }" />
          </Switch>
        </SwitchGroup>
      </div>
    </div>
    <div class="custom-settings">
      <div class="onwedset-container ">
        <div class="kingdomlabel-settings" >{{ $t("Sets") }}</div>

        <label class="checkbox">
            <input type="radio" style="margin-left:5px;" v-model="setsOrderType" :value="'alpha'" />
            <span>{{ $t("Alphabetical") }}</span>
        </label> 
        <label class="checkbox" style="margin-left:10px;">
            <input type="radio" style="margin-left:5px;" v-model="setsOrderType" :value="'date'" />
            <span>{{ $t("Date") }}</span>
        </label>

      </div> 
      <div class="sets-container">
    <div class="sets-grid">
      <div class="sets-column" v-for="(setId, index) in listedSetids.slice(0, Math.ceil(listedSetids.length / 2))" :key="index">
        <label class="checkbox">
          <input type="checkbox" v-model="ownedSetIds" :id="setId" :value="setId">
          <span>{{ $t(setId) }} <span v-if="FindMultipleVersionSets(setId).length !== 0"> - 1st</span></span>
        </label>
        <template v-for="(version, versionIndex) in FindMultipleVersionSets(setId)" :key="versionIndex">
          <label class="checkbox suboption-set">
            <input type="checkbox" v-model="ownedSetIds" :id="version.idv2" :value="version.idv2">
            <span>2nd</span>
          </label>
        </template>
      </div>
      </div>
      <div class="sets-grid">
      <div class="sets-column" v-for="(setId, index) in listedSetids.slice(Math.ceil(listedSetids.length / 2))" :key="index">
        <label class="checkbox">
          <input type="checkbox" v-model="ownedSetIds" :id="setId" :value="setId">
          <span>{{ $t(setId) }} <span v-if="FindMultipleVersionSets(setId).length !== 0"> - 1st</span></span>
        </label>
        <template v-for="(version, versionIndex) in FindMultipleVersionSets(setId)" :key="versionIndex">
          <label class="checkbox suboption-set">
            <input type="checkbox" v-model="ownedSetIds" :id="version.idv2" :value="version.idv2">
            <span>2nd</span>
          </label>
        </template>
      </div>
    </div>
  </div>
    </div>
  </div>
</template>

<script  lang="ts">


/* import Vue, typescript */
import { defineComponent, ref, computed, watch } from "vue";
import { SwitchGroup, Switch, SwitchLabel } from "@headlessui/vue";
import { useI18n } from 'vue-i18n'

/* import Dominion Objects and type*/
import { DominionSets } from "../dominion/dominion-sets";
import { MultipleVersionSets, HideMultipleVersionSets, Sets_To_Ignore_Regroup } from "../dominion/set-id";
import { Year_set } from "../dominion/digital_cards/digital-cards-Illustrator"
import type { SettingsParams } from "../settings/settings";

/* imoprt store  */
import { useSettingsStore } from "../pinia/settings-store";
import { useSetsStore } from "../pinia/sets-store";
import { useRandomizerStore } from "../pinia/randomizer-store";

export default defineComponent({
  name: "OwnedExpansionsSettings",
  components: {
    SwitchGroup,
    Switch,
    SwitchLabel,
  },
  setup() {
    const SettingsStore = useSettingsStore();
    const SetsStore = useSetsStore();
    const randomizerStore = useRandomizerStore()
    const { t } = useI18n();
    
    const ownedRestricted = ref(SettingsStore.isUsingOnlyOwnedsets);
    const ownedSetIds = ref(SettingsStore.ownedSets);
    const setsOrderType = ref("alpha");

    const listedSetids = computed(() => { 
        const AllSetIdsToConsider = DominionSets.getAllSetsIds()
            .filter(setId => !Sets_To_Ignore_Regroup.has(setId))
            .filter(setId => { return (HideMultipleVersionSets.indexOf(setId) == -1) })
        const sortedSets = setsOrderType.value === 'date'   // Check if sortType has a value (not undefined)
            ? AllSetIdsToConsider.sort((a, b) => (Year_set.find(set => set.id === a)?.order ||0) - (Year_set.find(set => set.id === b)?.order ||0))
            : AllSetIdsToConsider.sort((a, b) => t(a).localeCompare(t(b)))
        return sortedSets;
      }
      );

    watch([ownedSetIds, ownedRestricted] , () => {
      if (ownedSetIds.value.length == 0) ownedRestricted.value=false
      SettingsStore.updateSettings({ 
        ownedSets: ownedSetIds.value,
        isUsingOnlyOwnedsets: ownedRestricted.value
      });
      if (!ownedSetIds.value.some(setid => SetsStore.selectedSetId == setid)){
        SetsStore.selectedSetId=ownedSetIds.value[0];
      }
      if (!ownedSetIds.value.some(setid => SetsStore.selectedBoxesSetId== setid)){
        SetsStore.selectedBoxesSetId=ownedSetIds.value[0];
      }
      const ownedIdsSet = new Set(ownedSetIds.value);
      const filteredSelectedIds = randomizerStore.settings.selectedSets.filter((sid) => ownedIdsSet.has(sid) === true);

      randomizerStore.UPDATE_SETTINGS({
          selectedSets: filteredSelectedIds.map(DominionSets.convertToSetId)
        } as SettingsParams);
    });

    const FindMultipleVersionSets = (setValue: string) => {
      return MultipleVersionSets.filter(set => { return (set.id === setValue) })
    }

    return {
      ownedRestricted,
      listedSetids,
      setsOrderType,
      ownedSetIds,
      FindMultipleVersionSets,
    };
  },
});
</script>

<style scoped>
.OwnedSize {
  padding-left: 2%;
  padding-right: 2%;
  width: 55%;
  border-left: 2px solid #ccc; 
}

@media (max-width: 768px) {
  .OwnedSize {
    /* Adjust styles for smaller screens, if needed */
    width: 100%; /* Adjust width for smaller devices */
    border-left : none
  }
}

.onwedset-container{
  border-bottom: 2px solid #ccc;
  padding-bottom: 2px;
  margin-bottom: 10px;
  display: flex;
  gap: 4rem;
}

.sets-container {
  display: flex;
  flex-direction: row;
  row-gap: 1%;
}

.sets-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  row-gap: 1%;
  width: 60%;
}
.sets-grid:nth-child(2){
  width: 40%;
}

.sets-column {
  display: flex;
  flex-direction: row;
}


</style>