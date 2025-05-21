<template>
  <div class="ListofcontentCard Coef_scale12 card-rows ">
    <div v-for="Card in Cards" :key="Card.id" :class="getClassCard(Card)">
      <div class="card-container">
      <div class="full-card unselectable" style="z-index:0; cursor:default;
           transform: scale(1); transition:none; position: sticky;">
        <!-- is a card -->
        <!-- type of card -->
        <div class="full-card-template"
          :style='"background-image: url(" + getHost() + "/img/Templates-card-type/" + getCardTypeById(Card).png + ".png);"'>
        </div>
        <!-- Basic Card Image Treasure & Victory -->
        <div class="full-card-art"
          :style='"background-size: 287px 374px; background-image: url(" + getCardArtwork(Card.artwork) + "); top:12%;"'>
          <div class="action-layer none-layer"> </div>
        </div>

        <div v-if="getisTreasureCard(Card)" class="treasure-production-container">
          <div class="coin-production-container" v-if="getValueforTreasureCard(Card).treasure > 0">>
            <div class="coin-production-left" style="top:-23px;">
              <div class="coin-production-text-container">
                <div class="coin-production-text" style="top:12px;">{{ getValueforTreasureCard(Card).treasure }}</div>
              </div>
            </div>
            <div class="coin-production-right" style="top:-23px;">
              <div class="coin-production-text-container">
                <div class="coin-production-text" style="top:12px;">{{ getValueforTreasureCard(Card).treasure }}</div>
              </div>
            </div>
          </div>
          <div class="potion-production-container" v-if="getValueforTreasureCard(Card).potion > 0">
            <div class="potion-production-left" style="top:-23px;"></div>
            <div class="potion-production-right" style="top:-23px;"></div>
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
        <div class="bottom-bar-full" :style='"width:237.5%;bottom:" + getCardBottomBarOffset(Card) + "px;"'>
          <div class="cost-container-full">
            <div class="coin-cost-full">
              <div class="coin-cost-full-text" style="top:12px;">{{ getCardCost(Card).treasure }}</div>
            </div>
            <div class="potion-cost-full" v-if="getCardCost(Card).potion > 0">
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
import type { PropType } from 'vue';
import { useI18n } from 'vue-i18n'

/* import Dominion Objects and type*/
import { DominionSets } from "../dominion/dominion-sets";
import type { SupplyCard } from "../dominion/supply-card";
import type { OtherCard } from "../dominion/other-card";
import { CardType } from "../dominion/card-type"
import type{ Cost } from "../dominion/cost"
import type { DominionSet } from "../dominion/dominion-set";
import { getCardImageUrl } from "../utils/resources";
import { incaseofImgerror } from "../utils/resources";

import type { DigitalCard } from "../dominion/digital_cards/digital-cards-type"
import { OtherCards_list } from "../dominion/digital_cards/Manual/digital-cards-othercards"

/* import store  */
/* import Components */

interface DisplayableCardType {
  readonly png: string,
  readonly label: string
}

const BASEURL= /http:\/\/localhost:8080/

