<template>
  <!-- for the Landscape cards -->
  <div class="ListofcontentCard Coef_scale12 card-rows">
    <div v-for="Card in Cards" :key="Card.id" :class="getClassCard(Card)">
      <div class="card-container-landscape">
      <div class="landscape unselectable" style="left:0px; top:0px; z-index:0;transform: scale(1); cursor:">
        <div class="landscape-template"
          :style='"background-image: url(" + getHost() + "/img/Templates-card-type/" + getCardTypeById(Card).png + ".png);"'>
        </div>
        <!-- type of card -->
        <div class="landscape-art" :style='"background-size: 452px 177px; background-image: url(" + getCardArtwork(Card.artwork) + ")"'>
          <div class="action-layer"></div>
        </div>
        <!--Card name -->
        <div class="landscape-name-container" :style='"top:" + getCardNameFontSize(Card).top + "px;"'>
          <div class="landscape-name" :style='"font-size:" + getCardNameFontSize(Card).fontsize + "em;"'>
            {{ Card.frenchName }}
          </div>
        </div>

        <div class="landscape-type-rotate " style="top:35px; ">
          <div class="landscape-name" :style="getCardTypeById(Card).style">
            {{ getCardTypeById(Card).label }}
          </div>
        </div>
        <!---->
        <div class="landscape-cost-container-full" v-if="getCardNeedCost(Card)">
          <!---->
          <div class="landscape-coin-cost-full"
            v-if="((getCardCost(Card).treasure > 0 && getCardCost(Card).debt > 0) || getCardCost(Card).debt == 0 && getCardCost(Card).treasure >= 0)">
            <div class="coin-cost-full-text" style="top:12px;">{{ getCardCost(Card).treasure }}</div>
          </div>
          <div class="landscape-debt-cost-full" v-if="getCardCost(Card).debt > 0">
            <div class="landscape-debt-cost-full-text" style="top:12px;">{{ getCardCost(Card).debt }}</div>
          </div>
          <!---->
          <!---->
        </div>
        <!--Card Text -->
        <div class="landscape-text-container" v-html="Card.text_html"></div> 

        <div class="landscape-bottom-right-container-expansion" :style="ExpansionIconPosition(Card)">
          <div class="expansion-icon-bottom-full"
            :style='" background-image: url(" + getHost() + "/img/Templates-set/" + getCardSetById(Card) + "-small.png);"'>
          </div>
        </div>

        <div class="full-card-border">
          <div class="card-footer landscape-card-footer illustrator" style="color:Black;"
            :style="ExpansionillustratorOffset(Card)">{{ getCardIllustrator(Card).illustrator }}</div>
          <div class="card-footer landscape-card-footer copyright" :style="ExpansionillustratorOffset(Card)">{{
            getCardSetYear(Card) }}</div>

        </div>
        <!---->
      </div>
      </div>
      <div class="separator-card-landscape" style="z-index:0;"></div>
      <div class="card-container-landscape">
      <div class="landscape unselectable" style="left:0px; top:0px; z-index:0;transform: scale(1); cursor:">
        <div class="landscape-template"
          :style='"background-image: url(" + getHost() + "/img/Templates-card-type/" + getCardTypeById(Card).png + ".png);"'>
        </div>
        <!-- type of card -->
        <div class="landscape-art" :style='"background-size: 452px 177px; background-image: url(" + getCardArtwork(Card.artwork) + ")"'>
          <div class="action-layer"></div>
        </div>
        <!--Card name -->
        <div class="landscape-name-container" :style='"top:" + getCardNameFontSize(Card).top + "px;"'>
          <div class="landscape-name" :style='"font-size:" + getCardNameFontSize(Card).fontsize + "em;"'>
            {{ Card.frenchName }}
          </div>
        </div>

        <div class="landscape-type-rotate " style="top:35px; ">
          <div class="landscape-name" :style="getCardTypeById(Card).style">
            {{ getCardTypeById(Card).label }}
          </div>
        </div>
        <!---->
        <div class="landscape-cost-container-full" v-if="getCardNeedCost(Card)">
          <!---->
          <div class="landscape-coin-cost-full"
            v-if="((getCardCost(Card).treasure > 0 && getCardCost(Card).debt > 0) || getCardCost(Card).debt == 0 && getCardCost(Card).treasure >= 0)">
            <div class="coin-cost-full-text" style="top:12px;">{{ getCardCost(Card).treasure }}</div>
          </div>
          <div class="landscape-debt-cost-full" v-if="getCardCost(Card).debt > 0">
            <div class="landscape-debt-cost-full-text" style="top:12px;">{{ getCardCost(Card).debt }}</div>
          </div>
          <!---->
          <!---->
        </div>
        <!--Card Text -->
        <!-- <div class="landscape-text-container" v-html="Card.text_html"></div>  -->
        <CardTextContainer :card='Card' direction="landscape"/>

        <div class="landscape-bottom-right-container-expansion" :style="ExpansionIconPosition(Card)">
          <div class="expansion-icon-bottom-full"
            :style='" background-image: url(" + getHost() + "/img/Templates-set/" + getCardSetById(Card) + "-small.png);"'>
          </div>
        </div>

        <div class="full-card-border">
          <div class="card-footer landscape-card-footer illustrator" style="color:Black;"
            :style="ExpansionillustratorOffset(Card)">{{ getCardIllustrator(Card).illustrator }}</div>
          <div class="card-footer landscape-card-footer copyright" :style="ExpansionillustratorOffset(Card)">{{
            getCardSetYear(Card) }}</div>

        </div>
        <!---->
      </div>
      </div>
      <div class="separator-card-landscape" style="z-index:0;"></div>
           <img class="landscape " style="z-index:0; " :src="cardImageUrl(Card)" :key="cardImageUrl(Card)" @error="incaseoferror" />
    </div>
  </div>
