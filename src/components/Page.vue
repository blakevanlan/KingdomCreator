<template>
  <div>
    <div class="condensed-menu" v-if="isCondensed">
      <ul class="condensed-menu_items">
        <li class="condensed-menu_item" v-for="menuItem in menuItems"
          :class="{active: isMenuItemActive(menuItem)}"
          :key="menuItem.url"
        >
          <a class="condensed-menu_item_link" :href="getMenuItemUrl(menuItem.url)">{{ menuItem.title }}</a>
        </li>
      </ul>
    </div>
    <div class="page" :class="{'show-condensed-menu': shouldShowCondensedMenu}">
      <header>
        <div class="title-container">
          <h1 class="title">
            <a class="title_link" href="index.html">Dominion Randomizer</a>
          </h1>
          <h2 class="tagline">{{ subtitle }}</h2>
        </div>
        <div class="condensed-menu-button" v-if="isCondensed" @click="handleMenuClick"></div>
        <div class="menu" v-if="!isCondensed">
          <ul class="menu_items">
            <li class="menu_item" v-for="menuItem in menuItems"
                :class="{active: isMenuItemActive(menuItem)}" :key="menuItem.title">
              <a class="menu_item_link" :href="getMenuItemUrl(menuItem.url)">{{ menuItem.title }}</a>
            </li>
          </ul>
        </div>
      </header>
      <slot></slot>
      <footer>
        <div class="languages">
          <template>
            <span v-for="(language, index) in languages" :key="language">
              <router-link :to="getLanguageLinkOptions(language)">
                {{ $t(language) }}
              </router-link>
              <span v-if="index < languages.length - 1" :key="`${language}-bullet`">
                &nbsp;&bull;&nbsp;
              </span>
            </span>
          </template>
        </div>

        <i18n class="github-info" path="github_info" tag="div">
          <template v-slot:source>
            <a href="https://github.com/blakevanlan/KingdomCreator">{{
              $t("github_info_source")
            }}</a>
          </template>
          <template v-slot:issues>
            <a href="https://github.com/blakevanlan/KingdomCreator/issues">{{
              $t("github_info_issues")
            }}</a>
          </template>
        </i18n>

        <i18n class="disclaimers-and-credit" path="disclaimers_and_credits" tag="div">
          <template v-slot:wiki>
            <a href="http://wiki.dominionstrategy.com/index.php/Main_Page">{{
              $t("disclaimers_and_credits_wiki")
            }}</a>
          </template>
          <template v-slot:smashicons>
            <a href="https://www.flaticon.com/authors/smashicons" target="_blank">{{
              $t("disclaimers_and_credits_smashicons")
            }}</a>
          </template>
          <template v-slot:flaticon>
            <a href="https://www.flaticon.com/" target="_blank">www.flaticon.com</a>
          </template>
          <template v-slot:creativecommons>
            <a href="http://creativecommons.org/licenses/by/3.0/" target="_blank">{{
              $t("disclaimers_and_credits_creative_commons")
            }}</a>
          </template>
        </i18n>
      </footer>
    </div>
  </div>
</template>

<script lang="ts">
import { Getter, State } from "vuex-class";
import { Vue, Component, Prop } from "vue-property-decorator";
import { Language } from "../i18n/language";

export enum MenuItemType {
  RANDOMIZER,
  SETS,
  RULES,
}

class MenuItem {
  constructor(readonly type: MenuItemType, readonly title: string, readonly url: string) {
  }
}

const MENU_ITEMS = [
  new MenuItem(MenuItemType.RANDOMIZER, "Randomizer", "index.html"),
  new MenuItem(MenuItemType.SETS, "Recommended Kingdoms", "sets.html"),
  new MenuItem(MenuItemType.RULES, "Rules", "rules.html"),
];

@Component
export default class Page extends Vue {
  @Prop() readonly subtitle!: string;
  @Prop() readonly selectedType!: MenuItemType;
  @Getter("isCondensed") readonly isCondensed!: boolean;
  @State(state => state.i18n.language) readonly language!: Language;
  isCondensedMenuActive = false;
  menuItems = MENU_ITEMS;

  get shouldShowCondensedMenu() {
    return this.isCondensed && this.isCondensedMenuActive;
  }

  get languages() {
    return Object.keys(Language).map(key => Language[key as keyof typeof Language]);
  }

  getMenuItemUrl(url: string) {
    return this.language != Language.ENGLISH
      ? `${url}?lang=${this.language}`
      : url;
  }

  getLanguageLinkOptions(language: string) {
    return {
      params: this.$route.params,
      query: {
        ...this.$route.query,
        lang: language
      }
    };
  }

  handleMenuClick() {
    this.isCondensedMenuActive = !this.isCondensedMenuActive;
  }

  isMenuItemActive(menuItem: MenuItem) {
    return menuItem.type == this.selectedType;
  }
}
</script>

<style scoped>

footer {
  border-top: 1px #ddd solid;
  font-family: 'Alegreya Sans', sans-serif;
  font-weight: 300;
  margin: 10px -10px -10px -10px;
  padding: 10px;
}

.languages {
  text-align: center;
  font-size: 12px;
}

.github-info {
  font-size: 15px;
  margin: 12px 0;
  text-align: center;
}

.disclaimers-and-credit {
  font-size: 12px;
  max-width: 600px;
  margin: 0 auto;
}

</style>