export default defineComponent({
  name: "CardOnlineOthercardPageComponent",
  props: {
    set: {
      type: Object as PropType<DominionSet>,
      default: null,
    }
  },
  setup(props) {
    const { t } = useI18n();

    const Cards = computed(() => {
      return OtherCards_list.filter(card =>
        props.set.otherCards.some(function (item) { return ((item.shortId == card.id)); }));
    })

    const cardImageUrl = (card: DigitalCard) => {
      return getCardImageUrl(getCardSetById(card) + "_" + card.id, "en" as any);
    }

    const incaseoferror = (ev: any) => {
      console.log(ev)
      incaseofImgerror(ev);
    }
    
    const getHost= () => {
      return "";
      return window.location.protocol + "//" + window.location.host;
    }

    const getClassCard= (currentCard: DigitalCard) => {
      return "v-for card-theme-title-dark card-theme-text-dark";
    }
    const getCardArtwork = (cardArtwork:String) => {
      return cardArtwork
              .replace('%', '%25')
              .replace('http://wiki','https://wiki')
              .replace(BASEURL,'')
              .replace("https://wiki.dominionstrategy.com/", "http://localhost:5173/img/artworks/");
    }

    const getCardTypeById= (currentCard: DigitalCard): DisplayableCardType => {
      let card;
      card = DominionSets.getCardById(currentCard.id);
      /* here is otherCards 
      Events, Landmarks, Projetcs,
      Basic Supply Cards, Ruins, Shelters, Non-Supply, Travellers, Artefacts, Hexes
      */
      if (card.constructor.name == "OtherCard") {
        card = (card as OtherCard)
        if (card.isOfType(CardType.TREASURE)) { return { png: "treasure-basic", label: "Trésor" }; }
        if (card.isOfType(CardType.VICTORY)) { return { png: "victory-basic", label: "Victoire" }; }
        if (card.isOfType(CardType.TRASHING)) { return { png: "curse-basic", label: "Malédiction" }; }
      }
      return { png: 'error-no valid card type', label: 'error-no valid card type' };
    }

    const getisTreasureCard= (currentCard: DigitalCard) => {
      let card
      card = DominionSets.getCardById(currentCard.id);
      if (card.constructor.name == "SupplyCard") { return (card as SupplyCard).isOfType(CardType.TREASURE); }
      if (card.constructor.name == "OtherCard") { return (card as OtherCard).isOfType(CardType.TREASURE); }
      return false;
    }

    const getValueforTreasureCard= (currentCard: DigitalCard):Cost => {
      let pattern = '<div class="card-text-coin-text" style="color: black; display:inline; top:8px;">';
      switch ((currentCard.id)
        .replace("2_2nd", "")
        .replace("_2nd", "")
        .replace("2", "")) {
        case "copper": return ({ treasure: 1, potion: 0, debt: 0 } as Cost);
        case "silver": return ({ treasure: 2, potion: 0, debt: 0 } as Cost);
        case "gold": return ({ treasure: 3, potion: 0, debt: 0 } as Cost);
        case "platinum": return ({ treasure: 5, potion: 0, debt: 0 } as Cost);
        case "potion": return ({ treasure: 0, potion: 1, debt: 0 } as Cost);
        default: { }
      }
      let valuePosition = currentCard.text_html.indexOf(pattern)
      if (valuePosition == -1) { return ({ treasure: 99, potion: 99, debt: 99 } as Cost);}
      console.log("in getValueforTreasureCard error " + currentCard.id)
      console.log( currentCard.text_html.charAt(currentCard.text_html.indexOf(pattern) + pattern.length));
      return ({ treasure: 66, potion: 66, debt: 66 } as Cost);
    }


    const getCardCost= (currentCard: DigitalCard) => {
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

    const getCardNameFontSize= (currentCard: DigitalCard) => {
      let card = DominionSets.getCardById(currentCard.id);
      let isTypeTreasure = false;
      if (card.constructor.name == "OtherCard") { isTypeTreasure = (card as OtherCard).isOfType(CardType.TREASURE); }
      if (isTypeTreasure) {
        if (card.constructor.name == "OtherCard") { return { top: 25, fontsize: 1.8 }; }
        return { top: 16, fontsize: 1.8 };
      }
      if (card.constructor.name == "OtherCard") { return { top: 24, fontsize: 1.8 }; }
      return { top: 16, fontsize: 1.8 };
    }

    const getCardBottomBarOffset= (currentCard: DigitalCard) => {
      let card = DominionSets.getCardById(currentCard.id);
      if (card.constructor.name == "OtherCard") {
        if ((card as OtherCard).isOfType(CardType.TREASURE)) { return -62; }
        if ((card as OtherCard).isOfType(CardType.VICTORY)) { return -67; }
      }
      return -70;
    }

    const getCardSetById= (currentCard: DigitalCard) => {
      return (DominionSets.getCardById(currentCard.id)).setId;
    }

    const getCardTypeFontSize= (currentCard: DigitalCard) => {
      var typeOfCard = getCardTypeById(currentCard).label
      if (typeOfCard.length >= 16) { return "font-size: 2.8em; top:35px;"; }
      if (typeOfCard.length >= 10) { return "font-size: 3.125em; top:30px;"; }
      return "font-size: 4.2em; top:20px;";
    }

    return{
      Cards,
      getClassCard,
      getHost,
      getCardArtwork,
      getCardTypeById,
      getisTreasureCard,
      getValueforTreasureCard,
      getCardNameFontSize,
      getCardBottomBarOffset,
      getCardCost,
      getCardSetById,
      getCardTypeFontSize,
      cardImageUrl,
      incaseoferror
    }
  }
});
</script>



