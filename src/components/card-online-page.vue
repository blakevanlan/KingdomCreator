<template>
  <div class="content Coef_scale12 card-rows">
    <div v-for="Card in Cards" :key="Card.id" :class="getClassCard(Card)">
      <div class="card-container">
      <div class="full-card unselectable" style="z-index:0; cursor:default;
           transform: scale(1); transition:none; position: sticky;">
        <!-- is a card -->
        <!-- type of card -->
        <div class="full-card-template"
          :style='"background-image: url(" + getHost() + "/img/Templates-card-type/" + getCardTypeById(Card).png + ".png);"'>
        </div>
        <!-- Card Image -->
        <div class="full-card-art"
          :style='"background-size: 287px 209px; background-image: url(" + getCardArtwork(Card.artwork) + "); top:10%;"'>
          <div class="action-layer none-layer"> </div>
        </div>

        <div v-if="getisTreasureCard(Card)" class="treasure-production-container">
          <div class="coin-production-container">
            <div class="coin-production-left" style="top:-32px;">
              <div class="coin-production-text-container">
                <div class="coin-production-text" style="top:12px;" :style="fontsizefortune(Card)">{{
                  getValueforTreasureCard(Card) }}</div>
              </div>
            </div>
            <div class="coin-production-right" style="top:-32px;">
              <div class="coin-production-text-container">
                <div class="coin-production-text" style="top:12px;" :style="fontsizefortune(Card)">{{
                  getValueforTreasureCard(Card) }}</div>
              </div>
            </div>
          </div>
        </div>
        <!--Card name -->
        <div class="full-card-name-container unselectable " :style='"top:" + getCardNameFontSize(Card).top + "px;"'>
          <div class="full-card-name card-name unselectable"
            :style='"font-size:" + getCardNameFontSize(Card).fontsize + "em;"'>
            {{ Card.frenchName }}</div>
        </div>
        <!--Card Text -->
        <div class="full-card-text-container" v-html="Card.text_html"></div>
        <!--Card Bottom bar -->
        <div class="bottom-bar-full" style="width:239.75%;bottom:-70px;">
          <div class="cost-container-full">
            <div class="coin-cost-full"
              v-if="getCardCost(Card).treasure > 0 || (getCardCost(Card).potion + getCardCost(Card).debt == 0)">
              <div class="coin-cost-full-text" style="top:12px;">{{ getCardCost(Card).treasure }}<sup
                  v-if="DoNeedSub(Card)" class="supetoile" /></div>

            </div>
            <div class="potion-cost-full" v-if="getCardCost(Card).potion > 0">
            </div>
            <div class="debt-cost-full" v-if="getCardCost(Card).debt > 0">
              <div class="debt-cost-full-text unselectable" style="top:12px;">{{ getCardCost(Card).debt }}</div>
            </div>
          </div>
          <div class="bottom-right-container-full">
            <div class="expansion-icon-bottom-full"
              :style='"background-image: url(" + getHost() + "/img/Templates-set/" + getCardSetById(Card) + "-small.png);"'>
            </div>
          </div>

          <div class="types-text-full unselectable" :style="getCardTypeFontSize(Card)">
            {{ getCardTypeById(Card).label }}
          </div>
        </div>
        <div class="full-card-border">
          <div class="card-footer illustrator">{{ getCardIllustrator(Card).illustrator }}</div>
          <div class="card-footer copyright">{{ getCardSetYear(Card) }}</div>
        </div>
      </div>
      <div class="separator-card" style="z-index:0;">
           <img class="full-card static-card__img" style="z-index:0; width:310px;" :src="cardImageUrl(Card)" :key="cardImageUrl(Card)" @error="incaseoferror" />
      </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/* import Vue, typescript */
import { defineComponent, computed } from 'vue';
import { useI18n } from 'vue-i18n'

/* import Dominion Objects and type*/
import { SortOption } from "../settings/settings";
import { SupplyCardSorter } from "../utils/supply-card-sorter";
import { getCardImageUrl } from "../utils/resources";
import { incaseofImgerror } from "../utils/resources";


