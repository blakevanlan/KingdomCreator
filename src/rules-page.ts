import Vue from "vue";
import PageComponent, { MenuItemType } from "./components/page.vue";
import { store } from "./stores/sets-store";
import { initializeWindowListener } from "./setup";

interface RuleBook {
  name: string,
  url: string
}

const RULE_BOOKS: RuleBook[] = [
  {
    name: "Adventures",
    url: "/rules/adventures.pdf"
  }, {
    name: "Alchemy",
    url: "/rules/alchemy.pdf"
  }, {
    name: "Base Set - 1st edition",
    url: "/rules/base-set.pdf"
  }, {
    name: "Base Set - 2nd edition",
    url: "/rules/base-set-2.pdf"
  }, {
    name: "Cornucopia",
    url: "/rules/cornucopia.pdf"
  }, {
    name: "Dark Ages",
    url: "/rules/dark-ages.pdf"
  }, {
    name: "Empires",
    url: "/rules/empires.pdf"
  }, {
    name: "Guilds",
    url: "/rules/guilds.pdf"
  }, {
    name: "Hinterlands",
    url: "/rules/hinterlands.pdf"
  }, {
    name: "Intrigue - 1st edition",
    url: "/rules/intrigue.pdf"
  }, {
    name: "Intrigue - 2nd edition",
    url: "/rules/intrigue-2.pdf"
  }, {
    name: "Nocturne",
    url: "/rules/nocturne.pdf"
  }, {
    name: "Prosperity",
    url: "/rules/prosperity.pdf"
  }, {
    name: "Renaissance",
    url: "/rules/renaissance.pdf"
  }, {
    name: "Seaside",
    url: "/rules/seaside.pdf"
  }
];

initializeWindowListener(store);
new Vue({
  el: "#app",
  template: `
  <page-component subtitle="Official rulebooks" :selectedType="selectedType">
    <div class="content">
      <div class="rulebooks-container">
        <ul class="rulebook-list">
          <li v-for="ruleBook in ruleBooks">
            <a class="rulebook" :href="ruleBook.url">{{ ruleBook.name }}</a>
          </li>
        </ul>
      </div>
    </div>
  </page-component>
  `,
  store: store,
  data: {
    selectedType: MenuItemType.RULES,
    ruleBooks: RULE_BOOKS
  },
  components: {
    "page-component": PageComponent,
  }
});