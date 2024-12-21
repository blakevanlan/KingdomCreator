<template>
  <div class="ContraintsSize">
    <div class="SettingTitle">{{ $t("Randomize constraints Settings") }}</div>
    <div class="sets-description">{{ $t("settings_subtitle_constraint") }}</div>

    <div class="llevel1-div">
      <div class="llevel2-div">
        <SwitchGroup as="div" class="llevel3-Switch switchGroupcss">
          <SwitchLabel>{{ $t("Use constraint on randomization") }}</SwitchLabel>
          <Switch as="button" v-model="constraintRandomizer" v-slot="{ checked }"
            :class="constraintRandomizer ? 'switch-bg-indigo-600' : 'switch-bg-gray-200'" class="relative-switchcss">
            <span class="SwitchSpan" :class="{ 'translate-x-5': checked, 'translate-x-0': !checked }" />
          </Switch>
        </SwitchGroup>
      </div>
    </div>
    <div class="custom-settings">
      <div class="constraint-container ">
        <div class="kingdomlabel-settings">{{ $t("Sets") }}</div>

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
          <div class="sets-column" v-for="(setId, index) in listedSetids" :key="index">
            <label class="checkbox constraintsettingscheckbox">
              <input type="checkbox" :checked="selectedSets[setId]" v-model="selectedSets[setId]">
              <span>{{ $t(setId) }} <span v-if="FindMultipleVersionSets(setId).length !== 0"> - 1st</span></span>
            </label>
            <div class="nb-min-max">
              {{ $t("nb min(/nb max)") }}
              <input class="settingsInput" style="width:10%;" type="number" id="nbMin"
                v-model.number="selectedSetMinCounts[setId]" @input="updateSetConstraints(setId)" />   
              /
              <input class="settingsInput" style="width:10%;" type="number" id="nbMax"
                v-model="selectedSetMaxCounts[setId]" @input="updateSetConstraints(setId)" />
            </div>
            <div class="listbox-container  top-16 w-72">
              <Listbox v-model="selectedCards[setId]" multiple>
                <div class="settingsInput" style="position:relative; width:240px">
                  <ListboxButton class="listboxCard">
                    <span class="truncate-block"> {{ textForlistbox(selectedCards[setId], setId) }} {{ $t("cards_removed", lenghtcount(selectedCards[setId])) }} </span>
                    <span class="chevronlistbox">
                      <ChevronUpDownIcon class="chevronlistboxIcon" />
                    </span>
                  </ListboxButton>
                  <transition leave-active-class="listboxTransition" leave-from-class="listboxOpacityleavefrom"
                    leave-to-class="listboxOpacityleaveto">
                    <ListboxOptions class="listboxOptions">
                      <ListboxOption v-slot="{ active, selected }" v-for="card in getCardsForSet(setId)" :key="card.id"
                        :value="card.id" as="template">
                        <li class="listboxOption">
                          <span class="truncate-block">{{ $t(card.id) }}</span>
                          <span v-if="selected" class="listboxOptionSelected">
                            <CheckIcon class="chevronlistboxIcon" aria-hidden="true" />
                          </span>
                        </li>
                      </ListboxOption>
                      
                    </ListboxOptions>
                  </transition>
                </div>
              </Listbox>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script lang="ts">

/* import Vue, typescript */
import { defineComponent, ref, computed, watch } from "vue";
import { SwitchGroup, Switch, SwitchLabel } from "@headlessui/vue";
import { Listbox, ListboxButton, ListboxOptions, ListboxOption, ListboxLabel } from '@headlessui/vue';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid';
import { useI18n } from 'vue-i18n'
import type { TranslateResult } from 'vue-i18n';


/* import Dominion Objects and type*/
import { DominionSets } from "../dominion/dominion-sets";
import type { Card } from "../dominion/card";
import type { SupplyCard } from "../dominion/supply-card";
import { MultipleVersionSets, HideMultipleVersionSets, Sets_To_Ignore_Regroup } from "../dominion/set-id";
import type { SetId } from "../dominion/set-id";
import { Year_set } from "../dominion/digital_cards/digital-cards-Illustrator"
import { NUM_CARDS_IN_KINGDOM } from "../settings/Settings-value";

/* imoprt store  */
import { useSettingsStore } from "../pinia/settings-store";
import { SortOption } from "../settings/settings";
import { SupplyCardSorter } from "../utils/supply-card-sorter";


