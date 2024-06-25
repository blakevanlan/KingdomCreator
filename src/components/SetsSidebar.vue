<template>
  <div class="sidebar">
    <div class="sidebar-content filters">
      <div class="sidebar-content-title">
        <span>{{ $t("Sets") }}</span>
        <div class="sidebar-content-option">
        <label class="checkbox sidebar-content-option">
            <input type="radio" style="margin-left:5px;" v-model="setsOrderType" :value="'alpha'"
            @change="handleSetOrderTypeChange('alpha')" />
            <span>{{ $t("Alphabetical") }}</span>
        </label> 
        <label class="checkbox sidebar-content-option" style="margin-left:10px;">
            <input type="radio" style="margin-left:5px;" v-model="setsOrderType" :value="'date'"
            @change="handleSetOrderTypeChange('date')" />
            <span>{{ $t("Date") }}</span>
        </label>
        </div>
      </div>
      <div class="sets">
        <div class="set" v-for="set in kingdomsets" :key="set">
          <label class="checkbox">
            <input type="radio" v-model="selectedSetId" id="selectedSet" :value="set"
              @change="handleSelectionChange(set)" />
              <span>{{ $t(set) }} <span v-if="findMultipleVersionSets(set).length !== 0"> - 1st</span></span>
          </label>
          <span v-if="findMultipleVersionSets(set).length !== 0">
            <label class="checkbox suboption-set">
              <input type="radio" v-model="selectedSetId" id="selectedSet"
                :value="findMultipleVersionSets(set)[0].idv2" 
                @change="handleSelectionChange(findMultipleVersionSets(set)[0].idv2)" />
              <span>2nd</span>
            </label>
          </span>
        </div>
      </div><!-- sets {{ set.name }} --><!-- (this.$store.state as State).selectedSetId -->

      <br>
      <div class="sets">
        <div class="set">
          <label class="checkbox">
            <input type="radio" v-model="selectedSetId" id="selectedSet" :value="valueForSetId_All"
              @change="handleSelectionChange(valueForSetId_All)"/>
            <span>All recommended sets</span>
          </label>
        </div>
      </div><!-- sets All -->

      <div class="sets">
        <div class="set">
          <label class="checkbox">
            <input type="radio" id="selectedKDSet" :value="valueForSetId_Personal" v-model="selectedSetId" 
            @change="handleSelectionChange(valueForSetId_Personal)"/>
            <span>Personal sets</span>
          </label>
          <div class="js input-file-container" v-show="show_PersonalFileSelection_Div">
            <input type="file" class="input-file" id="fileInput" ref="fileInput" onclick="this.value=null;"
              @change="SelectFile($event)" accept=".yaml" v-show="show_PersonalFileSelection_Input" />
            <label id="my-file-label-trigger" for="fileInput" class="input-file-trigger"
              v-show="show_PersonalFileSelection_Input" tabindex="0">Select a file...</label>
            <div id="div-file-return" class="file-return" style="background-color:'blue'">{{ file_name }}</div>
          </div>
        </div>
      </div><!-- sets Personal -->

      <div class="clear"></div>

      <div class="sidebar-content-title">{{ $t("Filter Games") }}</div>
      <div class="option" v-for="filterOption in filterOptions" :key="filterOption.value">
        <label class="checkbox">
          <input type="radio" id="filterOption" :value="filterOption.value" v-model="selectedFilterOption"
          @change="handleFilterOptionChange(filterOption.value)"/>
          <span>{{ $t(filterOption.display) }}</span>
        </label>
      </div>

      <div class="sidebar-content-title">{{ $t("Sort") }}</div>
      <div class="option" v-for="sortOption in sortOptions" :key="sortOption.value">
        <label class="checkbox">
          <input type="radio" name="sortOption" :value="sortOption.value" v-model="sortSet"
          @change="handleSortChange(sortOption.value)"/>
          <span>{{ $t(sortOption.display) }}</span>
        </label>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