</template>

<script lang="ts">
/* import Vue, typescript */
import { defineComponent, computed } from 'vue';
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n'
import saveAs  from 'file-saver';

/* import Dominion Objects and type*/
import { DominionSets } from "../dominion/dominion-sets";
import type { SupplyCard } from "../dominion/supply-card";
import type { OtherCard } from "../dominion/other-card";
import { CardType } from "../dominion/card-type"
import type { Addon } from "../dominion/addon"
import type { Cost } from "../dominion/cost"
import { SetId } from "../dominion/set-id"
import type { DominionSet } from "../dominion/dominion-set";
import { getCardImageUrl } from "../utils/resources";
import { incaseofImgerror } from "../utils/resources";

import type { DigitalCard } from "../dominion/digital_cards/digital-cards-type"
import { Cards_list_Landsacpe as Cards_list } from "../dominion/digital_cards/digital-cards"
import type { IllustratorCard } from "../dominion/digital_cards/digital-cards-type"
import { Cards_list_Illustrator, Year_set } from "../dominion/digital_cards/digital-cards-Illustrator"

/* import store  */
/* import Components */
import CardTextContainer from "./CardTextContainer.vue";

export const QuestionMarkVaue =
  new Set(["bank",
    "philosophersstone"
  ]);

interface DisplayableCardType {
  readonly png: string,
  readonly label: string,
  readonly style: string
}

const BASEURL= /http:\/\/localhost:8080/