export default defineComponent({
  name: "OwnedExpansionsSettings",
  components: {
    SwitchGroup, Switch, SwitchLabel,
    Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions,
    CheckIcon, ChevronUpDownIcon
  },
  setup() {
    const SettingsStore = useSettingsStore()
    const { t } = useI18n();

    const ownedRestricted = ref(SettingsStore.isUsingOnlyOwnedsets);
    const constraintRandomizer = ref(SettingsStore.useConstraintOnRandomization);
    const setsOrderType = ref("alpha");

    const listedSetids = computed(() => {
      const AllSetIdsToConsider = DominionSets.getAllSetsIds()
            .filter(setId => {
              if (SettingsStore.isUsingOnlyOwnedsets){
                return SettingsStore.ownedSets.indexOf(setId as never) != -1
              } else {
                return (HideMultipleVersionSets.indexOf(setId) == -1);
                }
              })
            .filter(setId => !Sets_To_Ignore_Regroup.has(setId))

      const sortedSets = setsOrderType.value === 'date'   // Check if sortType has a value (not undefined)
        ? AllSetIdsToConsider.sort((a, b) => (Year_set.find(set => set.id === a)?.order || 0) - (Year_set.find(set => set.id === b)?.order || 0))
        : AllSetIdsToConsider.sort((a, b) => t(a).localeCompare(t(b)))
      return sortedSets;
    });

    const FindMultipleVersionSets = (setValue: string) => {
      return MultipleVersionSets.filter(set => { return (set.id === setValue) })
    }

    const getCardsForSet = (setid: SetId) => {
      const Set = DominionSets.getSetById(setid)
      SupplyCardSorter.sort(Set.supplyCards as SupplyCard[], SortOption.ALPHABETICAL, t);

      Set.supplyCards.sort((a, b) => compare(a, b, t));

      return (Set.supplyCards.sort((a, b) => compare(a, b, t)) as Card[])
        .concat((Set.events as Card[]).sort((a, b) => compare(a, b, t)),
            (Set.landmarks as Card[]).sort((a, b) => compare(a, b, t)), 
            (Set.projects as Card[]).sort((a, b) => compare(a, b, t)),
            (Set.boons as Card[]).sort((a, b) => compare(a, b, t)), 
            (Set.ways as Card[]).sort((a, b) => compare(a, b, t)),
            (Set.allies as Card[]).sort((a, b) => compare(a, b, t)),
            (Set.traits as Card[]).sort((a, b) => compare(a, b, t)),
            (Set.prophecies as Card[]).sort((a, b) => compare(a, b, t)));
    }

    const compare = (a: Card, b: Card, translator: (key: string) => TranslateResult) => {
      return translator(a.id) === translator(b.id) ? 0 : translator(a.id) < translator(b.id) ? -1 : 1;
    }

    const selectedCards = ref<{ [setId: string]: string[] }>({});
    const selectedSets = ref<{ [setId: string]: boolean }>({});
    const selectedSetMinCounts = ref<{ [setId: string]: number | undefined }>({});
    const selectedSetMaxCounts = ref<{ [setId: string]: number | undefined }>({});

    const textForlistbox = (cards: string[], setid: SetId) => {
      return (cards ? cards.length : 0) + " / " + getCardsForSet(setid).length;
    }
    const lenghtcount= (cards: string[]) => { return cards ? cards.length : 0 }

    // Initialiser les valeurs depuis le store
    const initializeSetConstraints = () => {
      listedSetids.value.forEach(setId => {
        const constraints = SettingsStore.getSetConstraints(setId);
        if (constraints) {
          selectedSets.value[setId] = constraints.isSelected;
          selectedSetMinCounts.value[setId] = constraints.minCards;
          selectedSetMaxCounts.value[setId] = constraints.maxCards;
        } 
      });
    };
    // Initialize selectedCards with saved values from SettingsStore
    const initializeSelectedCards = () => {
      listedSetids.value.forEach(setId => {
        const savedExcludedCards = SettingsStore.getSetConstraints(setId)?.excludedCards;
        if (savedExcludedCards && savedExcludedCards.length > 0) {
          selectedCards.value[setId] = savedExcludedCards;
        }
      });
    };
    // Call initialization functions
    initializeSelectedCards();
    initializeSetConstraints();

    watch([constraintRandomizer], () => {
        SettingsStore.updateSettings({
          useConstraintOnRandomization: constraintRandomizer.value
        })
      }
    );

    // Watch for changes in selectedCards and update SettingsStore
    watch(selectedCards, (newSelectedCards) => {
      Object.entries(newSelectedCards).forEach(([setId, cards]) => {
        if (cards.length > 0) {
          if (!selectedSets.value[setId]) selectedSets.value[setId] = false;
          SettingsStore.setSetConstraints(setId as SetId, {
            isSelected: selectedSets.value[setId],
            excludedCards: cards
          });
        }
      });
    }, { deep: true });

    watch(selectedSets, (newSelectedSets) => {
      Object.keys(newSelectedSets).forEach(setId => {
        updateSetConstraints(setId as SetId);
      });
    }, { deep: true });

    const updateSetConstraints = (setId: SetId) => {
      if (!selectedSets.value[setId]) selectedSets.value[setId] = false;
      // Assurons-nous que minCards n'est pas négatif
      if (selectedSetMinCounts.value[setId] !== undefined && 
          selectedSetMinCounts.value[setId] < 0) 
        selectedSetMinCounts.value[setId] = 0;
      // Assurons-nous que minCards n'est pas plus grand que le nombre total de cartes
      if (selectedSetMinCounts.value[setId] !== undefined && 
          selectedSetMinCounts.value[setId] > NUM_CARDS_IN_KINGDOM()) 
        selectedSetMinCounts.value[setId] = NUM_CARDS_IN_KINGDOM();
      // Assurons-nous que maxCards n'est pas négatif
      if (selectedSetMaxCounts.value[setId] !== undefined && 
          selectedSetMaxCounts.value[setId] < 0) 
        selectedSetMaxCounts.value[setId] = 0;
      // Assurons-nous que maxCards n'est pas plus grand que le nombre total de cartes
      if (selectedSetMaxCounts.value[setId] !== undefined && 
          selectedSetMaxCounts.value[setId] > NUM_CARDS_IN_KINGDOM()) 
        selectedSetMaxCounts.value[setId] = NUM_CARDS_IN_KINGDOM();
      // Assurons-nous que minCards est toujours plus petit ou égal à maxCards
      if (selectedSetMinCounts.value[setId] !== undefined && 
          selectedSetMaxCounts.value[setId] !== undefined && 
          selectedSetMinCounts.value[setId] > selectedSetMaxCounts.value[setId]) 
        selectedSetMinCounts.value[setId] = selectedSetMaxCounts.value[setId];
      
      SettingsStore.setSetConstraints(setId, {
        isSelected: selectedSets.value[setId],
        minCards: selectedSetMinCounts.value[setId],
        maxCards: selectedSetMaxCounts.value[setId],
        excludedCards: selectedCards.value[setId] || [],
      });
    };

    return {
      ownedRestricted,
      constraintRandomizer,
      listedSetids,
      setsOrderType,
      FindMultipleVersionSets,

      selectedSets,
      selectedSetMinCounts,
      selectedSetMaxCounts,
      updateSetConstraints,
      selectedCards,
      getCardsForSet,
      textForlistbox,
      lenghtcount

    };
  },
});
</script>
  