/* import Vue, typescript */
import { defineComponent, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n'

/* import Dominion Objects and type*/
import { DominionKingdom } from "../dominion/dominion-kingdom";
import { DominionKingdoms } from "../dominion/dominion-kingdoms";
import { MultipleVersionSets, HideMultipleVersionSets } from "../dominion/set-id";
import { SetId, Set_To_Ignore_Kingdoms } from "../dominion/set-id";
import { Year_set } from "../dominion/digital_cards/digital-cards-Illustrator"

import { SortOption } from "../settings/settings";

/* import store  */
import { useSetsStore } from '../pinia/sets-store';

/* import Components */

declare function Yaml_Parsing(file_content: string): any;

export default defineComponent({
  name: 'SetsSidebar',
  setup() {
    const { t } = useI18n();
    const setsStore = useSetsStore()
    const selectedSetId = ref(setsStore.selectedSetId)
    const setsOrderType = ref(setsStore.setsOrderType)
    const sortSet = ref(setsStore.sortSet);
    setsStore.updateSortSet(sortSet.value)

    const selectedFilterOption = ref(setsStore.showFilterPlayGames); 
    let file_name = "";
    let show_PersonalFileSelection_Input = ref(false);

    const kingdomsets = computed(() => { 
        const AllSetIdsToConsider = DominionKingdoms.getAllSets()
            .filter(setId => !((Set_To_Ignore_Kingdoms).has(setId)))
            .filter(setId => { return (HideMultipleVersionSets.indexOf(setId) == -1) });
        const sortedSets = setsOrderType.value === 'date'   // Check if sortType has a value (not undefined)
            ? AllSetIdsToConsider.sort((a, b) => (Year_set.find(set => set.id === a)?.order ||1000) - (Year_set.find(set => set.id === b)?.order ||1000))
            : AllSetIdsToConsider.sort((a, b) => t(a).localeCompare(t(b)))
        return sortedSets;
      }
      );

    const valueForSetId_All = SetId.ALL;
    const valueForSetId_Personal = SetId.PERSONAL;

    const show_PersonalFileSelection_Div = computed(() => {
      if (((setsStore.selectedSetId as string) == (SetId.PERSONAL as string)) && (file_name == "")) {
        show_PersonalFileSelection_Input.value = true;
        return true;
      }
      if (show_PersonalFileSelection_Input.value) { return true; }
      if (file_name != "") { return true; }
      return false;
    });

    const SelectFile = (ev: any) => {
      let file = ev.target.files[0];
      if (file == undefined) {
        file_name = ""
      } else {
        let reader = new FileReader();
        reader.onload = (e) => {
          let kingdoms_object = Yaml_Parsing((reader.result as string));
          let kingdoms = Object.keys(kingdoms_object).map((key) => { return kingdoms_object[key] })
          let sets = kingdoms[0].map((json: any) => DominionKingdom.fromJson(json));
          DominionKingdoms.kingdoms[SetId.PERSONAL] = sets;
          /* to  request update of kigndom-list */
          setsStore.updateSelectedSet(SetId.TO_FORCE_RELOAD); 
          setsStore.updateSelectedSet(SetId.PERSONAL); 
        };
        reader.readAsText(file);
        file_name = file.name;
      }
    };

    const filterOptions = [
        { display: "All Games", value: "PNP" },
        { display: "Played Games", value: "P" },
        { display: "Not played Games", value: "NP" }
      ];
   
    const sortOptions =  [
        { display: "Set", value: SortOption.SET },
        { display: "Alphabetical", value: SortOption.ALPHABETICAL },
        { display: "Cost", value: SortOption.COST },
      ];

    const handleSelectionChange = (value: SetId) => {
      // console.log("handleSelectionChange", value);
      ((value as string).toLowerCase() == (SetId.PERSONAL as string))
        ? show_PersonalFileSelection_Input.value = true
        : show_PersonalFileSelection_Input.value = false;
      setsStore.updateSelectedSet(value);
    };

    const handleSortChange = (value: SortOption) => {
      setsStore.updateSortSet(value);
    };
    
    const handleSetOrderTypeChange = (value: string) => {
      setsStore.updateSetsOrderType(value);
    };

    const handleFilterOptionChange = (value: string) => {
      setsStore.updateShowFilterPlayedGames(value);
    };

    const findMultipleVersionSets = (setValue: string) => {
      return MultipleVersionSets.filter(set => {
        return (set.id === setValue)
      });
    };


    return {

      selectedSetId,
      sortSet,
      selectedFilterOption,
      setsOrderType,

      kingdomsets,
      valueForSetId_All,
      valueForSetId_Personal,
      file_name,
      show_PersonalFileSelection_Div,
      show_PersonalFileSelection_Input,
      SelectFile,

      sortOptions,
      filterOptions,

      handleSelectionChange,
      handleSetOrderTypeChange,
      handleSortChange,
      handleFilterOptionChange,
      findMultipleVersionSets
    };
  }
});
</script>

<style scoped>
/* styles de base si JS est activé */
.js .input-file-container {
  position: relative;
  width: 225px;
}

.js .input-file-trigger {
  display: block;
  padding: 3px 22px;
  ;
  background: #39D2B4;
  color: #fff;
  font-size: 1em;
  transition: all .4s;
  cursor: pointer;
}

.js .input-file {
  position: absolute;
  top: 0;
  left: 0;
  width: 225px;
  padding: 3px;
  opacity: 0;
  cursor: pointer;
}

/* quelques styles d'interactions */
.js .input-file:hover+.input-file-trigger,
.js .input-file:focus+.input-file-trigger,
.js .input-file-trigger:hover {
  background: #344A5E;
  color: #39B2B4;
}

/* styles du retour visuel */
.file-return:empty {
  margin: 1.8em 0;
}

.file-return:not(:empty) {
  margin: 5px 3px;
  ;
}

.file-return:not(:empty):before {
  content: "Selected file: ";
  font-size: 0.8em;
}
</style>