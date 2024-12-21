<template>
  <button  class="copy-button copy-button-svg-color" >
    <input :aria-label="$t('copyButton')" ref="textInput" class="copy-button__input" type="text" readonly />
    <div class="copy-button__icon">
    <router-link :to="targetUrl">
      <svg fill="#000000" width="24px" height="24px" viewBox="0 0 32 32" id="icon" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.9474,19a4.9476,4.9476,0,0,1-3.4991-8.4465l5.1053-5.1043a4.9482,4.9482,0,0,1,6.9981,6.9976l-.5523.5526-1.4158-1.4129.5577-.5579a2.95,2.95,0,0,0-.0039-4.1653,3.02,3.02,0,0,0-4.17,0l-5.1047,5.104a2.9474,2.9474,0,0,0,0,4.1692,3.02,3.02,0,0,0,4.17,0l1.4143,1.4145A4.9176,4.9176,0,0,1,11.9474,19Z"/> 
          <path d="M19.9474,17a4.9476,4.9476,0,0,1-3.4991-8.4465l.5526-.5526,1.4143,1.4146-.5526.5523a2.9476,2.9476,0,0,0,0,4.1689,3.02,3.02,0,0,0,4.17,0c.26-.26,4.7293-4.7293,5.1053-5.1045a2.951,2.951,0,0,0,0-4.1687,3.02,3.02,0,0,0-4.17,0L21.5536,3.449a4.9483,4.9483,0,0,1,6.9981,6.9978c-.3765.376-4.844,4.8428-5.1038,5.1035A4.9193,4.9193,0,0,1,19.9474,17Z"/> 
          <path d="M24,30H4a2.0021,2.0021,0,0,1-2-2V8A2.0021,2.0021,0,0,1,4,6H8V8H4V28H24V18h2V28A2.0021,2.0021,0,0,1,24,30Z"/>
           <rect style="fill: none;" id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" width="32" height="32"/>
        </svg>
      </router-link>
    </div>
  </button>
</template>

<script lang="ts">
/* import Vue, typescript */
import { defineComponent, computed} from "vue";
import type { PropType } from "vue";
import { useRoute, useRouter } from "vue-router";

/* import Dominion Objects and type*/
import { Kingdom } from "../randomizer/kingdom";
import { DominionSets } from "../dominion/dominion-sets";
import { Supply, Replacements } from "../randomizer/supply";
import { DominionKingdom } from "../dominion/dominion-kingdom";
import { serializeKingdom } from "../randomizer/serializer";
import { Language } from "../i18n/language";

/* import store  */
/* import Components */

export default defineComponent({
  name: "RandomizeLinkButton",
  props: {
    kingdom: {
      type: DominionKingdom as PropType<DominionKingdom>,
      required: true
    }
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();

    const targetUrl = computed(() => {
      return handleClick();
    });

    const handleClick = () => {
      //const target = "lang=fr&supply=daimyo,familiar,fishmonger,goldmine,golem,herbalist,litter,rice,riverboat,vineyard&riverboat=scryingpool&events=credit,practice"
      //"lang=en&supply=crypt,devilsworkshop,figurine,flagship,fool,longship,pooka,shepherd,tools,tormentor&events=journey&traits=patient(flagship)"
      const redirectedKingdom = new Kingdom(0,
          new Supply(props.kingdom.supplyIds.map(Id => DominionSets.getSupplyCardById(Id)), 
              props.kingdom.baneCardId ? DominionSets.getSupplyCardById(props.kingdom.baneCardId) : null,
              props.kingdom.ferrymanCardId ? DominionSets.getSupplyCardById(props.kingdom.ferrymanCardId) : null,
              props.kingdom.obeliskCardId ? DominionSets.getSupplyCardById(props.kingdom.obeliskCardId) : null,
              props.kingdom.wayofthemouseCardId ? DominionSets.getSupplyCardById(props.kingdom.wayofthemouseCardId) : null,
              props.kingdom.riverboatActionCardId ? DominionSets.getSupplyCardById(props.kingdom.riverboatActionCardId) : null,
              props.kingdom.approachingArmyCardId ? DominionSets.getSupplyCardById(props.kingdom.approachingArmyCardId) : null,
              props.kingdom.traitSupplyIds.map(Id => DominionSets.getSupplyCardById(Id)),
              Replacements.empty()),
          props.kingdom.eventIds.map(Id => DominionSets.getEventById(Id)), 
          props.kingdom.landmarkIds.map(Id => DominionSets.getLandmarkById(Id)),
          props.kingdom.projectIds.map(Id => DominionSets.getProjectById(Id)),
          props.kingdom.wayIds.map(Id => DominionSets.getWayById(Id)),
          props.kingdom.boonIds.map(Id => DominionSets.getBoonById(Id)),
          props.kingdom.allyIds.map(Id => DominionSets.getAllyById(Id))[0],
          props.kingdom.prophecyIds.map(Id => DominionSets.getProphecyById(Id))[0],
          props.kingdom.traitIds.map(Id => DominionSets.getTraitById(Id)),
          props.kingdom.metadata)
console.log(serializeKingdom(redirectedKingdom))

      const newquery = {  
          ...serializeKingdom(redirectedKingdom)
        }

        return {
          path: '/',
          query: {
            ...newquery,
            lang: route.query.lang? route.query.lang : Language.ENGLISH,
          }
        };
    };

    return {
      targetUrl
    }
  }
});
</script>


<style scoped>
.copy-button {
  border: none;
  height: 30px;
  outline: none;
  padding: 0;
  position: relative;
  width: 30px;
}

.copy-button__icon {
  border: none;
  height: 100%;
  left: 0;
  outline: none;
  position: absolute;
  top: 0;
  width: 100%;
}

.copy-button__input {
  overflow: hidden;
  position: absolute;
  top: -999999px;
  width: 100%;
}

.copy-button__icon {
  background: #fff;
  box-sizing: border-box;
  padding: 3px;
  z-index: 1;
}

.copy-button-svg-color svg {
  fill: #02779e;
}

.copy-button__copied {
  background: #02779e;
  border-radius: 4px;
  border: 1px solid #02779e;
  color: #fff;
  font-size: 12px;
  left: 36px;
  padding: 3px 5px;
  position: absolute;
  top: 4px;
  z-index: 3;
  width: 40px;;
}

.copy-button__copied::before {
  border-bottom: 5px solid transparent;
  border-right: 4px solid #02779e;
  border-top: 5px solid transparent;
  content: '';
  height: 0;
  left: -4px;
  position: absolute;
  top: 5px;
  width: 0;
}
</style>