<style scoped>
.ContraintsSize {
  padding-left: 2%;
  padding-right: 2%;
  width: 100%;
  border-left: 0px solid #ccc;
}

@media (max-width: 768px) {
  .OwnedSize {
    /* Adjust styles for smaller screens, if needed */
    width: 100%;
    /* Adjust width for smaller devices */
    border-left: none
  }
}

.constraint-container {
  border-bottom: 2px solid #ccc;
  padding-bottom: 2px;
  margin-bottom: 10px;
  display: flex;
  gap: 4rem;
}

.sets-container {
  display: flex;
  flex-direction: row;
}

.sets-grid {
  display: grid;
  /* grid-template-columns: repeat(1, 1fr); */
  width: 100%;
}


.sets-column {
  display: flex;
  flex-direction: row;
  margin-top: 0.25%;
}

.constraintsettingscheckbox {
  width: 30%
}

.nb-min-max {
  margin-right: 2%;
  ;
}


.listbox-container {
  width: 30%;
}

.listboxCard {
  width: 100%;
  text-align: center;
  cursor: default;
  border-radius: .5rem;
  padding-bottom: .25rem;
  padding-right: 2.5rem;
  padding-left: .75rem;
  border-width: 0px;
  ;
}

.listboxCard:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.truncate-block {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}


.chevronlistbox {
  right: 0;
  top: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
  padding-right: 0.5rem;
  align-items: center;
  display: flex;
}

.chevronlistboxIcon {
  width: 1.25rem;
  --text-opacity: 1;
  color: #CCC;
  height: 1.25rem;
}

.listboxTransition {
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
  transition-duration: 0.1s;
  transition-timing-function: cubic-bezier(0.4, 0, 1, 1);
}

.listboxOpacityleavefrom {
  opacity: 1;
}

.listboxOpacityleaveto {
  opacity: 0;
}

.listboxOptions {
  position: absolute;
  max-height: 15rem;
  width: 100%;
  Padding-bottom: 20px;
  ;
  border-radius: 0.375rem;
  overflow: auto;
  background-color: #fff;
  z-index: 3;
  list-style: none;
  border-width: 0;
  text-align: center;
  margin: 0px;
  padding: 0Px;
}

.listboxOptions:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  /* border: 2px solid #ccc; */
}

.listboxOption {
  user-select: none;
  position: relative;
  border: 2px solid #ccc;
  cursor: default;
}

.listboxOptionSelected {
  display: flex;
  align-items: center;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  padding-left: 0.75rem;
}
</style>

