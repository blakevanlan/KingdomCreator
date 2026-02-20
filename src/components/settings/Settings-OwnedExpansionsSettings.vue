<template>
  <div class="OwnedSize">
    <div class="SettingTitle">{{ $t("Owned sets Settings") }}</div>
    <div class="sets-description">{{ $t("settings_subtitle_owned_sets") }}</div>

    <div class="switch-groupedline">
      <div class="switch-labelAndswitch">
        <SwitchGroup as="div" class="switch-flex switchGroupcss">
          <SwitchLabel as="div">
            {{ $t("Use Custom Configuration for Set Display") }}
          </SwitchLabel>
          <div class="question-mark-tooltip">
              <RouterLink :to="getHelpMarkdownUrl($t('HowDoesItWorksOwnedSets')+ '.md' )"
                :title="$t('ShortOwnedSets')"
                target="_blank"
              >
                <QuestionMarkCircleIcon class="QuestionMark" />
              </RouterLink>
            </div>
          <Switch as="button" v-model="ownedRestricted" v-slot="{ checked }" :class="ownedRestricted ? 'switch-bg-indigo-600' : 'switch-bg-gray-200'"
            class="relative-switchcss">
            <span class="SwitchSpan" :class="{ 'translate-x-5': checked, 'translate-x-0': !checked }" />
          </Switch>
        </SwitchGroup>
      </div>
    </div>
    <div class="sidebar">  
      <div class="sidebar-content filters">
        <div class="ownnedset-constraint-container">
          <div class="setlabel-settings">{{ $t("Sets") }}</div>
          <label class="checkbox sidebar-content-option">
            <input type="radio" style="margin-left:5px;" v-model="setsOrderType" :value="'alpha'" />
            <span>{{ $t("Alphabetical") }}</span>
          </label>
          <label class="checkbox sidebar-content-option" style="margin-left:10px;">
            <input type="radio" style="margin-left:5px;" v-model="setsOrderType" :value="'date'" />
            <span>{{ $t("Date") }}</span>
          </label>
          <label class="checkbox sidebar-content-option" style="margin-left:10px;">
            <input type="checkbox" 
                   :checked="listedSetids.length > 0 && ownedSetIds.length === listedSetids.length"
                   @change="toggleAllSets($event)" />
            <span>{{ $t('Select All') }}</span>
          </label>
        </div>

        <div class="sets">
          <div class="set" v-for="setId in listedSetids" :key="setId">
            <label class="checkbox">
              <input :id="setId" type="checkbox" v-model="ownedSetIds"  :value="setId">
              <span>{{ $t(setId) }} <span v-if="FindMultipleVersionSets(setId).length !== 0"> - {{ $t("1st") }}</span></span>
            </label>
            <span v-if="FindMultipleVersionSets(setId).length !== 0">
              <label class="checkbox suboption-set">
                <input :id="(FindMultipleVersionSets(setId))[0]!.idv2" type="checkbox" v-model="ownedSetIds" 
                  :value="(FindMultipleVersionSets(setId))[0]!.idv2">
                <span>{{ $t("2nd") }}</span>
              </label>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script  lang="ts">


/* import Vue, typescript */
import { defineComponent, ref, computed, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { SwitchGroup, Switch, SwitchLabel } from '@headlessui/vue';
import { QuestionMarkCircleIcon } from '@heroicons/vue/24/outline';
import { useI18n } from 'vue-i18n';

/* import Dominion Objects and type*/
import { DominionSets } from '@/dominion/dominion-sets';
import { MultipleVersionSets, HideMultipleVersionSets, Sets_To_Ignore_Regroup } from '@/dominion/set-id';
import { Year_set } from '@/dominion/digital_cards/digital-cards-Illustrator';
import type { SettingsParams } from '@/settings/settings';
import type {SetId} from '@/dominion/set-id';

/* imoprt store  */
import { useSettingsStore } from '@/pinia/settings-store';
import { useSetsStore } from '@/pinia/sets-store';
import { useRandomizerStore } from '@/pinia/randomizer-store';

export default defineComponent({
  name: "OwnedExpansionsSettings",
  components: {
    SwitchGroup,
    Switch,
    SwitchLabel,
    QuestionMarkCircleIcon,
    RouterLink,
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

        watch([ownedSetIds, ownedRestricted], ([newOwnedSetIds, newOwnedRestricted], [oldOwnedSetIds, oldOwnedRestricted]) => {
          // Détection fine des changements de SetId
          const added = newOwnedSetIds.filter((x) => !oldOwnedSetIds.includes(x));
          const removed = oldOwnedSetIds.filter((x) => !newOwnedSetIds.includes(x));
          //if (added.length) console.log('Ajouté(s) :', added);
          //if (removed.length) console.log('Retiré(s) :', removed)

          if (newOwnedSetIds.length == 0) newOwnedRestricted = false;
          SettingsStore.updateSettings({
            ownedSets: newOwnedSetIds,
            isUsingOnlyOwnedsets: newOwnedRestricted
          });
          if (oldOwnedRestricted == false) return;

          if (!newOwnedSetIds.some((setid: string) => SetsStore.selectedSetId == setid)) {
            SetsStore.selectedSetId = newOwnedSetIds[0] ?? SetsStore.selectedSetId;
          }
          if (!newOwnedSetIds.some((setid: string) => SetsStore.selectedBoxesSetId == setid)) {
            SetsStore.selectedBoxesSetId = newOwnedSetIds[0] ?? SetsStore.selectedBoxesSetId;
          }
          const ownedIdsSet = new Set(newOwnedSetIds);
          const filteredSelectedIds = randomizerStore.settings.selectedSets.filter((sid) => ownedIdsSet.has(sid) === true);

          randomizerStore.UPDATE_SETTINGS({
            selectedSets: filteredSelectedIds.map(DominionSets.convertToSetId)
          } as SettingsParams);
        });


    const FindMultipleVersionSets = (setValue: string) => {
      return MultipleVersionSets.filter(set => { return (set.id === setValue) })
    }

    const getHelpMarkdownUrl = (filename: string) => {
      return {
          path: '/help',
          query: { file: filename }
          }
    };

    // Fonction pour sélectionner/désélectionner tous les sets
    const toggleAllSets = (event: Event) => {
      const checked = (event.target as HTMLInputElement).checked;
      if (checked) {
        ownedSetIds.value = [...listedSetids.value];
      } else {
        ownedSetIds.value = [];
      }
    }

    return {
      ownedRestricted,
      listedSetids,
      setsOrderType,
      ownedSetIds,
      FindMultipleVersionSets,
      getHelpMarkdownUrl,
      toggleAllSets
    };
  },
});
</script>

<style scoped>

.content .sidebar
{
  width: unset;
  float: unset;
  margin-bottom: unset;
}

.sidebar .sidebar-content {
  border-width: 0px; 
} 

.OwnedSize {
  padding-left: 2%;
  padding-right: 2%;
  width: 55%;
  border-left: 2px solid #ccc; 
}

@media (max-width: 900px) {
  .OwnedSize {
    /* Adjust styles for smaller screens, if needed */
    width: 100%; /* Adjust width for smaller devices */
    border-left : none
  }
}


.content
  .sets
    .set {
      width: 50%;
      float: left;
    }


.sets-container {
  width: 100%;
  padding: 10px;
}



.sets-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 5px;
}
</style>