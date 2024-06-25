<template>
  <div>
    <div class="condensed-menu" v-if="isCondensed">
      <ul class="condensed-menu_items">
        <li class="condensed-menu_item" v-for="menuItem in menuItems" :class="{ active: isMenuItemActive(menuItem) }"
          :key="menuItem.url">
          <a class="condensed-menu_item_link" :href="getMenuItemUrl(menuItem.url)">{{ $t(menuItem.title) }}</a>
        </li>
      </ul>
    </div>
    <a id="TopofThePage" />
    <div class="page" :class="{ 'show-condensed-menu': shouldShowCondensedMenu }">
      <header>
       <div class="title-container">
          <h1 class="title">
            <a class="title_link" href="/index.html">Dominion Randomizer</a>
          </h1>
          <h2 class="tagline">{{ subtitle }}</h2>
        </div> 
        <div class="condensed-menu-button" v-if="isCondensed" @click="handleMenuClick"></div>
        <div class="menu" v-if="!isCondensed">
          <ul class="menu_items">
            <li class="menu_item" v-for="menuItem in menuItems" :class="{ active: isMenuItemActive(menuItem) }"
              :key="menuItem.title">
              <a class="menu_item_link" :href="getMenuItemUrl(menuItem.url)">{{ $t(menuItem.title) }}</a>
            </li>
          </ul>
        </div> 
      </header>
      <slot></slot>
      <footer>
        <div class="languages">
          <span v-for="(language, index) in languages" :key="language">
            <router-link :to="getLanguageLinkOptions(language)">
              {{ $t(language) }}
            </router-link>
            <span v-if="index < languages.length - 1" :key="`${language}-bullet`">
              &nbsp;&bull;&nbsp;
            </span>
          </span>
        </div>
        <i18n-t scope="global" class="github-info" keypath="github_info" tag="div">
          <template #source>
            <a href="https://github.com/gillesgros/KingdomCreator-New">{{
              $t("github_info_source")
            }}</a>
          </template>
          <template #issues>
            <a href="https://github.com/gillesgros/KingdomCreator-New/issues">{{
              $t("github_info_issues")
            }}</a>
          </template>
        </i18n-t>
        <i18n-t scope="global" class="disclaimers-and-credit" keypath="disclaimers_and_credits" tag="div">
          <template #wiki>
            <a href="http://wiki.dominionstrategy.com/index.php/Main_Page">{{
              $t("disclaimers_and_credits_wiki")
            }}</a>
          </template>
          <template #smashicons>
            <a href="https://www.flaticon.com/authors/smashicons" target="_blank">{{
              $t("disclaimers_and_credits_smashicons")
            }}</a>
          </template>
          <template #flaticon>
            <a href="https://www.flaticon.com/" target="_blank">www.flaticon.com</a>
          </template>
          <template #creativecommons>
            <a href="http://creativecommons.org/licenses/by/3.0/" target="_blank">{{
              $t("disclaimers_and_credits_creative_commons")
            }}</a>
          </template>
        </i18n-t>
      </footer>
    </div>
  </div>
</template>

<script lang="ts">
/* import Vue, typescript */
import { defineComponent, computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from 'vue-router';

/* import Dominion Objects and type*/

/* import store  */
import { useWindowStore } from "../pinia/window-store";
import { usei18nStore } from "../pinia/i18n-store";
import { Language } from "../i18n/language";

/* import Components */

export enum MenuItemType {
  RANDOMIZER,
  SETS,
  RULES,
  CARDS,
  BOXES,
}

class MenuItem {
  constructor(readonly type: MenuItemType, readonly title: string, readonly url: string) {
  }
}

let MENU_ITEMS = [
  new MenuItem(MenuItemType.RANDOMIZER, "Randomizer", "/index"),
  new MenuItem(MenuItemType.SETS, "Recommended Kingdoms", "/sets"),
  new MenuItem(MenuItemType.RULES, "Rules", "/rules"),
  new MenuItem(MenuItemType.BOXES, "Box content", "/boxes"),
];

if (process.env.NODE_ENV == "development") {
//  MENU_ITEMS = [
//    new MenuItem(MenuItemType.RANDOMIZER, "Randomizer", "/"),
//    new MenuItem(MenuItemType.SETS, "Recommended Kingdoms", "/sets.html"),
//    new MenuItem(MenuItemType.RULES, "Rules", "/rules.html"),
//    new MenuItem(MenuItemType.BOXES, "Box content", "/boxes.html"),
//    new MenuItem(MenuItemType.CARDS, "Cards", "/cards.html"),
//  ];
  MENU_ITEMS.push(new MenuItem(MenuItemType.CARDS, "Cards", "/cards"));
}

export default defineComponent({
  name: "Page",
  props: {
    subtitle: String,
    selectedType: Number
  },
  setup(props) {
    const route = useRoute();
    const WindowStore = useWindowStore();
    const i18nStore = usei18nStore();

    const { t } = useI18n();
    const language = computed(() => i18nStore.language);
    const isCondensedMenuActive = ref(false);
    const menuItems = MENU_ITEMS;
    const isCondensed = computed(() =>{ return WindowStore.isCondensed });
    const shouldShowCondensedMenu = computed(()=> { return isCondensed.value && isCondensedMenuActive.value });
    const languages = computed(() => { return Object.values(Language) });
    const getMenuItemUrl = (url: string) => language.value !== Language.ENGLISH ? `${url}?lang=${language.value}` : url;
    const isMenuItemActive = (menuItem: MenuItem) => menuItem.type === props.selectedType;

    const getLanguageLinkOptions = (language: string) => {
      return {
        params: route.params,
        query: {
          ...route.query,
          lang: language,
        }
      };
    };

    const handleMenuClick = () => {
      isCondensedMenuActive.value = !isCondensedMenuActive.value;
    };

    return {
      isCondensed,
      shouldShowCondensedMenu,
      menuItems,
      languages,
      getMenuItemUrl,
      getLanguageLinkOptions,
      handleMenuClick,
      isMenuItemActive,
    };
  },
});
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