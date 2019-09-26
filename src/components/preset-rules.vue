<template>
  <div>
    <div class="preset-set_title">
      <div class="preset-kingdom_title_sets" v-for="set in rulesets">
	    <a class="rulebook" target="_rulebookDominion" :href="getPdfURL(set.url)"><span class="preset-kingdom_set-name" :class="[set.id]">{{set.name}}</span></a>
	  </div>
    </div>
	
	<card-layout-component
      :items="rulesets"
      :number-of-columns="3"
      :is-vertical="true"
	  layoutType="rulebook"
    >
      <template v-slot:default="slotProps">
        <static-rule-with-set-component :rule="slotProps.item" />
      </template>
    </card-layout-component>
  </div>
</template>


<script lang="ts">
import { State } from "vuex-class";
import { Vue, Component } from "vue-property-decorator";
import CardLayoutComponent from "./card-layout.vue";
import StaticRuleWithSetComponent from "./static-rule-with-set.vue";
import { RULE_BOOKS } from "../dominion/rule";

@Component
export default class PresetRules extends Vue {
  constructor() {
    super({
      components: {
        "card-layout-component": CardLayoutComponent,
        "static-rule-with-set-component": StaticRuleWithSetComponent      }
    });
  }
  @State(state => state.window.width) windowWidth!: number;
 
  get rulesets () {
    return RULE_BOOKS;
  }
 
  getPdfURL(setUrl: string) {
    return "/rules/" + setUrl
  }
};


</script>

<style>

.content {
  padding: unset;
}

.preset-set_title {
  align-items: center;
  border-bottom: 1px solid #ccc;
  display:flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding-bottom: 10px;
}

.preset-kingdom_title_name {
  color: #555;
  font-size: 36px;
  margin: 0 12px 0 0;
}

.preset-kingdom_title_sets {
  display: flex;
  flex-direction: row;
  margin: 2px 0;
}
 
.preset-kingdom_set-name {
  display: block;
  background: rgba(220, 220, 220, 0.7);
  color: #fff;
  margin-right: 4px;
  padding: 6px 8px;
  text-shadow: 1px 1px 4px #fff;
  font-size: 16px;
}

.preset-kingdom_metadata {
  display: flex;
  flex-direction: row;
  margin-bottom: 10px;
}

.preset-kingdom_metadata_use-platinums-and-colonies,
.preset-kingdom_metadata_use-shelters {
  color: #fff;
  font-size: 14px;
  padding: 2px 6px;
  margin-right: 6px;
}
  
.preset-kingdom_metadata_use-platinums-and-colonies {
  background: #C8CE0B; /* prosperity-color */
}

.preset-kingdom_metadata_use-shelters {
  background: #b1572a; /* darkages-color */
}

.preset-kingdom__addon-title {
  color: #555;
  font-size: 24px;
  margin: 12px 0 8px 0;
}  

@media (max-width: 450px) {
  .preset-kingdom_title_name {
    font-size: 30px;
    margin-right: 8px;
  }
    
  .preset-kingdom_set-name {
    font-size: 14px;
    padding: 4px 6px;
  }
}

</style>