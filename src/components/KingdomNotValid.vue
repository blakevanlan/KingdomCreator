<template>
  <div v-if="hasInvalidCards" class="tagline">
    <p>{{ $t("warning") }} {{  $t("Constraint_violated") }}</p>
    <ul v-if="invalidCardsFromNonSelectedSets.length > 0">
      {{ $t("Cards_not_in_sets") }}
      <li v-for="card in invalidCardsFromNonSelectedSets" :key="card.id">
        {{ $t(card.name) }} 
      </li>
    </ul>
    <ul v-if="invalidCardsFromExcludedList.length > 0">
      {{ $t("Cards_excluded") }}
      <li v-for="card in invalidCardsFromExcludedList" :key="card.id">
        {{ $t(card.name) }} 
      </li>
    </ul>
    <ul v-if="invalidSpecialCardRules.length > 0">
      {{ $t("Card_rule_problem") }}
      <li v-for="message in invalidSpecialCardRules">
        {{ message }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
/* import Vue, typescript */
import { defineComponent, computed, ref} from "vue";
import { useI18n } from 'vue-i18n'

/* import Dominion Objects and type*/
import type { Card } from "../dominion/card";
import { SetId } from "../dominion/set-id";
import { DominionSets } from "../dominion/dominion-sets";
import { initializeExcludedCardIds } from "../randomizer/randomizer-options"
import { MAX_ADDONS_OF_TYPE } from "../settings/Settings-value";
import { Addons_TYPE } from '../dominion/addon';
import { YOUNG_WITCH_IDS, BANE_MIN_COST, BANE_MAX_COST } from "../randomizer/special-need-cards";
import { DRUID_ID, BOONS_NB_FROM_DRUID} from "../randomizer/special-need-cards";
import { FERRYMAN_IDS, FERRYMAN_MIN_COST, FERRYMAN_MAX_COST } from "../randomizer/special-need-cards";
import { OBELISK_LANDMARK_ID, OBELISK_CARDTYPE_REQUESTED } from "../randomizer/special-need-cards";
import { MOUSE_WAY_ID, MOUSE_MIN_COST, MOUSE_MAX_COST } from "../randomizer/special-need-cards";
import { TRAITS_CARDTYPE_POSSIBILITY_1, TRAITS_CARDTYPE_POSSIBILITY_2 } from "../randomizer/special-need-cards";

/* import store  */
import { useRandomizerStore } from "../pinia/randomizer-store";
import { useSettingsStore } from "../pinia/settings-store";

/* import Components */

export default defineComponent({
  name: 'KingdomNotValid',
  setup() {
    const { t } = useI18n();
    const randomizerStore = useRandomizerStore();
    const kingdom = computed(()=> randomizerStore.kingdom);
    const settings = ref(randomizerStore.settings);
    const settingsStore= useSettingsStore();
  
    const allKingdomCards =  [
        ...kingdom.value.supply.supplyCards,
        ...(kingdom.value.supply.baneCard ? [kingdom.value.supply.baneCard] : []),
        ...(kingdom.value.supply.ferrymanCard ? [kingdom.value.supply.ferrymanCard] : []),
        ...(kingdom.value.supply.obeliskCard ? [kingdom.value.supply.obeliskCard] : []),
        ...(kingdom.value.supply.mouseWay ? [kingdom.value.supply.mouseWay] : []),
        ...kingdom.value.supply.traitsSupply,
        ...kingdom.value.events,
        ...kingdom.value.landmarks,
        ...kingdom.value.projects,
        ...kingdom.value.ways,
        ...(kingdom.value.boons ? kingdom.value.boons : []),
        ...(kingdom.value.ally ? [kingdom.value.ally] : []),
        ...(kingdom.value.prophecy ? [kingdom.value.prophecy]  : []),
        ...kingdom.value.traits as Card[]
      ];
   
    const selectedSets = settings.value.selectedSets;

    const hasInvalidCards = computed(() => { 
      const invalidCards = [];
            // Check for cards not belonging to selected sets
      invalidCards.push(...invalidCardsFromNonSelectedSets.value);
      invalidCards.push(...invalidCardsFromExcludedList.value);
    return invalidCards.length > 0 || invalidSpecialCardRules.value.length > 0;
    });

    const containsNotValidCards = (kingdomCards: Card[], selectedSets: SetId[]) : Card[]=> {
      const selectedCards = kingdomCards.filter(card =>
        selectedSets.includes(card.setId)
      );
      return kingdomCards.filter(card => !selectedCards.includes(card));
    };

    const invalidCardsFromNonSelectedSets = computed(() => { 
      const  invalidCardsFromNonSelectedSets = containsNotValidCards(
        allKingdomCards, selectedSets
      );
      return invalidCardsFromNonSelectedSets
    })

    const invalidCardsFromExcludedList = computed(() => { 
      if (settingsStore.useConstraintOnRandomization) {
        const excludedCardIds = initializeExcludedCardIds(selectedSets, []);
        const invalidCardsFromExcludedList = 
            allKingdomCards.filter(
                card => excludedCardIds.includes(card.id)
            );
        return invalidCardsFromExcludedList
      } else return [] as Card[]
    })

    const invalidSpecialCardRules = computed(() => { 
      const invalidSpecialCardRules = [];
      // Check for special card rules
      invalidSpecialCardRules.push(...YOUNG_WITCHRule())
      invalidSpecialCardRules.push(...FERRYMANRule())
      invalidSpecialCardRules.push(...OBELISKRule())
      invalidSpecialCardRules.push(...DRUIDRule())
      invalidSpecialCardRules.push(...MOUSEWAYRule())
      invalidSpecialCardRules.push(...TRAITRule())
      invalidSpecialCardRules.push(...ALLYRule())
      invalidSpecialCardRules.push(...PROPHECYRule())
      

      return invalidSpecialCardRules;
    })

    const YOUNG_WITCHRule = () => {
      const invalidSpecialCardRules = [];
      if (kingdom.value.supply.supplyCards.some(card => YOUNG_WITCH_IDS.includes(card.id))) {
        if (!kingdom.value.supply.baneCard) {
          invalidSpecialCardRules.push(t("YW_needs_bane"));
        } else {
          if (kingdom.value.supply.baneCard.cost.treasure < BANE_MIN_COST ||
              kingdom.value.supply.baneCard.cost.treasure > BANE_MAX_COST)
            invalidSpecialCardRules.push(t("Bane_Cost" , {MIN_COST: BANE_MIN_COST , MAX_COST : BANE_MAX_COST}) );
        }
      } else {
        if (kingdom.value.supply.baneCard) {
          invalidSpecialCardRules.push(t("Bane_needs_YW"));
        }
      }
      return invalidSpecialCardRules;
    }

    const FERRYMANRule = () => {
      const invalidSpecialCardRules = [];
      if (kingdom.value.supply.supplyCards.some(card => FERRYMAN_IDS.includes(card.id))) {
        if (!kingdom.value.supply.ferrymanCard) {
          invalidSpecialCardRules.push(t("FM_needs_ferrymancard"));
        } else {
          if (kingdom.value.supply.ferrymanCard.cost.treasure < FERRYMAN_MIN_COST ||
              kingdom.value.supply.ferrymanCard.cost.treasure > FERRYMAN_MAX_COST)
            invalidSpecialCardRules.push(t("Ferryman_Cost", {MIN_COST: FERRYMAN_MIN_COST , MAX_COST : FERRYMAN_MAX_COST}))
        }
      } else {
        if (kingdom.value.supply.ferrymanCard)
          invalidSpecialCardRules.push(t("Ferrymancard_needs_FM"));
      }
      return invalidSpecialCardRules;
    }

    const MOUSEWAYRule = () => {
      const invalidSpecialCardRules = [];
      if (kingdom.value.ways.some(card => MOUSE_WAY_ID.includes(card.id))) {
        if (!kingdom.value.supply.mouseWay) {
          invalidSpecialCardRules.push(t("MW_needs_mousewaycard"));
        } else {
          if (kingdom.value.supply.mouseWay.cost.treasure < MOUSE_MIN_COST ||
              kingdom.value.supply.mouseWay.cost.treasure > MOUSE_MAX_COST)
            invalidSpecialCardRules.push(t("Mouseway_Cost", {MIN_COST: MOUSE_MIN_COST , MAX_COST : MOUSE_MAX_COST}))
        }
      } else {
        if (kingdom.value.supply.mouseWay)
          invalidSpecialCardRules.push(t("mousewaycard_needs_MW"));
      }
      return invalidSpecialCardRules;
    }

    const OBELISKRule = () => {
      const invalidSpecialCardRules = [];
      if (kingdom.value.landmarks.some(
            landmark => DominionSets.getLandmarkById(OBELISK_LANDMARK_ID).id === landmark.id)) {
        if (!kingdom.value.supply.obeliskCard) {
          invalidSpecialCardRules.push(t("OBE_needs_obeliskcard"));
        } else {
          if (!kingdom.value.supply.obeliskCard.isOfType(OBELISK_CARDTYPE_REQUESTED))
          invalidSpecialCardRules.push(t("obelisk_Cardtype"));
        }
      } else
        if (kingdom.value.supply.obeliskCard)
          invalidSpecialCardRules.push(t("obeliskcard_needs_OBE"));
      return invalidSpecialCardRules;
    }

    const DRUIDRule = () => {
      const invalidSpecialCardRules = [];
      if (kingdom.value.supply.supplyCards.some(card => card.id == DRUID_ID)) {
        if (kingdom.value.boons.length == 0)
          invalidSpecialCardRules.push(t("DRUID_needs_boons"));
        else if(kingdom.value.boons.length != BOONS_NB_FROM_DRUID)
          invalidSpecialCardRules.push(t("NB_of_Boons"));
      } else {
        if (kingdom.value.boons.length != 0)
          invalidSpecialCardRules.push(t("boons_for_DRUID"));
      }
      return invalidSpecialCardRules;
    }

    const TRAITRule = () => {
      const invalidSpecialCardRules = [];
      if (kingdom.value.traits.length > MAX_ADDONS_OF_TYPE(Addons_TYPE.TRAIT)) 
          invalidSpecialCardRules.push(t("TooMany_Traits"));
      else {
        if (kingdom.value.traits.length > kingdom.value.supply.traitsSupply.length)
          invalidSpecialCardRules.push(t("EachTrait_has_TraitSupply"))
        else if (kingdom.value.supply.traitsSupply.length > kingdom.value.traits.length)
          invalidSpecialCardRules.push(t("EachTraitSupply_has_Trait"))
        for (const traitSupplyId of kingdom.value.supply.traitsSupply || [])
          if (!(traitSupplyId.isOfType(TRAITS_CARDTYPE_POSSIBILITY_1) || traitSupplyId.isOfType(TRAITS_CARDTYPE_POSSIBILITY_2)))
            invalidSpecialCardRules.push(t("invalid_trait_type"));
      }
      return invalidSpecialCardRules;
    }

    const ALLYRule = () => {
      const invalidSpecialCardRules = [];
      if (kingdom.value.supply.supplyCards.some(s => s.isLiaison)) {
        if (!kingdom.value.ally)
          invalidSpecialCardRules.push(t("Liaison_needs_Ally"));
      } else
        if (kingdom.value.ally)
          invalidSpecialCardRules.push(t("Ally_needs_Liaison"));
      return invalidSpecialCardRules;
    }

    const PROPHECYRule = () => {
      const invalidSpecialCardRules = [];
      if (kingdom.value.supply.supplyCards.some(s => s.isOmen)) {
        if (!kingdom.value.prophecy)
          invalidSpecialCardRules.push(t("Omen_needs_Prohecy"));
      } else
        if (kingdom.value.prophecy)
          invalidSpecialCardRules.push(t("Prophecy_needs_Omen"));
      return invalidSpecialCardRules;
    }

    return {
      hasInvalidCards,
      invalidCardsFromNonSelectedSets,
      invalidCardsFromExcludedList,
      invalidSpecialCardRules
    }
  }
});
</script>