import { DominionSets } from "../dominion/dominion-sets";
import type { SupplyCard } from "../dominion/supply-card";
import type { OtherCard } from "../dominion/other-card";
import { CardType } from "../dominion/card-type";
import type { Cost } from "../dominion/cost";
import { SetId } from "../dominion/set-id";
import { DominionSet } from "../dominion/dominion-set";

import type { DigitalCard } from "../dominion/digital_cards/digital-cards-type"
import { Cards_list } from "../dominion/digital_cards/digital-cards"
import { Work_Card } from "../dominion/digital_cards/digital-cards - update"

import type { IllustratorCard } from "../dominion/digital_cards/digital-cards-type"
import { Cards_list_Illustrator, Year_set } from "../dominion/digital_cards/digital-cards-Illustrator"

/* import store  */
/* import Components */

const QuestionMarkValue =
  new Set(["bank", "philosophersstone", "scepter", "bauble"
  ]);

const TreasureWithNoGain =
  new Set(["tiara", "investment", "warchest", "astrolabe", "odysseys",
  ]);

const IsLooter =
  new Set(["deathcart", "cultist", "marauder"
  ]);

const IsZeroStar =
  new Set([
    "peddler",
    "spoils", "madman", "mercenary",
    "masterpiece", "stonemason", "doctor", "herald",
    "willopwisp", "wish", "bat", "imp", "ghost",
    "treasurehunter", "warrior", "hero", "champion",
    "soldier", "fugitive", "disciple", "teacher",
    "fisherman", "destrier", "wayfarer", "animalfair",
  ]);

const NeedHeirloom =
  new Set([
    "pooka", "shepherd", "pixie",
    "fool", "tracker", "secretcave", "cemetery",
  ]);

const IsKnight =
  new Set(["knights"
  ]);
const IsCastle =
  new Set(["castles"
  ]);

interface DisplayableCardType {
  readonly png: string,
  readonly label: string
}

const BASEURL= /http:\/\/localhost:8080/

