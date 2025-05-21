<template>
  <div v-if="hasInvalidCards" class="tagline">
    <p>{{ $t("Warning") }} {{  $t("Constraint_violated") }}</p>
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
import { RIVERBOAT_IDS, RIVERBOAT_CARDTYPE_REQUESTED, RIVERBOAT_CARDTYPE_NOTREQUESTED, RIVERBOAT_COST } from "../randomizer/special-need-cards";
import { APPROACHINGARMY_ID, APPROACHINGARMY_CARDTYPE_REQUESTED } from "../randomizer/special-need-cards";

/* import store  */
import { useRandomizerStore } from "../pinia/randomizer-store";
import { useSettingsStore } from "../pinia/settings-store";
import { SupplyCard } from "../dominion/supply-card";
import type { Kingdom } from "../randomizer/kingdom";
import type { Supply } from "../randomizer/supply";

/* import Components */

export default defineComponent({
  name: 'KingdomNotValid',
  setup() {
    const { t } = useI18n();
    const randomizerStore = useRandomizerStore();
    const kingdom = computed(()=> {return randomizerStore.kingdom as Kingdom});
    const settings = computed(()=> randomizerStore.settings);
    const settingsStore= useSettingsStore();
  
    const allKingdomCards = computed(()=>  [
        ...kingdom.value.supply.supplyCards as Card[],
        ...(kingdom.value.supply.baneCard ? [kingdom.value.supply.baneCard] : []) as Card[],
        ...(kingdom.value.supply.ferrymanCard ? [kingdom.value.supply.ferrymanCard] : []) as Card[],
        ...(kingdom.value.supply.obeliskCard ? [kingdom.value.supply.obeliskCard] : []) as Card[],
        ...(kingdom.value.supply.mouseWay ? [kingdom.value.supply.mouseWay] : []) as Card[],
        ...(kingdom.value.supply.riverboatCard ? [kingdom.value.supply.riverboatCard] : []) as Card[],
        ...(kingdom.value.supply.approachingArmyCard ? [kingdom.value.supply.approachingArmyCard] : []) as Card[],
        ...kingdom.value.supply.traitsSupply as Card[],
        ...kingdom.value.events as Card[],
        ...kingdom.value.landmarks as Card[],
        ...kingdom.value.projects as Card[],
        ...kingdom.value.ways as Card[],
        ...(kingdom.value.boons ? kingdom.value.boons : []) as Card[],
        ...(kingdom.value.ally ? [kingdom.value.ally] : []) as Card[],
        ...(kingdom.value.prophecy ? [kingdom.value.prophecy]  : []) as Card[],
        ...kingdom.value.traits as Card[]
      ]);
   
    const hasInvalidCards = computed(() => { 
      const invalidCards = [];
            // Check for cards not belonging to selected sets
      invalidCards.push(...invalidCardsFromNonSelectedSets.value);
      invalidCards.push(...invalidCardsFromExcludedList.value);
    return invalidCards.length > 0 || invalidSpecialCardRules.value.length > 0;
    });

    const containsNotValidCards = (kingdomCards: Card[], selectedSets: SetId[]) : Card[]=> {
      const selectedCards = kingdomCards.filter(card =>
          settings.value.selectedSets.includes(card.setId)
      );
      return kingdomCards.filter(card => !selectedCards.includes(card));
    };

    const invalidCardsFromNonSelectedSets = computed(() => { 
      const  invalidCardsFromNonSelectedSets = containsNotValidCards(
        allKingdomCards.value, settings.value.selectedSets
      );
      return invalidCardsFromNonSelectedSets
    })

    const invalidCardsFromExcludedList = computed(() => { 
      if (settingsStore.useConstraintOnRandomization) {
        const excludedCardIds = initializeExcludedCardIds(settings.value.selectedSets, []);
        const invalidCardsFromExcludedList = 
            allKingdomCards.value.filter(
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
      invalidSpecialCardRules.push(...RIVERBOATRule())
      invalidSpecialCardRules.push(...TRAITRule())
      invalidSpecialCardRules.push(...ALLYRule())
      invalidSpecialCardRules.push(...PROPHECYRule())
      invalidSpecialCardRules.push(...APPROACHINGARMYRule())
      
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
          const obeliskCard = SupplyCard.from(kingdom.value.supply.obeliskCard);
          if (!obeliskCard.isOfType(OBELISK_CARDTYPE_REQUESTED))
            invalidSpecialCardRules.push(t("obelisk_Cardtype"));
        }
      } else
        if (kingdom.value.supply.obeliskCard)
          invalidSpecialCardRules.push(t("obeliskcard_needs_OBE"));
      return invalidSpecialCardRules;
    }

    const RIVERBOATRule = () => {
      const invalidSpecialCardRules = [];
      if (kingdom.value.supply.supplyCards.some(card => RIVERBOAT_IDS.includes(card.id))) {
        if (!kingdom.value.supply.riverboatCard) {
          invalidSpecialCardRules.push(t("RB_needs_riverboatcard"));
        } else {
          const riverboatCard = SupplyCard.from(kingdom.value.supply.riverboatCard);
          if ( !(riverboatCard as SupplyCard).isOfType(RIVERBOAT_CARDTYPE_REQUESTED) || 
                (riverboatCard as SupplyCard).isOfType(RIVERBOAT_CARDTYPE_NOTREQUESTED) )
            invalidSpecialCardRules.push(t("riverboat_Cardtype"));
          else if (kingdom.value.supply.riverboatCard.cost.treasure != RIVERBOAT_COST)
           invalidSpecialCardRules.push(t("Riverboat_Cost", {COST: RIVERBOAT_COST}));
        }
      } else {
        if (kingdom.value.supply.riverboatCard)
          invalidSpecialCardRules.push(t("Riverboatcard_needs_RB"));
      }
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
        for (const traitSupplyId of kingdom.value.supply.traitsSupply) {
          if (!((traitSupplyId as SupplyCard).isOfType(TRAITS_CARDTYPE_POSSIBILITY_1) || 
                (traitSupplyId as SupplyCard).isOfType(TRAITS_CARDTYPE_POSSIBILITY_2) ))
            invalidSpecialCardRules.push(t("invalid_trait_type"));
        }
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

    const APPROACHINGARMYRule = () => {
      const invalidSpecialCardRules = [];
      if (kingdom.value.prophecy) {
        if (kingdom.value.prophecy.id == DominionSets.getProphecyById(APPROACHINGARMY_ID).id) {
          if (!kingdom.value.supply.approachingArmyCard) {
            invalidSpecialCardRules.push(t("APA_needs_aApproachingarmycard"));
          } else {
            const approachingArmyCard = SupplyCard.from(kingdom.value.supply.approachingArmyCard);
            if (!approachingArmyCard.isOfType(APPROACHINGARMY_CARDTYPE_REQUESTED))
              invalidSpecialCardRules.push(t("approachingarmycard_Cardtype"));
          }
        } else
          if (kingdom.value.supply.approachingArmyCard)
            invalidSpecialCardRules.push(t("approachingarmy_needs_APA"));
      } else 
        if (kingdom.value.supply.approachingArmyCard)
          invalidSpecialCardRules.push(t("approachingarmy_needs_APA"));
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