export default defineComponent({
  name: "CardOnlinePageLandscapeComponent",
  components:{
    CardTextContainer
  },
  props: {
    set: {
      type: Object as PropType<DominionSet>,
      default: null,
    }
  },
  setup(props) {
    const { t } = useI18n();

    const Cards = computed(() => {

      console.log( 
        Cards_list.filter(card =>
            props.set.otherCards.some(function (item) { return item.shortId == card.id; }))
      )
      const filteredCards = Cards_list.filter(card =>
        props.set.supplyCards.some(function (item) { return item.shortId == card.id; }))
        .concat(
          Cards_list.filter(card =>
            props.set.otherCards.some(function (item) { return item.shortId == card.id; }))
        ).concat(
          Cards_list.filter(card =>
            props.set.boons.some(function (item) { return item.shortId == card.id; }))
        ).concat(
          Cards_list.filter(card =>
            props.set.ways.some(function (item) { return item.shortId == card.id; }))
        ).concat(
          Cards_list.filter(card =>
            props.set.events.some(function (item) { return item.shortId == card.id; }))
        ).concat(
          Cards_list.filter(card =>
            props.set.projects.some(function (item) { return item.shortId == card.id; }))
        ).concat(
          Cards_list.filter(card =>
            props.set.landmarks.some(function (item) { return item.shortId == card.id; }))
        ).concat(
          Cards_list.filter(card =>
            props.set.allies.some(function (item) { return item.shortId == card.id; }))
        ).concat(
          Cards_list.filter(card =>
            props.set.traits.some(function (item) { return item.shortId == card.id; }))
        ).concat(
          Cards_list.filter(card =>
            props.set.prophecies.some(function (item) { return item.shortId == card.id; }))
        )
        const typefilteredCards = filteredCards.filter(card => {
        //const supplycard = DominionSets.getCardById(card.id) 
        return card.id == 'amass' || card.id == 'asceticism' || card.id == 'gather';
        })   
        //console.log(filteredCards, typefilteredCards)
        const uniqueCards = new Set(filteredCards);
      return Array.from(uniqueCards) 
    });

    const cardImageUrl = (card: DigitalCard) => {
      const cardType = DominionSets.getCardById(card.id);
      return getCardImageUrl(getCardSetById(card) + "_" + cardType.constructor.name + "_" + card.id, "en" as any);
    }

    const incaseoferror = (ev: any) => {
      //console.log(ev)
      incaseofImgerror(ev);
    }

    const getHost= () => {
      return ""
      return window.location.protocol + "//" + window.location.host;
    }

    const getClassCard= (currentCard: DigitalCard) => {
      return "v-for-landscape card-theme-title-dark card-theme-text-dark";
    }

    const getCardTypeById= (currentCard: DigitalCard):DisplayableCardType => {
      let card;
      card = DominionSets.getCardById(currentCard.id);
      switch (card.constructor.name) {
        case "Event": {
          return {
            png: "event", label: "Événement",
            style: "top:0px; left:-5px; font-size:0.7em;"
          };
        }
        case "Project": {
          return {
            png: "project", label: "Projet",
            style: "top:-2px; left:-10px; font-size:1em;"
          };
        }
        case "Landmark": {
          return {
            png: "landmark", label: "Repère",
            style: "top:3px; left:-15px; font-size:0.9em;"
          };
        }
        case "Boon": {
          return {
            png: "boon", label: "Aubaine",
            style: "top:-2px; left:-8px; font-size:0.9em;"
          };
        }
        case "Way": {
          return {
            png: "way", label: "Voie",
            style: "top:3px; left:-15px; font-size:1.2em;"
          };
        }
        case "Ally": {
          return {
            png: "ally", label: "Allié",
            style: "top:3px; left:-15px; font-size:1.2em;"
          };
        }
        case "Trait": {
          return {
            png: "trait", label: "trai",
            style: "top:3px; left:-15px; font-size:1.2em;"
          };
        }
        case "Prophecy": {
          return {
            png: "prophecy", label: "Prophétie",
            style: "top:3px; left:-15px; font-size:1.2em;"
          };
        }
        case "OtherCard": {
          card = card as OtherCard;
          switch (card.type) {
            case "Hexes": {
              return {
                png: "hex", label: "Sortilège",
                style: "top:1px; left:-6px; font-size:0.75em;"
              };
            }
            case "States": {
              return {
                png: "state", label: "État",
                style: "top:5px; left:-18px; font-size:1.1em;"
              };
            }
            case "Heirlooms": {
              return {
                png: "heirloom", label: "Patrimoine",
                style: "top:3px; left:-15px; font-size:0.9em;"
              };
            }
            case "Artifacts": {
              return {
                png: "artifact", label: "Artefact",
                style: "top:-2px; left:-8px; font-size:0.85em;"
              };
            }
            default: {
              return {
                png: 'error-no valid card type', label: 'error-no valid card type',
                style: ''
              };
            }
          }
        }
      }
      return { png: 'error-no valid card type', label: 'error-no valid card type', style: '' };
    }

    const getisTreasureCard= (currentCard: DigitalCard) => {
      let card;
      card = DominionSets.getCardById(currentCard.id);
      if (card.constructor.name == "SupplyCard") {
        card = card as SupplyCard;
        return card.isOfType(CardType.TREASURE);
      }
      if (card.constructor.name == "OtherCard") {
        return false;
      }
      return false;
    }

    const getValueforTreasureCard= (currentCard: DigitalCard) => {
      let pattern = '<div class="card-text-coin-text" style="color: black; display:inline; top:8px;">';
      if (QuestionMarkVaue.has(currentCard.id)) { return "?"; }
      let valuePosition = currentCard.text_html.indexOf(pattern)
      if (valuePosition == -1) { return "?"; }
      return currentCard.text_html.charAt(currentCard.text_html.indexOf(pattern) + pattern.length);
    }

    const getCardNeedCost= (currentCard: DigitalCard) => {
      let card;
      card = DominionSets.getCardById(currentCard.id);
      //console.log(currentCard.id + " :: " + card.constructor.name);
      if (card.constructor.name == "Boon" ||
        card.constructor.name == "Landmark" ||
        card.constructor.name == "OtherCard" ||
        card.constructor.name == "Way" ||
        card.constructor.name == "Ally") {
        return false;
      }
      return true;
    }

    const getCardCost= (currentCard: DigitalCard) => {
      let card;
      card = DominionSets.getCardById(currentCard.id);
      if (card.constructor.name == "Boon" || card.constructor.name == "OtherCard") {
        return ({
          treasure: 0,
          potion: 0,
          debt: 0
        } as Cost);
      }
      card = card as Addon
      return card.cost
    }

    const getCardNameFontSize= (currentCard: DigitalCard) => {
      let isTreasure = false
      let card = DominionSets.getCardById(currentCard.id);
      if (card.constructor.name == "SupplyCard") {
        if ((card as SupplyCard).isOfType(CardType.TREASURE)) { isTreasure = true; }
      }
      if (card.constructor.name == "Wayx") {
        return { top: 7, fontsize: 1 };
      }
      if (isTreasure) {
        if ((currentCard.frenchName).length >= 19) { return { top: 22, fontsize: 0.97 }; } /* 17 */
        if ((currentCard.frenchName).length >= 18) { return { top: 21, fontsize: 1.08 }; } /* 18 */
        if ((currentCard.frenchName).length >= 16) { return { top: 20, fontsize: 1.16 }; } /* 16 */
        if ((currentCard.frenchName).length >= 14) { return { top: 20, fontsize: 1.2 }; } /* 16 */
        if ((currentCard.frenchName).length >= 8) { return { top: 18, fontsize: 1.5 }; } /* 11 */
        return { top: 16, fontsize: 1.8 }; /* >= 6 */
      }

      if ((currentCard.frenchName).length >= 22) { return { top: 9, fontsize: 0.88 }; }
      if ((currentCard.frenchName).length >= 21) { return { top: 9, fontsize: 0.88 }; }
      if ((currentCard.frenchName).length >= 20) { return { top: 7, fontsize: 1 }; }
      if ((currentCard.frenchName).length >= 17) { return { top: 7, fontsize: 1 }; } /* 17 */
      if ((currentCard.frenchName).length >= 16) { return { top: 7, fontsize: 1.1 }; } /* 17 */
      if ((currentCard.frenchName).length >= 14) { return { top: 6, fontsize: 1.2 }; } /* 14 */
      if ((currentCard.frenchName).length >= 13) { return { top: 4, fontsize: 1.3 }; } /* 13 */
      return { top: 4, fontsize: 1.4 };  /* >= 12 */
    }

    const getCardSetById= (currentCard: DigitalCard) => {
      return DominionSets.getCardById(currentCard.id).setId;
    }

    const getCardById= (currentCard: DigitalCard,) => {
      return (DominionSets.getCardById(currentCard.id) as SupplyCard);
    }

    const getCardTypeFontSize= (currentCard: DigitalCard) => {
      var typeOfCard = getCardTypeById(currentCard).label
      if (typeOfCard.length >= 16) { return "font-size: 2.8em;   top:35px;"; }
      if (typeOfCard.length >= 14) { return "font-size: 3.125em; top:30px;"; }
      return "font-size: 4.2em;   top:20px;";
    }

    const ExpansionIconPosition= (currentCard: DigitalCard) => {
      let CardSetid = getCardSetById(currentCard);
      switch (CardSetid) {
        case SetId.ADVENTURES: return " right: -32px; bottom: -74px; " /* from style */
        case SetId.RENAISSANCE: return " right: -32px; bottom: -74px; " /* from style */
        case SetId.EMPIRES: return " right: -34px; bottom: -78px; "
        case SetId.NOCTURNE: return " right: -37px; bottom: -72px; "
        case SetId.PROMOS: return " right: -34px; bottom: -74px; "
        case SetId.MENAGERIE: return " right: -36px; bottom: -24px; "
        case SetId.ALLIES: return " right: -34px; bottom: -78px; "
        default: { return ""; }
      }
    }

    const ExpansionillustratorOffset= (currentCard: DigitalCard) => {
      let CardSetid = getCardSetById(currentCard);
      switch (CardSetid) {

        case SetId.ALLIES: return " bottom: -2px; "
        case SetId.RISING_SUN: 
          let card = DominionSets.getCardById(currentCard.id);
          switch (card.constructor.name) {
            case "Prophecy": return " color: #FEFFFC; "
          }
        default: { return ""; }
      }
    }

    const getCardIllustrator= (currentCard: DigitalCard):IllustratorCard => {
      let returned_value = Cards_list_Illustrator.find(elt => elt.id == currentCard.id) as IllustratorCard;
      if (typeof returned_value == "undefined") { return { id: "adventurer", illustrator: "" } }
      return returned_value
    }

    const getCardSetYear= (currentCard: DigitalCard) => {
      let CardSetid = getCardSetById(currentCard);
      if (CardSetid == SetId.PROMOS) {
        switch (currentCard.id) {
          case "envoy": return 2008;
          case "blackmarket": return 2009;
          case "stash": return 2010;
          case "walledvillage": return 2011;
          case "governor": return 2011;
          case "prince": return 2014;
          case "summon": return 2015;
          case "sauna": return 2016;
          case "avanto": return 2016;
          case "saunaavanto": return 2016;
          case "dismantle": return 2017;
          case "chruch": return 2019;
          case "captain": return 2019;
          default: { return ""; }
        }
      }
      return (Year_set.find(elt => elt.id == CardSetid))!.year;
    }

    const getCardArtwork = (cardArtwork:string) => {
        return cardArtwork
              .replace('%', '%25')
              .replace('http://wiki','https://wiki')
              .replace(BASEURL,'')
              .replace("https://wiki.dominionstrategy.com/", "http://localhost:5173/img/artworks/");
    }

    return {
      Cards,
      getClassCard,
      getHost,
      getCardTypeById,
      getCardNameFontSize,
      getCardNeedCost,
      getCardCost,
      ExpansionIconPosition,
      getCardSetById,
      ExpansionillustratorOffset,
      getCardIllustrator,
      getCardSetYear,
      getCardArtwork,
      cardImageUrl,
      incaseoferror
    }
  }
});
</script>