export default defineComponent({
  name: "CardOnlinePageComponent",
  props: {
    set: {
      type: DominionSet,
      default: null,
    }
  },
  setup(props) {
    const { t } = useI18n();

    const getCardsIMG = (cardIds: SupplyCard[], sortOption = SortOption.ORDERSTRING, origine = "unset") => {
      return SupplyCardSorter.sort(cardIds, sortOption, t);
    }


    const Cards = computed(() => {
      let setName = props.set.setId
      // console.log(Cards_list.filter(card =>
      //   props.set.otherCards.some(function (item) { return ((setName == item.setId) && (item.shortId == card.id)); })));
      let LocalTemp_CardsList: DigitalCard[] = Cards_list;

      if ( Work_Card.id !="" && setName == getCardSetById(Work_Card)) {
        LocalTemp_CardsList = Cards_list.filter(card => card.id == Work_Card.id)
        return LocalTemp_CardsList;
      }

      return LocalTemp_CardsList.filter(card =>
        props.set.supplyCards.some(function (item) { return ((setName == item.setId) && (item.shortId == card.id)); }))
        .concat(
          LocalTemp_CardsList.filter(card =>
            props.set.otherCards.some(function (item) { return ((setName == item.setId) && (item.shortId == card.id)); }))
        ).concat(
          LocalTemp_CardsList.filter(card =>
            props.set.boons.some(function (item) { return item.shortId == card.id; }))
        ).concat(
          LocalTemp_CardsList.filter(card =>
            props.set.ways.some(function (item) { return item.shortId == card.id; }))
        ).concat(
          LocalTemp_CardsList.filter(card =>
            props.set.events.some(function (item) { return item.shortId == card.id; }))
        ).concat(
          LocalTemp_CardsList.filter(card =>
            props.set.projects.some(function (item) { return item.shortId == card.id; }))
        ).concat(
          LocalTemp_CardsList.filter(card =>
            props.set.landmarks.some(function (item) { return item.shortId == card.id; }))
        ).concat(
          Cards_list.filter(card =>
            props.set.allies.some(function (item) { return item.shortId == card.id; }))
        )
    })

    const cardImageUrl = (card: DigitalCard) => {
      return getCardImageUrl(getCardSetById(card) + "_" + card.id, "en" as any);
    }

    const incaseoferror = (ev: any) => {
      console.log(ev)
      incaseofImgerror(ev);
    }

    const getHost = () => {
      return window.location.protocol + "//" + window.location.host;
    }
    const getSupplyCard = () => {
      return (DominionSets.getCardById("cellar")).constructor.name
    }
    const getOtherCard = () => {
      return (DominionSets.getCardById("copper")).constructor.name
    }
    const getClassCard = (currentCard: DigitalCard) => {
      let card
      card = DominionSets.getCardById(currentCard.id);
      if (card.constructor.name == "OtherCard") {
        card = card as OtherCard;
        if (card.type.includes(CardType.NIGHT.slice(2))) {
          if (card.type.includes(CardType.DURATION.slice(2))) {
            return "v-for card-theme-title-dark card-theme-text-light";
          }
          if (card.type.includes(CardType.ATTACK.slice(2)) && card.type.includes(CardType.ACTION.slice(2))) {
            return "v-for card-theme-title-dark card-theme-text-light";
          }
          return "v-for card-theme-title-light card-theme-text-light";
        }
        return "v-for card-theme-title-dark card-theme-text-dark";
      }
      card = (card as SupplyCard);
      if (card.isOfType(CardType.NIGHT)) {
        if (card.isOfType(CardType.DURATION)) {
          return "v-for card-theme-title-dark card-theme-text-light";
        }
        if (card.isOfType(CardType.ATTACK) && card.isOfType(CardType.ACTION)) {
          return "v-for card-theme-title-dark card-theme-text-light";
        }
        return "v-for card-theme-title-light card-theme-text-light";
      }
      return "v-for card-theme-title-dark card-theme-text-dark";
    }

    const getCardTypeById = (currentCard: DigitalCard): DisplayableCardType => {
      let card;
      card = DominionSets.getCardById(currentCard.id);
      if (card.constructor.name == getSupplyCard()) {
        let extension;
        extension = "";
        let NeedHeirloompng = false;
        if (IsLooter.has(currentCard.id)) { extension = " - Pillard"; }
        if (IsKnight.has(currentCard.id)) { extension = " - Chevalier"; }
        if (IsCastle.has(currentCard.id)) { extension = " - Château"; }

        if (NeedHeirloom.has(currentCard.id)) { NeedHeirloompng = true; }

        card = card as SupplyCard;
        if (card.isOfType(CardType.GATHERING)) { extension = " - Collecte"; }
        if (card.isOfType(CardType.FATE)) { extension = " - Destin"; }
        if (card.isOfType(CardType.DOOM)) { extension = " - Fatalité"; }
        if (card.isOfType(CardType.LIAISON)) { extension = " - Liaison"; }
        if (card.isOfType(CardType.COVER)) {
          extension = " - " + t(card.id)
          return { png: "action", label: "Action" + extension };
        }

        if (card.isOfType(CardType.NIGHT)) {
          if (card.isOfType(CardType.DURATION)) {
            if (card.isOfType(CardType.ATTACK)) {
              return { png: "night-duration", label: "Nuit - Attaque - Durée" + extension };
            }
            return { png: "night-duration", label: "Nuit - Durée" + extension };
          }
          if (card.isOfType(CardType.ATTACK)) {
            if (card.isOfType(CardType.DOOM)) {
              if (card.isOfType(CardType.ACTION)) { return { png: "action-night", label: "Action - Nuit - Attaque" + extension }; }
              return { png: "night", label: "Nuit - Attaque" + extension };
            }
          }
          return { png: "night", label: "Nuit" + extension };
        }
        if (card.isOfType(CardType.ACTION)) {
          if (card.isOfType(CardType.TRAVELLER)) { return { png: "action-traveller", label: "Action - Itinérant" + extension }; }
          if (card.isOfType(CardType.DURATION)) {
            if (card.isOfType(CardType.REACTION)) { return { png: "action-duration-reaction", label: "Action - Durée - Réaction" + extension }; }
            if (card.isOfType(CardType.ATTACK)) { return { png: "action-duration", label: "Action - Durée - Attaque" + extension }; }
            if (NeedHeirloompng) { return { png: "action-duration-heirloom", label: "Action - Durée" + extension }; }
            return { png: "action-duration", label: "Action - Durée" + extension };
          }
          if (NeedHeirloompng) { return { png: "action-heirloom", label: "Action" + extension }; }
          if (card.isOfType(CardType.RESERVE)) {
            if (card.isOfType(CardType.VICTORY)) { return { png: "action-reserve-victory", label: "Action - Réserve- Victoire" + extension }; }
            return { png: "action-reserve", label: "Action - Réserve" + extension };
          }
          if (card.isOfType(CardType.NIGHT)) { return { png: "action-night", label: "Action - Nuit" + extension }; }
          if (card.isOfType(CardType.REACTION)) {
            if (card.isOfType(CardType.ATTACK)) { return { png: "action-reaction", label: "Action - Attaque - Réaction" + extension }; }
            return { png: "action-reaction", label: "Action - Réaction" + extension };
          }
          if (card.isOfType(CardType.TREASURE)) { return { png: "action-treasure", label: "Action - Trésor" + extension }; }
          if (card.isOfType(CardType.VICTORY)) {
            if (card.isOfType(CardType.ATTACK)) { return { png: "action-victory", label: "Action - Attaque" + extension + "- Victoire" }; }
            return { png: "action-victory", label: "Action - Victoire" + extension };
          }
          if (card.isOfType(CardType.ATTACK)) { return { png: "action", label: "Action - Attaque" + extension }; }
          return { png: "action", label: "Action" + extension };
        }
        if (card.isOfType(CardType.TREASURE)) {
          if (card.isOfType(CardType.REACTION)) { return { png: "treasure-reaction", label: "Trésor - Réaction" + extension }; }
          if (card.isOfType(CardType.VICTORY)) { return { png: "treasure-victory", label: "Trésor - Victoire" + extension }; }
          if (card.isOfType(CardType.RESERVE)) { return { png: "treasure-reserve", label: "Trésor - Réserve" + extension }; }
          if (card.isOfType(CardType.ATTACK)) { return { png: "treasure", label: "Trésor - Attaque" + extension }; }
          if (card.isOfType(CardType.DURATION)) { return { png: "treasure-duration", label: "Trésor - Durée" + extension }; }
          return { png: "treasure", label: "Trésor" + extension };
        }
        if (card.isOfType(CardType.VICTORY)) {
          if (card.isOfType(CardType.REACTION)) { return { png: "victory-reaction", label: "Victoire - Réaction" + extension }; }
          if (NeedHeirloompng) { return { png: "victory-heirloom", label: "Victoire" + extension }; }
          return { png: "victory", label: "Victoire" + extension };
        }
      }
      if (card.constructor.name == "OtherCard") {
        //console.log(card)
        card = card as OtherCard;
        let extension
        extension = "";
        if (card.type.includes("Prize")) { extension = " - Prix"; }
        if (card.type.includes("Heirloom")) { extension = " - Patrimoine"; }
        if (card.type.includes("Spirit")) { extension = " - Esprit"; }
        if (card.type.includes("Zombie")) { extension = " - Zombie"; }
        if (card.type.includes("Knight")) { extension = " - Chevalier"; }
        if (card.type.includes("Castle")) { extension = " - Château"; }
        if (card.type.includes("Clashes")) { extension = " - Affrontement"; }
        if (card.type.includes("Townsfolk")) { extension = " - Citoyen"; }
        if (card.type.includes("Augurs")) { extension = " - Augure"; }
        if (card.type.includes("Odyssey")) { extension = " - Odyssée"; }
        if (card.type.includes("Fort")) { extension = " - Fortifications"; }
        if (card.type.includes("Wizards")) { extension = " - Magicien"; }
        if (card.type.includes("Wizards - Liaison")) { extension = " - Magicien - Liaison"; }


        if (card.type.includes("Ruins")) {
          return { png: "action-ruins", label: "Action - Ruines" + extension };
        }

        /* usion slice(2) to remove "is" in "isVictory" */
        if (card.type.includes("Shelter")) {
          if (card.type.includes(CardType.VICTORY.slice(2))) { return { png: "victory-shelter", label: "Victoire - Refuge" + extension }; }
          if (card.type.includes(CardType.REACTION.slice(2))) { return { png: "reaction-shelter", label: "Réaction - Refuge" + extension }; }
          if (card.type.includes(CardType.ACTION.slice(2))) { return { png: "action-shelter", label: "Action - Refuge" + extension }; }
        }

        if (card.type.includes(CardType.NIGHT.slice(2))) {
          if (card.type.includes(CardType.DURATION.slice(2))) { return { png: "night-duration", label: "Nuit - Durée" + extension }; }
          return { png: "night", label: "Nuit" };
        }

        if (card.type.includes(CardType.ACTION.slice(2))) {

          if (card.type.includes(CardType.DURATION.slice(2))) {
            if (card.type.includes(CardType.REACTION.slice(2))) { return { png: "action-duration-reaction", label: "Action - Durée - Réaction" + extension }; }
            if (card.type.includes(CardType.VICTORY.slice(2))) { return { png: "action-duration-victory", label: "Action - Victoire - Durée" + extension }; }
            return { png: "action-duration", label: "Action - Durée" + extension };
          }
          if (card.type.includes(CardType.RESERVE.slice(2))) {
            if (card.type.includes(CardType.VICTORY.slice(2))) { return { png: "action-reserve-victory", label: "Action - Réserve- Victoire" + extension }; }
            return { png: "action-reserve", label: "Action - Réserve" + extension };
          }
          if (card.type.includes(CardType.NIGHT.slice(2))) { return { png: "action-night", label: "Action - Nuit" + extension }; }
          if (card.type.includes(CardType.REACTION.slice(2))) { return { png: "action-reaction", label: "Action - Réaction" + extension }; }
          if (card.type.includes(CardType.TREASURE.slice(2))) { return { png: "action-treasure", label: "Action - Trésor" + extension }; }
          if (card.type.includes(CardType.VICTORY.slice(2))) {
            if (card.type.includes(CardType.ATTACK.slice(2))) { return { png: "action-victory", label: "Action - Attaque - Chevalier - Victoire" }; }
            return { png: "action-victory", label: "Action - Victoire" + extension };
          }
          if (card.type.includes(CardType.ATTACK.slice(2))) {
            if (card.type.includes(CardType.TRAVELLER.slice(2))) { return { png: "action-traveller", label: "Action - Attaque - Itinérant" + extension }; }
            return { png: "action", label: "Action - Attaque" + extension };
          }
          if (card.type.includes(CardType.TRAVELLER.slice(2))) { return { png: "action-traveller", label: "Action - Itinérant" + extension }; }
          return { png: "action", label: "Action" + extension };
        }

        if (card.type.includes(CardType.TREASURE.slice(2))) {
          if (card.type.includes(CardType.REACTION.slice(2))) { return { png: "treasure-reaction", label: "Trésor - Réaction" + extension }; }
          if (card.type.includes(CardType.VICTORY.slice(2))) { return { png: "treasure-victory", label: "Trésor - Victoire" + extension }; }
          if (card.type.includes(CardType.RESERVE.slice(2))) { return { png: "treasure-reserve", label: "Trésor - Réserve" + extension }; }
          return { png: "treasure", label: "Trésor" + extension };
        }

        if (card.type.includes(CardType.VICTORY.slice(2))) {
          if (card.type.includes(CardType.REACTION.slice(2))) { return { png: "victory-reaction", label: "Victoire - Réaction" + extension }; }
          return { png: "victory", label: "Victoire" + extension };
        }

      }
      return { png: 'error-no valid card type', label: 'error-no valid card type' };
    }

    const DoNeedSub = (currentCard: DigitalCard) => {
      let card;
      card = DominionSets.getCardById(currentCard.id);
      //console.log(card)
      if (card.constructor.name == "SupplyCard") {
        if (IsZeroStar.has(currentCard.id)) {
          return true;
        }
      }
      if (card.constructor.name == "OtherCard") {
        card = card as OtherCard;
        if (card.type.includes("Prize")) {
          return true;
        }
        if (IsZeroStar.has(currentCard.id)) {
          return true;
        }
      }
      return false;
    }

    const getisTreasureCard = (currentCard: DigitalCard) => {
      if (TreasureWithNoGain.has(currentCard.id)) { return false; }
      let card
      card = DominionSets.getCardById(currentCard.id);
      if (card.constructor.name == "SupplyCard") { return (card as SupplyCard).isOfType(CardType.TREASURE); }
      if (card.constructor.name == "OtherCard") { return (card as OtherCard).type.includes(CardType.TREASURE.slice(2)); }
      return false;
    }

    const getValueforTreasureCard = (currentCard: DigitalCard) => {
      let pattern = '<div class="card-text-coin-text" style="color: black; display:inline; top:8px;">';
      if (currentCard.id == "fortune") { return "x2"; }
      if (currentCard.id == "ducat" || currentCard.id == "sunkentreasure") { return 0; }
      if (QuestionMarkValue.has(currentCard.id)) { return "?"; }
      let valuePosition = currentCard.text_html.indexOf(pattern)
      if (valuePosition == -1) { return "?"; }
      return currentCard.text_html.charAt(currentCard.text_html.indexOf(pattern) + pattern.length);
    }

    const fontsizefortune = (currentCard: DigitalCard) => {
      if (currentCard.id == "fortune") { return "font-size:6em;"; }
      return "";
    }

    const getCardCost = (currentCard: DigitalCard) => {
      let card;
      card = DominionSets.getCardById(currentCard.id);
      //console.log(card)
      if (card.constructor.name == "SupplyCard") {
        card = card as SupplyCard;
        return card.cost;
      }
      if (card.constructor.name == "OtherCard") {
        card = card as OtherCard;
        return card.cost;
      }
      return ({
        treasure: 0,
        potion: 0,
        debt: 0
      } as Cost);
    }

    const getCardNameFontSize = (currentCard: DigitalCard) => {
      let isTreasure = getisTreasureCard(currentCard);
      if (isTreasure) {
        if ((currentCard.frenchName) == "Contrebande") { return { top: 19, fontsize: 1.45 }; }
        if ((currentCard.frenchName) == "Contrefaçon") { return { top: 19, fontsize: 1.45 }; }
        if ((currentCard.frenchName) == "Entreprise risquée") { return { top: 22, fontsize: 1.05 }; }
        if ((currentCard.frenchName).length >= 17) { return { top: 22, fontsize: 0.97 }; } /* 17 Corne d'abondance 19 pierre philosophale */
        if ((currentCard.frenchName).length >= 15) { return { top: 21, fontsize: 1.05 }; } /* 15 Château modeste */
        if ((currentCard.frenchName).length >= 12) { return { top: 20, fontsize: 1.2 }; } /* 12  Chef-d'œuvre 15 */
        if ((currentCard.frenchName).length >= 8) { return { top: 18, fontsize: 1.5 }; } /* 8 Talisman 11 Contrebande*/
        return { top: 16, fontsize: 1.8 }; /* >= 6 Banque */
        if ((currentCard.frenchName).length >= 18) { return { top: 21, fontsize: 1.08 }; } /* 18 */
        if ((currentCard.frenchName).length >= 16) { return { top: 20, fontsize: 1.16 }; } /* 16 */
      }
      if ((currentCard.frenchName).length >= 31) { return { top: 22, fontsize: 0.95 }; } /* 31 */
      if ((currentCard.frenchName).length >= 25) { return { top: 20, fontsize: 1.1 }; } /* 25 */
      if ((currentCard.frenchName).length >= 22) { return { top: 19, fontsize: 1.2 }; } /* 24 */
      if ((currentCard.frenchName).length >= 15) { return { top: 17, fontsize: 1.4 }; } /* 21 */
      if ((currentCard.frenchName).length >= 13) { return { top: 16, fontsize: 1.6 }; } /* 14 */
      return { top: 16, fontsize: 1.8 };  /* >= 12 */
    }

    const getCardSetById = (currentCard: DigitalCard) => {
      //return props.set.setId;
      let curr_Card_setid = DominionSets.getCardById(currentCard.id).setId;
      if (props.set.setId.substring(0, props.set.setId.length - 2) == curr_Card_setid.substring(0, props.set.setId.length - 2)) {
        return props.set.setId
      }
      return curr_Card_setid;
    }

    const getCardTypeFontSize = (currentCard: DigitalCard) => {
      var typeOfCard = getCardTypeById(currentCard).label
      /* 1.43em top: 50 px; */
      if (typeOfCard.length >= 39) { return "font-size: 1.36em;  top:50px;"; } /* Action - Victoire - Durée - Fortifications*/
      if (typeOfCard.length >= 35) { return "font-size: 1.43em;  top:50px;"; } /* Action - Attaque - Chevalier - Vitoire*/
      if (typeOfCard.length >= 28) { return "font-size: 1.75em;  top:50px;"; } /* Action - Attaque - Chevalier */
      if (typeOfCard.length >= 26) { return "font-size: 2em;     top:45px;"; } /* Action - Attaque - Pillard */
      if (typeOfCard.length >= 22) { return "font-size: 2.2em;   top:40px;"; } /* Action - Attaque - Prix */
      if (typeOfCard.length >= 21) { return "font-size: 2.4em;   top:38px;"; } /* Action - Attaque - Prix */
      if (typeOfCard.length >= 16) { return "font-size: 2.8em;   top:35px;"; } /* Action - Attaque */
      if (typeOfCard.length >= 13) { return "font-size: 3.125em; top:30px;"; } /* Action - Prix */ /*Action - Durée */
      return "font-size: 4.2em;   top:20px;";   /* Nuit - Attaque - Durée */
    }

    const getCardIllustrator = (currentCard: DigitalCard): IllustratorCard => {
      let returned_value = Cards_list_Illustrator.find(elt => elt.id == currentCard.id) as IllustratorCard;
      if (typeof returned_value == "undefined") { return { id: "adventurer", illustrator: "" } }
      return returned_value
    }

    const getCardSetYear = (currentCard: DigitalCard) => {
      let CardSetid = props.set.setId
      if ((CardSetid as string) === "undefined") { CardSetid = getCardSetById(currentCard); }
      if (CardSetid == SetId.PROMOS) {
        return (Year_set.find(elt => elt.id == currentCard.id))!.year;
      }
      return (Year_set.find(elt => elt.id == CardSetid))!.year;
    }

    const getCardArtwork = (cardArtwork:String) => {
        return cardArtwork.replace(BASEURL,'');
    }
    return {
      Cards,
      getClassCard,
      getHost,
      getCardTypeById,
      getisTreasureCard,
      fontsizefortune,
      getValueforTreasureCard,
      getCardNameFontSize,
      getCardCost,
      DoNeedSub,
      getCardSetById,
      getCardTypeFontSize,
      getCardIllustrator,
      getCardSetYear,
      cardImageUrl,
      incaseoferror,
      getCardArtwork
    }
  }
});

</script>




